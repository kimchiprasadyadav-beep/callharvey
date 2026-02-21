"""Centralized configuration — all secrets from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Twilio
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")

    # Deepgram
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")

    # Anthropic
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # ElevenLabs
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # App
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")

    # Google Calendar (optional)
    GOOGLE_CREDENTIALS_JSON: str = os.getenv("GOOGLE_CREDENTIALS_JSON", "credentials.json")
    GOOGLE_CALENDAR_ID: str = os.getenv("GOOGLE_CALENDAR_ID", "")

    def validate(self) -> list[str]:
        """Return list of missing required env vars."""
        required = [
            ("TWILIO_ACCOUNT_SID", self.TWILIO_ACCOUNT_SID),
            ("TWILIO_AUTH_TOKEN", self.TWILIO_AUTH_TOKEN),
            ("TWILIO_PHONE_NUMBER", self.TWILIO_PHONE_NUMBER),
            ("DEEPGRAM_API_KEY", self.DEEPGRAM_API_KEY),
            ("ANTHROPIC_API_KEY", self.ANTHROPIC_API_KEY),
            ("ELEVENLABS_API_KEY", self.ELEVENLABS_API_KEY),
        ]
        return [name for name, val in required if not val]


settings = Settings()
