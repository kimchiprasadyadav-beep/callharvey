"""Call Harvey — FastAPI backend for AI cold calling via Twilio + Pipecat."""

import csv
import io
import os
import json
import uuid
import logging
from datetime import datetime
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, UploadFile, File, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from twilio.rest import Client as TwilioClient
from twilio.twiml.voice_response import VoiceResponse, Connect

# Lazy import pipeline to avoid loading PyTorch/Silero on lightweight deployments
# from pipeline import run_harvey_pipeline
from sms import router as sms_router

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Call Harvey", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (replace with Supabase in production)
calls_db: dict[str, dict] = {}
leads_db: dict[str, dict] = {}

twilio_client = TwilioClient(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN"),
)

app.include_router(sms_router)

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
WS_URL = BASE_URL.replace("https://", "wss://").replace("http://", "ws://")


# --- Models ---

class StartCallRequest(BaseModel):
    lead_phone: str
    lead_name: str
    agent_name: str = "Sam"
    brokerage: str = "Harvey Realty"
    area: str = "your area"


# --- Endpoints ---

@app.get("/")
async def root():
    return {"service": "Call Harvey", "status": "running", "version": "2.0.0"}


@app.post("/api/calls/start")
async def start_call(req: StartCallRequest):
    """Trigger an outbound AI call to a lead."""
    call_id = str(uuid.uuid4())

    calls_db[call_id] = {
        "id": call_id,
        "lead_phone": req.lead_phone,
        "lead_name": req.lead_name,
        "agent_name": req.agent_name,
        "brokerage": req.brokerage,
        "area": req.area,
        "status": "queued",
        "started_at": datetime.utcnow().isoformat(),
        "ended_at": None,
        "duration_seconds": None,
        "qualification": None,
        "recording_url": None,
        "summary": None,
    }

    try:
        call = twilio_client.calls.create(
            to=req.lead_phone,
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            url=f"{BASE_URL}/api/twiml/outbound?call_id={call_id}",
            record=True,
            status_callback=f"{BASE_URL}/api/calls/status?call_id={call_id}",
            status_callback_event=["initiated", "ringing", "answered", "completed"],
        )
        calls_db[call_id]["twilio_sid"] = call.sid
        calls_db[call_id]["status"] = "initiated"
        logger.info(f"Call {call_id} initiated: {call.sid}")
    except Exception as e:
        calls_db[call_id]["status"] = "failed"
        logger.error(f"Call {call_id} failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {"call_id": call_id, "status": "initiated"}


@app.post("/api/twiml/outbound")
async def twiml_outbound(call_id: str = ""):
    """Returns TwiML that connects the call to our WebSocket media stream."""
    response = VoiceResponse()
    connect = Connect()
    connect.stream(url=f"{WS_URL}/ws/media/{call_id}")
    response.append(connect)
    # Keep the call alive while the stream is processing
    response.pause(length=600)
    return PlainTextResponse(content=str(response), media_type="application/xml")


@app.post("/api/twiml/inbound")
async def twiml_inbound(request: Request):
    """TwiML for inbound calls to the Twilio number."""
    call_id = str(uuid.uuid4())
    form = await request.form()
    caller = form.get("From", "unknown")
    
    calls_db[call_id] = {
        "id": call_id,
        "lead_phone": caller,
        "lead_name": "Caller",
        "status": "answered",
        "started_at": datetime.utcnow().isoformat(),
        "direction": "inbound",
    }
    
    response = VoiceResponse()
    connect = Connect()
    connect.stream(url=f"{WS_URL}/ws/media/{call_id}")
    response.append(connect)
    response.pause(length=600)
    return PlainTextResponse(content=str(response), media_type="application/xml")


@app.websocket("/ws/media/{call_id}")
async def websocket_media(websocket: WebSocket, call_id: str):
    """WebSocket endpoint for Twilio media streams — runs the Pipecat pipeline."""
    await websocket.accept()
    
    # Read the initial Twilio handshake messages to get streamSid
    stream_sid = None
    call_data = calls_db.get(call_id, {})
    
    async for message in websocket.iter_text():
        data = json.loads(message)
        if data.get("event") == "start":
            stream_sid = data["start"]["streamSid"]
            logger.info(f"Media stream started: {stream_sid} for call {call_id}")
            break
    
    if not stream_sid:
        logger.error(f"No stream_sid received for call {call_id}")
        await websocket.close()
        return
    
    # Update call status
    if call_id in calls_db:
        calls_db[call_id]["status"] = "in-progress"
        calls_db[call_id]["stream_sid"] = stream_sid
    
    lead_name = call_data.get("lead_name", "there")
    agent_name = call_data.get("agent_name", "Sam")
    brokerage = call_data.get("brokerage", "Harvey Realty")
    area = call_data.get("area", "your area")
    
    try:
        from pipeline import run_harvey_pipeline  # lazy import
        await run_harvey_pipeline(
            websocket=websocket,
            stream_sid=stream_sid,
            lead_name=lead_name,
            agent_name=agent_name,
            brokerage=brokerage,
            area=area,
        )
    except Exception as e:
        logger.error(f"Pipeline error for call {call_id}: {e}")
    finally:
        if call_id in calls_db:
            calls_db[call_id]["status"] = "completed"
            calls_db[call_id]["ended_at"] = datetime.utcnow().isoformat()


@app.post("/api/calls/status")
async def call_status_callback(request: Request, call_id: str = ""):
    """Twilio status callback."""
    form = await request.form()
    status = form.get("CallStatus", "unknown")
    duration = form.get("CallDuration")
    
    if call_id in calls_db:
        calls_db[call_id]["status"] = status
        if duration:
            calls_db[call_id]["duration_seconds"] = int(duration)
        if status in ("completed", "busy", "no-answer", "canceled", "failed"):
            calls_db[call_id]["ended_at"] = datetime.utcnow().isoformat()
    
    return {"status": "ok"}


# --- Telnyx Call Control ---
# NOTE: TELNYX_APP_ID webhook URL must match BASE_URL. If the Cloudflare tunnel
# restarts and BASE_URL changes, update the app webhook via Telnyx API/dashboard.

TELNYX_API_KEY = os.getenv("TELNYX_API_KEY", "")
TELNYX_PHONE_NUMBER = os.getenv("TELNYX_PHONE_NUMBER", "")
TELNYX_HEADERS = {
    "Authorization": f"Bearer {TELNYX_API_KEY}",
    "Content-Type": "application/json",
}

# Track call_control_id → call_id mapping
telnyx_cc_map: dict[str, str] = {}


@app.post("/api/telnyx/call")
async def telnyx_start_call(req: StartCallRequest):
    """Initiate an outbound call via Telnyx Call Control."""
    call_id = str(uuid.uuid4())

    calls_db[call_id] = {
        "id": call_id,
        "provider": "telnyx",
        "lead_phone": req.lead_phone,
        "lead_name": req.lead_name,
        "agent_name": req.agent_name,
        "brokerage": req.brokerage,
        "area": req.area,
        "status": "queued",
        "started_at": datetime.utcnow().isoformat(),
        "ended_at": None,
        "duration_seconds": None,
        "qualification": None,
        "recording_url": None,
        "summary": None,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.telnyx.com/v2/calls",
            headers=TELNYX_HEADERS,
            json={
                "connection_id": os.getenv("TELNYX_APP_ID"),
                "to": req.lead_phone,
                "from": TELNYX_PHONE_NUMBER,
                "webhook_url": f"{BASE_URL}/api/telnyx/webhook",
                "webhook_url_method": "POST",
            },
        )

    if resp.status_code not in (200, 201):
        calls_db[call_id]["status"] = "failed"
        logger.error(f"Telnyx call failed: {resp.text}")
        raise HTTPException(status_code=502, detail=f"Telnyx error: {resp.text}")

    data = resp.json().get("data", {})
    cc_id = data.get("call_control_id", "")
    calls_db[call_id]["telnyx_call_control_id"] = cc_id
    calls_db[call_id]["telnyx_call_leg_id"] = data.get("call_leg_id", "")
    calls_db[call_id]["status"] = "initiated"
    telnyx_cc_map[cc_id] = call_id

    logger.info(f"Telnyx call {call_id} initiated, cc_id={cc_id}")
    return {"call_id": call_id, "status": "initiated", "call_control_id": cc_id}


@app.post("/api/telnyx/webhook")
async def telnyx_webhook(request: Request):
    """Handle Telnyx Call Control webhook events."""
    body = await request.json()
    event_data = body.get("data", {})
    event_type = event_data.get("event_type", "")
    payload = event_data.get("payload", {})
    cc_id = payload.get("call_control_id", "")

    logger.info(f"Telnyx webhook: {event_type} cc_id={cc_id}")

    call_id = telnyx_cc_map.get(cc_id)

    if event_type == "call.initiated":
        if call_id and call_id in calls_db:
            calls_db[call_id]["status"] = "ringing"

    elif event_type == "call.answered":
        if call_id and call_id in calls_db:
            calls_db[call_id]["status"] = "answered"

        # Start media streaming via WebSocket
        stream_url = f"{WS_URL}/ws/telnyx-media/{call_id or cc_id}"
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"https://api.telnyx.com/v2/calls/{cc_id}/actions/streaming_start",
                headers=TELNYX_HEADERS,
                json={
                    "stream_url": stream_url,
                    "stream_track": "both_tracks",
                    "enable_dialogflow": False,
                },
            )
            logger.info(f"Telnyx streaming_start resp: {resp.status_code} {resp.text}")

    elif event_type in ("call.hangup", "call.machine.detection.ended"):
        if call_id and call_id in calls_db:
            calls_db[call_id]["status"] = "completed"
            calls_db[call_id]["ended_at"] = datetime.utcnow().isoformat()

    elif event_type == "streaming.started":
        logger.info(f"Telnyx media stream started for cc_id={cc_id}")

    elif event_type == "streaming.stopped":
        logger.info(f"Telnyx media stream stopped for cc_id={cc_id}")

    return {"status": "ok"}


