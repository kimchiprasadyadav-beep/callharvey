import { Phone, Clock, CheckCircle, Calendar, User, ArrowRight, Star, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-accent" />
            <span className="font-semibold text-lg tracking-tight">Harvey</span>
          </div>
          <a
            href="#pricing"
            className="bg-accent text-bg px-5 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            Get early access
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface text-sm text-muted mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 active-pulse" />
            Built for Dubai real estate. Not adapted for it.
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            The difference between the agent who{" "}
            <span className="text-accent">closes</span> and the one who{" "}
            <span className="text-muted">chases</span>?
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Harvey AI calls your Property Finder and Bayut leads in 60 seconds.
            Qualifies budget, timeline, visa status. Books the viewing — while
            you&apos;re at your last one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#pricing"
              className="group bg-accent text-bg px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2"
            >
              Get early access
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <span className="text-sm text-muted">Free trial · No credit card</span>
          </div>
        </div>
      </section>

      <div className="gold-divider max-w-2xl mx-auto" />

      {/* Pain Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-center">
            You know the feeling.
          </h2>
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 gold-corners">
            <p className="text-lg text-muted leading-relaxed">
              You&apos;re at a viewing in Dubai Marina. The client&apos;s asking
              about service charges, and your phone buzzes — new lead from
              Property Finder.
            </p>
            <p className="text-lg text-muted leading-relaxed mt-4">
              By the time you finish, <span className="text-white font-medium">three other agents have already called</span>.
              The lead picked the first one who answered. They didn&apos;t even
              remember your listing.
            </p>
            <p className="text-lg text-white leading-relaxed mt-6 font-medium">
              You didn&apos;t lose because you&apos;re worse. You lost because
              you were slower.
            </p>
            <p className="text-accent text-lg mt-6 font-serif italic">
              Harvey makes sure that never happens again.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
            How Harvey works
          </h2>
          <p className="text-muted text-center mb-16 text-lg">
            Five steps. Zero missed leads.
          </p>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: "01", icon: Zap, title: "Lead comes in", desc: "From Property Finder, Bayut, or your CRM" },
              { step: "02", icon: Phone, title: "Harvey calls in 60s", desc: "Professional, human-like AI voice call" },
              { step: "03", icon: CheckCircle, title: "Qualifies the lead", desc: "Budget, timeline, visa status, preferences" },
              { step: "04", icon: Calendar, title: "Books the viewing", desc: "Syncs with your calendar automatically" },
              { step: "05", icon: User, title: "You show up", desc: "To a qualified, confirmed prospect" },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-14 h-14 rounded-xl bg-bg border border-border flex items-center justify-center mx-auto mb-4 group-hover:border-accent/50 transition-colors">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-xs font-mono text-accent mb-2">{item.step}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16">
            The numbers don&apos;t lie
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "20,000+", label: "Licensed agents in Dubai competing for the same leads" },
              { stat: "60-80%", label: "Of property seekers expect a callback within minutes" },
              { stat: "Top 10%", label: "Of agents close 80% of all deals — speed is the difference" },
            ].map((item) => (
              <div
                key={item.stat}
                className="bg-surface border border-border rounded-2xl p-8 text-center hover:border-accent/30 transition-colors"
              >
                <div className="text-4xl md:text-5xl font-bold text-accent font-serif mb-3">
                  {item.stat}
                </div>
                <p className="text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gold-divider max-w-2xl mx-auto" />

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
            Simple pricing. Real ROI.
          </h2>
          <p className="text-muted text-center mb-6 text-lg max-w-2xl mx-auto">
            One closed deal pays for a year of Harvey. How many are you losing now?
          </p>
          {/* Anchor */}
          <div className="text-center mb-12">
            <div className="inline-flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted bg-surface border border-border rounded-full px-6 py-3">
              <span>Property Finder: <span className="text-white">AED 5K–25K/mo</span></span>
              <span className="hidden sm:inline text-border">|</span>
              <span>Human PA: <span className="text-white">AED 4K–6K/mo</span></span>
              <span className="hidden sm:inline text-border">|</span>
              <span>Harvey: <span className="text-accent font-semibold">AED 999/mo</span></span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col">
              <h3 className="text-lg font-semibold mb-1">Starter</h3>
              <p className="text-sm text-muted mb-6">For agents getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">AED 349</span>
                <span className="text-muted">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted mb-8 flex-1">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> 100 AI calls per month</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Lead qualification</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Viewing booking</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Email summaries</li>
              </ul>
              <a href="#" className="block text-center border border-border hover:border-accent/50 rounded-xl py-3 font-semibold transition-colors">
                Start free trial
              </a>
            </div>
            {/* Growth */}
            <div className="bg-surface border-2 border-accent rounded-2xl p-8 flex flex-col relative gold-glow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-1">Growth</h3>
              <p className="text-sm text-muted mb-6">For serious closers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-accent">AED 999</span>
                <span className="text-muted">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted mb-8 flex-1">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> 500 AI calls per month</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Lead qualification + scoring</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Viewing booking + reminders</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> CRM integration</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Priority support</li>
              </ul>
              <a href="#" className="block text-center bg-accent text-bg hover:bg-accent-hover rounded-xl py-3 font-semibold transition-colors">
                Start free trial
              </a>
            </div>
            {/* Pro */}
            <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col">
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-sm text-muted mb-6">For top-producing teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">AED 1,999</span>
                <span className="text-muted">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted mb-8 flex-1">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Unlimited AI calls</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Everything in Growth</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Multi-agent support</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Custom AI voice</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" /> Dedicated account manager</li>
              </ul>
              <a href="#" className="block text-center border border-border hover:border-accent/50 rounded-xl py-3 font-semibold transition-colors">
                Start free trial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16">
            Early agents are already closing more
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "I was losing 3-4 leads a week to faster agents. Harvey changed that.",
                author: "Beta agent",
                location: "Business Bay",
              },
              {
                quote: "Set it up in 10 minutes. Paid for itself in the first callback.",
                author: "Beta agent",
                location: "Dubai Marina",
              },
            ].map((t) => (
              <div
                key={t.location}
                className="bg-bg border border-border rounded-2xl p-8 relative"
              >
                <div className="quote-mark absolute top-4 left-6">&ldquo;</div>
                <p className="text-lg leading-relaxed mt-8 mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.author}</div>
                    <div className="text-xs text-muted">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            Dubai&apos;s top agents aren&apos;t waiting.
          </h2>
          <p className="text-lg text-muted mb-10 max-w-xl mx-auto">
            Built for Dubai. Launching with 50 agents. You should be one of them.
          </p>
          <a
            href="#pricing"
            className="group inline-flex items-center gap-2 bg-accent text-bg px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            Start your free trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-sm text-muted mt-4">callharvey.co</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Phone className="w-4 h-4 text-accent" />
            <span>Harvey AI</span>
            <span className="mx-2 text-border">·</span>
            <span>Built for Dubai real estate</span>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
