import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";

export const metadata: Metadata = {
  title: "Method and ten-run test",
  description: "How the diagnostic ranks fixes, what counts as hard cash, how sure we are, and a real ten-run test output from our builder.",
  alternates: { canonical: "/method" },
  openGraph: { title: "Method and ten-run test | Webflow Outreach", url: "/method" },
};

// Real output of `node wf.mjs eval invoice-chase`, captured as static data. Re-run and update before relying on it.
const EVAL = {
  ran: "9 November 2026",
  commit: "fc3cd00",
  workflow: "invoice-chase",
  purpose: "Every morning, list unpaid invoices that are 7, 14 or 30+ days old with the right chase stage, so the office sends chasers in one sitting.",
  never: ["Send anything to a customer", "Change the jobs sheet", "Chase an invoice marked paid or disputed"],
  cases: [
    ["normal", "10 runs", "1 distinct result", "clean, 3 units"],
    ["empty", "10 runs", "1 distinct result", "stopped: missing_input, 0 units"],
    ["hostile", "10 runs", "1 distinct result", "stopped: bad_amount, 0 units"],
  ],
  hashes: { spec: "ce4ee195acc9", src: "be38189f43e0", fixtures: "e0c58692e907" },
};
const GRADES = [["A", "0.9", "Seen in a document or export"], ["B", "0.7", "Counted from a sample we checked"], ["C", "0.5", "Your estimate, from a recent real example"], ["D", "0.3", "A guess. Check it before spending"]];
const STEPS = [
  ["Pre-scan", "We read public information only: Companies House, your website, your email settings. It is call prep. Everything in it is a hypothesis until you confirm it."],
  ["The call", "12 to 16 plain questions. We anchor on the last real quote or invoice, not an average, because people remember the last one better."],
  ["The engine", "Code turns your answers and your export into pounds and hours, and ranks them. Same inputs, same list, every time."],
  ["Review", "A person reads the report before it reaches you. Anything we cannot defend is cut or graded down."],
];

