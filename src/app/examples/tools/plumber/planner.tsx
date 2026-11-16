'use client'
// Tool two: the heating planner. The customer builds their home room by room; code works out the heat loss, checks
// every radiator, sizes the boiler, prices three options from the price book and checks heat pump readiness.
// Every figure is an estimate from rules of thumb that a survey confirms, and the screen says so.
import { useMemo, useState } from 'react'
import { FIRMS, gbp, type Artefact, type Firm } from '@/lib/sandbox/journey'
import { HEATING_STEPS } from '@/lib/sandbox/steps/plumber'
import {
  AGE, CELL, FLOW, FLOW_ORDER, GLAZING, GRANT, HP_FLOWS, HP_PRICE, HW_START, LOFT, RAD, RAD_MM, RAD_ORDER, RATES_START, REGION, ROOM, SCOP, SITE_START, TEMPLATES, WALL, WINDOW,
  btu, fits, houseLoss, lpm, options, pipeFlow, radLabel, radOutput, readiness, route, running, schedule, sizeBoiler, start, withAge,
  type AgeKey, type FlowKey, type GlazKey, type HotWater, type House, type HpFlow, type LoftKey, type Option, type RadType, type Rates, type RegionKey, type Room, type RoomType, type Site, type TemplateKey, type WallKey, type WinKey,
} from '@/lib/sandbox/plumber-heat'
import Stage, { FirmHead } from '../stage'
import Iso from './iso'
import { BANDS, Editor, Thermal } from './plan'
import { Auto, Plate } from './symbols'

const firm: Firm = { ...FIRMS.plumber, url: 'tidewater.example/plan', line: 'Rooms in. Heat loss, radiator schedule, boiler size and a priced data sheet out, before anyone visits.',
  stages: ['Your home', 'Thermal plan', 'Radiators', 'Boiler and quote', 'Survey and install'] }
const first = firm.customer.split(' ')[0]
const surveyor = firm.owner
const SLOTS = ['Thu 19 Nov, 9 am', 'Fri 20 Nov, 1 pm', 'Mon 23 Nov, 10 am']
const DATE = '16 Nov 2026'
const n = (x: number) => x.toLocaleString('en-GB')
const keys = <T extends string>(o: Record<T, unknown>) => Object.keys(o) as T[]
const SPLIT: [keyof ReturnType<typeof houseLoss>['split'], string][] = [['walls', 'Outside walls'], ['air', 'Fresh air'], ['windows', 'Windows'], ['floor', 'Ground floor'], ['roof', 'Roof']]

function Pick<T extends string>({ label, value, list, onChange }: { label: string; value: T; list: [T, string][]; onChange: (v: T) => void }) {
  return <label className="tw-f"><span className="lbl">{label}</span><select value={value} onChange={(e) => onChange(e.target.value as T)}>{list.map(([k, name]) => <option key={k} value={k}>{name}</option>)}</select></label>
}
function Num({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step))
  return (
    <div className="tw-f"><span className="lbl">{label}</span>
      <div className="tw-num"><button type="button" aria-label={`Less: ${label}`} onClick={() => onChange(clamp(value - step))} disabled={value <= min}>−</button><output className="tn">{value.toLocaleString('en-GB')} {unit}</output><button type="button" aria-label={`More: ${label}`} onClick={() => onChange(clamp(value + step))} disabled={value >= max}>+</button></div>
    </div>
  )
}

