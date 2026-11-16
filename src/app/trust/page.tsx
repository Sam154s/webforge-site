import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Finale, Hero } from "@/components/page-kit";
import { DSIT } from "@/lib/offer";

export const metadata: Metadata = {
  title: "Hard questions, straight answers",
  description: "Where your data goes, who checks the code, what happens if we disappear, working with your IT provider, how available we are, and what we do not have yet.",
  alternates: { canonical: "/trust" },
  openGraph: { title: "Hard questions, straight answers | Webflow Outreach", url: "/trust" },
};

type QA = { id: string; q: string; a: React.ReactNode[] };
const GROUPS: [string, string, QA[]][] = [
  ["Your data", "and your systems.", [
    { id: "data", q: "Where does our data go?", a: [
      "It stays on your accounts. Most of what we build runs as ordinary code and sends nothing anywhere.",
      "Where a step uses an AI model, we agree in writing which provider it is, where your data is processed and how long it is kept, before we start.",
      <>One firm told the government&rsquo;s survey: &ldquo;we don&rsquo;t know how that data is protected&rdquo; ({DSIT.name}, {DSIT.date}). You will know, on paper, before anything runs.</>,
    ] },
    { id: "it", q: "Will this work with our IT provider?", a: [
      "Bring them in on day one. Everything runs on your accounts with your permissions. They see all of it, and they keep control of access.",
      "We work on a test copy or on exports first, and they agree what we can see before we see it.",
    ] },
    { id: "copilot", q: "We already have Copilot. Why do we need this?", a: [
      "Keep it. It helps one person write and summarise. It does not take a step out of a process or connect your systems. That is the part we build.",
    ] },
  ]],
  ["The code", "and who checks it.", [
    { id: "code", q: "Who checks the code if AI writes it?", a: [
      "Three things. Every workflow has to give the same result ten times, including on empty and hostile input, or it does not ship.",
      "An independent senior engineer reviews each build before it goes live. Their fee is inside the fixed price.",
      <>And you agree the pass test in writing before we start. <Link href="/method#ten-run">See a real ten-run test</Link>.</>,
    ] },
    { id: "person", q: "Does a person have to approve everything it does?", a: [
      "No. We call it a person near the loop: a named person reviews the exceptions and a sample of the rest, and can stop the system at any time. They do not approve every step.",
    ] },
    { id: "wont", q: "Is there anything you will not build?", a: [
      <>Yes. Clinical decisions, payments taken from the public, and anything safety-critical. <Link href="/method#wont">Why</Link>.</>,
    ] },
  ]],
  ["Us", "and what could go wrong.", [
    { id: "gone", q: "What if you disappear?", a: [
      "You own the code and it runs on your accounts. There is a runbook for every system. You could hand it to any developer.",
    ] },
    { id: "time", q: "You are a doctor. Is this a side project?", a: [
      "I work in a hospital and I build software. Both are jobs where mistakes matter, which is why we test the way we do.",
      "I am not available every day, and I will not pretend to be. We agree days and response times in writing before you sign. The runbook and the code in your own account mean nothing depends on one person.",
    ] },
    { id: "yet", q: "What do you not have yet?", a: [
      "Case studies. We are new, which is why we are taking three founding clients on better terms.",
      "Security certificates. We hold none yet, and we will not show a badge we do not hold. Ask us where we are and you will get a straight answer.",
      <>What you can check today: <Link href="/examples">three working tools</Link>, <Link href="/method">the method and a real test run</Link>, and <Link href="/pricing">every price</Link>.</>,
    ] },
    { id: "cheaper", q: "Can you do it cheaper?", a: [
      "We can do less. We do not do the same for less.",
    ] },
  ]],
];

export default function Trust() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="Hard questions" title="The hard questions." sub="Answered straight."
          lede="The ones an operations director, a finance director and an IT manager ask us. If yours is not here, email it and we will add it." />
        {GROUPS.map(([t, sub, items]) => (
          <section key={t} className="frame">
            <div className="wrap cols">
              <h2 className="h2 reveal">{t} <span>{sub}</span></h2>
              <dl className="qa">
                {items.map((x) => (
                  <div key={x.id} id={x.id} className="reveal" style={{ scrollMarginTop: 80 }}>
                    <dt>{x.q}</dt>
                    {x.a.map((p, i) => <dd key={i}>{p}</dd>)}
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ))}
        <Finale where="trust-bottom" title="Still not sure?" mark="Ask us on a call." />
      </main>
    </>
  );
}
