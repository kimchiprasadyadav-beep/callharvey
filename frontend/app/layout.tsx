import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Call Harvey — AI Inside Sales Agent",
  description: "AI cold caller for real estate agents. Qualify leads and book showings automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
