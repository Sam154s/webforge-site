import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Finale } from "@/components/page-kit";
import { PRICE } from "@/lib/offer";
import { RATE, WEEKS, gbp, num, processCost } from "@/lib/sum";

export const metadata: Metadata = {
  title: "Sample sprint report (fictional)",
  description: "A fictional sprint report for a made-up firm of 100 people: a ranked list of problems with a pound range and payback on each, one thing working, and a fixed quote.",
  alternates: { canonical: "/sample-report" },
  openGraph: { title: "Sample sprint report (fictional) | Webflow Outreach", url: "/sample-report" },
};

const FICTION = "Fictional example. Not a real company. Every figure is made up to show the layout.";

type Call = "Do this first" | "Next" | "Later" | "Do not build";
// [problem, people, hours a week each, quoted build price, how we know, our call, note]
const RAW: [string, number, number, number, string, Call, string][] = [
  ["The weekly board report, rebuilt by hand", 6, 5, 12000, "Timed over three real weeks", "Do this first", "Four team sheets, one master workbook, one check by eye."],
  ["Orders typed into two systems", 4, 6, 14000, "Counted from a sample of 50 orders", "Next", "Shares its first step with the report, so it gets cheaper once that is built."],
  ["Quotes waiting on one estimator", 2, 8, 12000, "Their estimate, from the last five quotes", "Later", "Does not count work lost while customers wait. We could not measure that."],
  ["Supplier dates chased by email", 3, 4, 12000, "Their estimate", "Later", "A shared inbox rule would take some of this off first. Try that."],
  ["Month end that only one person can run", 1, 6, 0, "Watched once", "Do not build", "Write it down first. A runbook, not software."],
];
const ROWS = RAW.map(([job, people, hours, build, basis, call, note]) => ({ job, people, hours, build, basis, call, note, ...processCost(people, hours, RATE, build || PRICE.build) }));
const TOP = Math.max(...ROWS.map((r) => r.high));
const first = ROWS[0];

