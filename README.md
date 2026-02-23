# Call Harvey - AI Real Estate Agent

> **Status:** On hold pending board direction (2026-02-23)

Harvey is an AI-powered voice and SMS agent that qualifies real estate leads within 60 seconds. Built for Dubai market agents managing high Property Finder/Bayut lead volume.

## 🚀 Current Deployment Status

**✅ Live & Working:**
- **Frontend:** https://callharvey.co (Vercel)
- **Backend:** https://callharvey.onrender.com (Render free tier)
- **Auth:** Supabase magic link login
- **Database:** Supabase (sms_conversations + sms_messages tables)

**⏸️ Blocked:**
- **Twilio:** Account under compliance review (draft response ready)
- **Voice calls:** Requires Twilio + Mac Mini for pipecat/PyTorch

## 🏗️ Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend    │    │  Supabase   │
│  (Vercel)   │◄──►│  (Render)    │◄──►│ (Database)  │
│ Next.js 14  │    │   FastAPI    │    │ PostgreSQL  │
└─────────────┘    └──────────────┘    └─────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │    Twilio    │
                   │  SMS/Voice   │
                   └──────────────┘
```

## 📁 Project Structure

- `/frontend` - Next.js app (callharvey.co)
- `/backend` - FastAPI server (callharvey.onrender.com)
- `/dubai-agent-list.csv` - 50 Dubai agents with contact info
- `/whatsapp-messages.md` - 10 personalized outreach messages
- `/PRD.md` - Full product requirements

## 🛠️ Quick Start

### Backend (Local)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn main:app --host 0.0.0.0 --port 8765
```

### Frontend (Local)  
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Add Supabase keys
npm run dev
```

## 🔑 Required API Keys

- **Twilio:** Account SID, Auth Token, Phone Number
- **OpenAI:** API key for GPT-4o conversations
- **Deepgram:** API key for STT (voice calls)
- **ElevenLabs:** API key + Voice ID for TTS
- **Supabase:** URL + Anon Key for auth/database

## 📊 Current State

**What Works:**
- ✅ SMS qualification flow (Dubai tone, no emojis)
- ✅ Supabase persistence across restarts
- ✅ Magic link authentication  
- ✅ Messages dashboard UI
- ✅ Render deployment (stable URL)

**What's Blocked:**
- ❌ Twilio account (compliance review)
- ❌ Voice calls (needs pipecat + PyTorch locally)
- ❌ Outbound messaging (needs Twilio)

## 🚦 Deployment

**Automatic:**
- Frontend: Push to `main` → Vercel auto-deploys
- Backend: Push to `main` → Render auto-deploys

**Manual Steps:**
1. Update Twilio webhooks after backend URL changes
2. Warm up Render instance before demos (sleeps after 15min)
3. Rotate API keys in both Render and Vercel env vars

## 📈 Next Steps (If Resumed)

1. **Unblock Twilio:** Send compliance response (draft ready)
2. **Test end-to-end:** Real SMS → GPT-4o → Supabase → Reply
3. **Dubai outreach:** Send 10 WhatsApp messages (manual + demo)
4. **Voice pipeline:** Test pipecat on Mac Mini
5. **Scale:** Move to paid Render/Vercel for production loads

## 🏁 Monday Demo Plan (Pre-Hold)

**Demo-first approach:**
- Manual WhatsApp outreach from Rambo's number
- Harvey qualification screenshots as proof-of-concept
- CTA: callharvey.co for early access signup
- Backend goes live when Twilio unblocks

---

**Last Updated:** 2026-02-23 by Kimchi  
**Repository:** `github.com/kimchiprasadyadav-beep/callharvey`