export default function Planner({ onHome }: { onHome: () => void }) {
  const [stage, setStage] = useState(0)
  const [house, setHouse] = useState<House>(() => start('semi'))
  const [sel, setSel] = useState<string | null>('s1')
  const [floor, setFloor] = useState<0 | 1>(0)
  const [flow, setFlow] = useState<FlowKey>('f70')
  const [hw, setHw] = useState<HotWater>(HW_START)
  const [pick, setPick] = useState<Option['key']>('recommended')
  const [tab, setTab] = useState<'sheet' | 'pump' | 'pipes'>('sheet')
  const [hpFlow, setHpFlow] = useState<HpFlow>('f45')
  const [site, setSite] = useState<Site>(SITE_START)
  const [rates, setRates] = useState<Rates>(RATES_START)
  const [drop, setDrop] = useState<11 | 5>(11)
  const [slot, setSlot] = useState('')
  const restart = () => { onHome() }

  const loss = useMemo(() => houseLoss(house), [house])
  const sched = useMemo(() => schedule(house, flow), [house, flow])
  const size = useMemo(() => sizeBoiler(house, hw), [house, hw])
  const opts = useMemo(() => options(house, hw), [house, hw])
  const ready = useMemo(() => readiness(house, site, hpFlow), [house, site, hpFlow])
  const run = useMemo(() => running(rates, hpFlow), [rates, hpFlow])
  const pipes = useMemo(() => route(house, drop), [house, drop])
  const bigger = useMemo(() => { const a = route(house, 11).pipes, b = route(house, 5).pipes; return b.filter((p, i) => p.mm > a[i].mm).length }, [house])
  const chosen = opts.find((o) => o.key === pick) ?? opts[1]
  const room = house.rooms.find((r) => r.id === sel) ?? null
  const worst = [...loss.rooms].sort((a, b) => b.wm2 - a.wm2)[0]
  const biggest = Math.max(...Object.values(loss.split), 1)
  const mins = 40 + house.rooms.length * 5
  const when = slot || SLOTS[0]
  const sheetNo = `TW-HP-${String(1000 + ((loss.watts * 7) % 9000))}`
  const floors = ([0, 1] as const).filter((f) => house.rooms.some((r) => r.floor === f))
  const tpl = TEMPLATES[house.template]

  const patch = (id: string, p: Partial<Room>) => setHouse((h) => { const next = h.rooms.map((r) => (r.id === id ? { ...r, ...p } : r)); const r = next.find((x) => x.id === id)!; return fits(next, r) ? { ...h, rooms: next } : h })
  const pickTemplate = (t: TemplateKey) => { const h = start(t); setHouse(h); setSel(h.rooms[0].id); setFloor(0) }
  const changes = (o: Option) => schedule(house, o.flow).rows.filter((r) => r.suggest.how !== 'keep')

  const tb = (title: string, no = sheetNo): [string, string][] => [['Drawing', no], ['Title', title], ['Drawn by', 'Planner'], ['Date', DATE], ['Rev', 'A']]

  const artefacts: Record<string, Artefact | Artefact[]> = {
    h1: { type: 'doc', title: 'New enquiry on the board', rows: [['Customer', firm.customer], ['Wants', 'Heating plan and boiler quote'], ['House', `${tpl.name}, ${AGE[house.age].name.toLowerCase()}`], ['Source', 'Website, Plan my heating'], ['Owner', surveyor]] },
    h2: { type: 'text', to: firm.customer, body: `Hello ${first}, Tidewater here. Your heating plan is saved at tidewater.example/plan/jb-4172. Pick it up on any phone or laptop, and share it with whoever else needs a say.` },
    h3: { type: 'doc', title: 'Heat loss calculation', rows: [['Rooms', `${loss.rooms.length}, ${loss.area} m² of floor`], ['Outside design temperature', `${loss.to} degrees`], ['Fabric', `${WALL[house.wall].name}, ${GLAZING[house.glazing].name.toLowerCase()}, loft ${LOFT[house.loft].name.toLowerCase()}`], ['Total heat loss', `${n(loss.watts)} W (${loss.kw} kW)`], ['Per square metre', `${loss.wm2} W`], ['Rule of thumb for this age', `${loss.quick[0]} to ${loss.quick[1]} W per m²`], ['Hardest room', worst ? `${worst.name}, ${worst.wm2} W per m²` : 'None']], note: 'Fabric plus ventilation, room by room. An estimate that the survey confirms.' },
    h4: { type: 'doc', title: `Radiator schedule at ${FLOW[flow].name}`, rows: [...sched.rows.map((r) => [r.name, r.status === 'ok' ? `OK. ${n(r.have)} W for ${n(r.need)} W` : `${r.status === 'none' ? 'None fitted' : `Short by ${n(r.short)} W`}. Fit ${radLabel(r.suggest.rad, r.suggest.count)}`] as [string, string]), ['Summary', `${sched.ok} adequate, ${sched.change} to change`]] },
    h5: { type: 'doc', title: 'Boiler sizing', rows: [['Heat loss', `${loss.kw} kW`], ['Bathrooms', String(size.bathrooms)], ['People', String(hw.people)], ['Mains flow', `${hw.mains} litres a minute`], ['Recommendation', `${size.kw} kW ${size.kind} boiler${size.cylinder ? `, ${size.cylinder} litre cylinder` : ''}`], ...size.why.map((w, i) => [`Why ${i + 1}`, w] as [string, string])] },
    h6: [{ type: 'doc', title: 'Three options', rows: opts.map((o) => [o.name, `${gbp(o.total)} inc VAT, ${FLOW[o.flow].flow} degree flow, ${o.rads} radiators changed`] as [string, string]) },
      { type: 'quote', title: `${chosen.name}, from the price book`, lines: [...chosen.lines.map(([k, v]) => [k, gbp(v)] as [string, string]), ['VAT at 20%', gbp(chosen.vat)]], total: ['Total including VAT', gbp(chosen.total)], note: 'An estimate until the survey confirms it.' }],
    h7: { type: 'doc', title: 'Grant line', rows: [['Scheme', `${GRANT.scheme}, ${GRANT.where}`], ['Air source heat pump', gbp(GRANT.amount)], ['Checked on GOV.UK', GRANT.checked], ['Source', GRANT.source], ['Shown as', 'Indicative. Eligibility confirmed at survey.']], note: 'The amount is held in one place and re-checked on a schedule, so no quote goes out with a stale figure.' },
    h8: [{ type: 'email', to: firm.customer, from: firm.name, subject: `Your heating data sheet ${sheetNo}`, attach: [`Data sheet ${sheetNo} (PDF)`, 'Thermal plan (PDF)', 'Radiator schedule (PDF)'], body: [`Hello ${first},`, `Your plan is attached. Your home needs ${loss.kw} kW on the coldest day, and we would fit a ${size.kw} kW ${size.kind} boiler. The ${chosen.name.toLowerCase()} option comes to ${gbp(chosen.total)} including VAT.`, 'These are estimates from the rooms you entered. A short survey confirms them before any price is fixed.'] },
      { type: 'doc', title: `Survey pack for ${surveyor.split(' ')[0]}`, rows: [['Sheet', sheetNo], ['House', `${tpl.name}, ${loss.rooms.length} rooms, ${loss.area} m²`], ['Heat loss', `${loss.kw} kW`], ['Proposed', `${size.kw} kW ${size.kind}`], ['Customer leaning', chosen.name], ['Check on site', `Wall build, loft depth, ${chosen.rads} radiator positions, flue route, gas pipe size`]] }],
    h9: { type: 'doc', title: 'Survey slots offered', rows: [...SLOTS.map((s, i) => [`Slot ${i + 1}`, s] as [string, string]), ['Length', `${mins} minutes, from ${house.rooms.length} rooms`], ['Surveyor', surveyor]] },
    h10: [{ type: 'calendar', title: `Heating survey, ${firm.customer}`, when, who: surveyor, note: `${mins} minutes. Sheet ${sheetNo} attached.` },
      { type: 'text', to: firm.customer, body: `Hello ${first}, your survey is booked for ${when} with ${surveyor.split(' ')[0]}. It takes about ${mins} minutes. Please make sure we can reach the boiler, the loft hatch and the gas meter.` }],
    h11: { type: 'doc', title: 'Survey checklist, built from the plan', rows: [['Measure', `${loss.rooms.length} rooms against the plan`], ['Confirm', `${WALL[house.wall].name.toLowerCase()} walls, loft insulation ${LOFT[house.loft].name.toLowerCase()}`], ['Radiators', `${chosen.rads} to change: positions and pipe centres`], ['Boiler', 'Flue route, condensate run, gas pipe size'], ['Water', `Mains flow and pressure (customer measured ${hw.mains} litres a minute)`]] },
    h12: [{ type: 'text', to: firm.customer, body: `Hello ${first}, your fixed quote ${sheetNo} is ready after the survey. Any questions, reply here and ${surveyor.split(' ')[0]} will call.` },
      { type: 'email', to: firm.customer, from: firm.name, subject: 'Your quote is held for 30 days', body: [`Hello ${first},`, 'No rush. Your price and the plan behind it are held for 30 days. One tap accepts it and you can pick your fitting dates straight away.'] }],
    h13: [{ type: 'calendar', title: `Install, ${chosen.name.toLowerCase()} option`, when: `Mon 7 Dec, 8 am`, who: 'Two engineers', note: `${chosen.rads > 3 ? 'Two days' : 'One day'}. Parts delivered the Friday before.` },
      { type: 'doc', title: 'Materials order, from the design', rows: [['Boiler', `${size.kw} kW ${size.kind}`], ...(size.cylinder ? [['Cylinder', `${size.cylinder} litre unvented`]] as [string, string][] : []), ...changes(chosen).map((r) => [r.name, radLabel(r.suggest.rad, r.suggest.count)] as [string, string]), ['Also', 'Magnetic filter, inhibitor, flue kit, controls'], ['First service', 'Set for 12 months after fitting']] }],
  }

  return (
    <Stage firm={firm} steps={HEATING_STEPS} stage={stage} artefacts={artefacts} onRestart={restart} next={{ href: '/#payoff', label: 'Work out your numbers' }}>
      <div className="tw">
        <FirmHead firm={firm} right="Heating planner" />

        {stage === 0 && (
          <>
            <div className="col"><h2>Plan your heating before anyone visits.</h2>
              <p className="lede">Start from a house like yours, then make it yours. You get the sums an engineer would do, drawn so you can check them.</p></div>
            <div className="ctl"><span className="lbl">Start from</span>
              <div className="tw-tpl" role="group" aria-label="House type">
                {keys(TEMPLATES).map((t) => { const T = TEMPLATES[t], h = start(t), L = houseLoss(h); return (
                  <button key={t} type="button" aria-pressed={house.template === t} onClick={() => pickTemplate(t)}>
                    <Mini house={h} />
                    <strong>{T.name}</strong><span>{T.line}</span><span className="tn">{h.rooms.length} rooms · {L.area} m²</span>
                  </button>
                ) })}
              </div>
            </div>
            <div className="ctl"><span className="lbl">When was it built?</span>
              <div className="seg" role="group" aria-label="Age">{keys(AGE).map((k) => <button key={k} type="button" aria-pressed={house.age === k} onClick={() => setHouse((h) => withAge(h, k))}>{AGE[k].name}</button>)}</div>
              <p className="small muted">A house of this age usually has {WALL[house.wall].name.toLowerCase()} walls and {GLAZING[house.glazing].name.toLowerCase()}. You can correct that on the next screen.</p>
            </div>
            <div className="row"><button className="primary" type="button" onClick={() => setStage(1)}>Start my plan</button><button className="quiet" type="button" onClick={onHome}>Back</button></div>
          </>
        )}

        {stage === 1 && (
          <>
            <div className="col"><h2>Build your home.</h2>
              <p className="lede">Drag rooms to move them, drag the orange corner to resize, and add rooms from the bar. Each square is half a metre.</p></div>
            <Auto>Your enquiry is on our board and a link to this plan is on its way to your phone.</Auto>
            <div className="two wide-left">
              <Editor house={house} onRooms={(rooms) => setHouse((h) => ({ ...h, rooms }))} sel={sel} onSel={setSel} floor={floor} onFloor={setFloor} />
              <div className="col">
                {room ? (
                  <section className="tw-panel" aria-label="Selected room">
                    <header><span className="lbl">Selected room</span><button className="quiet" type="button" onClick={() => { setHouse((h) => ({ ...h, rooms: h.rooms.filter((r) => r.id !== room.id) })); setSel(null) }}>Remove</button></header>
                    <label className="tw-f"><span className="lbl">Name</span><input type="text" value={room.name} maxLength={24} onChange={(e) => patch(room.id, { name: e.target.value })} /></label>
                    <div className="grid2">
                      <Pick label="Used as" value={room.type} list={keys(ROOM).map((k) => [k, `${ROOM[k].name}, ${ROOM[k].ti}°`] as [RoomType, string])} onChange={(v) => patch(room.id, { type: v })} />
                      <Pick label="Windows" value={room.win} list={keys(WINDOW).map((k) => [k, WINDOW[k].name] as [WinKey, string])} onChange={(v) => patch(room.id, { win: v })} />
                      <Num label="Width" value={room.w * CELL} min={1} max={10} step={0.5} unit="m" onChange={(v) => patch(room.id, { w: v / CELL })} />
                      <Num label="Depth" value={room.h * CELL} min={1} max={12} step={0.5} unit="m" onChange={(v) => patch(room.id, { h: v / CELL })} />
                      <Pick label="Walls here" value={(room.wall ?? 'house') as WallKey | 'house'} list={[['house', 'As the house'], ...keys(WALL).map((k) => [k, WALL[k].name] as [WallKey, string])]} onChange={(v) => patch(room.id, { wall: v === 'house' ? undefined : v })} />
                      <Pick label="Radiator now" value={(room.rad?.type ?? 'none') as RadType | 'none'} list={[['none', 'None'], ...RAD_ORDER.map((k) => [k, `${RAD[k].short} ${RAD[k].name.split(',')[0].toLowerCase()}`] as [RadType, string])]} onChange={(v) => patch(room.id, { rad: v === 'none' ? null : { type: v, mm: room.rad?.mm ?? 800 } })} />
                    </div>
                    {room.rad ? <Num label="Radiator length" value={room.rad.mm} min={RAD_MM.min} max={RAD_MM.max} step={RAD_MM.step} unit="mm" onChange={(v) => patch(room.id, { rad: { type: room.rad!.type, mm: v } })} /> : null}
                    <p className="small muted">Outside wall: {loss.rooms.find((r) => r.id === room.id)?.extLen} m, worked out from the plan.</p>
                  </section>
                ) : <p className="tw-panel empty small">Tap a room to change its size, windows and radiator.</p>}
                <section className="tw-panel" aria-label="The house">
                  <header><span className="lbl">The house</span><span className="lbl tn">{house.rooms.length} rooms · {loss.area} m²</span></header>
                  <div className="grid2">
                    <Pick label="Built" value={house.age} list={keys(AGE).map((k) => [k, AGE[k].name] as [AgeKey, string])} onChange={(v) => setHouse((h) => withAge(h, v))} />
                    <Pick label="Region" value={house.region} list={keys(REGION).map((k) => [k, REGION[k].name] as [RegionKey, string])} onChange={(v) => setHouse((h) => ({ ...h, region: v }))} />
                    <Pick label="Walls" value={house.wall} list={keys(WALL).map((k) => [k, WALL[k].name] as [WallKey, string])} onChange={(v) => setHouse((h) => ({ ...h, wall: v }))} />
                    <Pick label="Glazing" value={house.glazing} list={keys(GLAZING).map((k) => [k, GLAZING[k].name] as [GlazKey, string])} onChange={(v) => setHouse((h) => ({ ...h, glazing: v }))} />
                    <Pick label="Loft insulation" value={house.loft} list={keys(LOFT).map((k) => [k, LOFT[k].name] as [LoftKey, string])} onChange={(v) => setHouse((h) => ({ ...h, loft: v }))} />
                  </div>
                  <div className="row">
                    <label className="check"><input type="checkbox" checked={house.party.left} onChange={(e) => setHouse((h) => ({ ...h, party: { ...h.party, left: e.target.checked } }))} />Neighbour on the left</label>
                    <label className="check"><input type="checkbox" checked={house.party.right} onChange={(e) => setHouse((h) => ({ ...h, party: { ...h.party, right: e.target.checked } }))} />Neighbour on the right</label>
                  </div>
                </section>
              </div>
            </div>
            <div className="foot-row"><span className="small muted">Close is good enough. The survey measures everything again.</span><button className="primary" type="button" disabled={!house.rooms.length} onClick={() => setStage(2)}>Work out my heat loss</button></div>
          </>
        )}

        {stage === 2 && (
          <>
            <div className="col" style={{ gap: 6 }}><p className="lbl">{tpl.name} · {AGE[house.age].name.toLowerCase()} · {REGION[house.region].name}</p>
              <h2>Your home needs {loss.kw} kW on the coldest day.</h2></div>
            <Auto>Heat loss worked out for {loss.rooms.length} rooms at {loss.to} degrees outside: walls, windows, roof, floor and fresh air, one room at a time.</Auto>
            <Plate fig="Fig. 2" title="Thermal plan" sheet="Scale 1:100 · watts per square metre"
              under={<div className="tw-legend ramp"><span>Heat loss per square metre</span>{BANDS.map(([, c, name]) => <span key={name}><i style={{ background: c }} />{name}</span>)}</div>}
              tb={tb(`Thermal plan, ${tpl.name.toLowerCase()}`)}>
              <div className={`tw-floors n${floors.length}`}>{floors.map((f) => <Thermal key={f} house={house} loss={loss} floor={f} mode="heat" />)}</div>
            </Plate>
            <div className="two">
              <div className="col">
                <section className="tw-panel" aria-label="Where the heat goes">
                  <header><span className="lbl">Where the heat goes</span><span className="lbl tn">{n(loss.watts)} W · {n(btu(loss.watts))} BTU/h</span></header>
                  <div className="tw-bars">{SPLIT.map(([k, name]) => <div key={k}><span>{name}</span><i style={{ width: `${(loss.split[k] / biggest) * 100}%` }} /><span className="tn">{n(loss.split[k])} W</span><span className="tn pc">{Math.round((loss.split[k] / Math.max(1, loss.watts)) * 100)}%</span></div>)}</div>
                  <p className="small muted">Your plan comes to {loss.wm2} W per square metre. The rule of thumb installers use for a house of this age is {loss.quick[0]} to {loss.quick[1]}, which would give {(loss.quickWatts[0] / 1000).toFixed(1)} to {(loss.quickWatts[1] / 1000).toFixed(1)} kW.</p>
                </section>
                <section className="tw-panel" aria-label="Try an upgrade">
                  <header><span className="lbl">Try an upgrade and watch the plan redraw</span></header>
                  <div className="grid2">
                    <Pick label="Walls" value={house.wall} list={keys(WALL).map((k) => [k, WALL[k].name] as [WallKey, string])} onChange={(v) => setHouse((h) => ({ ...h, wall: v }))} />
                    <Pick label="Glazing" value={house.glazing} list={keys(GLAZING).map((k) => [k, GLAZING[k].name] as [GlazKey, string])} onChange={(v) => setHouse((h) => ({ ...h, glazing: v }))} />
                    <Pick label="Loft insulation" value={house.loft} list={keys(LOFT).map((k) => [k, LOFT[k].name] as [LoftKey, string])} onChange={(v) => setHouse((h) => ({ ...h, loft: v }))} />
                  </div>
                </section>
              </div>
              <table className="tw-table"><thead><tr><th>Room</th><th className="n">Floor area</th><th className="n">Outside wall</th><th className="n">Heat loss</th><th className="n">W/m²</th></tr></thead>
                <tbody>{loss.rooms.map((r) => <tr key={r.id}><td>{r.name}</td><td className="n">{r.area} m²</td><td className="n">{r.extLen} m</td><td className="n"><b>{n(r.watts)} W</b></td><td className="n">{r.wm2}</td></tr>)}
                  <tr className="total"><td>Whole house</td><td className="n">{loss.area} m²</td><td className="n" /><td className="n"><b>{n(loss.watts)} W</b></td><td className="n">{loss.wm2}</td></tr></tbody></table>
            </div>
            <div className="foot-row"><button className="quiet" type="button" onClick={() => setStage(1)}>Back to the plan</button><span className="small muted">An estimate from typical values for a house of this age. The survey confirms it.</span><button className="primary" type="button" onClick={() => setStage(3)}>Check my radiators</button></div>
          </>
        )}

        {stage === 3 && (
          <>
            <div className="col" style={{ gap: 6 }}><p className="lbl">Radiator schedule · {n(loss.watts)} W to deliver</p>
              <h2>{sched.change === 0 ? 'Every radiator is big enough.' : `${sched.change} of ${sched.rows.length} radiators ${sched.change === 1 ? 'is' : 'are'} too small at ${FLOW[flow].flow} degrees.`}</h2></div>
            <div className="ctl"><span className="lbl">Water temperature leaving the boiler, flow / return. Cooler water is cheaper to make but radiators give less.</span>
              <div className="tw-flow" role="group" aria-label="Flow temperature">
                {FLOW_ORDER.map((k) => <button key={k} type="button" aria-pressed={flow === k} onClick={() => setFlow(k)}><b className="tn">{FLOW[k].name}</b><span>{FLOW[k].note}</span><span className="tn">Output × {radOutput({ type: 'K1', mm: 1000 }, k) / 1000}</span></button>)}
              </div>
            </div>
            <Auto>Every radiator was checked against its room at {FLOW[flow].name}, and a size suggested where it falls short.</Auto>
            <div className="col">
              <Plate fig="Fig. 3" title="Radiator plan" sheet={`Flow ${FLOW[flow].name} °C`} tb={tb('Radiator plan and schedule')}>
                <div className={`tw-floors n${floors.length}`}>{floors.map((f) => <Thermal key={f} house={house} loss={loss} floor={f} mode="rads" sched={sched} />)}</div>
              </Plate>
              <table className="tw-table sched"><thead><tr><th>Room</th><th className="n">Needs</th><th>Has now</th><th className="n">Gives</th><th>Suggested</th></tr></thead>
                <tbody>{sched.rows.map((r) => (
                  <tr key={r.id} className={r.status}>
                    <td>{r.name}</td><td className="n">{n(r.need)} W</td>
                    <td>{r.rad ? radLabel(r.rad) : 'None'}</td>
                    <td className="n">{r.rad ? <><b>{n(r.have)} W</b><span className="meter" aria-hidden><i style={{ width: `${Math.min(100, r.pct)}%` }} /></span></> : ''}</td>
                    <td>{r.suggest.how === 'keep' ? <span className="v ok">Keep it</span> : <><span className="v no">{radLabel(r.suggest.rad, r.suggest.count)}</span><small>{r.suggest.line}, {n(r.suggest.output)} W</small></>}</td>
                  </tr>
                ))}</tbody></table>
            </div>
            <p className="small muted">Radiator outputs are typical figures for 600 mm high panels, corrected for water temperature with the standard rule: output × (temperature gap ÷ 50) to the power 1.3.</p>
            <div className="foot-row"><button className="quiet" type="button" onClick={() => setStage(2)}>Back</button><button className="primary" type="button" onClick={() => setStage(4)}>Size the boiler and price it</button></div>
          </>
        )}

        {stage === 4 && (
          <>
            <div className="col" style={{ gap: 6 }}><p className="lbl">Sheet {sheetNo} · sent to you and to {surveyor.split(' ')[0]}</p>
              <h2>A {size.kw} kW {size.kind} boiler, not a guess.</h2></div>
            <Auto>Boiler sized from your heat loss and hot water, three options priced from our price book, the grant line checked, and the data sheet sent.</Auto>
            <div className="seg tw-tabs" role="group" aria-label="View">
              {([['sheet', 'Data sheet and prices'], ['pump', 'Heat pump ready?'], ['pipes', 'Pipework']] as const).map(([k, name]) => <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>{name}</button>)}
            </div>

            {tab === 'sheet' && (
              <>
                <Plate fig="Sheet 1" title="Heating system data sheet" sheet="Estimate · survey confirms" tb={tb(`Data sheet, ${firm.customer}`)} className="tw-sheet">
                  <div className="tw-spec">
                    <section><h3>Design</h3><dl>
                      <dt>Design heat loss</dt><dd><b>{loss.kw} kW</b> · {n(btu(loss.watts))} BTU/h</dd>
                      <dt>Outside design temperature</dt><dd>{loss.to} °C</dd>
                      <dt>Room temperatures</dt><dd>Living 21, bedrooms 18, bathroom 22 °C</dd>
                      <dt>Heated floor area</dt><dd>{loss.area} m² · {loss.wm2} W/m²</dd>
                      <dt>Radiators</dt><dd>{loss.rooms.length} rooms, {chosen.rads} changed in this option</dd>
                      <dt>Flow and return</dt><dd>{FLOW[chosen.flow].name} °C</dd>
                    </dl></section>
                    <section><h3>Hot water</h3>
                      <div className="grid2 in">
                        <Num label="People at home" value={hw.people} min={1} max={8} step={1} unit="" onChange={(v) => setHw((h) => ({ ...h, people: v }))} />
                        <Num label="Mains flow, bucket test" value={hw.mains} min={6} max={25} step={1} unit="L/min" onChange={(v) => setHw((h) => ({ ...h, mains: v }))} />
                      </div>
                      <p className="small muted">Bucket test: run the kitchen cold tap into a bucket for 10 seconds and multiply the litres by six.</p>
                      {size.bathrooms >= 2 ? <label className="check"><input type="checkbox" checked={hw.together} onChange={(e) => setHw((h) => ({ ...h, together: e.target.checked }))} />Two showers or baths are often run at the same time</label> : null}
                      <dl>
                        <dt>Bathrooms on the plan</dt><dd>{size.bathrooms}</dd>
                        <dt>Boiler</dt><dd><b>{size.kw} kW {size.kind}</b></dd>
                        {size.tap ? <><dt>Hot water at the tap</dt><dd>{size.tap} L/min at a 35 °C rise</dd></> : null}
                        {size.cylinder ? <><dt>Cylinder</dt><dd>{size.cylinder} litres, reheats in about {size.reheat} minutes</dd></> : null}
                        <dt>Primary pipework</dt><dd>{route(house, 11).primary} mm copper</dd>
                      </dl>
                    </section>
                  </div>
                  <ol className="tw-why">{size.why.map((w) => <li key={w}>{w}</li>)}</ol>
                  <div className="tw-opts" role="group" aria-label="Options">
                    {opts.map((o, i) => (
                      <button key={o.key} type="button" aria-pressed={pick === o.key} onClick={() => setPick(o.key)}>
                        <span className="lbl">Option {'ABC'[i]}{pick === o.key ? ' · selected' : ''}</span>
                        <strong>{o.name}</strong>
                        <span className="ln">{o.line}</span>
                        <span className="rows">{o.lines.map(([k, v]) => <span key={k}><span>{k}</span><span className="tn">{gbp(v)}</span></span>)}<span><span>VAT at 20%</span><span className="tn">{gbp(o.vat)}</span></span></span>
                        <span className="tot"><span>Total including VAT</span><b className="tn">{gbp(o.total)}</b></span>
                        <span className="lbl">{o.warranty} year warranty · flow {FLOW[o.flow].flow} °C</span>
                      </button>
                    ))}
                  </div>
                </Plate>
                <p className="small muted">Prices come from an example price book for a fictional firm. Sizing follows common installer rules of thumb. Nothing here is fixed until the survey.</p>
              </>
            )}

            {tab === 'pump' && (
              <div className="two">
                <div className="col">
                  <section className={`tw-verdict ${ready.verdict}`} aria-label="Heat pump readiness">
                    <span className="lbl">Heat pump readiness</span>
                    <strong>{ready.line}</strong>
                    <p className="small">{ready.verdict === 'notyet' ? 'A heat pump has an outdoor unit about the size of a washing machine. Without a place for it, a new boiler set up for low temperature keeps the option open.' : ready.upgrades.length ? `What it needs: ${ready.upgrades.join(', ')}.` : 'Your radiators already cover every room at this water temperature.'}</p>
                    <dl><dt>Heat pump size</dt><dd>{ready.capacity} kW, your design heat loss</dd><dt>Primary pipework</dt><dd>{route(house, 5).primary === route(house, 11).primary ? `${route(house, 5).primary} mm, the same as for a boiler` : `${route(house, 5).primary} mm, up from ${route(house, 11).primary} mm`}</dd></dl>
                  </section>
                  <div className="ctl"><span className="lbl">Water temperature the heat pump would run at</span>
                    <div className="seg" role="group" aria-label="Heat pump flow temperature">{HP_FLOWS.map((k) => <button key={k} type="button" aria-pressed={hpFlow === k} onClick={() => setHpFlow(k)}>{FLOW[k].flow} °C</button>)}</div></div>
                  <div className="row">
                    <label className="check"><input type="checkbox" checked={site.outdoor} onChange={(e) => setSite((s) => ({ ...s, outdoor: e.target.checked }))} />There is outdoor space for the unit</label>
                    <label className="check"><input type="checkbox" checked={site.cylinder} onChange={(e) => setSite((s) => ({ ...s, cylinder: e.target.checked }))} />There is room for a hot water cylinder</label>
                  </div>
                  <table className="tw-table sched"><thead><tr><th>Room</th><th className="n">Needs</th><th>At {FLOW[hpFlow].flow} °C</th></tr></thead>
                    <tbody>{ready.schedule.rows.map((r) => <tr key={r.id} className={r.status}><td>{r.name}</td><td className="n">{n(r.need)} W</td><td>{r.suggest.how === 'keep' ? <span className="v ok">Keep it</span> : <><span className="v no">{radLabel(r.suggest.rad, r.suggest.count)}</span><small>{r.rad ? `In place of ${radLabel(r.rad)}` : 'New'}</small></>}</td></tr>)}</tbody></table>
                </div>
                <div className="col">
                  <section className="tw-grant" aria-label="Grant">
                    <span className="lbl">{GRANT.scheme} · {GRANT.where}</span>
                    <strong className="tn">{gbp(GRANT.amount)}</strong>
                    <p>towards an air source heat pump. Your installer applies for you and takes it off the price.</p>
                    <p className="small muted">Amount checked on GOV.UK on {GRANT.checked}. Indicative only: eligibility is confirmed at survey.</p>
                    <dl><dt>Typical installed price</dt><dd>{gbp(HP_PRICE[0])} to {gbp(HP_PRICE[1])}</dd><dt>Less the grant</dt><dd>{gbp(GRANT.amount)}</dd>{ready.schedule.cost ? <><dt>Radiator changes, from our price book</dt><dd>{gbp(ready.schedule.cost)}</dd></> : null}<dt>Guide price to you</dt><dd><b>{gbp(ready.after[0])} to {gbp(ready.after[1])}</b></dd></dl>
                    <p className="small muted">The installed range is a typical figure from published guides, not a quote.</p>
                  </section>
                  <section className="tw-panel" aria-label="Running cost">
                    <header><span className="lbl">Running cost, the sum in full</span></header>
                    <div className="grid2">
                      <Num label="Gas you use a year" value={rates.gasKwh} min={4000} max={30000} step={500} unit="kWh" onChange={(v) => setRates((r) => ({ ...r, gasKwh: v }))} />
                      <Num label="Gas price" value={rates.gasP} min={3} max={15} step={0.5} unit="p/kWh" onChange={(v) => setRates((r) => ({ ...r, gasP: v }))} />
                      <Num label="Electricity price" value={rates.elecP} min={10} max={45} step={1} unit="p/kWh" onChange={(v) => setRates((r) => ({ ...r, elecP: v }))} />
                    </div>
                    <ol className="tw-sums">
                      <li><span>Heat your home uses</span><span className="tn">{n(rates.gasKwh)} kWh gas × 0.85 boiler efficiency = <b>{n(run.heat)} kWh</b></span></li>
                      <li><span>Gas boiler</span><span className="tn">{n(rates.gasKwh)} kWh × {rates.gasP}p = <b>{gbp(run.gas)} a year</b></span></li>
                      <li><span>Heat pump at {FLOW[hpFlow].flow} °C</span><span className="tn">{n(run.heat)} ÷ {SCOP[hpFlow]} efficiency = {n(run.kwh)} kWh × {rates.elecP}p = <b>{gbp(run.pump)} a year</b></span></li>
                      <li className="res"><span>Difference</span><span className="tn"><b>{run.diff === 0 ? 'The same' : `${gbp(Math.abs(run.diff))} a year ${run.diff < 0 ? 'less' : 'more'} with the heat pump`}</b></span></li>
                    </ol>
                    <p className="small muted">Assumptions: example unit prices, so put in the ones from your bill. Boiler efficiency 85%. Heat pump efficiency {SCOP[hpFlow]} at {FLOW[hpFlow].flow} °C is a typical figure and varies by product. Standing charges are left out.</p>
                  </section>
                </div>
              </div>
            )}

            {tab === 'pipes' && (
              <div className="two wide-left">
                <Plate night fig="Fig. 5" title="Pipework, isometric" sheet={`${drop === 11 ? 'Boiler' : 'Heat pump'} · ${drop} °C drop`} tb={tb('Two-pipe layout, proposed')}
                  under={<div className="tw-legend"><span><svg viewBox="0 0 30 8" aria-hidden><path d="M1 4 H29" className="f" /></svg>Flow</span><span><svg viewBox="0 0 30 8" aria-hidden><path d="M1 4 H29" className="r" /></svg>Return</span><span>Thick line: 22 mm or larger</span><span>Amber radiator: longest run</span></div>}>
                  <Iso house={house} drop={drop} />
                </Plate>
                <div className="col">
                  <div className="ctl"><span className="lbl">Size the pipes for</span>
                    <div className="seg" role="group" aria-label="Heat source">{([[11, 'A boiler'], [5, 'A heat pump']] as const).map(([k, name]) => <button key={k} type="button" aria-pressed={drop === k} onClick={() => setDrop(k)}>{name}</button>)}</div></div>
                  <section className="tw-panel" aria-label="Pipework figures">
                    <header><span className="lbl">From the plan</span></header>
                    <dl className="tw-dl">
                      <dt>Primary pipe</dt><dd><b>{pipes.primary} mm</b>, carrying {(pipes.total / 1000).toFixed(1)} kW</dd>
                      <dt>Water moved</dt><dd>{pipeFlow(pipes.total / 1000, drop)} litres a second</dd>
                      <dt>Longest run</dt><dd>{pipes.index?.name}, {pipes.index?.run} m from the boiler</dd>
                      <dt>Pipe to allow</dt><dd>About {'metres' in pipes ? pipes.metres : 0} m, flow and return</dd>
                      <dt>Radiators</dt><dd>{pipes.emitters.length}, balanced from the longest run back</dd>
                    </dl>
                    <p className="small muted">{drop === 5 ? `A heat pump moves the same heat with a smaller temperature drop, so more water has to flow. On this plan ${bigger} of ${pipes.pipes.length} pipe runs go up a size.` : 'Switch to a heat pump to see which pipes would need to be bigger.'}</p>
                  </section>
                  <p className="small muted">A proposed route for pricing. The surveyor sets the real one once floors and joists are seen. Pipe sizes follow a trade rule of thumb.</p>
                </div>
              </div>
            )}

            <section className="tw-book" aria-label="Book a survey">
              <div className="col" style={{ gap: 4 }}><h3>Book the survey that confirms it</h3><p className="small muted">{mins} minutes with {surveyor}. Free, and the plan above goes with them.</p></div>
              <div className="slots" role="group" aria-label="Survey slots">{SLOTS.map((s) => <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)}>{s}</button>)}</div>
              <div className="row"><button className="quiet" type="button" onClick={() => setStage(3)}>Back</button><button className="primary" type="button" disabled={!slot} onClick={() => setStage(5)}>Book my survey</button></div>
            </section>
          </>
        )}

        {stage === 5 && (
          <>
            <div className="col" style={{ gap: 6 }}><p className="lbl">Sheet {sheetNo} · {chosen.name} · {gbp(chosen.total)} inc VAT</p><h2>Survey booked for {when}.</h2></div>
            <Auto>The survey is in {surveyor.split(' ')[0]}&rsquo;s diary with your data sheet attached. When you accept, the fitting days and the parts order book themselves.</Auto>
            <div className="two">
              <Plate fig="Sheet 2" title="Your plan at a glance" sheet="Estimate · survey confirms" tb={tb(`Summary, ${firm.customer}`)}>
                <dl className="tw-glance">
                  <div><dt className="lbl">Heat loss</dt><dd>{loss.kw} kW</dd></div>
                  <div><dt className="lbl">Boiler</dt><dd>{size.kw} kW {size.kind}</dd></div>
                  <div><dt className="lbl">Radiators to change</dt><dd>{chosen.rads} of {loss.rooms.length}</dd></div>
                  <div><dt className="lbl">Flow temperature</dt><dd>{FLOW[chosen.flow].flow} °C</dd></div>
                  <div><dt className="lbl">Option</dt><dd>{chosen.name}</dd></div>
                  <div><dt className="lbl">Estimate</dt><dd>{gbp(chosen.total)}</dd></div>
                </dl>
              </Plate>
              <ol className="tw-next">
                <li><b>{when}</b><span>{surveyor.split(' ')[0]} measures up and confirms the plan. About {mins} minutes.</span></li>
                <li><b>Same day</b><span>Your fixed quote arrives, with anything the survey changed marked on the data sheet.</span></li>
                <li><b>When you accept</b><span>You pick fitting dates. Parts are ordered from the design.</span></li>
                <li><b>A year on</b><span>The first service offers its own slots.</span></li>
              </ol>
            </div>
            <div><button type="button" onClick={restart}>Start again</button></div>
          </>
        )}

        <p className="tw-safe">Smell gas? Leave the house and call <b>0800 111 999</b>. This planner gives guidance and estimates, not a design to build from. Example figures for a fictional firm.</p>
      </div>
    </Stage>
  )
}

/** A thumbnail of a house template: both floors as outlines. */
function Mini({ house }: { house: House }) {
  const U = 4
  return (
    <svg className="tw-svg mini" viewBox="0 0 196 96" aria-hidden>
      {[0, 1].map((f) => <g key={f} transform={`translate(${6 + f * 98} 4)`}>{house.rooms.filter((r) => r.floor === f).map((r) => <rect key={r.id} x={(r.x - 2) * U} y={(r.y - 1) * U} width={r.w * U} height={r.h * U} className="fill" />)}</g>)}
    </svg>
  )
}