@app.websocket("/ws/telnyx-media/{call_id}")
async def telnyx_websocket_media(websocket: WebSocket, call_id: str):
    """WebSocket endpoint for Telnyx media streams — runs the Pipecat pipeline."""
    await websocket.accept()
    logger.info(f"Telnyx media WebSocket connected for call {call_id}")

    call_data = calls_db.get(call_id, {})
    if call_id in calls_db:
        calls_db[call_id]["status"] = "in-progress"

    lead_name = call_data.get("lead_name", "there")
    agent_name = call_data.get("agent_name", "Sam")
    brokerage = call_data.get("brokerage", "Harvey Realty")
    area = call_data.get("area", "your area")

    try:
        from pipeline import run_telnyx_pipeline
        await run_telnyx_pipeline(
            websocket=websocket,
            call_id=call_id,
            lead_name=lead_name,
            agent_name=agent_name,
            brokerage=brokerage,
            area=area,
        )
    except Exception as e:
        logger.error(f"Telnyx pipeline error for call {call_id}: {e}")
    finally:
        if call_id in calls_db:
            calls_db[call_id]["status"] = "completed"
            calls_db[call_id]["ended_at"] = datetime.utcnow().isoformat()


# --- Telnyx SMS ---

@app.post("/api/telnyx/sms/send")
async def telnyx_sms_send(req: StartCallRequest):
    """Send outbound SMS via Telnyx and start qualification conversation."""
    from sms import _get_or_create_convo, _insert_message, _upsert_conversation

    convo = _get_or_create_convo(req.lead_phone, req.lead_name, req.area)
    convo["lead_name"] = req.lead_name
    convo["qualification"]["area"] = req.area
    _upsert_conversation(req.lead_phone, req.lead_name, req.area, convo["qualification"])

    greeting = (
        f"Hi {req.lead_name}, this is Sam from Harvey Realty. "
        f"I saw you were looking at properties in {req.area} — "
        f"are you still in the market? I'd love to help you find the right place."
    )

    _insert_message(req.lead_phone, "assistant", greeting)

    # Send via Telnyx
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.telnyx.com/v2/messages",
            headers=TELNYX_HEADERS,
            json={
                "from": TELNYX_PHONE_NUMBER,
                "to": req.lead_phone,
                "text": greeting,
                "messaging_profile_id": os.getenv("TELNYX_MESSAGING_PROFILE_ID"),
            },
        )

    if resp.status_code not in (200, 201):
        logger.error(f"Telnyx SMS send failed: {resp.text}")
        raise HTTPException(status_code=502, detail=f"Telnyx SMS error: {resp.text}")

    logger.info(f"Telnyx SMS sent to {req.lead_phone}")
    return {"status": "sent", "phone": req.lead_phone, "message": greeting, "provider": "telnyx"}


