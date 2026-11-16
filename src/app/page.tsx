import Link from "next/link";
import { HowScene } from "./builder-scene";
import { Reveal } from "./reveal";
import { Examples } from "./story/examples";
import { Ladder } from "./story/ladder";
import { Payoff } from "./story/payoff";
import { Cta, TrackLink } from "@/components/track-link";
import { EMAIL, EXPLAINER } from "@/lib/site";
import { DSIT, FOUNDING, RUNNING, SALARY } from "@/lib/offer";
import { EXAMPLE, RATE, WEEKS, gbp, processCost } from "@/lib/sum";

// The homepage is a storyboard: nine frames that take a visitor from A (work done by hand) to B (a system that does it).
// The rail in the header follows along. Frame ids and labels live in lib/story.ts.

// Six thumbnail drawings for the strip under the headline. Each path draws itself in on load.
const STRIP: { side: string; cap: string; href: string; art: React.ReactNode }[] = [
  { side: "A", cap: "The work runs by hand", href: "#by-hand", art: <><rect x="34" y="18" width="92" height="64" rx="4" pathLength={1} /><path d="M34 34h92M34 50h92M34 66h92M64 18v64M95 18v64" pathLength={1} /></> },
  { side: "A", cap: "It waits on one person", href: "#by-hand", art: <><rect x="40" y="20" width="80" height="62" rx="4" pathLength={1} /><path d="M40 36h80M60 14v12M100 14v12" pathLength={1} /><path d="M52 46l8 8m0 -8l-8 8M72 46l8 8m0 -8l-8 8M92 46l8 8m0 -8l-8 8M52 62l8 8m0 -8l-8 8M72 62l8 8m0 -8l-8 8" pathLength={1} /></> },
  { side: "→", cap: "We sit in and watch", href: "#how", art: <><path d="M18 40h64v18h60M18 52h52v18h72" pathLength={1} /><circle cx="94" cy="46" r="20" pathLength={1} /><path d="M109 61l16 16" pathLength={1} /></> },
  { side: "B", cap: "AI writes the code, once", href: "#how", art: <><rect x="46" y="60" width="34" height="22" rx="3" pathLength={1} /><rect x="84" y="60" width="34" height="22" rx="3" pathLength={1} /><rect x="65" y="34" width="34" height="22" rx="3" pathLength={1} /><path d="M118 14l3 9l9 3l-9 3l-3 9l-3 -9l-9 -3l9 -3z" pathLength={1} /></> },
  { side: "B", cap: "Plain code runs it", href: "#how", art: <><path d="M54 24c-8 0 -10 4 -10 10v8c0 5 -3 8 -8 8c5 0 8 3 8 8v8c0 6 2 10 10 10M106 24c8 0 10 4 10 10v8c0 5 3 8 8 8c-5 0 -8 3 -8 8v8c0 6 -2 10 -10 10" pathLength={1} /><path d="M66 50a14 14 0 1 1 6 11.5M72 68v-7h-7" pathLength={1} /></> },
  { side: "B", cap: "You own it", href: "#pricing", art: <><circle cx="56" cy="50" r="18" pathLength={1} /><circle cx="56" cy="50" r="5" pathLength={1} /><path d="M74 50h56M112 50v14M124 50v10" pathLength={1} /></> },
];

// One weekly report at an example firm of 100 people. [when, who, what, detail, the wait that follows, how long the wait draws]
const BY_HAND: [string, string, string, string, string, number][] = [
  ["Fri 16:00", "Four team leads", "Four spreadsheets filled in", "Each in their own layout.", "The weekend", 4],
  ["Mon 09:00", "The analyst", "One is missing. Chased by email", "Again.", "Half a day", 2],
  ["Mon 14:00", "The analyst", "Copied into the master workbook", "Retyped. Broken formulas fixed by hand.", "Overnight", 3],
  ["Tue 10:00", "The operations director", "Checked by eye", "Every tab, every total.", "Most of the day", 3],
  ["Tue 16:00", "The board", "The report lands", "Four days after the numbers were true.", "", 0],
];
const eg = processCost(EXAMPLE.people, EXAMPLE.hoursEach);

