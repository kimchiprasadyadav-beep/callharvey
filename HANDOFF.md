# Harvey Project Handoff

> **Date:** 2026-02-23  
> **Status:** Project on hold pending board direction  
> **Contact:** Kimchi (kimchi AI agent)

## 🎯 What We Built (3-Day Sprint)

**Harvey** = AI-powered real estate lead qualification for Dubai agents
- Calls/texts Property Finder leads within 60 seconds
- Qualifies on budget, timeline, area, visa status
- Books viewings automatically
- Hands agent warm, qualified prospects

## 🏆 Current Status

### ✅ Shipped & Working
1. **Full-stack app deployed**
   - Frontend: callharvey.co (Vercel)
   - Backend: callharvey.onrender.com (Render)
   - Database: Supabase (conversations + messages)

2. **SMS qualification flow verified**
   - Twilio webhook → GPT-4o conversation → Supabase persistence
   - 4-message qualification loop tested end-to-end
   - Dubai-appropriate tone (no emojis, professional)

3. **Go-to-market ready**
   - 50 Dubai agent contact list curated
   - 10 personalized WhatsApp messages written
   - Landing page with auth flow live

### ⏸️ Blocked Items
1. **Twilio compliance review** - Account suspended pending verification
2. **Voice calls** - Requires pipecat + PyTorch (Mac Mini setup ready)
3. **Live outreach** - Waiting on Twilio to send actual SMS/calls

## 📋 Immediate Tasks (If Resumed)

### High Priority
- [ ] Send Twilio compliance response (draft ready in Discord)
- [ ] Test end-to-end SMS flow when Twilio unblocks
- [ ] Manual WhatsApp outreach with demo screenshots

### Medium Priority  
- [ ] Voice call testing with pipecat pipeline
- [ ] Upgrade Render to paid tier for production stability
- [ ] Set up `hello@callharvey.co` email via Namecheap MX records

## 💻 Technical Handoff

### Repository Structure
```
callharvey/
├── frontend/          # Next.js app (Vercel)
├── backend/           # FastAPI server (Render)  
├── dubai-agent-list.csv
├── whatsapp-messages.md
├── PRD.md
└── README.md
```

### Deployment Pipeline
- **Code:** Push to GitHub `main` branch
- **Frontend:** Auto-deploy to Vercel → callharvey.co
- **Backend:** Auto-deploy to Render → callharvey.onrender.com
- **DNS:** Namecheap domain pointing to Vercel

### Environment Variables
- **Frontend (Vercel):** Supabase keys, backend API URL
- **Backend (Render):** Twilio, OpenAI, Deepgram, ElevenLabs, Supabase keys
- **Local:** `.env` templates provided in each directory

## 🔧 Known Issues & Workarounds

1. **Render free tier sleeps after 15min** → Warm up before demos
2. **Twilio webhook signature validation** → Currently disabled
3. **Voice calls need pipecat locally** → Too heavy for Render (PyTorch ~2GB)
4. **API key rotation needed** → Using Pratzyy's OpenAI key temporarily

## 📊 Key Metrics & Validation

- **SMS delivery to India:** ✅ Confirmed working pre-suspension
- **GPT-4o qualification:** ✅ 4-message loop extracts all 5 fields
- **Supabase persistence:** ✅ Data survives server restarts  
- **Frontend auth flow:** ✅ Magic link signup working
- **Landing page conversion:** 🔄 Not tested (no traffic yet)

## 💡 Strategic Decisions Made

1. **Text-first approach** - Voice calls are premium feature
2. **Self-serve product** - No concierge, agents upload own leads
3. **Dubai market focus** - AED pricing, local Property Finder integration
4. **Demo-first outreach** - Manual WhatsApp + screenshots, not live backend

## 🎨 Design & Brand

- **Harvey Specter aesthetic** - Dark navy + gold, serif headings
- **Dubai-native** - Built for local market, not adapted
- **Professional tone** - No emojis, polished business communication
- **Mobile-first** - Dubai agents work from phones

## 📞 Stakeholder Context

- **Rambo (founder)** - Young dev, action-oriented, wants speed
- **Market** - 20,000+ licensed agents in Dubai, highly competitive
- **Problem** - First agent to respond wins, manual calling is too slow
- **Solution** - 60-second AI response beats human speed

## 🚀 Potential Pivots (If Direction Changes)

**Similar markets:** 
- Other real estate markets (UK, US, Australia)  
- High-velocity sales (insurance, SaaS, automotive)
- Any industry where speed-to-lead matters

**Adjacent products:**
- Lead scoring/routing without calls
- CRM integration for existing agents  
- WhatsApp Business API for Dubai market

## 🏁 Success Criteria (Pre-Hold)

**Week 1 target:** 10 Dubai agents signed up via manual outreach  
**Month 1 target:** 50 agents, 1000 qualified leads processed
**Validation metric:** Average time from lead → viewing booked

---

**This project is ready to resume or pivot as directed.**  
All code, configs, and context preserved in repository.