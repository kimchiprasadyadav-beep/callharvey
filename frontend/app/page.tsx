"use client";

import { useState } from "react";
import { Upload, Phone, BarChart3, Calendar, ChevronDown, Play } from "lucide-react";

/* ─── Waitlist Form ─── */
function WaitlistForm({ className = "", cta = "DEPLOY HARVEY" }: { className?: string; cta?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const existing = JSON.parse(localStorage.getItem("harvey_waitlist") || "[]");
      existing.push({ email, ts: new Date().toISOString() });
      localStorage.setItem("harvey_waitlist", JSON.stringify(existing));
    } catch { /* silent */ }
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 text-accent font-medium ${className}`}>
        <span>✓</span> You&apos;re on the list. Harvey will be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-surface border border-border rounded px-4 py-3 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors min-w-0 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-accent-hover text-bg font-bold px-5 py-3 rounded transition-colors whitespace-nowrap disabled:opacity-50 text-sm tracking-widest"
      >
        {loading ? "..." : cta}
      </button>
    </form>
  );
}

/* ─── Gold H Medallion ─── */
function GoldMedallion() {
  return (
    <div className="w-10 h-10 rounded-full border-2 border-accent flex items-center justify-center bg-accent/10">
      <span className="font-serif text-accent text-lg font-bold">H</span>
    </div>
  );
}

/* ─── Live Call UI Mock ─── */
function LiveCallMock() {
  return (
    <div className="bg-[#0D1117] border border-[#1E2A3A] rounded-xl p-6 font-mono text-sm gold-corners relative overflow-hidden">
      {/* Subtle glow behind */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 terminal-line-1">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 active-pulse" />
          <span className="text-green-400 text-xs font-bold tracking-widest">ACTIVE SESSION</span>
        </div>
        <div className="h-px bg-gradient-to-r from-accent/40 to-transparent mb-4 terminal-line-1" />

        {/* Transcript */}
        <div className="space-y-3 text-[13px]">
          <div className="text-muted/60 terminal-line-2">▶ Starting lead call...</div>

          <div className="terminal-line-3">
            <span className="text-accent">◆ HARVEY:</span>{" "}
            <span className="text-white/90">&ldquo;Hi, I noticed your property search on Zillow. I have a buyer interested in that area — are you free at 2 PM?&rdquo;</span>
          </div>

          <div className="terminal-line-4">
            <span className="text-blue-400">◆ LEAD:</span>{" "}
            <span className="text-white/70">&ldquo;Yes, that works for me.&rdquo;</span>
          </div>

          <div className="flex items-center gap-2 terminal-line-5">
            <span className="text-green-400">✓</span>
            <span className="text-green-400 font-bold">Appointment Booked</span>
            <span className="cursor-blink text-accent ml-1">█</span>
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-5 pt-3 border-t border-[#1E2A3A] flex items-center justify-between text-[11px] text-muted/40 terminal-line-5">
          <span>Duration: 00:47</span>
          <span>Lead Score: 92/100</span>
          <span className="text-green-400/60">● Connected</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Waveform Visual ─── */
function Waveform() {
  const bars = [3, 5, 8, 12, 7, 15, 10, 13, 6, 9, 14, 8, 11, 5, 13, 7, 10, 15, 6, 9, 12, 8, 14, 5, 11, 7, 13, 10, 6, 15, 8, 12, 9, 5, 14, 11, 7, 10, 13, 8];
  return (
    <div className="flex items-center justify-center gap-[3px] h-16">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-accent/40 rounded-full"
          style={{
            height: `${h * 3}px`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const faqs = [
    { q: "Is this a robocall?", a: "No. Harvey uses a natural AI voice and always discloses it's AI at the start of every call. Fully TCPA compliant." },
    { q: "What if the lead doesn't answer?", a: "Harvey leaves a natural-sounding voicemail and can follow up via SMS automatically." },
    { q: "Do I need any technical setup?", a: "No. Upload a CSV or connect your lead source. Takes 5 minutes to get your first call out." },
    { q: "Can I hear what it sounds like?", a: "Demo recording coming soon. Join the waitlist and we'll send you a sample call." },
    { q: "Does it work with my CRM?", a: "We're integrating with Follow Up Boss, KVCore, and Sierra. More integrations coming soon." },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden bg-surface/50 gold-corners">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left text-white font-medium hover:bg-surface-light/50 transition-colors"
          >
            {faq.q}
            <ChevronDown className={`w-4 h-4 text-accent transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-muted text-sm leading-relaxed">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return <div className="gold-divider max-w-5xl mx-auto" />;
}

