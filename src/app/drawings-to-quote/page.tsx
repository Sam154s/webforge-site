import type { Metadata } from "next";
import { TrackLink } from "@/components/track-link";
import { EMAIL, social } from "@/lib/site";
import { Inbox } from "./inbox";
import "./quote.css";

const TITLE = "Drawings to quote";
const DESCRIPTION = "A working example for a subcontract machine shop. A drawing comes in, the system reads it and prices it from the shop's own rate sheet, and the estimator checks and sends.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/drawings-to-quote" },
  ...social(`${TITLE} | Webflow Outreach`, "/drawings-to-quote", DESCRIPTION),
};

// A static record of a real run: eight emailed requests read and priced by the demo in our gym. No AI is called here and nothing is sent.
export default function DrawingsToQuote() {
  return (
    <main className="sb sub qd">
      <section className="sub-hero">
        <div className="wrap">
          <h1 className="h1 qd-h1">A drawing comes in. A priced quote is waiting for your estimator.</h1>
          <p className="lede">The system reads the drawing, prices it from your own rate sheet, and your estimator checks and sends. Nothing goes out without a person.</p>
        </div>
      </section>

      <section className="frame qd-frame" aria-label="Example inbox">
        <div className="wrap">
          <Inbox />
        </div>
      </section>

      <section className="frame dark finale">
        <div className="wrap">
          <h2 className="end-h">Try it on your drawings.</h2>
          <p className="end-p">Send us 20 past drawings and what you quoted for them. We&rsquo;ll run them through and show you our figures next to yours. It costs nothing.</p>
          <div className="end-cta">
            <TrackLink where="quote-demo" href="/start" className="group big-cta">
              Book a call
              <span aria-hidden className="chip">→</span>
            </TrackLink>
            <p>Or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          </div>
          <p className="fine qd-fiction">Corvane Precision and its customers are made up. The drawings, rates and prices are examples.</p>
        </div>
      </section>
    </main>
  );
}
