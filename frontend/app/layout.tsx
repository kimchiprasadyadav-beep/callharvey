import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Call Harvey — AI Sales Agent for Dubai Real Estate",
  description: "Harvey AI calls your Property Finder and Bayut leads in 60 seconds. Qualifies budget, timeline, visa status. Books the viewing — while you're at your last one.",
  openGraph: {
    title: "Call Harvey — AI Sales Agent for Dubai Real Estate",
    description: "Harvey AI calls your Property Finder and Bayut leads in 60 seconds. Qualifies budget, timeline, visa status. Books the viewing.",
    url: "https://callharvey.co",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700;6..96,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
