import type { Metadata } from "next";
import Link from "next/link";
import { TrackLink } from "@/components/track-link";
import { social } from "@/lib/site";
import { Tool } from "./tool";
import "./form.css";

const TITLE = "A free quote request form for your website";
const DESCRIPTION = "Build it, download it, it’s yours. We never see it or your customers’ details.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/quote-form" },
  ...social(`${TITLE} | Webflow Outreach`, "/quote-form", DESCRIPTION),
};

// The builder runs in the visitor's browser and the form it makes is a file they keep. There is no backend: the form
// opens their customer's own email app. Nothing typed here or into the form reaches us.
export default function QuoteForm() {
  return (
    <main className="sb sub qb">
      <section className="sub-hero qb-hero">
        <div className="wrap">
          <h1 className="h1 qb-h1">A free quote request form for your website.</h1>
          <p className="lede">Build it, download it, it&rsquo;s yours. We never see it or your customers&rsquo; details.</p>
        </div>
      </section>

      <section className="frame qb-frame" aria-label="The form builder">
        <div className="wrap">
          <Tool />
        </div>
      </section>

      <section className="frame dark finale qb-end">
        <div className="wrap">
          <h2 className="end-h qb-end-h">We&rsquo;re forward deployed engineers.</h2>
          <p className="end-p">We come into businesses and use AI to take work off people&rsquo;s desks.</p>
          <div className="end-cta">
            <TrackLink where="quote-form" href="/start" className="group big-cta">
              Book a call
              <span aria-hidden className="chip">→</span>
            </TrackLink>
            <p><Link href="/pricing">See pricing</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
