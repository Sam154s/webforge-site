import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, DM_Mono } from "next/font/google";
import { SafeAnalytics } from "@/components/safe-analytics";
import { SiteHeader } from "@/components/site-header";
import { StoryRail } from "@/components/story-rail";
import { HeaderSwitch } from "@/components/header-switch";
import { SiteFooter } from "@/components/site-footer";
import { DESCRIPTION, EMAIL, LABEL, SITE_URL } from "@/lib/site";
import { COMPANY } from "@/lib/company";
import "./globals.css";
import "./story.css";

// Three faces only: Bricolage Grotesque (display, with its optical size and width axes), Figtree (body),
// DM Mono (code and drawing dimensions only; every label is set in Figtree).
const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-display", display: "swap" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Webflow Outreach: ${LABEL}`, template: "%s | Webflow Outreach" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `Webflow Outreach: ${LABEL}`,
    description: DESCRIPTION,
    type: "website",
    siteName: "Webflow Outreach",
    locale: "en_GB",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: `Webflow Outreach: ${LABEL}`, description: DESCRIPTION },
};

// Organization markup. It carries only what the pages show: legal details are added when they are set.
const ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Webflow Outreach",
  url: SITE_URL,
  email: EMAIL,
  description: DESCRIPTION,
  areaServed: "GB",
  ...(COMPANY.name && { legalName: COMPANY.name }),
  ...(COMPANY.address && { address: COMPANY.address }),
  ...(COMPANY.vat && { vatID: COMPANY.vat }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <HeaderSwitch home={<StoryRail />} other={<SiteHeader />} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <SafeAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      </body>
    </html>
  );
}
