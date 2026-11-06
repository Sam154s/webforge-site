import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Three faces only: Archivo (display, uses its width axis), Hanken Grotesk (body), JetBrains Mono (code).
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Webflow Outreach: AI builds it once. Plain code runs it forever.",
  description:
    "We set up an AI workflow builder inside your business. Describe a problem in plain English and it builds a plain-code workflow that runs without AI: same result every time, nothing per run, code you own.",
  openGraph: { title: "Webflow Outreach", description: "AI builds it once. Plain code runs it forever.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