@app.post("/api/telnyx/sms/webhook")
async def telnyx_sms_webhook(request: Request):
    """Handle inbound SMS via Telnyx webhook."""
    from sms import (
        _get_or_create_convo, _insert_message, _build_messages,
        _extract_qualification, _get_openai,
    )

    body = await request.json()
    event_data = body.get("data", {})
    event_type = event_data.get("event_type", "")
    payload = event_data.get("payload", {})

    # Only process inbound messages
    if event_type != "message.received":
        logger.info(f"Telnyx SMS webhook ignoring event: {event_type}")
        return {"status": "ok"}

    from_number = payload.get("from", {}).get("phone_number", "")
    text = payload.get("text", "").strip()

    if not text or not from_number:
        return {"status": "ok"}

    logger.info(f"Telnyx inbound SMS from {from_number}: {text}")

    convo = _get_or_create_convo(from_number)
    convo["messages"].append({"role": "user", "content": text})
    _insert_message(from_number, "user", text)

    # Generate response via GPT-4o
    try:
        resp = _get_openai().chat.completions.create(
            model="gpt-4o",
            messages=_build_messages(convo),
            max_tokens=300,
            temperature=0.7,
        )
        reply = resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        reply = "Thanks for your message! Let me get back to you shortly."

    convo["messages"].append({"role": "assistant", "content": reply})
    _insert_message(from_number, "assistant", reply)
    _extract_qualification(from_number, convo, reply)

    # Reply via Telnyx
    async with httpx.AsyncClient() as client:
        resp_telnyx = await client.post(
            "https://api.telnyx.com/v2/messages",
            headers=TELNYX_HEADERS,
            json={
                "from": TELNYX_PHONE_NUMBER,
                "to": from_number,
                "text": reply,
                "messaging_profile_id": os.getenv("TELNYX_MESSAGING_PROFILE_ID"),
            },
        )
        if resp_telnyx.status_code not in (200, 201):
            logger.warning(f"Telnyx reply SMS failed: {resp_telnyx.text}")

    return {"status": "ok"}