export default function SampleReport() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <div className="band-note" style={{ paddingTop: 64 }}><p>{FICTION}</p></div>

        <section className="sub-hero" style={{ paddingTop: "clamp(32px, 6vw, 72px)" }}>
          <div className="wrap">
            <p className="slate"><span>Sprint report</span>Sample</p>
            <h1 className="h1">Example Supplies Ltd</h1>
            <p className="lede">A made-up distributor with 100 people. This is the layout you would get in your own dashboard at the end of a sprint.</p>
            <div className="sum" role="img" aria-label={`Five problems found. The first costs ${gbp(first.byHand)} a year by hand.`}>
              <div><span>Problems found</span><b>5</b></div>
              <div><span>Worth building</span><b>4</b></div>
              <div><span>Cases followed</span><b>3</b></div>
              <div><span>Cost an hour used</span><b>{gbp(RATE)}</b></div>
              <div className="is"><span>Could come off, a year, from the first build</span><b>{gbp(first.low)} to {gbp(first.high)}</b></div>
            </div>
            <p className="fine">An estimate, not a promise. Shown as a range, with the cautious figure first.</p>
          </div>
        </section>

        {/* 1 of 3: the ranked list */}
        <section className="frame">
          <div className="wrap">
            <p className="slate reveal"><span>1 of 3</span>The ranked list</p>
            <h2 className="h2 reveal">Five problems. <span>A pound range and a payback on each.</span></h2>
            <ol className="rank">
              {ROWS.map((r, i) => (
                <li key={r.job} className="reveal">
                  <div className="rank-head">
                    <span className="rank-no">{i + 1}</span>
                    <h3>{r.job}</h3>
                    <span className={`tag ${r.call === "Do this first" ? "ai" : r.call === "Do not build" ? "person" : "code"}`}>{r.call}</span>
                  </div>
                  <div className="rank-body">
                    <p className="rank-sum">{r.people} {r.people === 1 ? "person" : "people"} × {r.hours} hours a week × {WEEKS} weeks × {gbp(RATE)} = <b>{gbp(r.byHand)} a year by hand</b> ({num(r.hoursYear)} hours)</p>
                    <div className="rank-bar" role="img" aria-label={`Could come off: ${gbp(r.low)} to ${gbp(r.high)} a year`}>
                      <i className="hi" style={{ width: `${(r.high / TOP) * 100}%` }} /><i style={{ width: `${(r.low / TOP) * 100}%` }} />
                    </div>
                    <dl>
                      <div><dt>Could come off, a year</dt><dd>{gbp(r.low)} to {gbp(r.high)}</dd></div>
                      <div><dt>To fix</dt><dd>{r.build ? `${gbp(r.build)} fixed` : "No build"}</dd></div>
                      <div><dt>Pays back</dt><dd>{r.build && r.payback ? `Month ${r.payback}, on the low figure` : "Not applicable"}</dd></div>
                      <div><dt>How we know</dt><dd>{r.basis}</dd></div>
                    </dl>
                    <p className="rank-note">{r.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="fine reveal">Bars share one scale. Solid is the low estimate (40% of the work comes off), hatched the high one (70%). The sum is the same for every row, so you can check it.</p>
          </div>
        </section>

        {/* 2 of 3: one thing working */}
        <section className="frame">
          <div className="wrap cols">
            <div>
              <p className="slate reveal"><span>2 of 3</span>One thing working</p>
              <h2 className="h2 reveal">Built in the sprint, <span>on their real data.</span></h2>
            </div>
            <div className="prose">
              <p className="reveal">A small piece of the first build: it reads last week&rsquo;s four team sheets and produces the summary table from the board report.</p>
              <div className="term reveal" style={{ background: "#111" }}>
                <p className="dim">$ run sheets-to-table --week 46</p>
                <p className="ok">PASS</p>
                <p>{"  normal: 10 runs, 1 distinct result"}</p>
                <p>{"  sheet missing: 10 runs, stops, names it"}</p>
                <p>{"  matches hand-built table: to the pound"}</p>
              </div>
              <p className="fine reveal">Made-up output for this fictional firm. <Link href="/method#ten-run">A real ten-run test is on the method page</Link>.</p>
            </div>
          </div>
        </section>

        {/* 3 of 3: the fixed quote */}
        <section className="frame dark slab">
          <div className="wrap cols">
            <div>
              <p className="slate reveal"><span>3 of 3</span>The fixed quote</p>
              <h2 className="h2 reveal">{gbp(first.build)} fixed. <span>The weekly board report.</span></h2>
              <p className="end-p reveal">One system, on Example Supplies&rsquo; own accounts. Half on signature, half when it passes the test below. We keep working until it passes.</p>
            </div>
            <div>
              <div className="also" style={{ marginTop: 0 }}>
                <div className="reveal"><span>Sprint fee</span><b>Credited</b><p>Signed within 30 days, so the {gbp(PRICE.sprint)} comes off. {gbp(first.build - PRICE.sprint)} left to pay.</p></div>
                <div className="reveal"><span>The written pass test</span><b>Agreed first</b><p>For any of the last twelve weekly reports, the pack matches the hand-built one to the pound, ten runs out of ten. If a team sheet is missing, it stops and says which.</p></div>
                <div className="reveal"><span>A person near the loop</span><b>Named</b><p>The operations director sees every figure that moved more than usual, and can stop the Monday send.</p></div>
                <div className="reveal"><span>Running costs</span><b>At cost</b><p>On their own accounts, agreed up front.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">The honest part. <span>What we would not build.</span></h2>
            <ul className="cards c3" style={{ marginTop: 36 }}>
              <li className="reveal"><b>Pricing unusual jobs</b><p>It needs judgement, and the estimator is better at it than any rule. We help them get to it faster instead.</p></li>
              <li className="reveal"><b>Month end, for now</b><p>One person runs it from memory. Software would copy the muddle. Write the steps down first.</p></li>
              <li className="reveal"><b>What we did not check</b><p>We did not audit the accounts. If a number they gave us is wrong, the result is wrong. Tell us and we run it again.</p></li>
            </ul>
            <p className="fine reveal">Not a guarantee of any saving, and not financial, tax or legal advice. Time taken off people is only money if it is used to cut cost or earn more. {FICTION}</p>
          </div>
        </section>

        <Finale where="sample-bottom" title="Want one of these" mark="for your firm?">It starts with a free 30 minute call. If a sprint is not worth your £3,500, we will say so.</Finale>
      </main>
    </>
  );
}
