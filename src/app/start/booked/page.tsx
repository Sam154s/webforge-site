import type { Metadata } from "next";
import Link from "next/link";
import { BOOKING_URL, EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request received",
  description: "What happens next after you ask for an intro call.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/start/booked" },
};

const NEXT = [
  ["Pick a time", ""],
  ["The call", "Thirty minutes. Tell us what is slow or painful. We ask who does it, how often, and what it costs when it goes wrong."],
  ["A straight answer", "Before we hang up you know whether it is something we fix. If it is, we send one page on the Diagnosis and its price. If it is not, we say so."],
];
const BRING = [
  "Nothing to prepare.",
  "If you can, think of the last time the process went wrong, and who had to sort it out.",
  "If someone else looks after your systems and logins, tell us who. We bring them in early.",
];

export default function Booked() {
  return (
    <main className="sb sub">
      <section className="sub-hero">
        <div className="wrap">
          <p className="slate"><span>Request received</span></p>
          <h1 className="h1">Thanks. <span>Here is what happens next.</span></h1>
          <p className="lede"><span className="note" style={{ fontSize: "1rem" }}>{BOOKING_URL ? "Pick a time now. It takes a minute." : "We will email you some times to choose from."}</span></p>
        </div>
      </section>
      <section className="frame" style={{ paddingTop: 0 }}>
        <div className="wrap cols">
          <ol className="steps">
            {NEXT.map(([t, d], i) => (
              <li key={t}>
                <b>{t}</b>
                {i === 0 ? (
                  BOOKING_URL ? (
                    <a href={BOOKING_URL} target="_blank" rel="noopener" className="group mt-3 inline-flex items-center gap-3 rounded-full bg-ink text-stone font-semibold pl-6 pr-2 py-2 min-h-[44px]">
                      Pick a time
                      <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-lime text-ink transition-transform duration-300 ease-apple group-hover:translate-x-0.5">→</span>
                    </a>
                  ) : <p>Reply to our email with the time that suits you best.</p>
                ) : <p>{d}</p>}
              </li>
            ))}
          </ol>
          <div>
            <h2 className="h3">What to bring</h2>
            <dl className="qa" style={{ marginTop: 18 }}>
              {BRING.map((b) => <div key={b}><dd style={{ margin: 0, color: "var(--ink)" }}>{b}</dd></div>)}
            </dl>
            <p className="fine">While you wait, <Link href="/examples">try one of our tools</Link>. Questions to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
