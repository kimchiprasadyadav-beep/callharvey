"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Phone, ArrowRight, Check } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-12">
          <Phone className="w-6 h-6 text-accent" />
          <span className="font-serif text-2xl text-white tracking-wide">Call Harvey</span>
        </Link>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-serif text-xl text-white mb-2">Check your email</h2>
              <p className="text-muted text-sm leading-relaxed">
                We sent a magic link to{" "}
                <span className="text-white font-medium">{email}</span>.
                <br />
                Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-accent text-sm hover:text-accent-hover transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-2xl text-white text-center mb-1">Welcome back</h1>
              <p className="text-muted text-sm text-center mb-8">
                Sign in to your dashboard
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-muted mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="harvey@specter.com"
                    required
                    className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors text-sm"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover text-bg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? "Sending link…" : "Send magic link"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-neutral-600 text-xs mt-6">
          No password needed. We&apos;ll email you a secure sign-in link.
        </p>
      </div>
    </div>
  );
}
