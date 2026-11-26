"use client";

import { useEffect, useRef, useState } from "react";
import data from "./cases.json";

type Outcome = "priced" | "hold" | "query";
type Row = { k: string; v: string; mono: boolean; unread: string | null };
type Line = { group: string; label: string; working: string; amount: number };
type Case = {
  id: string; subject: string; from: string; fromAddr: string; received: string; body: string;
  drawing: string; part: string; outcome: string; read: Row[];
  reply: { to: string; subject: string; body: string } | null;
  price?: { lines: Line[]; cost: number; margin: number; gross: number; unit: number; total: number; qty: number; lead: number };
};

const CASES = data as Case[];
const gbp = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

const OUTCOMES: { o: Outcome; name: string; line: string }[] = [
  { o: "priced", name: "Priced", line: "Read, priced and drafted, ready to check." },
  { o: "hold", name: "Held for the estimator", line: "Something isn’t on the rate sheet, so a person prices it." },
  { o: "query", name: "Question to the customer", line: "Something can’t be read, so it asks. It never guesses." },
];
const NAME = Object.fromEntries(OUTCOMES.map((x) => [x.o, x.name])) as Record<Outcome, string>;

function Mark({ o }: { o: string }) {
  return <span className="qd-mark" data-o={o} aria-hidden>{o === "query" ? "?" : null}</span>;
}

function status(c: Case) {
  if (c.price) return gbp(c.price.total);
  return c.outcome === "hold" ? "Held" : "Question";
}

export function Inbox() {
  const [id, setId] = useState("01");
  const caseRef = useRef<HTMLElement>(null);
  const c = CASES.find((x) => x.id === id) ?? CASES[0];

  // A link can open a given email: /drawings-to-quote?case=07.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("case");
    if (want && CASES.some((x) => x.id === want)) setId(want);
  }, []);

  function pick(next: string) {
    setId(next);
    const url = new URL(window.location.href);
    url.searchParams.set("case", next);
    window.history.replaceState(null, "", url);
    // On a phone the email sits under the list, so bring it into view.
    if (window.matchMedia("(max-width: 999px)").matches && caseRef.current) {
      const top = caseRef.current.getBoundingClientRect().top + window.scrollY - 76;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
    }
  }

  const material = c.read.find((r) => r.k === "Material")?.v;
  const unread = c.read.filter((r) => r.unread);

  return (
    <>
      <ul className="qd-key">
        {OUTCOMES.map((x) => {
          const first = CASES.find((k) => k.outcome === x.o)!;
          return (
            <li key={x.o}>
              <button type="button" onClick={() => pick(first.id)} aria-label={`${x.name}: open email ${first.id}`}>
                <Mark o={x.o} />
                <span><b>{x.name}</b>{x.line}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="qd-box">
        <nav className="qd-list" aria-label="Emails">
          <p className="qd-list-h">Corvane Precision, sales inbox</p>
          <ul>
            {CASES.map((k) => (
              <li key={k.id}>
                <button type="button" onClick={() => pick(k.id)} aria-current={k.id === id ? "true" : undefined} data-o={k.outcome}>
                  <Mark o={k.outcome} />
                  <span className="qd-li-main">
                    <span className="qd-li-top"><b>{k.from}</b><time>{k.received.split(",")[0]}</time></span>
                    <span className="qd-li-sub">{k.subject}</span>
                  </span>
                  <span className="qd-li-st">{status(k)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <article className="qd-case" ref={caseRef} aria-live="polite">
          <header className="qd-head">
            <h2>{c.subject}</h2>
            <p className="qd-from">{c.from} &lt;{c.fromAddr}&gt; &middot; {c.received}</p>
            <p className="qd-body">{c.body}</p>
            <p className="qd-out" data-o={c.outcome}>
              <Mark o={c.outcome} />
              <span>
                <b>{NAME[c.outcome as Outcome]}.</b>{" "}
                {c.outcome === "priced" && "Waiting for the estimator to check it and send."}
                {c.outcome === "hold" && <>{material} isn&rsquo;t on the rate sheet, so nothing is priced. The estimator prices it by hand or adds it to the sheet.</>}
                {c.outcome === "query" && "The quantity is smudged on the drawing and the email doesn’t give one. A wrong quantity changes every line, so it asks the customer first."}
              </span>
            </p>
          </header>

          <div className="qd-grid">
            <figure className="qd-panel qd-draw">
              <figcaption className="qd-ph">
                <span>The drawing, {c.drawing}</span>
                <a href={`/drawings-to-quote/${c.id}.webp`} target="_blank" rel="noopener">Open full size</a>
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/drawings-to-quote/${c.id}.webp`} width={1800} height={1274} alt={`Drawing ${c.drawing}, ${c.part}`} />
            </figure>

            <section className="qd-panel qd-read" aria-label="What was read">
              <h3 className="qd-ph"><span>What was read</span></h3>
              <dl>
                {c.read.map((r) => (
                  <div key={r.k} className={r.unread ? "un" : c.outcome === "hold" && r.k === "Material" ? "off" : undefined}>
                    <dt>{r.k}</dt>
                    <dd className={r.mono ? "m" : undefined}>{r.v}</dd>
                  </div>
                ))}
              </dl>
              {unread.length > 0 && <p className="qd-note">{unread.map((r) => r.unread).join(" ")}</p>}
            </section>

            <section className="qd-panel qd-work" aria-label="The price, line by line">
              <h3 className="qd-ph"><span>The price, line by line</span>{c.price && <span>From the rate sheet</span>}</h3>
              {c.price ? (
                <>
                  <ol className="qd-lines">
                    {c.price.lines.map((l, i) => (
                      <li key={i}>
                        <span className="qd-l-name"><b>{l.group}</b> {l.label}</span>
                        <span className="qd-l-amt m">{gbp(l.amount)}</span>
                        <span className="qd-l-work m">{l.working}</span>
                      </li>
                    ))}
                  </ol>
                  <dl className="qd-sum">
                    <div><dt>Cost</dt><dd className="m">{gbp(c.price.cost)}</dd></div>
                    <div><dt>With {Math.round(c.price.margin * 100)}% margin</dt><dd className="m">{gbp(c.price.gross)}</dd></div>
                    <div><dt>Each, rounded up to the penny</dt><dd className="m">{gbp(c.price.unit)}</dd></div>
                    <div className="tot"><dt>{c.price.qty} off</dt><dd className="m"><mark>{gbp(c.price.total)}</mark></dd></div>
                  </dl>
                  <p className="qd-lead">Lead time {c.price.lead} working days.</p>
                </>
              ) : (
                <p className="qd-none">{c.outcome === "hold" ? "No price until the estimator has one for the material." : "No price until the customer gives the quantity."}</p>
              )}
            </section>

            <section className="qd-panel qd-reply" aria-label="Draft reply">
              <h3 className="qd-ph"><span>Draft reply</span><span>Not sent</span></h3>
              {c.reply ? (
                <div className="qd-mail">
                  <p className="qd-meta"><span>To</span> {c.reply.to}</p>
                  <p className="qd-meta"><span>Subject</span> {c.reply.subject}</p>
                  <p className="qd-txt">{c.reply.body}</p>
                </div>
              ) : (
                <p className="qd-none">No reply drafted. The estimator decides what to say.</p>
              )}
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
