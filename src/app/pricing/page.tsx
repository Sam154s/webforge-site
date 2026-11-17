import type { Metadata } from "next";
import { Reveal } from "../reveal";
import { Ladder } from "../story/ladder";
import { Hero } from "@/components/page-kit";
import { Cta } from "@/components/track-link";
import { FOUNDING, PRICE } from "@/lib/offer";
import { SITE_URL, social } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing: Diagnosis £3,500, solution from £12,000",
  description: "Every price, up front. The call is free, a Diagnosis is £3,500, a Solution is from £12,000 and Upkeep is from £750 a month per system.",
  alternates: { canonical: "/pricing" },
  ...social("Pricing | Webflow Outreach", "/pricing"),
};

// Matches the visible text on this page. No FAQ markup.
const LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Webflow Outreach",
  provider: { "@type": "Organization", name: "Webflow Outreach", url: SITE_URL },
  areaServed: "GB",
  offers: [
    { "@type": "Offer", name: "Call", price: "0", priceCurrency: "GBP" },
    { "@type": "Offer", name: "Diagnosis", price: String(PRICE.diagnosis), priceCurrency: "GBP" },
    { "@type": "Offer", name: "Solution", priceCurrency: "GBP", priceSpecification: { "@type": "PriceSpecification", minPrice: String(PRICE.solution), priceCurrency: "GBP" } },
    { "@type": "Offer", name: "Upkeep, per system per month", priceCurrency: "GBP", priceSpecification: { "@type": "UnitPriceSpecification", minPrice: String(PRICE.upkeep), priceCurrency: "GBP", unitText: "month" } },
  ],
};

export default function Pricing() {
  return (
    <>
      <Reveal />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      <main className="sb sub">
        <Hero kicker="Pricing" title="Every price," sub="up front." />
        <section className="frame dark slab">
          <div className="wrap">
            <div className="sp"><Ladder full heading="h2" /></div>
            <p className="fine reveal">{FOUNDING}</p>
          </div>
        </section>
        <section className="frame">
          <div className="wrap">
            <Cta where="pricing-bottom" />
          </div>
        </section>
      </main>
    </>
  );
}
