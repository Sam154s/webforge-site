import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Finale, Hero } from "@/components/page-kit";

export const metadata: Metadata = {
  title: "Method and ten-run test",
  description: "Plain code, AI only where judgement is needed, a person near the loop, and every workflow run ten times before release. With a real ten-run test output, and what we will not build.",
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

const LANES: ["code" | "ai" | "person", string, string, string][] = [
  ["code", "Code", "Sums, rules, moving data between systems, building documents.", "The same input gives the same output, every time. Most of every system we build."],
  ["ai", "AI", "Reading a messy email. Drafting a paragraph. Sorting free text.", "Only where judgement is needed, at a named step, with its output checked."],
  ["person", "A person", "Exceptions, a sample of the rest, and the stop button.", "Named, and near the loop. Not approving every step."],
];
const WONT = [
  ["Clinical decisions", "Software that makes decisions about patients is regulated, for good reason. We do not build it here."],
  ["Payments taken from the public", "Taking card or bank payments has its own rules. Use a payment provider."],
  ["Anything safety-critical", "If a wrong answer could injure someone, it is not a job for us."],
];

export default function Method() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="Method" title="Plain code. AI only where judgement is needed." sub="Tested ten times."
          lede="Published so you can check our working. Nothing here is secret, and nothing here is a promise of savings." />

        <section className="frame" style={{ paddingTop: 0 }}>
          <div className="wrap cols">
            <blockquote className="quote reveal">
              <p>&ldquo;When building applications with LLMs, we recommend finding the simplest solution possible, and only increasing complexity when needed.&rdquo;</p>
              <footer>Anthropic, <a href="https://www.anthropic.com/engineering/building-effective-agents" rel="noopener">Building effective agents</a>, 19 December 2024</footer>
            </blockquote>
            <div className="prose big">
              <p className="reveal">That is from one of the firms that makes the AI. An LLM is the kind of AI behind the chat tools. We agree with them.</p>
              <p className="reveal">So we design the system first. AI writes the code once, when we build. What ships and runs every day is ordinary code. AI is used at run time only where judgement is needed.</p>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">Three kinds of step. <span>Each does what it is good at.</span></h2>
            <ul className="cards c3" style={{ marginTop: 36 }}>
              {LANES.map(([k, name, does, rule], i) => (
                <li key={k} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span className={`tag ${k}`}>{name}</span>
                  <b>{does}</b>
                  <p>{rule}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="frame" id="person" style={{ scrollMarginTop: 64 }}>
          <div className="wrap cols">
            <h2 className="h2 reveal">A person <span>near the loop.</span></h2>
            <div className="prose big">
              <p className="reveal"><b>It means this:</b> a named person reviews the exceptions and a sample of the rest, and can stop the system at any time. They do not approve every step.</p>
              <p className="reveal">A person approving every step is the work done by hand again, with extra clicks. Nobody checking at all is how small errors become big ones. This sits between the two.</p>
            </div>
          </div>
        </section>

        {/* Ten-run test */}
        <section id="ten-run" className="frame dark slab" style={{ scrollMarginTop: 64 }}>
          <div className="wrap cols">
            <div>
              <p className="slate reveal"><span>The ten-run test</span></p>
              <h2 className="h2 reveal">Ten runs. Same result, <span>or it does not ship.</span></h2>
              <p className="end-p reveal">Before anything goes live we run it ten times against your own examples, including an empty input and a hostile one. Every run must give an identical result. Stopping safely on bad input is the right behaviour. If it drifts, we fix it and run the ten again.</p>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="term reveal">
                <p className="dim">$ node wf.mjs eval {EVAL.workflow}</p>
                <p className="ok">PASS {EVAL.workflow}</p>
                {EVAL.cases.map(([c, runs, distinct, out]) => (
                  <p key={c}>{`  ${c}: ${runs}, ${distinct}, ${out}`}</p>
                ))}
              </div>
              <div className="also">
                <div className="reveal"><span>Ran</span><b>{EVAL.ran}</b><p>Builder commit {EVAL.commit}.</p></div>
                <div className="reveal"><span>What this workflow does</span><b>{EVAL.workflow}</b><p>{EVAL.purpose}</p></div>
                <div className="reveal"><span>What it must never do</span><b>Three rules</b><p>{EVAL.never.join(". ")}.</p></div>
              </div>
              <p className="fine reveal">Fingerprints, first 12 characters: spec {EVAL.hashes.spec}, code {EVAL.hashes.src}, examples {EVAL.hashes.fixtures}.</p>
              <p className="fine reveal">This is a real run, but of an example workflow on made-up sample data, not a client&rsquo;s. It is the output of our own builder, captured on the date above. It shows how the test works, not a result for your business.</p>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">The written pass test. <span>Agreed before we start.</span></h2>
            <div className="prose big">
              <p className="reveal">Every build has one. It says what working means, on your own examples, in words you would use. One firm told the government&rsquo;s AI survey: &ldquo;it&rsquo;s got to be as black and white as a set of numbers on a piece of paper.&rdquo;</p>
              <div className="flow-test reveal"><b>An example line from a pass test</b>For any of the last twelve weekly reports, the pack matches the hand-built one to the pound, ten runs out of ten. If a team sheet is missing, it stops and says which.</div>
              <p className="reveal">Half the build price is due when it passes. We keep working until it does.</p>
              <p className="fine reveal">Quote: DSIT AI Adoption Survey 2026, published 29 October 2026.</p>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">You own it.</h2>
            <div className="prose big">
              <p className="reveal">The code is yours. It runs on your own accounts, with your permissions, and comes with a runbook. Hosting and any AI usage are billed to you at cost, agreed up front.</p>
              <p className="reveal">You could hand it to any developer. That is the point.</p>
            </div>
          </div>
        </section>

        <section className="frame" id="wont" style={{ scrollMarginTop: 64 }}>
          <div className="wrap">
            <h2 className="h2 reveal">What we will not build.</h2>
            <ul className="cards c3" style={{ marginTop: 36 }}>
              {WONT.map(([t, d]) => <li key={t} className="reveal"><b>{t}</b><p>{d}</p></li>)}
            </ul>
            <p className="fine reveal">And when the answer is a rule, a template or a setting you already have, we say so. <Link href="/trust">More hard questions</Link>.</p>
          </div>
        </section>

        <Finale where="method-bottom" />
      </main>
    </>
  );
}
