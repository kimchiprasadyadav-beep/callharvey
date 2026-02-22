"""SMS/WhatsApp qualification flow for Call Harvey — Supabase-backed."""

import os
import json
import logging
from datetime import datetime, timezone
from openai import OpenAI
from twilio.rest import Client as TwilioClient
from supabase import create_client, Client as SupabaseClient
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sms", tags=["sms"])

_openai_client = None
_twilio_client = None
_supabase_client: SupabaseClient | None = None

DEFAULT_QUALIFICATION = {
    "budget": None,
    "timeline": None,
    "area": None,
    "property_type": None,
    "visa_status": None,
    "qualified": None,
}


def _get_openai():
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client


def _get_twilio():
    global _twilio_client
    if _twilio_client is None:
        _twilio_client = TwilioClient(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN"),
        )
    return _twilio_client


def _get_supabase() -> SupabaseClient:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY"),
        )
    return _supabase_client


def _get_twilio_phone():
    return os.getenv("TWILIO_PHONE_NUMBER")


SYSTEM_PROMPT = """You are Sam, a friendly and professional AI assistant for Harvey Realty, a Dubai real estate agency.

Your job is to qualify leads through natural WhatsApp/SMS conversation. Keep messages SHORT — this is texting, not email.

Information to gather (one or two at a time, naturally):
1. Budget range (in AED)
2. Timeline — when are they looking to buy or rent?
3. Preferred areas in Dubai
4. Property type (apartment, villa, townhouse, etc.)
5. Visa status (resident, investor visa, tourist, etc.)

Guidelines:
- Be warm, concise, and professional. Think polished Dubai real estate, not bubbly chatbot.
- Don't ask all questions at once — have a natural conversation.
- If they mention a topic, acknowledge it before moving on.
- Once you have all info, summarize what they're looking for and offer to book a viewing.
- Ask for their preferred date/time for a viewing.
- If they're not interested, thank them gracefully and let them know you're available if they change their mind.
- Never be pushy. One short paragraph max per message.
- No emojis. Keep it clean and sharp.

You are texting on behalf of Harvey Realty. The lead's name and any known context will be provided."""


# ── Supabase helpers ──────────────────────────────────────────────────────────


