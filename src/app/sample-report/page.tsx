import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Cta } from "@/components/track-link";

export const metadata: Metadata = {
  title: "Sample report (fictional)",
  description: "A fictional diagnostic report for a made-up 12 person firm: ranked fixes, pound ranges, confidence grades, and hours shown separately.",
  alternates: { canonical: "/sample-report" },
  openGraph: { title: "Sample diagnostic report (fictional) | Webflow Outreach", url: "/sample-report" },
};

type Lane = "Do first" | "Test first" | "Verify first";
// Fictional numbers from the method worked example. low = confidence-adjusted, base = before confidence adjustment.
const ROWS: { id: string; job: string; grade: "A" | "B" | "C" | "D"; low: number; base: number; us: number; you: number; freed?: number; lane: Lane; note?: string }[] = [
  { id: "Q1", job: "Follow up every quote within 48 hours", grade: "C", low: 7944, base: 16128, us: 8, you: 2, lane: "Test first", note: "Measure the real win-rate lift in month one." },
  { id: "Q2", job: "Free the estimator with drafted quotes from site notes and a price book", grade: "C", low: 16128, base: 32256, us: 30, you: 6, lane: "Test first", note: "The bottleneck. Starts in week one, alongside Q1." },
  { id: "C1", job: "Chase overdue invoices automatically", grade: "B", low: 4193, base: 5990, us: 12, you: 2, freed: 192, lane: "Do first" },
  { id: "C2", job: "Raise invoices from the job sheet and capture extras", grade: "B", low: 8449, base: 12070, us: 24, you: 4, freed: 96, lane: "Do first", note: "Gets cheaper once C1 has built the accounts connection." },
  { id: "O1", job: "Owner decision queue and a purchase-order limit", grade: "C", low: 3036, base: 6072, us: 10, you: 6, freed: 480, lane: "Do first", note: "A process change. Little code." },
  { id: "L1", job: "Missed-call text-back", grade: "D", low: 785, base: 2977, us: 6, you: 1, lane: "Verify first", note: "First, count missed calls for one week. We assumed 25% are real new work." },
  { id: "R1", job: "Job checklist to cut callbacks", grade: "B", low: 1548, base: 2212, us: 14, you: 4, lane: "Do first" },
  { id: "S1", job: "Supplier bill entry and price check", grade: "C", low: 1338, base: 3276, us: 20, you: 3, freed: 90, lane: "Test first" },
];
const PARKED = [
  ["M1", "Post-job review requests", "About £1,500 on a guess. Below our £1,000 floor once risked."],
  ["K1", "Write down the office manager's rules", "About £1,350 a year of key-person risk. Below the floor."],
];
const LANES: [Lane, string][] = [
  ["Do first", "Good evidence. Build it."],
  ["Test first", "Build small, then measure the real lift before going further."],
  ["Verify first", "The number rests on a guess. Check it before spending anything."],
];
const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;
const FICTION = "Fictional example. Not a real company. Numbers are illustrative.";

