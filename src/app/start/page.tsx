import type { Metadata } from "next";
import { Reveal } from "../reveal";
import { StartForm } from "./start-form";
import { landingFor } from "@/lib/outreach";
import { EMAIL } from "@/lib/site";
import { situation } from "@/lib/situations";

const base: Metadata = {
  title: "Book an intro call",
  description: "Thirty minutes, free. Tell us what is slow or painful and get a straight answer on whether we can help, what the next step is and what it costs.",
  alternates: { canonical: "/start" },
  openGraph: { title: "Book an intro call | Webflow Outreach", url: "/start" },
};

// A visit with a token (c) is a personal link from an email: keep it out of search results.
export function generateMetadata({ searchParams }: { searchParams: { c?: string } }): Metadata {
  return searchParams.c ? { ...base, robots: { index: false, follow: false } } : base;
}

const SIDE = [
  ["What happens on the call", "You tell us what is slow or painful. We ask who does it, how often, and what it costs when it goes wrong."],
  ["What you get", "A straight answer on whether it is something we fix. If it is, the next step and its price. If it is not, we say so."],
  ["What it is not", "Not a pitch, not a report, and not a promise of savings."],
  ["Who it is for", "UK limited companies with about 30 to 250 people."],
];

export default async function StartPage({ searchParams }: { searchParams: { c?: string; situation?: string } }) {
  const known = await landingFor(searchParams.c);
  const sit = situation(searchParams.situation ?? "")?.key ?? situation(known?.situation ?? "")?.key;
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <section className="sub-hero">
          <div className="wrap start">
            <div className="s-head">
              <p className="slate"><span>Start</span>Free, 30 minutes</p>
              <h1 className="h1">Book an intro call.</h1>
              <p className="lede">Tell us what is slow. You get a straight answer on whether we can help.</p>
            </div>
            <div className="s-form">
              <StartForm defaults={known ? { company: known.company, website: known.website } : undefined} situation={sit} />
            </div>
            <div className="s-side">
              <dl className="qa">
                {SIDE.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
              </dl>
              <p className="fine">Rather write? <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
