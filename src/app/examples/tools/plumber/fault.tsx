'use client'
// Tool one: the boiler fault finder. Make, model, age and code in; diagnosis, a safe first check, the repair or
// replace sum, the part reserved or ordered, a fixed price, slots built round the part, and a boiler passport out.
import { useMemo, useState } from 'react'
import { FIRMS, gbp, type Artefact } from '@/lib/sandbox/journey'
import { PLUMBER_STEPS } from '@/lib/sandbox/steps/plumber'
import { CASE_LINE, COMPONENT, GAS_LINE, MAKES, NO_CODE, START, THIS_YEAR, advise, codesFor, diagnose, firstCode, make, nice, passport, type Answers } from '@/lib/sandbox/plumber'
import Stage, { FirmHead } from '../stage'
import Schematic from './schematic'
import { Auto, SYMBOL } from './symbols'

const firm = FIRMS.plumber
const first = firm.customer.split(' ')[0]
const engineer = firm.owner.split(' ')[0]

function GasLine() {
  return <div className="tw-gas" role="note"><span className="num"><small>Smell gas? Call first</small>0800 111 999</span><span>{GAS_LINE}</span></div>
}

export default function FaultFinder({ onHome }: { onHome: () => void }) {
  const [stage, setStage] = useState(0)
  const [a, setA] = useState<Answers>(START)
  const [slot, setSlot] = useState('')
  const [fixed, setFixed] = useState(false)
  const [quote, setQuote] = useState(false)
  const d = useMemo(() => diagnose(a), [a])
  const adv = useMemo(() => advise(a), [a])
  const set = (patch: Partial<Answers>) => setA((cur) => ({ ...cur, ...patch }))
  const restart = () => { setStage(0); setA(START); setSlot(''); setFixed(false); setQuote(false); onHome() }
  const when = slot || d.slots[0]
  const shown = d.hasCode ? d.code.code : 'No code'
  const pass = useMemo(() => passport(a, when), [a, when])
  const also = d.code.also ?? []
  const wantsQuote = quote && adv.suggest
  const big = Math.max(adv.sum, adv.replacement)

  const artefacts: Record<string, Artefact | Artefact[]> = {
    p1: { type: 'doc', title: 'Catalogue match', rows: [['Make', d.make.name], ['Model', d.model.name], ['Output', `${d.model.kw} kW ${d.model.kind.toLowerCase()}`], ['Fitted', `About ${adv.fitted}, ${adv.age} years old`], ['Codes on file', `${codesFor(d.make, d.model.key).length - NO_CODE.length} for this model, ${NO_CODE.length} symptoms`]] },
    p2: { type: 'doc', title: 'Catalogue entry', rows: [['Code', d.code.sub ? `${shown}, cause code ${d.code.sub}` : shown], ['Means', d.code.shows], ['Most likely', d.code.cause], ['Component', COMPONENT[d.code.component]], ...(also.length ? [['Also check', also.map((k) => COMPONENT[k]).join(', ')]] as [string, string][] : []), ['Part', `${d.part.name}, ${d.part.ref}${d.provisional ? ' (provisional)' : ''}`]] },
    p3: d.check
      ? { type: 'doc', title: 'First check shown to the customer', rows: [['Check', d.check.title], ...d.check.steps.map((s, i) => [`Step ${i + 1}`, s] as [string, string]), ['Outcome', fixed ? 'Customer fixed it. No visit raised.' : stage >= 3 ? 'Did not clear. Engineer needed.' : 'Waiting for the customer']] }
      : { type: 'doc', title: 'First check', rows: [['Check', 'None is safe for this fault'], ['Outcome', 'Straight to an engineer']] },
    p4: d.code.gas
      ? { type: 'doc', title: 'Gas safety line', rows: [['Shown', 'Above the diagnosis, before anything else'], ['Number', '0800 111 999, National Gas Emergency Service'], ['Why', 'This is an ignition or gas fault']] }
      : { type: 'doc', title: 'Gas safety line', rows: [['Fault type', 'Not an ignition or gas fault'], ['Shown', 'In the footer of every screen, as always'], ['Number', '0800 111 999']] },
    p5: { type: 'doc', title: 'Repair or replace', rows: [['Age', `${adv.age} years`], ['Repair', gbp(adv.repair)], ['Age x repair', gbp(adv.sum)], ['New boiler from', gbp(adv.replacement)], ['Advice', adv.line], ...adv.reasons.map((r, i) => [`Reason ${i + 1}`, r] as [string, string])], note: 'A rule of thumb. The repair goes ahead either way.' },
    p6: { type: 'doc', title: 'Stock check', rows: [['Part', `${d.part.ref}, ${d.part.name}`], ['Fits', `${d.make.name} ${d.model.name}`], ['On the van', d.stock === 'van' ? 'Yes, 1' : 'No'], ['Trade counter', d.stock === 'branch' ? 'Yes, 1' : d.stock === 'van' ? 'Not needed' : 'No'], ['Supplier', d.stock === 'order' ? 'Yes, next day' : 'Not needed']] },
    p7: d.order
      ? { type: 'doc', title: `Purchase order ${d.order}`, rows: [['To', 'Northgate Heating Supplies'], ['Part', `${d.part.ref}, ${d.part.name}`], ['Fits', d.model.name], ['Quantity', '1'], ['Deliver', 'To the depot by 10 am tomorrow'], ['Raised by', 'The fault finder, no phone call']] }
      : { type: 'doc', title: 'Stock reservation', rows: [['Part', `${d.part.ref}, ${d.part.name}`], ['Where', d.stockName], ['Held for', `${firm.customer}, ${d.model.name}`]] },
    p8: [{ type: 'quote', title: 'Fixed price', lines: [[d.part.name, gbp(d.part.price)], [`Labour, about ${d.code.minutes} minutes`, gbp(d.labour)]], total: ['Fixed price including VAT', gbp(d.total)], note: d.provisional ? `The part is provisional. If the engineer finds it is not needed, the price is ${gbp(d.labourOnly)}.` : 'Part guaranteed for 12 months. If the fault turns out to be something else, the engineer agrees a new price before starting.' },
      { type: 'doc', title: 'Slots offered', rows: d.slots.map((s, i) => [`Slot ${i + 1}`, s] as [string, string]), note: `No slot is offered before the part is ${d.stock === 'order' ? 'delivered' : 'in the engineer\'s hands'}.` }],
    p9: { type: 'doc', title: `Job card for ${engineer}`, rows: [['Customer', firm.customer], ['Slot', when], ['Boiler', `${d.make.name} ${d.model.name}, ${d.model.kw} kW, fitted about ${adv.fitted}`], ['Display', d.code.sub ? `${shown} (${d.code.sub})` : shown], ['Likely cause', d.code.cause], ...(also.length ? [['Also check', also.map((k) => COMPONENT[k]).join(', ')]] as [string, string][] : []), ['Part', `${d.part.ref}, ${d.stockName.toLowerCase()}`], ['Agreed price', `${gbp(d.total)} inc VAT`], ...(wantsQuote ? [['Customer asked', 'Bring a replacement price']] as [string, string][] : []), ...(a.vulnerable ? [['Note', 'Priority household, no heating']] as [string, string][] : [])] },
    p10: { type: 'text', to: firm.customer, body: `Hello ${first}, Tidewater here. ${engineer}, Gas Safe registered, is booked for ${when.replace('Priority: ', '')}. Fixed price ${gbp(d.total)}, the part is ${d.stock === 'order' ? 'on order and will be with us before the visit' : 'already reserved'}. Leave the boiler off until then.` },
    p12: { type: 'email', to: firm.customer, from: firm.name, subject: `Invoice paid: ${gbp(d.total)}`, attach: ['Invoice (PDF)', 'Gas Safe job record (PDF)'], body: [`Hello ${first},`, `All done. ${engineer} fitted a new ${d.part.name.toLowerCase()} to your ${d.model.name} at the price quoted. The part is guaranteed until ${nice(pass.guarantee)}.`] },
    p13: { type: 'doc', title: `Boiler passport ${pass.number}`, rows: [['Boiler', `${pass.make} ${pass.model}, ${pass.output}`], ['Fitted', `About ${pass.fitted}`], ['Part fitted', `${pass.part.name}, ${pass.part.ref}`], ['On', nice(pass.visit)], ['Part guarantee to', nice(pass.guarantee)], ['Next service due', nice(pass.service)]], note: 'One record per boiler. Every later visit adds a line.' },
    p14: { type: 'text', to: firm.customer, body: `Hello ${first}, thanks for using Tidewater. If ${engineer} did a good job, a short review helps us a lot. One tap here.` },
    p15: { type: 'email', to: firm.customer, from: firm.name, subject: `Your ${d.model.name} is due its service`, body: [`Hello ${first},`, `It is nearly a year since we repaired your boiler, so its annual service is due by ${nice(pass.service)}. Pick a time that suits and it is booked.`, 'Tue 8 am to 10 am · Wed 12 pm to 2 pm · Sat 9 am to 11 am'], attach: [`Sends on ${nice(pass.reminder)}`] },
  }

  const plate = <Schematic hot={d.code.component} also={also} display={d.hasCode ? d.code.code : ''} title={`${d.make.name} ${d.model.name}, typical arrangement`} sheet={`TW-FF-${d.make.prefix}`} />

  return (
    <Stage firm={firm} steps={PLUMBER_STEPS} stage={stage} artefacts={artefacts} onRestart={restart} next={{ href: '/#payoff', label: 'Work out your numbers' }}>
      <div className="tw">
        <FirmHead firm={firm} right="Boiler fault finder" />

        {stage === 0 && (
          <>
            <div className="col"><h2>Which boiler is it?</h2>
              <p className="lede">Tell us the boiler and what it is showing. You will know what is wrong, what it costs and when it will be fixed before the kettle has boiled.</p></div>
            <div className="ctl"><span className="lbl">Make</span>
              <div className="seg" role="group" aria-label="Make">{MAKES.map((m) => <button key={m.key} type="button" aria-pressed={a.make === m.key} onClick={() => set({ make: m.key, model: m.models[0].key, code: firstCode(m, m.models[0].key) })}>{m.name}</button>)}</div>
            </div>
            <div className="ctl"><span className="lbl">Model, printed on the front panel</span>
              <div className="spec-list" role="group" aria-label="Model">
                {d.make.models.map((m) => (
                  <button key={m.key} type="button" aria-pressed={a.model === m.key} onClick={() => set({ model: m.key, code: firstCode(d.make, m.key) })}><strong>{m.name}</strong><span>{m.kw} kW</span><span>{m.kind}</span></button>
                ))}
              </div>
            </div>
            <label className="tw-age"><span className="top-line ctl"><span className="lbl">Roughly how old is it?</span></span>
              <span className="ctl"><span className="top-line"><span>Fitted about {adv.fitted}</span><b>{adv.age} {adv.age === 1 ? 'year' : 'years'} old</b></span></span>
              <input type="range" min={1} max={25} step={1} value={adv.age} onChange={(e) => set({ age: +e.target.value })} aria-label="Age of the boiler in years" />
              <span className="ticks" aria-hidden><span>{THIS_YEAR - 1}</span><span>{THIS_YEAR - 9}</span><span>{THIS_YEAR - 17}</span><span>{THIS_YEAR - 25}</span></span>
            </label>
            <div className="row"><button className="primary" type="button" onClick={() => setStage(1)}>This is my boiler</button><button className="quiet" type="button" onClick={onHome}>Back</button></div>
            <p className="small muted">Example catalogue with four makes. A live build carries every boiler the firm services.</p>
          </>
        )}

        {stage === 1 && (
          <>
            <div className="col"><p className="lbl">{d.make.name} {d.model.name} · fitted about {adv.fitted}</p><h2>What is the display showing?</h2></div>
            <Auto>Your boiler was matched in our catalogue. These are the codes this model can show.</Auto>
            <div className="code-grid" role="group" aria-label="Fault code">
              {codesFor(d.make, d.model.key).filter((c) => !c.code.startsWith('none')).map((c) => <button key={c.code} type="button" aria-pressed={a.code === c.code} onClick={() => set({ code: c.code })}><b>{c.code}</b><span>{c.shows}{c.sub ? <small>Cause code {c.sub}</small> : null}</span></button>)}
            </div>
            <div className="ctl"><span className="lbl">No code on the display</span>
              <div className="code-grid plain" role="group" aria-label="Symptom">
                {NO_CODE.map((c) => <button key={c.code} type="button" aria-pressed={a.code === c.code} onClick={() => set({ code: c.code })}><span>{c.shows}</span></button>)}
              </div>
            </div>
            <div><button className="primary" type="button" onClick={() => setStage(2)}>Tell me what is wrong</button></div>
          </>
        )}

        {stage === 2 && (
          <>
            {d.code.gas ? <GasLine /> : null}
            <div className="two">
              {plate}
              <div className="col">
                <div className="col" style={{ gap: 6 }}><p className="lbl">{d.make.name} {d.model.name} · {shown}{d.code.sub ? ` · cause code ${d.code.sub}` : ''}</p><h2>{d.code.shows}.</h2></div>
                <Auto>Code {shown} looked up for this model. Part {SYM_N[d.code.component]} on the drawing is where we would look first.</Auto>
                <div className="col" style={{ gap: 4 }}><p className="lbl">Most likely cause</p><p>{d.code.cause}</p></div>
                {fixed ? (
                  <div className="check-box">
                    <strong>Sorted. No visit and no charge.</strong>
                    <p className="small">If the code comes back within a week, something is wearing out. Come back here and we will pick up where you left off.</p>
                    <div><button type="button" onClick={restart}>Start again</button></div>
                  </div>
                ) : d.check ? (
                  <div className="check-box">
                    <strong>{d.check.title}</strong>
                    <ol>{d.check.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                    {d.checkKind === 'pressure' && (
                      <label className="ctl"><span className="top-line"><span>Pressure reading</span><b>{a.pressure.toFixed(1)} bar · {a.pressure < 1 ? 'too low' : a.pressure <= 2 ? 'normal' : 'too high'}</b></span>
                        <span className="scale" aria-hidden><i className="ok" /><i className="at" style={{ left: `${(a.pressure / 3) * 100}%` }} /></span>
                        <input type="range" min={0} max={3} step={0.1} value={a.pressure} onChange={(e) => set({ pressure: +e.target.value })} aria-label="Pressure reading in bar" /></label>
                    )}
                    <p className="small">{d.check.ask}</p>
                    <div className="row"><button type="button" onClick={() => setFixed(true)}>Yes, that fixed it</button><button className="primary" type="button" onClick={() => setStage(3)}>No, book an engineer</button></div>
                  </div>
                ) : (
                  <div className="check-box">
                    <strong>This one needs an engineer.</strong>
                    <p className="small">There is no safe check for you to do on this fault. We will find the part and a time now.</p>
                    <div><button className="primary" type="button" onClick={() => setStage(3)}>Find the part and a time</button></div>
                  </div>
                )}
                {!fixed && <label className="check"><input type="checkbox" checked={a.vulnerable} onChange={(e) => set({ vulnerable: e.target.checked })} />Someone at home is elderly, unwell or under five</label>}
              </div>
            </div>
          </>
        )}

        {stage >= 3 && (
          <>
            {d.code.gas && stage === 3 ? <GasLine /> : null}
            <div className="col" style={{ gap: 6 }}>
              <p className="lbl">{d.make.name} {d.model.name} · {shown} · {COMPONENT[d.code.component].toLowerCase()}</p>
              <h2>{stage === 3 ? `Fixed price: ${gbp(d.total)}` : stage === 4 ? 'You are booked.' : 'Fixed, and on the record.'}</h2>
            </div>
            <div className="two">
              {stage < 5 ? plate : (
                <section className="tw-pass" aria-label="Boiler passport">
                  <div className="in">
                    <header><strong>Boiler passport</strong><span className="lbl tn">{pass.number}</span></header>
                    <dl>
                      <div><dt className="lbl">Boiler</dt><dd>{pass.make} {pass.model}</dd></div>
                      <div><dt className="lbl">Output</dt><dd>{pass.output}</dd></div>
                      <div><dt className="lbl">Fitted</dt><dd>About {pass.fitted}</dd></div>
                      <div><dt className="lbl">Next service</dt><dd>{nice(pass.service)}</dd></div>
                    </dl>
                    <ol>
                      {pass.entries.map((e, i) => (
                        <li key={e.what} className={i === 2 ? 'now' : i > 2 ? 'next' : ''}><span className="d">{nice(e.date)}</span><span className="m" aria-hidden /><span><b>{e.what}</b><span>{e.detail}</span></span></li>
                      ))}
                    </ol>
                  </div>
                </section>
              )}
              <div className="col">
                {stage === 3 && <Auto>{d.order ? `Not in stock, so purchase order ${d.order} went to the supplier.` : `${d.stockName}: one reserved for you.`} The slots below start when the part will be there.</Auto>}
                {stage === 5 && <Auto>The job wrote itself onto your boiler&rsquo;s passport and set next year&rsquo;s service reminder for {nice(pass.reminder)}.</Auto>}
                <div className="part-card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
                    <div><p className="lbl">The part{d.provisional ? ', provisional' : ''}</p><p className="part-name">{d.part.name}</p></div>
                    <svg className="tw-svg" viewBox="-30 -30 60 60" width="56" height="56" aria-hidden>{SYMBOL[d.code.component]({ x: 0, y: 0, s: d.code.component === 'hex' ? 0.45 : d.code.component === 'vessel' ? 0.6 : 1.4 })}</svg>
                  </div>
                  <dl><dt>Catalogue ref</dt><dd>{d.part.ref}</dd><dt>Fits</dt><dd>{d.make.name} {d.model.name}</dd><dt>Stock</dt><dd><span className={`tag ${d.stock === 'order' ? 'watch' : 'ok'}`}><i className="dot" />{d.stockName}</span></dd>{d.order ? <><dt>Order</dt><dd>{d.order}</dd></> : null}</dl>
                  <p className="small">{d.stockLine}</p>
                </div>
                <table className="price"><tbody>
                  <tr><td>{d.part.name}</td><td className="n">{gbp(d.part.price)}</td></tr>
                  <tr><td>Labour, about {d.code.minutes} minutes</td><td className="n">{gbp(d.labour)}</td></tr>
                  <tr className="total"><td>Fixed price including VAT</td><td className="n">{gbp(d.total)}</td></tr>
                </tbody></table>
                {d.provisional && stage === 3 ? <p className="tw-prov">The engineer confirms the cause before fitting anything. If this part turns out not to be needed, you pay {gbp(d.labourOnly)} for the visit and nothing for the part.</p> : null}

                {stage === 3 && (
                  <section className="tw-sum" aria-label="Repair or replace">
                    <header><strong>Repair or replace?</strong><span className="lbl">A rule of thumb, shown in full</span></header>
                    <div className="calc">
                      <div><span className="lbl">Age</span><b>{adv.age} yrs</b></div><span className="op" aria-hidden>×</span>
                      <div><span className="lbl">This repair</span><b>{gbp(adv.repair)}</b></div><span className="op" aria-hidden>=</span>
                      <div><span className="lbl">Age × repair</span><b>{gbp(adv.sum)}</b></div>
                    </div>
                    <div className="bars">
                      <div className="bar"><span>Age × repair</span><i style={{ width: `${(adv.sum / big) * 100}%` }} /><span>{gbp(adv.sum)}</span></div>
                      <div className="bar new"><span>New boiler from</span><i style={{ width: `${(adv.replacement / big) * 100}%` }} /><span>{gbp(adv.replacement)}</span></div>
                    </div>
                    <div className="say">
                      <p><strong>{adv.line}</strong></p>
                      {adv.reasons.length ? <ul>{adv.reasons.map((r) => <li key={r}>{r}</li>)}</ul> : <p className="small muted">{gbp(adv.sum)} is under the {gbp(adv.replacement)} a new one starts at.</p>}
                      <label className="check"><input type="checkbox" checked={!!a.repeat} onChange={(e) => set({ repeat: e.target.checked })} />It has already had a repair in the last 12 months</label>
                      {adv.suggest ? <label className="check"><input type="checkbox" checked={quote} onChange={(e) => setQuote(e.target.checked)} />Ask the engineer to bring a replacement price. No charge, no obligation.</label> : null}
                      <p className="small muted">We repair it either way. The choice is yours.</p>
                    </div>
                  </section>
                )}

                {stage === 3 && (
                  <div className="done-card">
                    <p className="lbl">Slots, starting when the part arrives</p>
                    <div className="slots" role="group" aria-label="Slots">{d.slots.map((s) => <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)}>{s}</button>)}</div>
                    <button className="primary" type="button" disabled={!slot} onClick={() => setStage(4)}>Book at {gbp(d.total)}</button>
                  </div>
                )}
                {stage === 4 && <>
                  <Auto>{engineer} has the job card on their phone: your boiler, the code, the likely cause and the part.{wantsQuote ? ' It asks for a replacement price too.' : ''}</Auto>
                  <p>{when.replace('Priority: ', '')}, {nice(pass.visit)}. Leave the boiler off until then.</p>
                  <div><button className="primary" type="button" onClick={() => setStage(5)}>Fast forward to after the job</button></div></>}
                {stage === 5 && <><p>Fixed in one visit at the agreed price. The invoice, the review request and next year&rsquo;s service reminder go out on their own.</p><div><button type="button" onClick={restart}>Start again</button></div></>}
              </div>
            </div>
          </>
        )}

        <p className="tw-safe">Smell gas? Leave the house and call <b>0800 111 999</b>. {CASE_LINE} Example catalogue and prices for a fictional firm.</p>
      </div>
    </Stage>
  )
}

// The balloon number each component carries on Fig. 1, so the text can point at the drawing.
const SYM_N: Record<string, number> = { fan: 1, hex: 2, electrode: 3, vessel: 4, gasvalve: 5, ntc: 6, sensor: 7, condensate: 8, pump: 9, diverter: 10, prv: 11 }
