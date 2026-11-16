import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Ladder } from "../story/ladder";
import { Finale, Hero } from "@/components/page-kit";
import { FOUNDING, PRICE, RUNNING, SALARY } from "@/lib/offer";
import { SITE_URL } from "@/lib/site";
import { EXAMPLE, RATE, WEEKS, gbp, num, processCost } from "@/lib/sum";

export const metadata: Metadata = {
  title: "Pricing: sprint £3,500, first build from £12,000",
  description: "Every price published. Intro call free. Sprint £3,500 fixed. First build from £12,000, half on signature and half when it passes the written test. Embedded engineer from £4,500 a month.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: "Pricing | Webflow Outreach", url: "/pricing" },
};

const eg = processCost(EXAMPLE.people, EXAMPLE.hoursEach, RATE, PRICE.build);
const IN = [
  ["The written pass test", "Agreed before we start. It says what working means, on your own examples."],
  ["Ten identical runs", "Every workflow is run ten times before release, including on empty and hostile input."],
  ["An independent review", "A senior engineer from outside the build reviews it before it goes live. Their fee is inside the fixed price."],
  ["Handover", "The code on your accounts, and a runbook any developer could follow."],
];

// Matches the visible text on this page. No FAQ markup.
const LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI engineers who work inside your business",
  provider: { "@type": "Organization", name: "Webflow Outreach", url: SITE_URL },
  areaServed: "GB",
  offers: [
    { "@type": "Offer", name: "Intro call", price: "0", priceCurrency: "GBP" },
    { "@type": "Offer", name: "Sprint", price: String(PRICE.sprint), priceCurrency: "GBP" },
    { "@type": "Offer", name: "First build", priceCurrency: "GBP", priceSpecification: { "@type": "PriceSpecification", minPrice: String(PRICE.build), priceCurrency: "GBP" } },
    { "@type": "Offer", name: "Embedded engineer, per month", priceCurrency: "GBP", priceSpecification: { "@type": "UnitPriceSpecification", minPrice: String(PRICE.embedded), priceCurrency: "GBP", unitText: "month" } },
  ],
};

export default function Pricing() {
  return (
    <>
      <Reveal />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      <main className="sb sub">
        <Hero kicker="Pricing" title="Four steps." sub="Every price is published."
          lede="Fixed prices, agreed in writing before any work starts. No day rates. You can stop after any step and keep what you have." />

        <section className="frame dark slab">
          <div className="wrap">
            <Ladder />
            <div className="also">
              <div className="reveal"><span>Running costs</span><b>At cost</b><p>{RUNNING}</p></div>
              <div className="reveal"><span>Founding clients</span><b>Three places</b><p>{FOUNDING}</p></div>
              <div className="reveal"><span>VAT</span><b>On the quote</b><p>If VAT applies, it is shown on your written quote before you sign.</p></div>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <div>
              <h2 className="h2 reveal">How the build is paid. <span>Half, then half.</span></h2>
            </div>
            <div className="prose">
              <div className="halves reveal">
                <div><b>Half</b>on signature</div>
                <div><b>Half</b>when it passes the written test</div>
              </div>
              <p className="reveal">The test is written down and agreed before we start. If the build does not pass, the second half is not due, and we keep working until it does.</p>
              <p className="reveal">For a build at {gbp(PRICE.build)}, that is {gbp(PRICE.build / 2)} and {gbp(PRICE.build / 2)}.</p>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <p className="slate reveal"><span>Worked example</span>Example figures, at the lowest build price</p>
            <h2 className="h2 reveal">One weekly report. <span>What it would cost to fix.</span></h2>
            <div className="cols" style={{ marginTop: 36 }}>
              <dl className="qa">
                <div className="reveal"><dt>Today, by hand</dt><dd>{EXAMPLE.people} people, {EXAMPLE.hoursEach} hours a week each, {WEEKS} weeks a year, at {gbp(RATE)} an hour. That is {num(eg.hoursYear)} hours and {gbp(eg.byHand)} a year.</dd></div>
                <div className="reveal"><dt>Sprint</dt><dd>{gbp(PRICE.sprint)}, paid on booking.</dd></div>
                <div className="reveal"><dt>First build</dt><dd>{gbp(PRICE.build)}, signed within 30 days, so the sprint is credited. That leaves {gbp(PRICE.build - PRICE.sprint)} to pay, half on signature and half when it passes the test.</dd></div>
                <div className="reveal"><dt>Total</dt><dd>{gbp(PRICE.build)}, plus running costs at cost.</dd></div>
              </dl>
              <div>
                <ul className="bars reveal">
                  <li>
                    <div className="bl"><span>Costs by hand, a year</span><b>{gbp(eg.byHand)}</b></div>
                    <div className="track"><i style={{ width: "100%" }} /></div>
                  </li>
                  <li>
                    <div className="bl"><span>Estimated to come off, a year</span><b>{gbp(eg.low)} to {gbp(eg.high)}</b></div>
                    <div className="track"><i className="hi" style={{ width: `${(eg.high / eg.byHand) * 100}%` }} /><i style={{ width: `${(eg.low / eg.byHand) * 100}%` }} /></div>
                    <small>Solid is the low estimate, hatched the high one.</small>
                  </li>
                  <li>
                    <div className="bl"><span>Sprint and first build, once</span><b>{gbp(PRICE.build)}</b></div>
                    <div className="track"><i className="us" style={{ width: `${(PRICE.build / eg.byHand) * 100}%` }} /></div>
                  </li>
                </ul>
                <p className="fine reveal">On the low estimate the build pays for itself in about {eg.payback} months. An estimate, not a promise: it assumes the build takes 40 to 70% of the work off those people. <Link href="/#payoff">Put your own numbers in</Link>.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">Inside the fixed price. <span>Not extras.</span></h2>
            <ul className="cards c2" style={{ marginTop: 36 }}>
              {IN.map(([t, d]) => <li key={t} className="reveal"><b>{t}</b><p>{d}</p></li>)}
            </ul>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">Hire one, <span>or use us.</span></h2>
            <div className="prose">
              <p className="reveal">The median advertised salary for a UK AI engineer is {SALARY.median} ({SALARY.source}). With employer costs that is roughly {SALARY.loaded} a year.</p>
              <p className="reveal">Sometimes hiring is the right answer, and we say when. <Link href="/compare">The comparison, side by side</Link>.</p>
            </div>
          </div>
        </section>

        <Finale where="pricing-bottom" />
      </main>
    </>
  );
}