@app.get("/api/calls")
async def list_calls(limit: int = 50, offset: int = 0):
    """List all call results."""
    all_calls = list(calls_db.values())
    all_calls.sort(key=lambda c: c.get("started_at", ""), reverse=True)
    return {"calls": all_calls[offset:offset + limit], "total": len(all_calls)}


@app.get("/api/calls/{call_id}")
async def get_call(call_id: str):
    """Get a single call result."""
    if call_id not in calls_db:
        raise HTTPException(status_code=404, detail="Call not found")
    return calls_db[call_id]


@app.post("/api/leads/upload")
async def upload_leads(file: UploadFile = File(...)):
    """Upload a CSV of leads."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files supported")

    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    imported = []
    for row in reader:
        lead_id = str(uuid.uuid4())
        lead = {
            "id": lead_id,
            "name": row.get("name", "").strip(),
            "phone": row.get("phone", "").strip(),
            "email": row.get("email", "").strip(),
            "area": row.get("area", "").strip(),
            "notes": row.get("notes", "").strip(),
            "status": "new",
            "imported_at": datetime.utcnow().isoformat(),
        }
        leads_db[lead_id] = lead
        imported.append(lead)

    return {"imported": len(imported), "leads": imported}


@app.get("/api/leads")
async def list_leads(limit: int = 100, offset: int = 0):
    """List all leads."""
    all_leads = list(leads_db.values())
    all_leads.sort(key=lambda l: l.get("imported_at", ""), reverse=True)
    return {"leads": all_leads[offset:offset + limit], "total": len(all_leads)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
