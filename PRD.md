# Call Harvey — Product Requirements Document

**Product:** Call Harvey — AI Cold Caller for Real Estate Agents
**Domain:** callharvey.co
**Version:** 1.0
**Date:** February 22, 2026
**Status:** Draft

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution](#2-solution)
3. [User Personas](#3-user-personas)
4. [User Flows](#4-user-flows)
5. [Feature Requirements — MVP](#5-feature-requirements--mvp)
6. [Feature Requirements — V2](#6-feature-requirements--v2)
7. [Technical Architecture](#7-technical-architecture)
8. [Pricing](#8-pricing)
9. [Success Metrics](#9-success-metrics)
10. [Competitive Landscape](#10-competitive-landscape)
11. [Risks & Mitigations](#11-risks--mitigations)

---

## 1. Problem Statement

Real estate is a speed game. The agent who calls first wins — and almost nobody calls fast enough.

### The Lead Waste Problem

- **Agents spend $500–2,000/mo** on leads from Zillow, Realtor.com, and Facebook Ads
- **78% of deals go to the first agent who responds** (MIT/InsideSales.com study)
- **Average agent response time: 47 hours** — but leads go cold in **5 minutes**
- Result: agents burn thousands per month on leads they never convert because they simply can't call fast enough

### The ISA Problem

- Inside Sales Agents (ISAs) cost **$1,500–3,000/mo** (salary + tools + management overhead)
- ISA turnover is brutal — average tenure is 6–12 months
- Training a new ISA takes 2–4 weeks of ramp time
- ISAs are inconsistent: mood, energy, and call quality vary day to day
- Solo agents and small teams can't afford a dedicated ISA at all

### The Math

A solo agent buying 100 Zillow leads/mo at $15/lead = $1,500/mo in lead spend. If they convert 2% (industry average with slow follow-up), that's 2 deals. If they called every lead within 60 seconds, conversion jumps to 5–8% — that's 5–8 deals from the same spend. The bottleneck isn't lead quality. It's speed to lead.

---

## 2. Solution

**Call Harvey** is an AI-powered outbound caller that contacts real estate leads within 60 seconds of capture, qualifies them through natural conversation, and books showings directly on the agent's calendar.

### Core Value Proposition

| Capability | Call Harvey | Human ISA |
|---|---|---|
| Speed to lead | < 60 seconds | 5 min – 48 hours |
| Cost | $299/mo | $1,500–3,000/mo |
| Availability | 24/7 (within business hours) | 8 hours/day, M–F |
| Consistency | Every call, same quality | Varies by mood/day |
| Scalability | Instant | Hire + train (weeks) |

### How It Works

1. **Lead arrives** — via Zillow webhook, CSV upload, or CRM integration
2. **Harvey calls within 60 seconds** — natural American voice, not robotic
3. **Qualification conversation** — Harvey asks about:
   - Budget range
   - Purchase/sale timeline
   - Preferred neighborhoods
   - Property type (single family, condo, townhouse, etc.)
   - Interest in scheduling a showing
4. **Outcome routing:**
   - **Hot lead** → Books showing on agent's Google Calendar, sends SMS confirmation to lead
   - **Warm lead** → Tags for nurture sequence, schedules callback
   - **Not interested** → Logs and moves on
5. **Agent gets a summary** — call recording, transcription, qualification data, and next steps delivered via email/SMS/dashboard

---

## 3. User Personas

### Persona 1: Solo Agent — "Sarah"

- **Profile:** Independent agent, 3 years in the business, licensed in suburban Texas market
- **Lead volume:** 50–200 leads/mo from Zillow + Facebook Ads
- **Pain:** Can't call leads fast enough while doing showings, open houses, and paperwork. Knows she's losing deals to faster agents. Can't afford a $2K/mo ISA.
- **Goal:** Call every lead within minutes, not hours. Convert more of her existing lead spend.
- **Budget sensitivity:** High — needs to see ROI within 30 days
- **Tech comfort:** Moderate — uses Google Calendar, Zillow CRM, basic tools

### Persona 2: Team Lead — "Marcus"

- **Profile:** Runs a 4-agent team in Phoenix metro, 8 years experience
- **Lead volume:** 200–500 leads/mo, distributes across team
- **Pain:** Agents are inconsistent with follow-up. Some leads fall through cracks. Hired an ISA once — they quit after 4 months.
- **Goal:** Consistent, immediate follow-up on every lead with fair distribution to agents. Accountability and visibility.
- **Budget sensitivity:** Medium — already spending $3K/mo on leads, will pay for proven conversion lift
- **Tech comfort:** High — uses Follow Up Boss, multiple lead sources

### Persona 3: Brokerage Owner — "Diana"

- **Profile:** Owns a 25-agent brokerage in South Florida, 15 years experience
- **Lead volume:** 500–2,000 leads/mo across multiple sources
- **Pain:** Currently employs 3 ISAs ($7,500/mo total) with constant turnover and training. Quality is inconsistent. Wants to scale without linear headcount growth.
- **Goal:** Replace or augment ISA team, reduce cost per qualified lead, standardize qualification criteria across the brokerage.
- **Budget sensitivity:** Low — focused on unit economics and scalability
- **Tech comfort:** Delegates to ops manager — needs clean admin dashboard and reporting

---

## 4. User Flows

### 4.1 Onboarding Flow

```
Sign Up (email or Google OAuth)
    │
    ├─→ Welcome Screen — "Let's get Harvey ready to call"
    │
    ├─→ Step 1: Connect Google Calendar
    │       └─ OAuth flow → select calendar for showings
    │
    ├─→ Step 2: Add Lead Source
    │       ├─ Option A: Upload CSV (name, phone, email, source)
    │       ├─ Option B: Connect Zillow webhook (guided setup)
    │       └─ Option C: Manual entry (for testing)
    │
    ├─→ Step 3: Set Business Hours
    │       └─ Define calling window (e.g., 9 AM – 8 PM local)
    │
    ├─→ Step 4: Customize (optional)
    │       ├─ Voice preference (male/female, tone)
    │       ├─ Greeting script adjustments
    │       └─ Qualification criteria weights
    │
    ├─→ Step 5: Test Call
    │       └─ Harvey calls YOUR phone so you hear what leads hear
    │
    └─→ Go Live → Dashboard
```

**Target:** Onboarding complete in < 10 minutes. First real call within 15 minutes of signup.

### 4.2 Call Flow

```
Lead Ingested (webhook/CSV/manual)
    │
    ├─→ Validate phone number (format, carrier lookup, DNC check)
    │
    ├─→ Check business hours
    │       ├─ Within hours → Call immediately (< 60s)
    │       └─ Outside hours → Queue for next business hour window
    │
    ├─→ Twilio initiates outbound call
    │       ├─ No answer → Retry logic (3 attempts over 24h)
    │       ├─ Voicemail → [V2: drop custom voicemail]
    │       └─ Connected → Begin conversation
    │
    ├─→ Qualification Conversation
    │       ├─ Introduction: "Hi [Name], this is Harvey calling on behalf
    │       │   of [Agent Name] at [Brokerage]. I understand you were
    │       │   looking at properties in [Area]..."
    │       │
    │       ├─ Qualify:
    │       │   ├─ Budget range
    │       │   ├─ Timeline (buying/selling when?)
    │       │   ├─ Preferred neighborhoods
    │       │   ├─ Property type
    │       │   └─ Interest in seeing a property
    │       │
    │       └─ Handle objections naturally:
    │           ├─ "I'm just browsing" → gauge timeline
    │           ├─ "I already have an agent" → graceful exit
    │           ├─ "How did you get my number?" → explain lead source
    │           └─ "Is this a robot?" → transparent disclosure
    │
    ├─→ Outcome
    │       ├─ BOOK SHOWING
    │       │   ├─ Check agent calendar availability
    │       │   ├─ Propose times to lead
    │       │   ├─ Create calendar event
    │       │   └─ Send confirmation (SMS to lead, email to agent)
    │       │
    │       ├─ NURTURE
    │       │   ├─ Tag lead as warm
    │       │   ├─ Schedule follow-up call (3 days, 7 days)
    │       │   └─ [V2: trigger SMS drip]
    │       │
    │       └─ NOT INTERESTED
    │           ├─ Log reason
    │           └─ Mark as closed
    │
    └─→ Post-Call
        ├─ Save recording + transcription
        ├─ Generate qualification summary
        ├─ Notify agent (email/SMS with summary)
        └─ Update dashboard
```

### 4.3 Dashboard Flow

```
Dashboard Home
    │
    ├─→ Overview Cards
    │       ├─ Calls today / this week / this month
    │       ├─ Connection rate
    │       ├─ Showings booked
    │       └─ Leads in pipeline
    │
    ├─→ Leads Table
    │       ├─ Filter: status, source, date, agent
    │       ├─ Each row: name, phone, status, last action, assigned agent
    │       └─ Click → Lead detail (all calls, recordings, transcripts, notes)
    │
    ├─→ Calls Log
    │       ├─ Date, lead, duration, outcome, recording player
    │       └─ Transcript viewer with qualification highlights
    │
    ├─→ Calendar View
    │       └─ Showings booked by Harvey, synced with Google Calendar
    │
    └─→ Settings
        ├─ Business hours
        ├─ Voice + script customization
        ├─ Lead source connections
        ├─ Agent management (team/brokerage plans)
        ├─ Notification preferences
        └─ Billing
```

---

## 5. Feature Requirements — MVP

### 5.1 Lead Ingestion

| Requirement | Details |
|---|---|
| CSV Upload | Accept CSV with columns: name, phone, email (optional), source (optional). Validate phone format. Deduplicate by phone number. |
| Zillow Webhook | Receive Zillow lead notifications via webhook. Parse lead data (name, phone, property of interest, search criteria). |
| Manual Entry | Single lead form in dashboard for testing/one-offs. |
| DNC Check | Cross-reference against National Do Not Call Registry before dialing. |
| Lead Queue | Queue with priority (newest first). Respect business hours. Retry logic for no-answer. |

### 5.2 AI Outbound Calling

| Requirement | Details |
|---|---|
| Telephony | Twilio Programmable Voice for outbound calls. Purchase local numbers matching agent's area code. |
| Voice Pipeline | Pipecat framework orchestrating: Deepgram STT → Claude conversation engine → ElevenLabs TTS → Twilio audio stream. |
| Latency Target | < 800ms response time (STT + LLM + TTS) for natural conversation feel. |
| Voice Quality | ElevenLabs with natural American voice. Male and female options. No robotic tone. |
| Call Duration | Target 2–5 minutes for qualification. Graceful wrap-up at 8 minutes. |
| Concurrent Calls | Support up to 10 concurrent calls per account (brokerage tier). |

### 5.3 Qualification Conversation

| Requirement | Details |
|---|---|
| LLM Engine | Claude (Anthropic) with real-estate-specific system prompt. |
| Conversation Flow | Dynamic — not a rigid script. Adapts to lead responses. Follows qualification framework but feels natural. |
| Qualification Fields | Budget range, timeline, preferred neighborhoods, property type (SFH/condo/townhouse/land), showing interest (yes/no/maybe), pre-approval status. |
| Objection Handling | Trained responses for: "just browsing," "have an agent," "how'd you get my number," "is this AI." |
| AI Disclosure | Transparent: if asked, Harvey confirms it's an AI assistant calling on behalf of [Agent Name]. Compliant with FTC guidelines. |
| Context Awareness | Uses lead source data (e.g., "I see you were looking at 123 Oak St on Zillow") to personalize. |
| Conversation Guardrails | Stay on topic. Don't provide legal/financial advice. Don't make promises about pricing or availability. Escalate to human agent when needed. |

### 5.4 Calendar Booking

| Requirement | Details |
|---|---|
| Google Calendar Integration | OAuth2 connection. Read agent availability. Create events. |
| Availability Logic | Check agent's calendar for open slots. Propose 2–3 options to lead. |
| Event Creation | Title: "Showing — [Lead Name]". Description: property interest, qualification summary. Attendees: agent + lead email (if provided). |
| Confirmation | SMS to lead confirming time + agent info. Email to agent with lead summary. |
| Time Zone | Auto-detect from agent's calendar settings. All times communicated in lead's local time. |

### 5.5 Call Recording & Transcription

| Requirement | Details |
|---|---|
| Recording | Record all calls via Twilio. Store in Supabase Storage (S3-compatible). |
| Transcription | Deepgram post-call transcription with speaker diarization. |
| Summary | Claude generates structured summary: qualification answers, sentiment, recommended next action. |
| Retention | 90-day recording retention (Starter), 1 year (Pro/Brokerage). |
| Compliance | Recording disclosure at start of call ("This call may be recorded for quality purposes"). State-specific two-party consent handling. |

### 5.6 Dashboard

| Requirement | Details |
|---|---|
| Framework | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Authentication | Supabase Auth — email/password + Google OAuth |
| Pages | Overview, Leads, Calls, Calendar, Settings, Billing |
| Real-time | Supabase Realtime for live call status updates |
| Responsive | Desktop-first, mobile-friendly (agents check on the go) |
| Audio Player | In-browser playback of call recordings with transcript sync |

### 5.7 Agent Settings

| Requirement | Details |
|---|---|
| Business Hours | Per-day schedule with timezone. Support for holidays/blackout dates. |
| Voice Preference | Select from 3–4 voice options (male/female, warm/professional). Preview before saving. |
| Qualification Criteria | Toggle which fields Harvey asks about. Set priority order. Add custom questions (up to 3). |
| Notification Preferences | Email and/or SMS alerts for: showing booked, hot lead, daily summary. |
| Script Customization | Edit intro greeting, closing statement, and agent/brokerage branding. |

---

## 6. Feature Requirements — V2

### 6.1 CRM Integrations

- **Follow Up Boss** — Bi-directional sync: push qualified leads + call notes, pull lead assignments
- **KVCore** — Lead sync + activity logging
- **Sierra Interactive** — Webhook integration for lead flow
- **API-first approach** — Public REST API for custom CRM connections

### 6.2 SMS Follow-Up

- Automated post-call SMS: "Thanks for chatting with us! [Agent Name] will be in touch about your showing on [Date]."
- Nurture sequences: 3-touch SMS drip for warm leads over 14 days
- Two-way SMS: leads can reply to reschedule or ask questions (routed to agent)

### 6.3 Multi-Language Support

- Spanish (priority — large US real estate market segment)
- Mandarin Chinese
- Language detection in first 10 seconds → auto-switch

### 6.4 A/B Testing Call Scripts

- Create script variants for intro, qualification flow, and closing
- Random assignment with statistical significance tracking
- Dashboard showing conversion rates per variant

### 6.5 Lead Scoring

- Score 0–100 based on qualification responses, engagement signals, property interest data
- Auto-prioritize high-score leads for agent follow-up
- Scoring model improves over time with outcome feedback

### 6.6 Voicemail Detection & Custom Drop

- AMD (Answering Machine Detection) via Twilio
- Drop pre-recorded voicemail: "Hi [Name], this is Harvey from [Agent's Name] team. I'm calling about your property search..."
- Track voicemail → callback conversions

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   Next.js 14 (Vercel)                        │
│         Dashboard · Onboarding · Settings · Billing          │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST + Realtime
┌──────────────────────▼──────────────────────────────────────┐
│                       SUPABASE                               │
│   Auth · PostgreSQL · Storage · Realtime · Edge Functions     │
└──────┬───────────────────────────────────┬──────────────────┘
       │                                   │
┌──────▼──────────┐              ┌─────────▼─────────────────┐
│  LEAD INGESTION  │              │     VOICE PIPELINE         │
│  (Edge Function) │              │   (Railway / Fly.io)       │
│                  │              │                             │
│  Zillow Webhook  │──triggers──▶│  Pipecat Orchestrator       │
│  CSV Parser      │              │    ├─ Twilio (telephony)   │
│  DNC Check       │              │    ├─ Deepgram (STT)       │
│                  │              │    ├─ Claude (conversation) │
│                  │              │    └─ ElevenLabs (TTS)      │
└─────────────────┘              └─────────────┬───────────────┘
                                               │
                                  ┌────────────▼──────────────┐
                                  │    INTEGRATIONS            │
                                  │  Google Calendar API       │
                                  │  Twilio SMS                │
                                  │  SendGrid (email)          │
                                  │  [V2: CRM APIs]            │
                                  └────────────────────────────┘
```

### 7.2 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 + Tailwind + shadcn/ui | Dashboard, onboarding, settings |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Database | Supabase PostgreSQL | Leads, calls, agents, settings, call logs |
| File Storage | Supabase Storage | Call recordings (mp3/wav) |
| Realtime | Supabase Realtime | Live call status, dashboard updates |
| Voice Orchestration | Pipecat | Pipeline management for voice AI |
| Telephony | Twilio Programmable Voice | Outbound calls, recording, DTMF |
| STT | Deepgram Nova-2 | Real-time speech-to-text |
| LLM | Claude (Anthropic) | Conversation engine, summarization |
| TTS | ElevenLabs | Natural voice synthesis |
| Backend Hosting | Railway or Fly.io | Voice pipeline server (needs persistent connections) |
| Frontend Hosting | Vercel | Next.js deployment |
| Email | SendGrid | Transactional emails (summaries, confirmations) |
| SMS | Twilio Messaging | Lead confirmations, agent notifications |
| Payments | Stripe | Subscriptions, metered billing |
| Monitoring | Sentry + Axiom | Error tracking + log aggregation |

### 7.3 Voice Pipeline Detail

```
Twilio Outbound Call
    │
    ├─→ WebSocket audio stream to Pipecat server
    │
    ├─→ Deepgram STT (streaming)
    │       └─ Real-time transcription with endpointing
    │
    ├─→ Claude Conversation Engine
    │       ├─ System prompt: real estate qualification expert
    │       ├─ Conversation state: tracks what's been asked/answered
    │       ├─ Tool calls: check_calendar, book_showing, end_call
    │       └─ Output: response text + any tool actions
    │
    ├─→ ElevenLabs TTS (streaming)
    │       └─ Low-latency streaming synthesis
    │
    └─→ Twilio audio stream (back to caller)

Target round-trip latency: < 800ms
```

### 7.4 Database Schema (Key Tables)

```sql
-- Agents (users)
agents: id, email, name, brokerage, phone, timezone,
        business_hours (jsonb), voice_preference, plan,
        google_calendar_token, created_at

-- Leads
leads: id, agent_id, name, phone, email, source,
       source_data (jsonb), status (new/calling/qualified/nurture/closed),
       score, created_at

-- Calls
calls: id, lead_id, agent_id, twilio_sid, status,
       duration_seconds, outcome (booked/nurture/not_interested/no_answer/voicemail),
       qualification_data (jsonb), summary, transcript,
       recording_url, created_at

-- Showings
showings: id, call_id, lead_id, agent_id, calendar_event_id,
          scheduled_at, property_address, status (confirmed/cancelled/completed),
          created_at

-- Call Queue
call_queue: id, lead_id, priority, scheduled_at, attempts,
            status (pending/in_progress/completed/failed), created_at
```

### 7.5 Security & Compliance

- All data encrypted at rest (Supabase) and in transit (TLS)
- PII handling: phone numbers and recordings access-controlled per agent
- TCPA compliance: only call leads who have provided prior express consent via lead form
- Recording consent: automated disclosure at call start
- Two-party consent states: enhanced disclosure for CA, FL, IL, etc.
- SOC 2 consideration for V2 (enterprise/brokerage sales)
- Data retention policies enforced per plan tier

---

## 8. Pricing

### Tier Structure

| | Starter | Pro | Brokerage |
|---|---|---|---|
| **Price** | $99/mo | $299/mo | $599/mo |
| **Calls/mo** | 100 | 500 | 2,000 |
| **Agents** | 1 | 5 | Unlimited |
| **Lead Sources** | CSV + 1 webhook | CSV + 3 webhooks | Unlimited |
| **CRM Integration** | — | ✓ (V2) | ✓ (V2) |
| **Recording Retention** | 90 days | 1 year | 1 year |
| **Support** | Email | Email + Chat | Priority (phone + chat) |
| **Custom Voice** | — | — | ✓ |
| **Overage** | $1.50/call | $1.00/call | $0.75/call |

### Unit Economics

| Cost Component | Per Call Estimate |
|---|---|
| Twilio (outbound, ~3 min avg) | $0.08 |
| Deepgram STT (3 min) | $0.04 |
| Claude API (conversation) | $0.05 |
| ElevenLabs TTS (3 min) | $0.12 |
| Infrastructure | $0.03 |
| **Total COGS per call** | **~$0.32** |

At Pro tier ($299/mo, 500 calls): $0.60 revenue/call vs $0.32 cost = **47% gross margin**.

### Go-to-Market Pricing Strategy

- **14-day free trial** — 25 calls included, no credit card required
- **Annual discount** — 20% off (billed annually)
- **Referral program** — 1 free month per referred agent who converts

---

## 9. Success Metrics

### Primary KPIs

| Metric | Target | Measurement |
|---|---|---|
| **Call Connection Rate** | > 40% | Connected calls / total attempted |
| **Qualification Completion Rate** | > 60% | Fully qualified / connected calls |
| **Showing Booking Rate** | > 15% | Showings booked / connected calls |
| **Agent Retention (MoM)** | > 80% | Active agents month N / month N-1 |

### Secondary KPIs

| Metric | Target | Measurement |
|---|---|---|
| Speed to Lead | < 60 seconds | Time from lead ingestion to call initiated |
| Average Call Duration | 2–5 minutes | For connected, qualified calls |
| Onboarding Completion | > 70% | Signups that complete setup + first call |
| NPS | > 50 | Quarterly agent survey |
| Trial → Paid Conversion | > 25% | Free trial users who subscribe |
| Revenue Churn | < 5%/mo | MRR lost / total MRR |

### Tracking Infrastructure

- **Product analytics:** PostHog (self-hosted or cloud)
- **Call metrics:** Custom dashboard pulling from Supabase + Twilio
- **Revenue metrics:** Stripe dashboard + internal reporting
- **Agent feedback:** In-app NPS survey (monthly) + post-onboarding survey

---

## 10. Competitive Landscape

### Direct Competitors

| Competitor | Type | Price | Strengths | Weaknesses |
|---|---|---|---|---|
| **Structurely** | AI text/chat | $300–500/mo | Established brand, text-based nurture | No voice — misses the speed-to-lead advantage of a phone call |
| **Ylopo** | AI nurture platform | $500+/mo | Full marketing suite, strong integrations | Expensive, complex setup, not focused on instant outbound calling |
| **Human ISA Services** (e.g., REDX, Mojo) | Human callers | $1,500–3,000/mo | Human touch, can handle complex conversations | Expensive, inconsistent quality, high turnover, limited hours |

### Adjacent / Generic Competitors

| Competitor | Type | Price | Why Harvey Wins |
|---|---|---|---|
| **Synthflow** | Generic AI voice | $29–450/mo | Not real-estate-specific. No qualification framework, no calendar booking, no industry context. |
| **Bland AI** | Generic AI calling | Custom pricing | Developer-focused, requires engineering to set up. No turnkey real estate solution. |
| **Vapi** | Voice AI platform | Usage-based | Infrastructure layer, not a product. Agent would need to build everything themselves. |
| **Air AI** | AI phone agent | Custom | Enterprise-focused, expensive, long sales cycles. Not built for individual agents. |

### Harvey's Competitive Moat

1. **Vertical focus** — Purpose-built for real estate. Every prompt, script, and feature is designed for lead qualification and showing booking.
2. **Speed** — < 60 second speed to lead, out of the box. No setup required beyond connecting a lead source.
3. **Price point** — $299/mo vs $2K+/mo for human ISAs. Clear ROI story.
4. **Ease of use** — 10-minute onboarding. No technical skills required.
5. **Data flywheel** — Every call improves the conversation model. Over time, Harvey gets better at qualifying real estate leads than any generic AI.

---

## 11. Risks & Mitigations

### Risk 1: TCPA Compliance

| | |
|---|---|
| **Risk** | The Telephone Consumer Protection Act (TCPA) requires prior express consent before making AI/automated calls. Violations carry $500–1,500 per call in damages. |
| **Mitigation** | Only call leads who submitted a form with clear consent language (Zillow, Realtor.com lead forms include this). Maintain consent records. Scrub against DNC registry. Consult telecom attorney for state-specific compliance. Add clear consent language to any Harvey-hosted lead capture forms. |
| **Severity** | High |
| **Likelihood** | Medium |

### Risk 2: Call Quality / Uncanny Valley

| | |
|---|---|
| **Risk** | If Harvey sounds robotic or can't handle unexpected conversation turns, it damages the agent's brand and loses leads. |
| **Mitigation** | Use highest-quality ElevenLabs voices. Extensive prompt engineering with real call transcripts. Graceful fallback: "Let me have [Agent Name] call you directly" when confused. Regular A/B testing of scripts. Agent can listen to recordings and flag issues. Continuous improvement loop. |
| **Severity** | High |
| **Likelihood** | Medium |

### Risk 3: Twilio Cost Management

| | |
|---|---|
| **Risk** | Per-minute Twilio costs could erode margins on long calls, spam numbers, or retry loops. |
| **Mitigation** | Hard call duration cap (8 min). Smart retry logic (max 3 attempts, increasing intervals). Carrier lookup to filter invalid/landline numbers before calling. Monitor per-account costs and alert on anomalies. Negotiate volume discounts with Twilio as scale grows. |
| **Severity** | Medium |
| **Likelihood** | Medium |

### Risk 4: Lead Data Privacy

| | |
|---|---|
| **Risk** | Handling PII (phone numbers, names, property interests) creates liability. Data breach would be catastrophic for trust. |
| **Mitigation** | Supabase RLS (Row Level Security) — agents can only access their own leads. Encryption at rest and in transit. Minimal data retention policies. SOC 2 compliance roadmap. Regular security audits. Privacy policy and DPA (Data Processing Agreement) for brokerage clients. |
| **Severity** | High |
| **Likelihood** | Low |

### Risk 5: Carrier Blocking / Spam Labeling

| | |
|---|---|
| **Risk** | Outbound calls from new numbers get flagged as spam by carriers (STIR/SHAKEN, spam databases). |
| **Mitigation** | Register numbers with Twilio's Trust Hub (A2P 10DLC). Use local numbers matching agent's area code. Warm up new numbers gradually. Monitor spam reports via free caller ID services. Rotate numbers if flagged. Keep call volumes reasonable per number. |
| **Severity** | High |
| **Likelihood** | High |

### Risk 6: LLM Hallucination / Off-Script

| | |
|---|---|
| **Risk** | Claude says something incorrect, makes a promise Harvey can't keep, or goes off-topic. |
| **Mitigation** | Tight system prompts with explicit guardrails. Never quote property prices, guarantee availability, or provide legal/financial advice. Regular transcript review pipeline. Automated flagging of conversations that deviate from expected patterns. Kill-switch capability for agents to pause Harvey instantly. |
| **Severity** | Medium |
| **Likelihood** | Medium |

---

## Appendix A: MVP Development Timeline

| Phase | Duration | Deliverables |
|---|---|---|
| **Phase 1: Foundation** | Weeks 1–3 | Supabase schema, auth, Next.js shell, Twilio account setup, basic dashboard layout |
| **Phase 2: Voice Pipeline** | Weeks 3–6 | Pipecat integration, Deepgram STT, ElevenLabs TTS, Claude conversation engine, end-to-end test call |
| **Phase 3: Lead Flow** | Weeks 6–8 | CSV upload, Zillow webhook, call queue, retry logic, DNC check |
| **Phase 4: Calendar + Notifications** | Weeks 8–9 | Google Calendar OAuth, availability checking, event creation, email/SMS notifications |
| **Phase 5: Dashboard + Polish** | Weeks 9–11 | Full dashboard (leads, calls, recordings, settings), onboarding flow, billing (Stripe) |
| **Phase 6: Beta** | Weeks 11–13 | 10–20 beta agents, collect feedback, iterate on prompts and voice quality |
| **Launch** | Week 14 | Public launch on callharvey.co |

## Appendix B: Conversation Example

```
HARVEY: Hi, is this Sarah?

LEAD: Yes, who's calling?

HARVEY: Hey Sarah! This is Harvey, I'm calling on behalf of Mike Chen
        at Keller Williams. I saw you were checking out that 3-bedroom
        on Maple Street — beautiful neighborhood. Do you have a quick
        minute?

LEAD: Oh yeah, I was looking at that one online. What about it?

HARVEY: Great taste — that one just came on the market last week.
        Are you actively looking to buy right now, or more in the
        early research phase?

LEAD: We're pretty serious. Probably looking to buy in the next
      couple months.

HARVEY: That's exciting! And do you have a budget range you're
        working with?

LEAD: Somewhere around 400 to 450.

HARVEY: Perfect, that's right in range for that area. Are you
        focused on that neighborhood specifically, or are you
        open to a few others nearby?

LEAD: We like Maple Heights and also Riverside. Good schools
      are important to us.

HARVEY: Totally makes sense — both great school districts. Would
        you be interested in seeing that Maple Street property?
        Mike has some time Thursday afternoon or Saturday morning.

LEAD: Saturday morning would work.

HARVEY: Awesome, I've got you down for Saturday at 10 AM with
        Mike at 247 Maple Street. He'll send you a confirmation
        with all the details. Is there anything else you'd like
        him to know before the showing?

LEAD: No, that covers it. Thanks!

HARVEY: Great, you're all set Sarah! Mike's looking forward to
        meeting you Saturday. Have a great evening!
```

---

*This document is the blueprint for Call Harvey's development. All feature decisions, technical choices, and design work should reference this PRD. Update as decisions evolve.*
