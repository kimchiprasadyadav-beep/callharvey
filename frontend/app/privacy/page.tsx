import Link from "next/link";
import { Phone } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Phone className="w-5 h-5 text-accent" />
          <span className="font-semibold text-lg text-white">Call Harvey</span>
        </Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-neutral-400 leading-relaxed">
          Privacy policy coming soon. For questions, contact{" "}
          <a href="mailto:hello@callharvey.co" className="text-accent hover:underline">hello@callharvey.co</a>.
        </p>
      </div>
    </div>
  );
}
