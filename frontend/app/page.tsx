"use client";

import { useState } from "react";
import { Phone, Upload, Calendar, BarChart3, ArrowRight, ChevronDown, Shield } from "lucide-react";

/* ─── Waitlist Form ─── */
function WaitlistForm({ className = "" }: { className?: string }) {
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
    <form onSubmit={handleSubmit} className={`flex gap-3 ${className}`}>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors min-w-0"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-accent-hover text-bg font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
      >
        {loading ? "..." : <>Let Harvey work for you <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}

/* ─── FAQ Accordion ─── */
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
        <div key={i} className="border border-border rounded-xl overflow-hidden bg-surface/50">
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

/* ─── Gold Divider ─── */
function Divider() {
  return <div className="gold-divider max-w-4xl mx-auto my-0" />;
}

/* ─── Main Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-accent" />
          <span className="font-semibold text-lg text-white tracking-wide">Call Harvey</span>
        </div>
        <a
          href="#waitlist"
          className="bg-accent hover:bg-accent-hover text-bg text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Get Early Access
        </a>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="max-w-4xl mx-auto px-6 pt-28 pb-20 text-center relative">
        {/* Subtle suited silhouette — CSS only */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex justify-center items-start overflow-hidden">
          <svg width="400" height="600" viewBox="0 0 400 600" fill="white">
            <path d="M200 40c-25 0-45 20-45 45s20 45 45 45 45-20 45-45-20-45-45-45zm-60 110c-15 5-25 20-25 35v200l-30 180h50l25-160h5v160h70v-160h5l25 160h50l-30-180V185c0-15-10-30-25-35l-35-10-35 10z"/>
          </svg>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8 relative">
          Harvey never loses a lead.
        </h1>
        <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          60-second AI callbacks. Qualification. Bookings.
          <br className="hidden sm:block" />
          Your leads don&apos;t stand a chance.
        </p>

        <div id="waitlist" className="max-w-xl mx-auto mb-5">
          <WaitlistForm />
        </div>
        <p className="text-sm text-muted/70">
          Join <span className="text-white font-medium">50+ agents</span> on the early access waitlist
        </p>
      </section>

      <Divider />

      {/* ═══ TRUST CARD ═══ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="bg-surface border border-border rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-start gap-6 gold-glow">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-white text-2xl font-bold mb-3">&ldquo;Is this a robot?&rdquo;</h3>
            <p className="text-muted leading-relaxed text-lg">
              Harvey sounds human, qualifies like a pro, and always tells your leads he&apos;s AI.
              No shady tactics. Ever.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-14">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Upload, num: "01", title: "Upload Leads", desc: "CSV upload or connect your lead source. Leads hit the queue instantly." },
            { icon: Phone, num: "02", title: "Harvey Calls in 60s", desc: "Each lead gets a call with a natural American voice. No robocalls." },
            { icon: BarChart3, num: "03", title: "Qualifies & Scores", desc: "Budget, timeline, neighborhood, pre-approval — all extracted automatically." },
            { icon: Calendar, num: "04", title: "Books Showings", desc: "Interested leads get a showing booked directly on your Google Calendar." },
          ].map((step) => (
            <div key={step.num} className="bg-surface border border-border rounded-xl p-6 relative">
              <span className="font-serif text-accent text-3xl font-bold opacity-40 absolute top-4 right-5">{step.num}</span>
              <step.icon className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ═══ HARVEY VS HUMAN ISA ═══ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-14">Harvey vs. a Human ISA</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Human ISA */}
          <div className="bg-surface border border-border rounded-xl p-7">
            <h3 className="text-muted font-semibold text-lg mb-6">Human ISA</h3>
            <div className="space-y-4">
              {[
                { label: "Cost", value: "$2,000/mo" },
                { label: "Calls/day", value: "~40" },
                { label: "Availability", value: "9–5 only" },
                { label: "Turnover", value: "~3 months" },
                { label: "Ramp time", value: "2–4 weeks" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-muted/70">{r.label}</span>
                  <span className="text-muted">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Harvey */}
          <div className="bg-surface border-2 border-accent rounded-xl p-7 relative gold-glow">
            <div className="absolute -top-3 right-4 bg-accent text-bg text-xs font-bold px-3 py-1 rounded-full tracking-wide">
              10× CHEAPER
            </div>
            <h3 className="text-white font-semibold text-lg mb-6">Harvey</h3>
            <div className="space-y-4">
              {[
                { label: "Cost", value: "$299/mo" },
                { label: "Calls/day", value: "Unlimited" },
                { label: "Availability", value: "24/7" },
                { label: "Turnover", value: "Never quits" },
                { label: "Ramp time", value: "5 minutes" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-muted/70">{r.label}</span>
                  <span className="text-accent font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══ HARVEY QUOTES ═══ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="space-y-12">
          {[
            "I don't have leads. I have closings.",
            "While you sleep, I'm booking showings.",
            "First to call wins. I call in 60 seconds. You do the math.",
          ].map((quote, i) => (
            <div key={i} className="text-center">
              <span className="quote-mark">&ldquo;</span>
              <p className="font-serif italic text-2xl sm:text-3xl text-white/90 -mt-6 mb-2 leading-snug">
                {quote}
              </p>
              <span className="quote-mark">&rdquo;</span>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ═══ PRICING ═══ */}
      <section className="max-w-md mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-12">Simple Pricing</h2>
        <div className="bg-surface border border-accent/30 rounded-2xl p-8 sm:p-10 gold-glow">
          <div className="text-5xl sm:text-6xl font-bold text-white mb-1">
            <span className="text-accent">$299</span><span className="text-xl text-muted font-normal">/mo</span>
          </div>
          <p className="text-muted mb-8">That&apos;s less than your ISA&apos;s first week.</p>
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
                <span className="text-accent text-lg">✓</span> {item}
              </li>
            ))}
          </ul>
          <WaitlistForm />
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
      <section className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to never lose a lead again?
        </h2>
        <p className="text-muted mb-8">Get early access to Harvey and start converting leads on autopilot.</p>
        <WaitlistForm className="justify-center" />
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted/60">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-accent/50" />
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