export default function SampleReport() {
  return (
    <>
      <Reveal />
      <main className="pt-16">
        <div className="bg-lime text-ink">
          <p className="max-w-page mx-auto px-5 md:px-10 py-2.5 text-sm font-semibold">{FICTION}</p>
        </div>

        <section className="max-w-page mx-auto px-5 md:px-10 pt-12 md:pt-20 pb-12">
          <p className="font-mono text-xs text-dim">diagnostic report · sample · fictional</p>
          <h1 className="mt-3 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[5.6vw] max-w-[18ch]">
            Tideway Heating &amp; Plumbing Ltd
          </h1>
          <p className="mt-4 text-dim max-w-xl">A made-up 12 person firm. 40 project quotes and about 108 reactive jobs a month. This is the layout you would get in your own dashboard.</p>

          <div className="mt-12 rounded-[24px] bg-ink text-stone p-7 md:p-12 grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-8">
              <p className="font-mono text-xs text-lime">top 3 jobs · hard cash only · fictional</p>
              <p className="mt-3 font-display font-extrabold tracking-[-0.04em] leading-[0.95] text-5xl md:text-8xl num">£27,200 <span className="font-medium text-stone/50">to</span> £52,900</p>
              <p className="mt-3 text-stone/65">a year, as a range. The cautious figure comes first.</p>
            </div>
            <p className="md:col-span-4 text-sm text-stone/65 leading-relaxed border-t border-white/15 pt-4">
              Estimate, not a promise. Shown as a range from what you told us and what we could check. Confidence: mostly C. Staff time is shown separately and is not in this figure.
            </p>
          </div>
        </section>

        {/* Do this first */}
        <section className="max-w-page mx-auto px-5 md:px-10 pb-16">
          <div className="reveal rounded-[24px] bg-lime p-7 md:p-10 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <p className="font-mono text-xs">do this first · rank 1</p>
              <h2 className="mt-2 font-display font-bold text-3xl md:text-5xl tracking-[-0.03em] leading-[0.98]">Follow up every quote within 48 hours.</h2>
              <p className="mt-4 max-w-xl leading-snug">Highest value for the least effort: about 10 hours in total. Done looks like: every quote gets a prompt on day 2, and you can see the win rate move. Size S.</p>
            </div>
            <div className="md:col-span-4 space-y-3">
              <p className="font-display font-bold text-4xl tracking-[-0.03em]">£750 <span className="text-base font-semibold">fixed</span></p>
              <p className="text-sm leading-snug">Tested ten times against your own examples. No fee if it fails.</p>
              <button type="button" disabled aria-disabled="true" className="inline-flex items-center gap-3 rounded-full bg-ink text-stone font-semibold pl-6 pr-2 py-2 min-h-[44px] opacity-90 cursor-not-allowed">
                Fix this <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-lime text-ink">→</span>
              </button>
              <p className="text-xs">Button is switched off in the sample.</p>
            </div>
          </div>
        </section>

        {/* Ranked table */}
        <section className="max-w-page mx-auto px-5 md:px-10 pb-16">
          <h2 className="reveal font-display font-bold tracking-[-0.035em] leading-[0.95] text-4xl md:text-6xl">Ranked fixes.</h2>
          <p className="reveal mt-3 text-dim max-w-2xl">Ranked by risked value per hour of effort. Value is a range: low is after we have reduced it for how sure we are, base is before. Fictional.</p>

          <div className="mt-10 border-t border-ink">
            <div className="hidden md:grid grid-cols-12 gap-4 py-3 font-mono text-xs text-dim border-b border-line">
              <span className="col-span-1">Rank</span><span className="col-span-4">Job</span><span className="col-span-2">Value a year, low to base</span>
              <span className="col-span-1">Grade</span><span className="col-span-2">Effort hours (us + you)</span><span className="col-span-2">Lane</span>
            </div>
            {ROWS.map((r, i) => (
              <div key={r.id} className="reveal grid grid-cols-12 gap-x-4 gap-y-1 py-5 border-b border-line items-baseline">
                <span className="col-span-2 md:col-span-1 font-mono text-sm text-dim">{i + 1} · {r.id}</span>
                <div className="col-span-10 md:col-span-4">
                  <p className="font-semibold leading-snug">{r.job}</p>
                  {r.note && <p className="text-sm text-dim mt-1">{r.note}</p>}
                </div>
                <p className="col-span-6 md:col-span-2 mt-2 md:mt-0 num"><span className="md:hidden font-mono text-xs text-dim block">Value a year</span>{gbp(r.low)} to {gbp(r.base)}</p>
                <p className="col-span-2 md:col-span-1 mt-2 md:mt-0"><span className="md:hidden font-mono text-xs text-dim block">Grade</span><span className="inline-grid place-items-center w-7 h-7 rounded-full border border-ink font-mono text-sm">{r.grade}</span></p>
                <p className="col-span-4 md:col-span-2 mt-2 md:mt-0 num"><span className="md:hidden font-mono text-xs text-dim block">Effort hours</span>{r.us + r.you} h <span className="text-dim text-sm">({r.us} + {r.you})</span></p>
                <p className="col-span-12 md:col-span-2 mt-2 md:mt-0"><span className={`inline-block rounded-full px-3 py-1 text-sm ${r.lane === "Do first" ? "bg-lime" : r.lane === "Test first" ? "border border-ink" : "border border-dashed border-ink"}`}>{r.lane}</span></p>
                {r.freed && <p className="col-span-12 md:col-start-2 md:col-span-11 text-sm text-dim mt-1">Staff time freed, shown separately and not counted in £: about {r.freed} hours a year.</p>}
              </div>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {LANES.map(([l, d]) => (
              <div key={l} className="rounded-[16px] border border-line p-5"><p className="font-semibold">{l}</p><p className="text-sm text-dim mt-1">{d}</p></div>
            ))}
          </div>

          <div className="mt-10">
            <h3 className="font-display font-bold text-2xl tracking-[-0.02em]">Parked, below the £1,000 floor</h3>
            <ul className="mt-3 text-dim">
              {PARKED.map(([id, t, d]) => <li key={id} className="border-t border-line py-3"><span className="font-mono text-xs mr-2">{id}</span><span className="text-ink">{t}.</span> {d}</li>)}
            </ul>
          </div>
        </section>

        {/* Honest bits */}
        <section className="max-w-page mx-auto px-5 md:px-10 pb-16 grid md:grid-cols-3 gap-6">
          <div className="reveal rounded-[20px] border border-ink p-6">
            <h3 className="font-display font-bold text-2xl tracking-[-0.02em]">We would not automate</h3>
            <p className="mt-3 text-dim leading-relaxed">Pricing of unusual jobs. It needs judgement, and the estimator is better at it than any rule. We help him get to it faster instead.</p>
          </div>
          <div className="reveal rounded-[20px] border border-ink p-6" style={{ transitionDelay: ".1s" }}>
            <h3 className="font-display font-bold text-2xl tracking-[-0.02em]">Do it yourself</h3>
            <ol className="mt-3 text-dim leading-relaxed list-decimal pl-5 space-y-1">
              <li>List quotes sent in the last 7 days with no reply.</li>
              <li>Call or message each one on day 2.</li>
              <li>Write down how many replied. Do it for a month.</li>
            </ol>
          </div>
          <div className="reveal rounded-[20px] border border-ink p-6" style={{ transitionDelay: ".2s" }}>
            <h3 className="font-display font-bold text-2xl tracking-[-0.02em]">Method line</h3>
            <p className="mt-3 text-dim leading-relaxed">Staff cost used: office manager £19 an hour, engineer £26, estimator £28. Time estimated from the last real quote, not an average. <Link href="/method" className="text-signal underline underline-offset-4">How the ranking works</Link>.</p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-page mx-auto px-5 md:px-10 pb-16">
          <div className="rounded-[20px] bg-ink text-stone p-7 md:p-10">
            <h2 className="font-display font-bold text-3xl tracking-[-0.03em]">Read this before the numbers</h2>
            <div className="mt-6 grid md:grid-cols-2 gap-x-12 gap-y-5 text-stone/70 leading-relaxed text-[15px]">
              <p><strong className="text-stone">What this report is.</strong> An estimate of where time and money may be leaking in your business and which fixes may be worth doing first. It is based on the information you gave us and the files you shared. It is a starting point for a decision, not advice that a particular saving will happen.</p>
              <p><strong className="text-stone">How to read the numbers.</strong> Every figure is a range, and the cautious end comes first. We reduce savings below what the raw figures suggest, because forecasts of savings tend to come out too high. Figures graded C or D rest on answers we could not check.</p>
              <p><strong className="text-stone">What we did not check.</strong> We have not audited your accounts or systems. If an input is wrong, the result is wrong. Tell us what looks incorrect and we will re-run it. The same inputs always give the same result.</p>
              <p><strong className="text-stone">Not a guarantee.</strong> We do not guarantee any saving, revenue or time. Time freed is not cash unless it is used to cut costs or earn more.</p>
              <p><strong className="text-stone">Not financial, tax, legal or HR advice.</strong> Speak to your accountant, adviser or solicitor before changes that affect your finances, staff or contracts.</p>
              <p><strong className="text-stone">Record.</strong> Every report carries a version and an input reference, so you can see exactly what it was based on.</p>
            </div>
            <p className="mt-6 text-sm text-stone/50">{FICTION}</p>
          </div>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-36 flex flex-wrap items-center gap-6">
          <Cta where="sample-bottom" />
          <Link href="/method" className="text-signal underline underline-offset-4">How the method works</Link>
        </section>
      </main>
    </>
  );
}
