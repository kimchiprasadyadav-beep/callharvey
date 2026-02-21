import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Call Harvey — AI Inside Sales Agent",
  description: "AI cold caller for real estate agents. Qualify leads and book showings automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
