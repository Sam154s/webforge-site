"use client";

import { useState } from "react";
import { gbp, range, tidy } from "@/lib/showcase/journey";
import { ASSUME, SECTORS, levers, sector, type Inputs } from "@/lib/showcase/yours";
import { Slider } from "./parts";

// The three levers, on the visitor's own numbers. Same sums as the "Now do yours" page in the sales sandbox.
const VALUES = [100, 150, 200, 240, 300, 400, 500, 750, 1000, 1500, 2000, 2400, 3000, 4200, 5000, 6500, 8000, 9500, 12000, 14000, 18000, 25000, 35000, 50000];
const start = (key: string): Inputs => ({ v: 1, sector: key, ...sector(key).defaults });
const BUILD = 5000;

export function Payoff() {
  const [i, setI] = useState<Inputs>(start("builder"));
  const l = levers(i), top = l.total.high || 1;
  const rows = [
    { key: "cost", name: "Lower cost", low: l.cost.low, high: l.cost.high, note: `${l.cost.hours[0].toLocaleString("en-GB")} to ${l.cost.hours[1].toLocaleString("en-GB")} hours of admin a year, gone` },
    { key: "customers", name: "More customers", low: l.customers.low, high: l.customers.high, note: `${l.customers.jobs[0]} to ${l.customers.jobs[1]} more jobs a year from enquiries answered at once` },
    { key: "ticket", name: "Higher ticket", low: l.ticket.low, high: l.ticket.high, note: "A better experience supports a better price" },
  ];
  const months = l.total.low > 0 ? Math.max(1, Math.ceil(BUILD / (l.total.low / 12))) : null;
  const vi = VALUES.reduce((best, v, k) => (Math.abs(v - i.jobValue) < Math.abs(VALUES[best] - i.jobValue) ? k : best), 0);
  return (
    <div className="pay">
      <div className="pay-in">
        <div className="chips" role="group" aria-label="Your kind of business">
          {SECTORS.map((s) => (
            <button key={s.key} type="button" aria-pressed={s.key === i.sector} onClick={() => setI(start(s.key))}>{s.name}</button>
          ))}
        </div>
        <Slider label="Enquiries a month" value={i.enquiries} min={1} max={200} onChange={(v) => setI({ ...i, enquiries: v })} show={String(i.enquiries)} />
        <Slider label="Average job value" value={vi} min={0} max={VALUES.length - 1} onChange={(v) => setI({ ...i, jobValue: VALUES[v] })} show={gbp(i.jobValue)} />
        <Slider label="Enquiries that become jobs" value={i.winRate} min={5} max={90} onChange={(v) => setI({ ...i, winRate: v })} show={`${i.winRate}%`} />
        <p className="fine">
          Assumes {ASSUME.adminCut[0] * 100} to {ASSUME.adminCut[1] * 100}% of the admin on each enquiry is removed, {ASSUME.winPoints[0]} to {ASSUME.winPoints[1]} more enquiries in every 100 become jobs, and prices rise {ASSUME.priceLift[0] * 100} to {ASSUME.priceLift[1] * 100}%.
          Margin, admin time and hourly cost are typical for the business you picked. Estimates, not promises. We work out your real figures in the diagnostic.
        </p>
      </div>
      <div className="pay-out" aria-live="polite">
        <p className="pay-k">Worth to you, a year</p>
        <p className="pay-total">{range(tidy(l.total.low), tidy(l.total.high))}</p>
        <div className="pay-bars">
          {rows.map((r) => (
            <div key={r.key} className="pay-row">
              <div className="pay-l"><b>{r.name}</b><span>{range(tidy(r.low), tidy(r.high))}</span></div>
              <div className="pay-bar"><i className="hi" style={{ width: `${(r.high / top) * 100}%` }} /><i className="lo" style={{ width: `${(r.low / top) * 100}%` }} /></div>
              <p>{r.note}</p>
            </div>
          ))}
        </div>
        {months && months <= 36 && (
          <p className="pay-back">On the low figure, a {gbp(BUILD)} build pays for itself in <b>{months === 1 ? "about a month" : `about ${months} months`}</b>.</p>
        )}
      </div>
    </div>
  );
}