export default function Method() {
  return (
    <>
      <Reveal />
      <main className="pt-16">
        <section className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-16">
          <p className="font-mono text-xs text-dim">method</p>
          <h1 className="mt-3 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[6vw] max-w-[16ch]">
            How we rank fixes, and how we prove them.
          </h1>
          <p className="mt-6 text-lg text-dim max-w-2xl leading-relaxed">Published so you can check our working. Nothing here is secret, and nothing here is a promise of savings.</p>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-20">
          <ol className="grid md:grid-cols-4 border-t border-ink">
            {STEPS.map(([t, d], i) => (
              <li key={t} className={`reveal py-7 md:pr-8 border-b md:border-b-0 border-line ${i ? "md:pl-8 md:border-l" : ""}`}>
                <p className="font-mono text-xs text-dim">0{i + 1}</p>
                <h2 className="font-display font-bold text-2xl tracking-[-0.02em] mt-3 mb-2">{t}</h2>
                <p className="text-dim leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-20 grid md:grid-cols-12 gap-10">
          <h2 className="reveal md:col-span-5 font-display font-bold tracking-[-0.035em] leading-[0.95] text-4xl md:text-6xl">The ranking.</h2>
          <div className="md:col-span-6 md:col-start-7 space-y-6 text-lg leading-relaxed min-w-0">
            <pre className="reveal font-mono text-[13px] md:text-sm bg-ink text-stone rounded-[16px] p-5 overflow-x-auto leading-relaxed">{`Value  = Hard + 0.4 x Soft
Risked = (Value - Running cost) x Confidence
Size   = our hours + your hours
Score  = Risked / Size`}</pre>
            <p className="reveal"><strong>Hard cash</strong> is money that reaches your bank: faster payment, wins you would not have had, errors you stop paying for. <strong>Soft time</strong> is staff hours freed. Time is only worth money if you use it to cut cost or earn more, so it counts at 40% and is shown separately. The headline figure uses hard cash only.</p>
            <p className="reveal">The list is cheapest-to-fix first. Items worth under £1,000 a year after risking are parked. Items within 10% of each other are a tie, broken by confidence, then by fewer hours.</p>
            <p className="reveal">Every figure is a range. Low is after we reduce it for how sure we are. We never subtract confidence from your own numbers. It only orders the list.</p>
          </div>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-20 grid md:grid-cols-12 gap-10">
          <h2 className="reveal md:col-span-5 font-display font-bold tracking-[-0.035em] leading-[0.95] text-4xl md:text-6xl">How sure we are.</h2>
          <div className="md:col-span-6 md:col-start-7">
            {GRADES.map(([g, w, d]) => (
              <div key={g} className="reveal grid grid-cols-[2.5rem_3rem_1fr] gap-x-3 items-baseline border-t border-line py-4">
                <span className="inline-grid place-items-center w-8 h-8 rounded-full border border-ink font-mono text-sm">{g}</span>
                <span className="font-mono text-sm text-dim num">{w}</span>
                <span>{d}</span>
              </div>
            ))}
            <p className="reveal border-t border-ink pt-4 text-dim">A grade D figure is still shown, but its first task is a short check of the number.</p>
          </div>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-20 grid md:grid-cols-12 gap-10">
          <h2 className="reveal md:col-span-5 font-display font-bold tracking-[-0.035em] leading-[0.95] text-4xl md:text-6xl">What AI does, and does not.</h2>
          <div className="md:col-span-6 md:col-start-7 space-y-6 text-lg leading-relaxed min-w-0">
            <p className="reveal">Code works out every number and the ranking. AI writes words only, such as explaining a finding in plain English. A person reads the report before you do.</p>
            <p className="reveal"><strong>What we never take:</strong> passwords, bank logins, access to your systems at the diagnostic stage, or patient and other special category data. We read an export you choose to send, and public information.</p>
          </div>
        </section>

        {/* Ten-run test */}
        <section id="ten-run" className="bg-ink text-stone rounded-t-[36px] md:rounded-t-[56px] scroll-mt-0">
          <div className="max-w-page mx-auto px-5 md:px-10 py-20 md:py-32 grid md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <p className="font-mono text-xs text-lime">the ten-run test</p>
              <h2 className="reveal mt-3 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[5vw]">Ten runs. Same result, or it does not ship.</h2>
              <p className="reveal mt-6 text-stone/65 leading-relaxed">Before any fix goes live, we run it ten times against your own examples, including an empty input and a hostile one. Every run must give an identical result. A fix that stops safely on bad input counts as a pass. A fix that drifts does not, and you do not pay for it.</p>
            </div>
            <div className="md:col-span-7 min-w-0">
              <div className="reveal rounded-[16px] bg-[#171717] border border-white/10 p-5 md:p-7 font-mono text-[12.5px] md:text-sm leading-[1.8] overflow-x-auto">
                <p className="text-stone/50">$ node wf.mjs eval {EVAL.workflow}</p>
                <p className="text-lime">PASS {EVAL.workflow}</p>
                {EVAL.cases.map(([c, runs, distinct, out]) => (
                  <p key={c} className="whitespace-pre text-stone/85">{`  ${c}: ${runs}, ${distinct}, ${out}`}</p>
                ))}
              </div>
              <dl className="reveal mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-stone/65">
                <div><dt className="font-mono text-xs text-stone/45">ran</dt><dd>{EVAL.ran}, builder commit {EVAL.commit}</dd></div>
                <div><dt className="font-mono text-xs text-stone/45">fingerprints (first 12 characters)</dt><dd className="font-mono text-xs break-all">spec {EVAL.hashes.spec} · code {EVAL.hashes.src} · examples {EVAL.hashes.fixtures}</dd></div>
              </dl>
              <div className="reveal mt-8 border-t border-white/15 pt-6 text-stone/65 leading-relaxed space-y-3">
                <p><strong className="text-stone">What this workflow does.</strong> {EVAL.purpose}</p>
                <p><strong className="text-stone">What it must never do.</strong> {EVAL.never.join(". ")}.</p>
                <p className="text-sm text-stone/50">This is a real run, but of an example workflow on made-up sample data, not a client&apos;s. It is the output of our own builder, captured on the date above. It shows how the test works, not a result for your business.</p>
              </div>
            </div>
          </div>
          <div className="max-w-page mx-auto px-5 md:px-10 pb-20 flex flex-wrap items-center gap-6">
            <Link href="/diagnostic" className="group inline-flex items-center gap-3 rounded-full bg-lime text-ink font-semibold pl-6 pr-2 py-2 min-h-[44px]">
              Book a free diagnostic
              <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-ink text-lime transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
            <Link href="/sample-report" className="text-stone underline underline-offset-4">See a sample report</Link>
          </div>
        </section>
      </main>
    </>
  );
}
