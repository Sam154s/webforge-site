"use client";

import { useState } from "react";
import { buildEmail, fmtBand, FOOT, NOT_SHOWN, PART_ROWS, partLabel, toText, type Check } from "./schema";
import type { Shop } from "./shop";

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function CopyButton({ text, label, quiet }: { text: string; label: string; quiet?: boolean }) {
  const [done, setDone] = useState<"" | "ok" | "no">("");
  return (
    <button type="button" className={quiet ? "dc-btn alt" : "dc-btn"} onClick={async () => { setDone((await copyText(text)) ? "ok" : "no"); window.setTimeout(() => setDone(""), 2500); }}>
      {done === "ok" ? "Copied" : done === "no" ? "Copy blocked, select the text" : label}
    </button>
  );
}

const Where = ({ w }: { w: string }) => <span className="dc-where">{w}</span>;

function Rows<T>({ label, items, render }: { label: string; items: T[]; render: (x: T) => React.ReactNode }) {
  return (
    <div className="dc-row">
      <dt>{label}</dt>
      <dd>{items.length ? <ul>{items.map((x, i) => <li key={i}>{render(x)}</li>)}</ul> : <span className="dc-none">None found</span>}</dd>
    </div>
  );
}

// The one-page check. Used for a live result and for the examples.
export function Sheet({ check: c, shop, actions, onAgain }: { check: Check; shop: Shop | null; actions?: boolean; onAgain?: () => void }) {
  const email = buildEmail(c, shop?.questions ?? [], shop?.signOff ?? "Thanks,");
  const text = toText(c, email);
  const hasShop = !!shop;
  return (
    <article className="dc-sheet" aria-label={`Drawing check for ${partLabel(c.part)}`}>
      <header className="dc-sheet-h">
        <div>
          <p className="dc-sheet-k">Drawing check</p>
          <h3>{c.part.drawing_number ?? "No drawing number"}{c.part.revision && <span> rev {c.part.revision}</span>}</h3>
          {c.part.part_name && <p className="dc-sheet-sub">{c.part.part_name}{c.part.customer && `, ${c.part.customer}`}</p>}
        </div>
        {actions && (
          <div className="dc-sheet-act dc-noprint">
            <CopyButton text={text} label="Copy the check" />
            <button type="button" className="dc-btn alt" onClick={() => window.print()}>Print</button>
            {onAgain && <button type="button" className="dc-btn alt" onClick={onAgain}>Check another</button>}
          </div>
        )}
      </header>

      <section className="dc-sec">
        <h4 className="dc-ah"><span className="dc-num" aria-hidden>1</span>The part</h4>
        <dl className="dc-tb">
          {PART_ROWS.map(([k, label]) => (
            <div key={k} className={c.part[k] ? undefined : "un"}>
              <dt>{label}</dt>
              <dd>{c.part[k] ?? NOT_SHOWN}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="dc-sec">
        <h4 className="dc-ah"><span className="dc-num" aria-hidden>2</span>What it asks for</h4>
        <dl className="dc-list">
          <Rows label="Special processes" items={c.special_processes} render={(s) => <>{s.process}{s.spec ? `, ${s.spec}` : ", no spec given"} <Where w={s.where} /></>} />
          <div className="dc-row"><dt>General tolerance</dt><dd>{c.general_tolerance ?? <span className="dc-none">{NOT_SHOWN}</span>}</dd></div>
          <div className="dc-row">
            <dt>Tightest tolerances</dt>
            <dd>
              {c.tightest_tolerances.length ? (
                <table className="dc-tol">
                  <thead><tr><th scope="col">Feature</th><th scope="col">Callout</th><th scope="col">Band</th></tr></thead>
                  <tbody>
                    {c.tightest_tolerances.map((t, i) => (
                      <tr key={i}><td>{t.feature} <Where w={t.where} /></td><td>{t.callout}</td><td>{t.band_mm === null ? "Fit" : fmtBand(t.band_mm)}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <span className="dc-none">None found</span>}
            </dd>
          </div>
          <div className="dc-row"><dt>GD&amp;T</dt><dd>{c.gdt.count} feature control frame{c.gdt.count === 1 ? "" : "s"}{c.gdt.types.length > 0 && `: ${c.gdt.types.join(", ")}`}</dd></div>
          <Rows label="Surface finish" items={c.surface_finish} render={(s) => <>{s.callout} <Where w={s.where} /></>} />
          <Rows label="Threads" items={c.threads} render={(t) => <>{t.count > 1 && `${t.count}x `}{t.spec} <Where w={t.where} /></>} />
          <Rows label="Inspection" items={c.inspection} render={(s) => <>{s.requirement} <Where w={s.where} /></>} />
          <Rows label="Certificates" items={c.certificates} render={(s) => <>{s.requirement} <Where w={s.where} /></>} />
          <Rows label="Notes that flow down" items={c.flow_down_notes} render={(s) => <>{s.note} <Where w={s.where} /></>} />
        </dl>
      </section>

      <section className="dc-sec">
        <h4 className="dc-ah"><span className="dc-num" aria-hidden>3</span>Against your shop</h4>
        {!hasShop ? <p className="dc-none">No shop setup, so nothing to compare.</p> : c.against_shop.length ? (
          <ol className="dc-flags">
            {c.against_shop.map((a, i) => (
              <li key={i}>
                <b>{a.item}</b>
                <span className="dc-vs"><span>Drawing: {a.drawing_says}</span><span>Your shop: {a.shop_has}</span></span>
                <span className="dc-impact">{a.impact}</span>
              </li>
            ))}
          </ol>
        ) : <p className="dc-none">Nothing outside what your shop does.</p>}
      </section>

      <section className="dc-sec">
        <h4 className="dc-ah"><span className="dc-num" aria-hidden>4</span>Missing or unclear</h4>
        {c.missing.length ? (
          <ol className="dc-flags">
            {c.missing.map((m, i) => <li key={i}><b>{m.item}</b> <Where w={m.where} /><span className="dc-impact">{m.why}</span></li>)}
          </ol>
        ) : <p className="dc-none">Nothing missing.</p>}
      </section>

      <section className="dc-sec">
        <h4 className="dc-ah"><span className="dc-num" aria-hidden>5</span>Email to the customer</h4>
        {email ? (
          <div className="dc-mail">
            <p className="dc-meta"><span>Subject</span> {email.subject}</p>
            <p className="dc-mailtxt">{email.body}</p>
            {actions && <div className="dc-noprint"><CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy the email" quiet /></div>}
          </div>
        ) : <p className="dc-none">Nothing to ask, so no email needed.</p>}
      </section>

      <p className="dc-foot">{FOOT}</p>
    </article>
  );
}
