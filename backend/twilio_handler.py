"""Twilio telephony integration — outbound calls + webhook handling."""

import os
import logging
from typing import Optional

from twilio.rest import Client as TwilioClient
from twilio.twiml.voice_response import VoiceResponse, Connect

from config import settings

logger = logging.getLogger(__name__)


def get_twilio_client() -> TwilioClient:
    return TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


def initiate_outbound_call(
    to_number: str,
    call_id: str,
    base_url: Optional[str] = None,
) -> str:
    """Place an outbound call via Twilio. Returns the Twilio Call SID."""
    base = base_url or settings.BASE_URL
    client = get_twilio_client()

    call = client.calls.create(
        to=to_number,
        from_=settings.TWILIO_PHONE_NUMBER,
        url=f"{base}/api/calls/webhook?call_id={call_id}",
        record=True,
        recording_status_callback=f"{base}/api/calls/recording?call_id={call_id}",
        status_callback=f"{base}/api/calls/status-callback?call_id={call_id}",
        status_callback_event=["initiated", "ringing", "answered", "completed"],
        machine_detection="DetectMessageEnd",  # detect voicemail
        async_amd=True,
        async_amd_status_callback=f"{base}/api/calls/amd?call_id={call_id}",
    )
    logger.info(f"Outbound call {call_id} → {to_number} | SID: {call.sid}")
    return call.sid


def build_stream_twiml(call_id: str, base_url: Optional[str] = None) -> str:
    """Generate TwiML that connects the call to a WebSocket media stream."""
    base = base_url or settings.BASE_URL
    ws_url = base.replace("https://", "wss://").replace("http://", "ws://")

    response = VoiceResponse()
    response.say("", voice="alice")  # tiny pause for connection
    connect = Connect()
    stream = connect.stream(url=f"{ws_url}/ws/audio/{call_id}")
    stream.parameter(name="call_id", value=call_id)
    response.append(connect)

    return str(response)


def build_voicemail_twiml(call_id: str, base_url: Optional[str] = None) -> str:
    """TwiML for voicemail — connect to a voicemail-specific stream."""
    base = base_url or settings.BASE_URL
    ws_url = base.replace("https://", "wss://").replace("http://", "ws://")

    response = VoiceResponse()
    connect = Connect()
    stream = connect.stream(url=f"{ws_url}/ws/voicemail/{call_id}")
    stream.parameter(name="call_id", value=call_id)
    response.append(connect)

    return str(response)


def hangup_call(call_sid: str):
    """Terminate an in-progress call."""
    client = get_twilio_client()
    client.calls(call_sid).update(status="completed")
    logger.info(f"Hung up call {call_sid}")