// One total, asked for ten times. Illustrative.
const TEN_AI = ["£34,180", "£34,500", "£33,950", "£34,300", "£34,610", "£34,090", "£34,500", "£34,480", "£33,990", "£34,350"];
const METHOD = [
  ["Plain code", "AI writes the code once, when we build. What runs every day is ordinary code."],
  ["AI only where judgement is needed", "Reading a messy email, say. Nowhere else, so nothing drifts."],
  ["A person near the loop", "A named person reviews the exceptions and a sample, and can stop the system. They do not approve every step."],
  ["You own it", "The code is yours, on your accounts. Any developer could pick it up."],
];

const HARD: [string, string][] = [
  ["Where does our data go?", "It stays on your accounts. We agree in writing where your data is processed before we start."],
  ["Who checks the code if AI writes it?", "Ten identical test runs, an independent senior engineer, and a pass test you agreed in writing."],
  ["What if you disappear?", "You own the code, on your accounts, with a runbook. Any developer could take it on."],
  ["What about our IT provider?", "Bring them in on day one. They see all of it and keep control of access."],
  ["How available are you?", "Not every day. I also work in a hospital. We agree days and response times in writing first."],
];
const NOT_FOR = [
  "Clinical decisions, payments taken from the public, or anything safety-critical.",
  "A chatbot for its own sake.",
  "A problem that nobody senior owns.",
  "Firms of fewer than about 30 people. The sums rarely work at our prices.",
];

const Slate = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <p className="slate reveal"><span>Frame {n}</span>{children}</p>
);

