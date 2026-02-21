import Link from "next/link";
import { Phone, Upload, Calendar, BarChart3, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-accent" />
          <span className="font-semibold text-lg text-white">Call Harvey</span>
        </div>
        <Link
          href="/dashboard"
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
          AI-Powered Cold Calling for Real Estate
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Your leads go cold in 5 minutes.
          <br />
          <span className="text-accent">Harvey calls in 60 seconds.</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
          Upload your leads, and Harvey calls each one within 60 seconds. Natural American voice.
          Qualifies budget, timeline, and preferences. Books showings on your Google Calendar.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how"
            className="border border-border hover:border-neutral-600 text-neutral-300 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Pricing */}
      <section className="max-w-md mx-auto px-6 py-20 text-center">
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
          <Link
            href="/dashboard"
            className="block w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-lg transition-colors text-center"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-neutral-500 text-sm">
        © 2025 Call Harvey. Built for real estate agents who want to close more deals.
      </footer>
    </div>
  );
}
