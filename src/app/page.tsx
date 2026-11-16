import Link from "next/link";
import { BuilderScene } from "./builder-scene";
import { Reveal } from "./reveal";
import { Examples } from "./story/examples";
import { Payoff } from "./story/payoff";
import { Cta, TrackLink } from "@/components/track-link";
import { EMAIL } from "@/lib/site";
import "./story.css";

// The homepage is a storyboard: seven frames that take a visitor from A (work done by hand) to B (tools that run
// themselves). The rail in the header follows along. Frame ids and labels live in lib/story.ts.

// Six thumbnail drawings for the strip under the headline. Each path draws itself in on load.
const STRIP: { side: string; cap: string; href: string; art: React.ReactNode }[] = [
  { side: "A", cap: "An enquiry comes in", href: "#by-hand", art: <><rect x="58" y="16" width="44" height="68" rx="7" pathLength={1} /><path d="M68 34h24M68 43h24M68 52h14" pathLength={1} /><path d="M112 32a16 16 0 0 1 0 22M121 24a28 28 0 0 1 0 38" pathLength={1} /></> },
  { side: "A", cap: "Days go by", href: "#by-hand", art: <><rect x="40" y="20" width="80" height="62" rx="4" pathLength={1} /><path d="M40 36h80M60 14v12M100 14v12" pathLength={1} /><path d="M52 46l8 8m0 -8l-8 8M72 46l8 8m0 -8l-8 8M92 46l8 8m0 -8l-8 8M52 62l8 8m0 -8l-8 8M72 62l8 8m0 -8l-8 8" pathLength={1} /></> },
  { side: "→", cap: "We find the leak", href: "#pricing", art: <><path d="M18 40h64v18h60M18 52h52v18h72" pathLength={1} /><path d="M88 76v8M88 90v4" pathLength={1} /><circle cx="94" cy="46" r="20" pathLength={1} /><path d="M109 61l16 16" pathLength={1} /></> },
  { side: "B", cap: "AI builds the tool, once", href: "#fix", art: <><rect x="46" y="60" width="34" height="22" rx="3" pathLength={1} /><rect x="84" y="60" width="34" height="22" rx="3" pathLength={1} /><rect x="65" y="34" width="34" height="22" rx="3" pathLength={1} /><path d="M118 14l3 9l9 3l-9 3l-3 9l-3 -9l-9 -3l9 -3z" pathLength={1} /></> },
  { side: "B", cap: "Plain code runs it", href: "#fix", art: <><path d="M54 24c-8 0 -10 4 -10 10v8c0 5 -3 8 -8 8c5 0 8 3 8 8v8c0 6 2 10 10 10M106 24c8 0 10 4 10 10v8c0 5 3 8 8 8c-5 0 -8 3 -8 8v8c0 6 -2 10 -10 10" pathLength={1} /><path d="M66 50a14 14 0 1 1 6 11.5M72 68v-7h-7" pathLength={1} /></> },
  { side: "B", cap: "More jobs, bigger jobs", href: "#payoff", art: <><path d="M30 84h100" pathLength={1} /><rect x="40" y="62" width="16" height="22" pathLength={1} /><rect x="64" y="50" width="16" height="34" pathLength={1} /><rect x="88" y="36" width="16" height="48" pathLength={1} /><path d="M40 44l32 -14l16 6l30 -20M106 16h12v12" pathLength={1} /></> },
];

// One enquiry handled by hand. Days of waiting between each touch.
const BY_HAND: [string, string, string, number][] = [
  ["Mon 09:12", "Enquiry lands", "A voicemail and a web form.", 1],
  ["Tue 17:40", "Called back", "After the day’s work.", 6],
  ["Mon", "Site visit", "An hour there, an hour back.", 4],
  ["Fri", "Quote typed up", "An evening. One page, one price.", 6],
  ["Thu", "Chased once", "They went with someone else.", 0],
];
const LEAKS = [
  ["Cost", "2 hrs", "of admin on every enquiry, won or lost."],
  ["Customers", "4 in 5", "enquiries never become a job."],
  ["Ticket", "1 price", "on one page. So you are compared on price alone."],
];
const TEN_AI = ["£4,180", "£4,420", "£3,950", "£4,300", "£4,610", "£4,090", "£4,250", "£4,480", "£3,990", "£4,350"];

