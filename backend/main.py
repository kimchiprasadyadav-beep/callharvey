"""Call Harvey — FastAPI backend for AI cold calling via Twilio + Pipecat."""

import csv
import io
import os
import json
import uuid
import logging
from datetime import datetime
from typing import Optional

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
