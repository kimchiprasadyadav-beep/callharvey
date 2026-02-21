# Call Harvey 📞

**AI Inside Sales Agent for Real Estate** — $299/mo instead of $2,000/mo

Upload leads → AI calls within 60s → Qualifies budget/timeline/preferences → Books showings on Google Calendar

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Next.js UI  │────▶│  FastAPI      │────▶│  Twilio      │
│  (Dashboard) │◀────│  + Pipecat    │◀────│  (Voice)     │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │  Deepgram    │  STT
                    │  Claude      │  Conversation
                    │  ElevenLabs  │  TTS
                    └──────────────┘
```

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in API keys
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
cp .env.example .env  # fill in API keys
docker-compose up
```

## API Keys Needed

| Service | Purpose | Get it at |
|---------|---------|-----------|
| Twilio | Outbound calls | twilio.com |
| Deepgram | Speech-to-text | deepgram.com |
| Anthropic | AI conversation (Claude) | console.anthropic.com |
| ElevenLabs | Text-to-speech | elevenlabs.io |
| Google Calendar | Booking showings | console.cloud.google.com |

## API Endpoints

- `POST /api/calls/start` — Trigger a call to a lead
- `POST /api/calls/webhook` — Twilio webhook handler
- `GET /api/calls` — List call results
- `POST /api/leads/upload` — Upload CSV of leads
- `GET /api/leads` — List all leads

## CSV Format

```csv
name,phone,email,area,notes
John Smith,+15551234567,john@email.com,Downtown Austin,Interested in condos
```
