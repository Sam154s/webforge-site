import type { Metadata } from "next";
import Link from "next/link";
import { TrackLink } from "@/components/track-link";
import { social } from "@/lib/site";
import { Examples, Tool } from "./tool";
import "./check.css";

const TITLE = "A free drawing check for machine shops";
const DESCRIPTION = "Drop in a customer's drawing and your own AI account checks it against your shop: what it asks for, what's missing, and the email to send back. Free, and it always will be.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/drawing-check" },
  ...social(`${TITLE} | Webflow Outreach`, "/drawing-check", DESCRIPTION),
};

// No upload to us and no AI call on our side. The check runs in the visitor's browser on their own AI account.
export default function DrawingCheck() {
  return (
    <main className="sb sub dc">
      <section className="sub-hero dc-hero dc-noprint">
        <div className="wrap">
          <h1 className="h1 dc-h1">A free drawing check for machine shops.</h1>
          <p className="lede">Drop in a customer&rsquo;s drawing and your own AI account checks it against your shop: what it asks for, what&rsquo;s missing, and the email to send back. Free, and it always will be.</p>
          <p className="dc-trust">Your drawings and your key go from this page straight to your AI provider. They never reach us.</p>
        </div>
      </section>

      <section className="frame dc-frame" aria-label="The drawing check">
        <div className="wrap">
          <Tool />
        </div>
      </section>

      <section className="frame dc-frame dc-noprint" aria-labelledby="dc-get">
        <div className="wrap">
          <h2 id="dc-get" className="dc-h2">What you get</h2>
          <p className="dc-intro">Two real results from drawings in our test set, checked against the example shop. The customers and the shop are made up.</p>
          <Examples />
        </div>
      </section>

      <section className="frame dark finale dc-end dc-noprint">
        <div className="wrap">
          <p className="dc-pitch">Want it running on your quotes inbox by itself, every drawing checked before your estimator opens it? That&rsquo;s what we build.</p>
          <h2 className="end-h dc-end-h">We&rsquo;re forward deployed engineers.</h2>
          <p className="end-p">We come into businesses and use AI to take work off people&rsquo;s desks.</p>
          <div className="end-cta">
            <TrackLink where="drawing-check" href="/start" className="group big-cta">
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
