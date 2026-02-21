"use client";

import { useState } from "react";
import { Phone, Upload, Calendar, BarChart3, ArrowRight, ChevronDown, Shield, MessageSquare, Zap } from "lucide-react";

function WaitlistForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Store locally for now — add backend later
    try {
      const existing = JSON.parse(localStorage.getItem("harvey_waitlist") || "[]");
      existing.push({ email, ts: new Date().toISOString() });
      localStorage.setItem("harvey_waitlist", JSON.stringify(existing));
    } catch {
      // silent fail
    }
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 text-green-400 font-medium ${className}`}>
        <span>✓</span> You&apos;re on the list! We&apos;ll be in touch soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent transition-colors min-w-0"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
      >
        {loading ? "..." : <>Get Early Access <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}

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
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left text-white font-medium hover:bg-surface/50 transition-colors"
          >
            {faq.q}
            <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-6 pb-4 text-neutral-400 text-sm leading-relaxed">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-accent" />
          <span className="font-semibold text-lg text-white">Call Harvey</span>
        </div>
        <a
          href="#waitlist"
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Get Early Access
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-8 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
          AI-Powered Inside Sales Agent for Real Estate
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Your leads go cold in 5 minutes.
          <br />
          <span className="text-accent">Harvey calls in 60 seconds.</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-4">
          Upload your leads, and Harvey calls each one within 60 seconds. Natural American voice.
          Qualifies budget, timeline, and preferences. Books showings on your Google Calendar.
        </p>

        {/* ISA Price Comparison — hero line */}
        <p className="text-xl font-semibold text-white mb-10">
          <span className="text-accent">$299/mo</span>{" "}
          <span className="text-neutral-500">vs $2,000/mo for a human ISA.</span>{" "}
          Same job. 10× cheaper.
        </p>

        {/* Waitlist CTA */}
        <div id="waitlist" className="max-w-lg mx-auto mb-6">
          <WaitlistForm />
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Join <span className="text-white font-medium">50+ agents</span> on the early access waitlist
        </p>

        <a
          href="#how"
          className="inline-block border border-border hover:border-neutral-600 text-neutral-300 font-medium px-6 py-3 rounded-lg transition-colors"
        >
          See How It Works
        </a>
      </section>

      {/* Trust Section */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">&quot;Is this a robot?&quot;</h3>
            <p className="text-neutral-400 leading-relaxed">
              Harvey sounds human, qualifies like a pro, and always discloses it&apos;s AI.
              Your leads get a great experience. You get booked showings.
              Fully TCPA compliant — no shady tactics, ever.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Upload, title: "Upload Leads", desc: "CSV upload or connect Zillow. Leads hit the queue instantly." },
          { icon: Phone, title: "AI Calls in 60s", desc: "Harvey calls each lead with a natural American voice. No robocalls." },
          { icon: BarChart3, title: "Qualify & Score", desc: "Budget, timeline, neighborhood, pre-approval — all extracted automatically." },
          { icon: Calendar, title: "Book Showings", desc: "Interested leads get a showing booked directly on your Google Calendar." },
        ].map((f) => (
          <div key={f.title} className="bg-surface border border-border rounded-xl p-6">
            <f.icon className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-neutral-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Comparison Section */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Harvey vs. a Human ISA</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Human ISA */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-neutral-400 font-semibold text-lg mb-6">Human ISA</h3>
            <div className="space-y-4">
              {[
                { label: "Cost", value: "$2,000/mo" },
                { label: "Calls/day", value: "~40" },
                { label: "Availability", value: "9–5 only" },
                { label: "Turnover", value: "~3 months" },
                { label: "Ramp time", value: "2–4 weeks" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-neutral-500">{r.label}</span>
                  <span className="text-neutral-300">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Harvey */}
          <div className="bg-surface border-2 border-accent rounded-xl p-6 relative">
            <div className="absolute -top-3 right-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              10× CHEAPER
            </div>
            <h3 className="text-white font-semibold text-lg mb-6">Harvey</h3>
            <div className="space-y-4">
              {[
                { label: "Cost", value: "$299/mo", highlight: true },
                { label: "Calls/day", value: "Unlimited", highlight: true },
                { label: "Availability", value: "24/7", highlight: true },
                { label: "Turnover", value: "Never quits", highlight: true },
                { label: "Ramp time", value: "5 minutes", highlight: true },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-neutral-500">{r.label}</span>
                  <span className={r.highlight ? "text-accent font-medium" : "text-neutral-300"}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-md mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Simple Pricing</h2>
        <div className="bg-surface border border-border rounded-xl p-8">
          <div className="text-5xl font-bold text-white mb-2">$299<span className="text-lg text-neutral-500">/mo</span></div>
          <p className="text-neutral-400 mb-6">Unlimited leads · Unlimited calls · Recordings included</p>
          <ul className="text-left text-sm text-neutral-300 space-y-2 mb-8">
            {["AI calls within 60 seconds", "Natural American voice", "Lead qualification & scoring", "Google Calendar integration", "Call recordings & summaries", "CSV upload + Zillow connect"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-accent">✓</span> {item}
              </li>
            ))}
          </ul>
          <WaitlistForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <FAQ />
      </section>

      {/* Final CTA */}
      <section className="max-w-lg mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to stop losing leads?</h2>
        <p className="text-neutral-400 mb-6">Get early access to Harvey and start converting leads on autopilot.</p>
        <WaitlistForm className="justify-center" />
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>© 2025 Call Harvey</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="mailto:hello@callharvey.co" className="hover:text-neutral-300 transition-colors">hello@callharvey.co</a>
            <a href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-neutral-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
