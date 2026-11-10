import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { SafeAnalytics } from "@/components/safe-analytics";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Three faces only: Archivo (display, uses its width axis), Hanken Grotesk (body), JetBrains Mono (code).
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

const DESCRIPTION =
  "A free 30 minute diagnostic for UK limited companies with 5 to 50 staff. You get a ranked list of what to fix, with a pound range on each, in your own dashboard.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Webflow Outreach: find the jobs costing you money, then fix the first one", template: "%s | Webflow Outreach" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Webflow Outreach: free diagnostic for UK limited companies",
    description: DESCRIPTION,
    type: "website",
    siteName: "Webflow Outreach",
    locale: "en_GB",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Webflow Outreach: free diagnostic", description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <SafeAnalytics />
      </body>
    </html>
  );
}
