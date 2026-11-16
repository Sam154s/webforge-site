"use client";

import { useState } from "react";
import { PRICE } from "@/lib/offer";
import { CUT, EXAMPLE, RATE, WEEKS, gbp, num, processCost } from "@/lib/sum";
import { Slider } from "./parts";

// One process, on the visitor's own numbers. The sum is in lib/sum.ts and matches the one in the sales sandbox.
export function Payoff() {
  const [people, setPeople] = useState<number>(EXAMPLE.people);
  const [hours, setHours] = useState<number>(EXAMPLE.hoursEach);
  const [rate, setRate] = useState<number>(RATE);
  const s = processCost(people, hours, rate, PRICE.build);
  return (
    <div className="pay">
      <div className="pay-in">
        <Slider label="People who touch it" value={people} min={1} max={40} onChange={setPeople} show={String(people)} />
        <Slider label="Hours a week, each" value={hours} min={1} max={20} onChange={setHours} show={String(hours)} />
        <Slider label="What an hour of their time costs you" value={rate} min={15} max={60} onChange={setRate} show={gbp(rate)} />
        <p className="fine">
          Assumes {WEEKS} working weeks a year, and that a build takes {CUT[0] * 100} to {CUT[1] * 100}% of the work off your people. The hourly cost is pay plus employer costs. An estimate, not a promise. We measure your real figures in the sprint.
        </p>
      </div>
      <div className="pay-out" aria-live="polite">
        <p className="pay-k">Costs you by hand, a year</p>
        <p className="pay-total">{gbp(s.byHand)}</p>
        <div className="pay-row">
          <div className="pay-l"><b>By hand</b><span>{num(s.hoursYear)} hours a year</span></div>
          <div className="pay-bar"><i className="all" style={{ width: "100%" }} /></div>
        </div>
        <div className="pay-row">
          <div className="pay-l"><b>Could come off</b><span>{gbp(s.low)} to {gbp(s.high)} a year</span></div>
          <div className="pay-bar"><i className="hi" style={{ width: `${CUT[1] * 100}%` }} /><i className="lo" style={{ width: `${CUT[0] * 100}%` }} /></div>
          <p>Solid is the low estimate. Hatched is the high one.</p>
        </div>
        <p className="pay-back">
          {s.payback && s.payback <= 36
            ? <>On the low estimate, a {gbp(PRICE.build)} build pays for itself in <b>{s.payback === 1 ? "about a month" : `about ${s.payback} months`}</b>.</>
            : <>On the low estimate, a {gbp(PRICE.build)} build would not pay for itself inside three years. <b>We would tell you that on the call.</b></>}
        </p>
      </div>
    </div>
  );
}