def _upsert_conversation(phone: str, lead_name: str = "there", area: str | None = None, qualification: dict | None = None):
    """Create or update a conversation in Supabase."""
    sb = _get_supabase()
    data = {
        "phone": phone,
        "lead_name": lead_name,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if area:
        data["area"] = area
    if qualification:
        data["qualification"] = json.dumps(qualification) if isinstance(qualification, dict) else qualification
    else:
        data["qualification"] = json.dumps(DEFAULT_QUALIFICATION)

    result = sb.table("sms_conversations").upsert(data, on_conflict="phone").execute()
    return result.data[0] if result.data else data


def _insert_message(phone: str, role: str, content: str):
    """Insert a message into sms_messages."""
    sb = _get_supabase()
    sb.table("sms_messages").insert({
        "conversation_phone": phone,
        "role": role,
        "content": content,
    }).execute()


def _get_conversation(phone: str) -> dict | None:
    """Load a conversation from Supabase."""
    sb = _get_supabase()
    result = sb.table("sms_conversations").select("*").eq("phone", phone).execute()
    if result.data:
        row = result.data[0]
        qual = row.get("qualification")
        if isinstance(qual, str):
            qual = json.loads(qual)
        row["qualification"] = qual or dict(DEFAULT_QUALIFICATION)
        return row
    return None


def _get_messages(phone: str) -> list[dict]:
    """Load messages for a conversation from Supabase."""
    sb = _get_supabase()
    result = (
        sb.table("sms_messages")
        .select("role, content, created_at")
        .eq("conversation_phone", phone)
        .order("created_at")
        .execute()
    )
    return result.data or []


def _update_qualification(phone: str, qualification: dict):
    """Update the qualification JSON for a conversation."""
    sb = _get_supabase()
    sb.table("sms_conversations").update({
        "qualification": json.dumps(qualification),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("phone", phone).execute()


# ── Core logic ────────────────────────────────────────────────────────────────


def _get_or_create_convo(phone: str, lead_name: str = "there", area: str | None = None) -> dict:
    """Get or create conversation, returns dict with lead_name, messages, qualification."""
    convo = _get_conversation(phone)
    if convo is None:
        qual = dict(DEFAULT_QUALIFICATION)
        if area:
            qual["area"] = area
        _upsert_conversation(phone, lead_name, area, qual)
        return {
            "lead_name": lead_name,
            "messages": [],
            "qualification": qual,
        }

    messages = _get_messages(phone)
    return {
        "lead_name": convo.get("lead_name", lead_name),
        "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
        "qualification": convo.get("qualification", dict(DEFAULT_QUALIFICATION)),
    }


def _build_messages(convo: dict) -> list[dict]:
    system = SYSTEM_PROMPT + f"\n\nLead name: {convo['lead_name']}"
    qual = convo["qualification"]
    gathered = {k: v for k, v in qual.items() if v and k != "qualified"}
    if gathered:
        system += f"\nInfo gathered so far: {gathered}"
    missing = [k for k, v in qual.items() if not v and k != "qualified"]
    if missing:
        system += f"\nStill need: {missing}"
    return [{"role": "system", "content": system}] + convo["messages"]


def _extract_qualification(phone: str, convo: dict, assistant_msg: str):
    """Use GPT to extract any newly revealed qualification data."""
    if not convo["messages"]:
        return
    if len(convo["messages"]) % 2 != 0:
        return

    qual = convo["qualification"]
    missing = [k for k, v in qual.items() if not v and k != "qualified"]
    if not missing:
        qual["qualified"] = True
        _update_qualification(phone, qual)
        return

    try:
        resp = _get_openai().chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract real estate qualification data from this conversation. "
                        "Return ONLY a JSON object with these keys (use null if not mentioned): "
                        "budget, timeline, area, property_type, visa_status. "
                        "Values should be short strings summarizing what the lead said."
                    ),
                },
                {
                    "role": "user",
                    "content": "\n".join(
                        f"{m['role']}: {m['content']}" for m in convo["messages"][-10:]
                    ),
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=200,
        )
        extracted = json.loads(resp.choices[0].message.content)
        for key in ("budget", "timeline", "area", "property_type", "visa_status"):
            if extracted.get(key) and not qual.get(key):
                qual[key] = extracted[key]

        filled = sum(1 for k in ("budget", "timeline", "area", "visa_status") if qual.get(k))
        if filled >= 4:
            qual["qualified"] = True

        _update_qualification(phone, qual)
    except Exception as e:
        logger.warning(f"Extraction failed: {e}")


def _send_sms(to: str, body: str):
    """Send SMS/WhatsApp message via Twilio."""
    from_number = _get_twilio_phone()
    if to.startswith("whatsapp:"):
        from_number = f"whatsapp:{_get_twilio_phone()}"
    _get_twilio().messages.create(to=to, from_=from_number, body=body)
    logger.info(f"Sent message to {to}: {body[:80]}...")


# ── API Endpoints ─────────────────────────────────────────────────────────────


class SendRequest(BaseModel):
    lead_phone: str
    lead_name: str
    area: str = "Dubai"


@router.post("/send")
async def send_outbound(req: SendRequest):
    """Trigger an outbound text to a lead to start qualification."""
    convo = _get_or_create_convo(req.lead_phone, req.lead_name, req.area)
    convo["lead_name"] = req.lead_name
    convo["qualification"]["area"] = req.area

    # Update Supabase with lead_name and area
    _upsert_conversation(req.lead_phone, req.lead_name, req.area, convo["qualification"])

    greeting = (
        f"Hi {req.lead_name}, this is Sam from Harvey Realty. "
        f"I saw you were looking at properties in {req.area} — "
        f"are you still in the market? I'd love to help you find the right place."
    )

    _insert_message(req.lead_phone, "assistant", greeting)
    _send_sms(req.lead_phone, greeting)

    return {"status": "sent", "phone": req.lead_phone, "message": greeting}


@router.post("/webhook")
async def sms_webhook(request: Request):
    """Twilio webhook for incoming SMS/WhatsApp messages."""
    form = await request.form()
    from_number = form.get("From", "")
    body = form.get("Body", "").strip()

    if not body:
        return PlainTextResponse("")

    logger.info(f"Incoming from {from_number}: {body}")

    convo = _get_or_create_convo(from_number)
    convo["messages"].append({"role": "user", "content": body})
    _insert_message(from_number, "user", body)

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

    # Reply via Twilio (graceful fail for testing)
    try:
        _send_sms(from_number, reply)
    except Exception as e:
        logger.warning(f"SMS send failed (trial limitation): {e}")

    return PlainTextResponse(reply)


@router.get("/conversations")
async def list_conversations():
    """List all SMS conversations and their qualification status."""
    sb = _get_supabase()
    result = sb.table("sms_conversations").select("*").order("updated_at", desc=True).execute()

    out = {}
    for row in (result.data or []):
        phone = row["phone"]
        qual = row.get("qualification")
        if isinstance(qual, str):
            qual = json.loads(qual)

        # Get last message
        last_msg_result = (
            sb.table("sms_messages")
            .select("role, content")
            .eq("conversation_phone", phone)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        # Get message count
        msgs_result = (
            sb.table("sms_messages")
            .select("id", count="exact")
            .eq("conversation_phone", phone)
            .execute()
        )

        out[phone] = {
            "lead_name": row.get("lead_name", "there"),
            "message_count": msgs_result.count or 0,
            "qualification": qual or DEFAULT_QUALIFICATION,
            "last_message": last_msg_result.data[0] if last_msg_result.data else None,
        }

    return out


@router.get("/conversations/{phone}")
async def get_conversation(phone: str):
    """Get full conversation history for a phone number."""
    phone = phone if phone.startswith("+") or phone.startswith("whatsapp") else f"+{phone}"

    convo = _get_conversation(phone)
    if convo is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = _get_messages(phone)
    qual = convo.get("qualification", DEFAULT_QUALIFICATION)
    if isinstance(qual, str):
        qual = json.loads(qual)

    return {
        "lead_name": convo.get("lead_name", "there"),
        "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
        "qualification": qual,
    }
