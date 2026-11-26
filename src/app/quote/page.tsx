import type { Metadata } from "next";
import { TrackLink } from "@/components/track-link";
import { social } from "@/lib/site";
import { Calculator } from "./calculator";
import "./calc.css";

const TITLE = "A free quoting calculator for machine shops";
const DESCRIPTION = "Put in the part, get a price with the working shown, on your own rates. Free, and it always will be.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/quote" },
  ...social(`${TITLE} | Webflow Outreach`, "/quote", DESCRIPTION),
};

// A plain calculator. No AI, no account, no calls to a server: the sums run in the browser and the rates stay in it.
export default function Quote() {
  return (
    <main className="sb sub qc">
      <section className="sub-hero">
        <div className="wrap">
          <h1 className="h1 qc-h1">A free quoting calculator for machine shops.</h1>
          <p className="lede">Put in the part, get a price with the working shown, on your own rates. Free, and it always will be.</p>
          <p className="fine qc-note">Example rates to start. Change them to yours and they stay in this browser. Nothing is sent anywhere.</p>
        </div>
      </section>

      <section className="frame qc-frame" aria-label="Calculator">
        <div className="wrap">
          <Calculator />
        </div>
      </section>

      <section className="frame dark finale qc-end">
        <div className="wrap">
          <p className="end-p qc-who">We&rsquo;re forward deployed engineers. We come into businesses and use AI to take work off people&rsquo;s desks.</p>
          <p className="qc-links">
            <TrackLink where="quote-calc" href="/start" className="group big-cta">
              Book a call
              <span aria-hidden className="chip">→</span>
            </TrackLink>
            <TrackLink where="quote-calc-pricing" href="/pricing" className="ghost-link">Pricing</TrackLink>
          </p>
        </div>
      </section>
    </main>
  );
}