export default function Home() {
  return (
    <>
      <Reveal />
      <main className="sb">
        {/* 01 TODAY */}
        <section id="today" className="frame hero">
          <span aria-hidden className="ghost ghost-a">A</span>
          <div className="wrap">
            <p className="hero-brand">webflow outreach</p>
            <div className="hero-top">
              <div>
                <p className="ab-line fade" aria-label="From A, done by hand, to B, runs itself.">
                  <span className="a" aria-hidden><b className="pin">A</b><em>Done by hand</em></span>
                  <span className="to" aria-hidden>→</span>
                  <span aria-hidden><b className="pin lime">B</b>Runs itself</span>
                </p>
                <h1 className="label" aria-label="AI engineers who work inside your business.">
                  <span className="mask" aria-hidden><span>AI engineers who</span></span>
                  <span className="mask" aria-hidden><span style={{ animationDelay: ".12s" }}><mark>work inside</mark></span></span>
                  <span className="mask" aria-hidden><span style={{ animationDelay: ".24s" }}><mark>your business.</mark></span></span>
                </h1>
              </div>
              <div className="hero-side fade" style={{ animationDelay: ".6s" }}>
                <p>We sit with your team, find the work that still runs by hand, and build the system that does it. {EXPLAINER}</p>
                <a href="#pricing" className="hero-price" aria-label="Prices: sprint £3,500 fixed, first build from £12,000. See all prices.">
                  <span>Sprint<b>£3,500</b>fixed</span>
                  <span>First build<b>From £12,000</b>fixed in writing</span>
                </a>
                <div className="hero-cta">
                  <Cta where="hero" />
                </div>
                <div className="hero-links">
                  <TrackLink where="hero-examples" href="#examples" className="ghost-link">Try three working tools</TrackLink>
                  <TrackLink where="hero-pricing" href="#pricing" className="ghost-link">See every price</TrackLink>
                </div>
              </div>
            </div>
            <ol className="strip" aria-label="The story in six frames">
              {STRIP.map((s, i) => (
                <li key={s.cap} style={{ "--i": i } as React.CSSProperties}>
                  <a href={s.href}>
                    <span className="strip-art">
                      <span className="strip-side">{s.side}</span>
                      <svg viewBox="0 0 160 100" aria-hidden>{s.art}</svg>
                    </span>
                    <span className="strip-cap"><span>{String(i + 1).padStart(2, "0")}</span>{s.cap}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 02 BY HAND */}
        <section id="by-hand" className="frame">
          <div className="wrap">
            <Slate n="02">A, where you are</Slate>
            <h2 className="h2 reveal">One weekly report, <span>done by hand.</span></h2>
            <ol className="hand reveal">
              {BY_HAND.map(([when, who, title, sub, wait, w], i) => (
                <li key={when} style={{ "--w": w, "--i": i } as React.CSSProperties}>
                  <span className="hand-when">{when}</span>
                  <span className="hand-dot" aria-hidden><i />{wait && <><s /><em>{wait}</em><s /></>}</span>
                  <b>{title}</b>
                  <span className="hand-who">{who}</span>
                  <span className="hand-sub">{sub}</span>
                  {wait && <span className="hand-gap">Then it waits: {wait.toLowerCase()}.</span>}
                </li>
              ))}
            </ol>
            <p className="hand-sum reveal"><b>Six people, about five hours a week each.</b> None of it is hard. It is slow, and done by a person every time.</p>
            <div className="sum reveal" role="img" aria-label={`${EXAMPLE.people} people, times ${EXAMPLE.hoursEach} hours a week each, times ${WEEKS} weeks, times ${gbp(RATE)} an hour, is ${gbp(eg.byHand)} a year.`}>
              <div><span>People</span><b>{EXAMPLE.people}</b></div>
              <div><i className="op">×</i><span>Hours a week, each</span><b>{EXAMPLE.hoursEach}</b></div>
              <div><i className="op">×</i><span>Working weeks</span><b>{WEEKS}</b></div>
              <div><i className="op">×</i><span>Cost an hour</span><b>{gbp(RATE)}</b></div>
              <div className="is"><i className="op">=</i><span>One report, a year</span><b>{gbp(eg.byHand)}</b></div>
            </div>
            <p className="fine reveal">An example firm of 100 people, with example figures. Yours are measured in the sprint.</p>
          </div>
        </section>

        {/* 03 THE GAP */}
        <section id="gap" className="frame">
          <div className="wrap">
            <Slate n="03">Why the chat tools did not fix it</Slate>
            <h2 className="h2 reveal">AI is in the building. <span>The work still runs by hand.</span></h2>
            <ul className="stats">
              <li className="reveal">
                <b>47%</b>
                <p>of medium firms use AI, or plan to.<small>{DSIT.name}, {DSIT.date}</small></p>
                <div className="meter" role="img" aria-label="47 in every 100"><i style={{ width: "47%" }} /></div>
              </li>
              <li className="reveal">
                <b>1 in 5</b>
                <p>of their staff use it, on average, in the medium firms that have it.<small>{DSIT.name}, {DSIT.date}</small></p>
                <div className="heads" role="img" aria-label="1 in 5"><i className="on" /><i /><i /><i /><i /></div>
              </li>
              <li className="reveal">
                <b>67%</b>
                <p>of firms using AI say skills, or knowing what to use it for, hold them back.<small>{DSIT.name}, {DSIT.date}</small></p>
                <div className="meter" role="img" aria-label="67 in every 100"><i style={{ width: "67%" }} /></div>
              </li>
            </ul>
            <p className="gap-end reveal">A chat tool helps one person write. It does not take a step out of a process, or join two systems up. <b>That is the part we build.</b></p>
            <p className="fine reveal">{DSIT.name}, {DSIT.date}, {DSIT.sample}. {DSIT.note} The same survey puts mean AI spend by a medium firm in 2025 at £11,000.</p>
          </div>
        </section>

        {/* 04 HOW WE WORK */}
        <section id="how" className="frame how">
          <div className="wrap">
            <Slate n="04">From A to B</Slate>
            <h2 className="h2 reveal">Watch. Draw. Build and test. <span>Hand over and stay.</span></h2>
          </div>
          <HowScene />
          <div className="wrap how-after">
            <h3 className="h3 reveal">Run it ten times. Get one answer.</h3>
            <div className="ten reveal">
              <div className="ten-row ai">
                <p><b>A chat tool, asked ten times</b>Close, most of the time.</p>
                <div className="ten-tiles">{TEN_AI.map((v, i) => <span key={i} style={{ "--r": `${((i * 37) % 7) - 3}deg`, "--i": i } as React.CSSProperties}>{v}</span>)}</div>
              </div>
              <div className="ten-row code-row">
                <p><b>What we ship, run ten times</b>Identical, or it does not ship.</p>
                <div className="ten-tiles">{TEN_AI.map((_, i) => <span key={i} style={{ "--i": i } as React.CSSProperties}>{gbp(eg.byHand)}</span>)}</div>
              </div>
              <p className="fine">Illustrative. <Link href="/method#ten-run">See a real ten-run test</Link>.</p>
            </div>
            <ul className="method">
              {METHOD.map(([t, d], i) => (
                <li key={t} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}><b>{t}</b><p>{d}</p></li>
              ))}
            </ul>
            <p className="fine reveal"><Link href="/method">The method in full, and what we will not build</Link>.</p>
          </div>
        </section>

        {/* 05 EXAMPLES */}
        <section id="examples" className="frame">
          <div className="wrap">
            <Slate n="05">Proof of range and speed</Slate>
            <h2 className="h2 reveal">Three working tools. <span>Open one and use it.</span></h2>
            <p className="lede reveal">None of these is what we sell. They show how fast we can get into an unfamiliar business. Yours is next.</p>
            <Examples />
          </div>
        </section>

        {/* 06 PAYOFF */}
        <section id="payoff" className="frame">
          <div className="wrap">
            <Slate n="06">B, where you will be</Slate>
            <h2 className="h2 reveal">What one process costs. <span>Put your own numbers in.</span></h2>
            <div className="reveal"><Payoff /></div>
          </div>
        </section>

        {/* 07 PRICE */}
        <section id="pricing" className="frame dark slab">
          <div className="wrap">
            <Slate n="07">What it costs</Slate>
            <h2 className="h2 reveal">Four steps. <span>Every price is published.</span></h2>
            <Ladder />
            <div className="also">
              <div className="reveal"><span>Running costs</span><b>At cost</b><p>{RUNNING}</p></div>
              <div className="reveal"><span>Founding clients</span><b>Three places</b><p>{FOUNDING}</p></div>
            </div>
            <div className="hire reveal">
              <h3>Hire one, or use us.</h3>
              <div>
                <p>The median advertised salary for a UK AI engineer is <b>{SALARY.median}</b> ({SALARY.source}). Roughly {SALARY.loaded} a year with employer costs.</p>
                <p>If you have a long list of work and want a team, hire. If you want the first system working before you decide, start with us. <Link href="/compare">The fair comparison</Link>.</p>
              </div>
            </div>
            <p className="fine reveal">
              Fixed, and agreed in writing before any work starts. <Link href="/pricing">Pricing in full</Link>, <Link href="/sprint">the sprint</Link>, <Link href="/sample-report">a sample sprint report</Link>.
            </p>
          </div>
        </section>

        {/* 08 WHO */}
        <section id="who" className="frame">
          <div className="wrap">
            <Slate n="08">Who you would be working with</Slate>
            <h2 className="h2 reveal">Who builds it. <span>And the hard questions.</span></h2>
            <div className="who">
              <div className="who-me reveal">
                <p><b>I&rsquo;m Sam.</b> I&rsquo;m a hospital doctor and I build clinical software, where a mistake can hurt someone. So I see the problem myself, keep the system simple, test it properly, and keep a person checking what matters.</p>
                <p className="fine">No case studies yet. What you can check instead: the tools, the test and the prices. <Link href="/about">More about us</Link>.</p>
              </div>
              <div>
                <dl className="qa">
                  {HARD.map(([q, a]) => (
                    <div key={q} className="reveal"><dt>{q}</dt><dd>{a}</dd></div>
                  ))}
                </dl>
                <p className="fine reveal"><Link href="/trust">Every hard question, answered in full</Link>.</p>
              </div>
            </div>
            <div className="notfor reveal">
              <h3 className="h3">Who this is not for.</h3>
              <ul>{NOT_FOR.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* 09 START */}
        <section id="start" className="frame dark finale">
          <span aria-hidden className="ghost ghost-b">B</span>
          <div className="wrap">
            <Slate n="09">Start</Slate>
            <h2 className="end-h reveal">Thirty minutes. <mark>A straight answer.</mark></h2>
            <p className="end-p reveal">Tell us what is slow. We will say whether we can fix it and what it costs. If it is not a fit, we will say so.</p>
            <div className="end-cta reveal">
              <TrackLink where="bottom" href="/start" className="group big-cta">
                Book an intro call
                <span aria-hidden className="chip">→</span>
              </TrackLink>
              <p>Or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