const PATH = [
  ["01", "Free diagnostic", "Free", "A 30 minute call and a ranked report: each job, what it costs you a year, and what to fix first. Keep it either way."],
  ["02", "Fix this", "£750 to £1,000", "One audited fix. Fixed price, agreed in writing and paid in full before we start. We test and adjust it with you until it works."],
  ["03", "Builder, then two workflows", "£5,000", "Four weeks. For teams that want to build the rest themselves. Offered after your first fix is working."],
];
const ALSO = [
  ["Extra workflows", "£1,000", "Each, built by us. Scoped and agreed before we start."],
  ["Support and AI consulting", "From £1,000 a month", "Re-testing, new tools, advice on where AI fits next. Rolling monthly."],
  ["Websites and customer tools", "Quoted per project", "Priced after the diagnostic, in writing, before any work starts."],
  ["Running costs", "At cost", "Hosting and any AI usage on your own accounts, agreed up front."],
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
            <div className="hero-top">
              <h1 className="ab" aria-label="From A, done by hand, to B, runs itself.">
                <span className="ab-row a" aria-hidden><b className="pin">A</b><span className="mask"><span>Done by hand.</span></span></span>
                <span className="ab-row b" aria-hidden><b className="pin lime">B</b><span className="mask"><span style={{ animationDelay: ".25s" }}><mark>Runs itself.</mark></span></span></span>
              </h1>
              <div className="hero-side fade" style={{ animationDelay: ".7s" }}>
                <p>We use AI once, to build tools for your business in plain code. They quote, book and chase for you, and cost almost nothing to run.</p>
                <div className="hero-cta">
                  <Cta where="hero" />
                  <TrackLink where="hero-examples" href="#examples" className="ghost-link"><span aria-hidden>↓</span> Play with three tools we built</TrackLink>
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
            <h2 className="h2 reveal">One enquiry, <span>done by hand.</span></h2>
            <ol className="hand reveal">
              {BY_HAND.map(([when, title, sub, wait], i) => (
                <li key={title} style={{ "--w": wait, "--i": i } as React.CSSProperties} className={i === BY_HAND.length - 1 ? "lost" : ""}>
                  <span className="hand-when">{when}</span>
                  <span className="hand-dot" aria-hidden><i />{wait > 0 && <><s /><em>{wait === 1 ? "1 day" : `${wait} days`}</em><s /></>}</span>
                  <b>{title}</b>
                  <span className="hand-sub">{sub}</span>
                  {wait > 0 && <span className="hand-gap">Then {wait === 1 ? "a day" : `${wait} days`} of waiting.</span>}
                </li>
              ))}
            </ol>
            <p className="hand-sum reveal"><b>17 days. No job.</b> Nothing here was hard. It was just slow, and done by a person every time.</p>
            <div className="leaks">
              {LEAKS.map(([k, big, line], i) => (
                <div key={k} className="leak reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <span className="leak-k">Leak {i + 1}: {k}</span>
                  <b>{big}</b>
                  <p>{line}</p>
                </div>
              ))}
            </div>
            <p className="fine reveal">An example builder, with typical figures. Yours go in at the diagnostic.</p>
          </div>
        </section>

        {/* 03 THE FIX */}
        <section id="fix" className="frame fix">
          <div className="wrap">
            <Slate n="03">The fix</Slate>
            <h2 className="h2 reveal">AI builds it once. <span>Plain code runs it forever.</span></h2>
            <div className="ten reveal">
              <div className="ten-row ai">
                <p><b>AI on every job</b>A different answer each time, and a bill each time.</p>
                <div className="ten-tiles">{TEN_AI.map((v, i) => <span key={i} style={{ "--r": `${((i * 37) % 7) - 3}deg`, "--i": i } as React.CSSProperties}>{v}</span>)}</div>
              </div>
              <div className="ten-row code-row">
                <p><b>AI once, then code</b>The same answer every time, for about nothing.</p>
                <div className="ten-tiles">{TEN_AI.map((_, i) => <span key={i} style={{ "--i": i } as React.CSSProperties}>£4,250</span>)}</div>
              </div>
              <p className="fine">The same quote, run ten times. Illustrative. <Link href="/method">See a real ten-run test</Link>.</p>
            </div>
          </div>
          <BuilderScene />
        </section>

        {/* 04 EXAMPLES */}
        <section id="examples" className="frame">
          <div className="wrap">
            <Slate n="04">See what we build</Slate>
            <h2 className="h2 reveal">Three tools. <span>Open one and play.</span></h2>
            <p className="lede reveal">Three example firms, three tools we built. Each one is fully usable, so open it and be the customer: design the house, plan the kitchen, find the fault.</p>
            <Examples />
            <div className="more reveal">
              <p><b>Now picture yours.</b> We build the same kind of tool around your own prices, rules and diary.</p>
              <Cta where="examples" />
            </div>
          </div>
        </section>

        {/* 05 PAYOFF */}
        <section id="payoff" className="frame">
          <div className="wrap">
            <Slate n="05">B, where you will be</Slate>
            <h2 className="h2 reveal">Three ways it pays. <span>Put your own numbers in.</span></h2>
            <div className="reveal"><Payoff /></div>
          </div>
        </section>

        {/* 06 PRICE */}
        <section id="pricing" className="frame dark">
          <div className="wrap">
            <Slate n="06">What it costs</Slate>
            <h2 className="h2 reveal">Three steps. <span>The first is free.</span></h2>
            <ol className="path">
              {PATH.map(([no, what, cost, note], i) => (
                <li key={no} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <span className="path-no">{no}</span>
                  <b className={cost === "Free" ? "free" : ""}>{cost}</b>
                  <h3>{what}</h3>
                  <p>{note}</p>
                </li>
              ))}
            </ol>
            <div className="also">
              {ALSO.map(([what, cost, note]) => (
                <div key={what} className="reveal"><span>{what}</span><b>{cost}</b><p>{note}</p></div>
              ))}
            </div>
            <p className="fine reveal">
              Fixed prices, agreed in writing before any work starts. No day rates. <Link href="/sample-report">See a sample report</Link>, <Link href="/method">read the method</Link>, or <Link href="/estimate">try the price estimator</Link>.
            </p>
          </div>
        </section>

        {/* 07 START */}
        <section id="start" className="frame dark finale">
          <span aria-hidden className="ghost ghost-b">B</span>
          <div className="wrap">
            <Slate n="07">Start</Slate>
            <h2 className="end-h reveal">Find out what B looks like for you. <mark>It is free.</mark></h2>
            <div className="end-cta reveal">
              <TrackLink where="bottom" href="/diagnostic" className="group big-cta">
                Book a free diagnostic
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