/* ─── Main Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      {/* ═══ NAV ═══ */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <GoldMedallion />
          <span className="font-serif text-xl font-bold text-white tracking-[0.15em] border border-accent/30 px-3 py-1">
            HARVEY
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted/70">
          <a href="#capabilities" className="hover:text-accent transition-colors tracking-wide">Capabilities</a>
          <a href="#performance" className="hover:text-accent transition-colors tracking-wide">Performance</a>
          <a href="#integration" className="hover:text-accent transition-colors tracking-wide">Integration</a>
          <a
            href="#deploy"
            className="bg-accent hover:bg-accent-hover text-bg font-bold px-5 py-2.5 rounded text-xs tracking-[0.2em] transition-colors"
          >
            DEPLOY HARVEY
          </a>
        </div>
      </nav>

      {/* ═══ HERO — Split Layout ═══ */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6">
              I don&apos;t just chase leads.{" "}
              <span className="text-accent">I close them.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted leading-relaxed mb-8 max-w-lg">
              Harvey isn&apos;t a chatbot. He&apos;s a Closer. A ruthless, tireless AI-driven Inside Sales Agent that engages leads within milliseconds and doesn&apos;t stop until the appointment is booked.
            </p>
            <div id="deploy" className="mb-4">
              <WaitlistForm />
            </div>
            <p className="text-sm text-muted/50 flex items-center gap-2">
              <span className="text-accent">●</span> Join 50+ agents on the early access waitlist
            </p>
          </div>

          {/* RIGHT — Live Call Mock */}
          <div className="lg:pl-4">
            <LiveCallMock />
          </div>
        </div>
      </section>

      {/* ═══ METRICS BAR ═══ */}
      <section id="performance" className="border-y border-border bg-surface/30">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { num: "0.2s", label: "Response Time" },
            { num: "24/7", label: "Uptime" },
            { num: "10×", label: "ROI Guarantee" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-accent mb-1">{stat.num}</div>
              <div className="text-xs sm:text-sm text-muted/60 tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW HARVEY WORKS — Bento Grid ═══ */}
      <section id="capabilities" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-4">How Harvey Works</h2>
        <p className="text-muted text-center mb-14 max-w-lg mx-auto">Four steps. Zero effort. Maximum closings.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Upload, num: "01", title: "Upload Leads", desc: "CSV upload or connect your lead source. Leads hit the queue instantly." },
            { icon: Phone, num: "02", title: "Harvey Calls in 60s", desc: "Each lead gets a call with a natural American voice. No robocalls." },
            { icon: BarChart3, num: "03", title: "Qualifies & Scores", desc: "Budget, timeline, neighborhood, pre-approval — all extracted automatically." },
            { icon: Calendar, num: "04", title: "Books Showings", desc: "Interested leads get a showing booked directly on your calendar." },
          ].map((step) => (
            <div key={step.num} className="bg-surface border border-border rounded-xl p-6 relative hover:border-accent/40 transition-colors group gold-corners">
              <span className="font-serif text-accent/20 text-4xl font-bold absolute top-3 right-4 group-hover:text-accent/40 transition-colors">{step.num}</span>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ═══ HARVEY VS HUMAN ISA ═══ */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-4">Harvey vs. a Human ISA</h2>
        <p className="text-muted text-center mb-14">The numbers speak for themselves.</p>

        {/* Editorial table */}
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-muted/60 font-normal text-xs uppercase tracking-widest">Metric</th>
                <th className="text-center px-6 py-4 text-muted/60 font-normal text-xs uppercase tracking-widest">Human ISA</th>
                <th className="text-center px-6 py-4 text-accent font-bold text-xs uppercase tracking-widest bg-accent/5">Harvey</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Monthly Cost", human: "$2,000+", harvey: "$299" },
                { label: "Calls Per Day", human: "~40", harvey: "Unlimited" },
                { label: "Availability", human: "9–5 M-F", harvey: "24/7/365" },
                { label: "Turnover Risk", human: "~3 months", harvey: "Never quits" },
                { label: "Ramp Time", human: "2–4 weeks", harvey: "5 minutes" },
                { label: "Response Time", human: "30+ min", harvey: "0.2 seconds" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="px-6 py-4 text-white font-medium">{row.label}</td>
                  <td className="px-6 py-4 text-center text-muted/60">{row.human}</td>
                  <td className="px-6 py-4 text-center text-accent font-semibold bg-accent/5">{row.harvey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Divider />

      {/* ═══ AUDIO DEMO ═══ */}
      <section id="integration" className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">Hear Harvey in Action</h2>
        <p className="text-muted mb-10">Listen to a real qualification call. No scripts. Pure AI.</p>

        <div className="bg-surface border border-border rounded-xl p-8 gold-corners">
          <Waveform />
          <div className="mt-6 flex items-center justify-center gap-4">
            <button className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center transition-colors group">
              <Play className="w-6 h-6 text-bg ml-0.5 group-hover:scale-110 transition-transform" />
            </button>
            <div className="text-left">
              <div className="text-white font-medium text-sm">Sample Call — Zillow Lead</div>
              <div className="text-muted/50 text-xs">Duration: 1:24</div>
            </div>
          </div>
          <p className="text-muted/40 text-xs mt-6">Audio demo coming soon — join the waitlist for early access</p>
        </div>
      </section>

      <Divider />

      {/* ═══ HARVEY QUOTE ═══ */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <span className="quote-mark">&ldquo;</span>
        <p className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white/90 -mt-8 mb-4 leading-snug">
          Real estate is war.<br />
          <span className="text-accent">Harvey is your weapon.</span>
        </p>
        <span className="quote-mark">&rdquo;</span>
      </section>

      <Divider />

      {/* ═══ PRICING ═══ */}
      <section className="max-w-lg mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-12">Retain Harvey</h2>
        <div className="bg-surface border border-accent/30 rounded-2xl p-8 sm:p-10 gold-glow gold-corners">
          <div className="text-5xl sm:text-6xl font-bold text-white mb-1">
            <span className="text-accent font-serif">$299</span><span className="text-xl text-muted font-normal">/mo</span>
          </div>
          <p className="text-muted mb-8 text-sm">That&apos;s less than your ISA&apos;s first week.</p>
          <ul className="text-left text-sm text-white/80 space-y-3 mb-8">
            {[
              "AI calls within 60 seconds",
              "Unlimited leads & calls",
              "Natural American voice",
              "Lead qualification & scoring",
              "Google Calendar integration",
              "Call recordings & summaries",
              "CSV upload + Zillow connect",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="text-accent">✓</span> {item}
              </li>
            ))}
          </ul>
          <WaitlistForm cta="RETAIN HARVEY" />
        </div>
      </section>

      <Divider />

      {/* ═══ FAQ ═══ */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <FAQ />
      </section>

      <Divider />

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Stop losing leads.<br />
          <span className="text-accent">Deploy Harvey.</span>
        </h2>
        <p className="text-muted mb-8">Your competitors are already calling. Are you?</p>
        <WaitlistForm className="justify-center" />
        <p className="text-xs text-muted/40 mt-4">
          <a href="#" className="hover:text-accent transition-colors">VIEW CASE STUDIES →</a>
        </p>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted/50">
          <div className="flex items-center gap-3">
            <GoldMedallion />
            <span>© 2025 Call Harvey</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="mailto:hello@callharvey.co" className="hover:text-accent transition-colors">hello@callharvey.co</a>
            <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
