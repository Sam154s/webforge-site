import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Finale, Hero } from "@/components/page-kit";
import { Cta } from "@/components/track-link";
import { FOUNDING } from "@/lib/offer";

export const metadata: Metadata = {
  title: "The sprint: £3,500 fixed",
  description: "We spend time with your team, measure the work, and leave a ranked list with a pound range on each item, one thing working on your real data, and a fixed quote. £3,500, credited against a build.",
  alternates: { canonical: "/sprint" },
  openGraph: { title: "The sprint: £3,500 fixed | Webflow Outreach", url: "/sprint" },
};

const STEPS = [
  ["Before", "A short call with whoever looks after your systems. We agree what we may see, where test data lives, and where any data is processed. In writing."],
  ["Watch", "We sit with the people who do the work and follow three real cases from start to finish. Every hand-off, every retype, every wait."],
  ["Measure", "People, hours a week, cost, errors and delays. Your numbers, with the date and the sample size on each."],
  ["Build one thing", "A small working piece, on your real data, in front of you."],
  ["Report", "A ranked list in your dashboard. Each item has a pound range, what it would cost to fix, and the payback month. One is marked do this first."],
  ["Decide", "A meeting with whoever runs operations and whoever signs. You get a fixed quote for the first build, with the written pass test attached."],
];
const LEAVE = [
  ["A ranked list", "Every problem we found, with a pound range and a payback on each. And a list of what not to automate."],
  ["One thing working", "On your real data, not a demo. Small, but it runs."],
  ["A fixed quote", "For the first build, with the written pass test that decides when the second half is due."],
];
const NEED = [
  ["Someone senior who owns the problem", "An operations, managing or finance director who wants it fixed."],
  ["Time with the people who do the work", "We learn more from watching one real case than from a workshop."],
  ["A test copy, or exports", "We do not need your live system. We do need something real to work on."],
  ["Your IT person or provider, early", "They agree what we can see and they keep control of access."],
];

export default function Sprint() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="The sprint" title="We come in, measure the work," sub="and leave something working."
          lede="£3,500 fixed. Credited in full against a build signed within 30 days.">
          <div className="btn-row fade" style={{ animationDelay: ".3s" }}>
            <Cta where="sprint-top" />
            <Link href="/sample-report" className="ghost-link">See a sample sprint report</Link>
          </div>
        </Hero>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">What happens. <span>In order.</span></h2>
            <ol className="steps">
              {STEPS.map(([t, d]) => <li key={t} className="reveal"><b>{t}</b><p>{d}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">What you leave with. <span>Whether or not you build.</span></h2>
            <ul className="cards c3" style={{ marginTop: 36 }}>
              {LEAVE.map(([t, d], i) => <li key={t} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}><span className="tag ai">{i + 1} of 3</span><b>{t}</b><p>{d}</p></li>)}
            </ul>
            <p className="fine reveal">If nothing is worth building, the report says so. <Link href="/sample-report">A sample report for a made-up firm of 100 people</Link>.</p>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">What we need <span>from you.</span></h2>
            <dl className="qa">
              {NEED.map(([t, d]) => <div key={t} className="reveal"><dt>{t}</dt><dd>{d}</dd></div>)}
            </dl>
          </div>
        </section>

        <section className="frame dark slab" id="price">
          <div className="wrap cols">
            <div>
              <h2 className="h2 reveal">£3,500. <span>Fixed.</span></h2>
            </div>
            <div className="also" style={{ marginTop: 0 }}>
              <div className="reveal"><span>When you pay</span><b>On booking</b><p>The sprint starts once it is paid.</p></div>
              <div className="reveal"><span>If you go on to build</span><b>Credited in full</b><p>Sign a build within 30 days and the £3,500 comes off its price.</p></div>
              <div className="reveal"><span>The first build</span><b>From £12,000</b><p>Fixed in writing. Half on signature, half when it passes the written test. <Link href="/pricing">Pricing in full</Link>.</p></div>
              <div className="reveal"><span>Founding clients</span><b>Three places</b><p>{FOUNDING}</p></div>
            </div>
          </div>
        </section>

        <Finale where="sprint-bottom" title="The sprint starts" mark="with a free call.">Thirty minutes. Tell us what is slow, and we will say whether a sprint is worth your £3,500. If it is not, we will say so.</Finale>
      </main>
    </>
  );
}
