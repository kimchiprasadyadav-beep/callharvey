"""Call Harvey — FastAPI backend for AI cold calling."""

import csv
import io
import os
import uuid
import asyncio
import logging
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.rest import Client as TwilioClient
from twilio.twiml.voice_response import VoiceResponse

from pipeline import start_call_pipeline

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Call Harvey", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (replace with DB in production)
calls_db: dict[str, dict] = {}
leads_db: dict[str, dict] = {}

twilio_client = TwilioClient(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN"),
)


# --- Models ---

class StartCallRequest(BaseModel):
    lead_phone: str
    lead_name: str
    agent_name: str = "Your Agent"
    brokerage: str = "Harvey Realty"
    area: str = "your area"


class CallResult(BaseModel):
    id: str
    lead_phone: str
    lead_name: str
    status: str  # queued, in-progress, completed, failed, no-answer
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    duration_seconds: Optional[int] = None
    qualification: Optional[dict] = None
    recording_url: Optional[str] = None
    summary: Optional[str] = None


# --- Endpoints ---

@app.get("/")
async def root():
    return {"service": "Call Harvey", "status": "running"}


@app.post("/api/calls/start")
async def start_call(req: StartCallRequest, background_tasks: BackgroundTasks):
    """Trigger an outbound AI call to a lead."""
    call_id = str(uuid.uuid4())

    calls_db[call_id] = {
        "id": call_id,
        "lead_phone": req.lead_phone,
        "lead_name": req.lead_name,
        "status": "queued",
        "started_at": datetime.utcnow().isoformat(),
        "ended_at": None,
        "duration_seconds": None,
        "qualification": None,
        "recording_url": None,
        "summary": None,
    }

    base_url = os.getenv("BASE_URL", "http://localhost:8000")

    try:
        call = twilio_client.calls.create(
            to=req.lead_phone,
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            url=f"{base_url}/api/calls/webhook?call_id={call_id}",
            record=True,
            recording_status_callback=f"{base_url}/api/calls/recording?call_id={call_id}",
            status_callback=f"{base_url}/api/calls/status?call_id={call_id}",
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


@app.post("/api/calls/webhook")
async def call_webhook(call_id: str = ""):
    """Twilio webhook — returns TwiML to connect the call to a media stream."""
    response = VoiceResponse()

    # Connect to a WebSocket for real-time audio processing
    base_url = os.getenv("BASE_URL", "http://localhost:8000").replace("http", "ws")
    connect = response.connect()
    connect.stream(
        url=f"{base_url}/ws/audio/{call_id}",
        track="both_tracks",
    )

    return str(response)


@app.post("/api/calls/status")
async def call_status_callback(call_id: str = ""):
    """Twilio status callback — updates call status."""
    if call_id in calls_db:
        # Twilio sends form data, but simplified here
        calls_db[call_id]["status"] = "completed"
        calls_db[call_id]["ended_at"] = datetime.utcnow().isoformat()
    return {"status": "ok"}


@app.post("/api/calls/recording")
async def recording_callback(call_id: str = ""):
    """Twilio recording callback — stores recording URL."""
    if call_id in calls_db:
        calls_db[call_id]["recording_url"] = f"https://api.twilio.com/recordings/{call_id}"
    return {"status": "ok"}


@app.get("/api/calls")
async def list_calls(limit: int = 50, offset: int = 0):
    """List all call results."""
    all_calls = list(calls_db.values())
    all_calls.sort(key=lambda c: c.get("started_at", ""), reverse=True)
    return {
        "calls": all_calls[offset : offset + limit],
        "total": len(all_calls),
    }


@app.get("/api/calls/{call_id}")
async def get_call(call_id: str):
    """Get a single call result."""
    if call_id not in calls_db:
        raise HTTPException(status_code=404, detail="Call not found")
    return calls_db[call_id]


@app.post("/api/leads/upload")
async def upload_leads(file: UploadFile = File(...)):
    """Upload a CSV of leads. Expected columns: name, phone, email, area, notes."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

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
    return {
        "leads": all_leads[offset : offset + limit],
        "total": len(all_leads),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
