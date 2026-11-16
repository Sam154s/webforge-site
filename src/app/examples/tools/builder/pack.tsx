'use client'
// The job pack: nine numbered sheets with title blocks, every one worked out from the customer's plan.
import { useId, useState, type ReactNode } from 'react'
import { gbp } from '@/lib/sandbox/journey'
import { JOBS, SLOT, WALLS, WALL_NAME, grouped, mat, slotsFor, takeoff, check, type Finish, type Option, type Pin, type Scene, type Slot, type Wall } from '@/lib/sandbox/builder'
import { REGS_LINE, SHEETS, STATUS, billOfQuantities, busiestWall, elevation, jobNo, payments, programme, regs, scope } from '@/lib/sandbox/builder-pack'
import { ElecZones, ElevArt, INK, MatPattern, PdGauge, PlanArt, RefTag, SANG, fillOf, fit, mix, useWidth } from './draw'
import { Auto } from './planner'
import { Photo, PinList } from '../photo'
import Axo from './axo'

const fmt = (v: number) => Math.round(v).toLocaleString('en-GB')
const r1 = (n: number) => Math.round(n * 10) / 10
const TIER_WORD = ['Trade range', 'Mid range', 'Top range']

function Sheet({ no, title, scale, job, index, note, children }: { no: string; title: string; scale: string; job: Scene['job']; index: number; note?: ReactNode; children: ReactNode }) {
  return (
    <article className="bb-sheet" aria-label={`Sheet ${no}, ${title}`}>
      <div className="bb-sheetbody">{children}</div>
      {note ? <div className="bb-sheetnote">{note}</div> : null}
      <footer className="bb-tb">
        <div className="firm"><span>Builder</span><b>Bramley Build Co.</b></div>
        <div><span>Project</span><b>{JOBS[job].name}, Okafor</b></div>
        <div><span>Drawing</span><b>{title}</b></div>
        <div><span>Scale</span><b>{scale}</b></div>
        <div><span>Job</span><b>{jobNo(job)}</b></div>
        <div className="no"><span>Sheet {index + 1} of {SHEETS.length}</span><b>{no}</b></div>
      </footer>
    </article>
  )
}

// ---------------------------------------------------------------- A-101 plan
function PlanSheet({ s }: { s: Scene }) {
  const uid = useId().replace(/:/g, ''), [ref, px] = useWidth<HTMLDivElement>(640)
  const v = fit(s, px, px < 430 ? 44 : 64)
  return (
    <>
      <div ref={ref} className="bb-drawing">
        <svg className="bb-svg" viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} style={{ ['--u' as string]: v.u }} role="img" aria-label={`Floor plan, ${fmt(s.length)} by ${fmt(s.width)} mm, with ${s.items.length} items, dimensions and finish tags`}>
          <PlanArt s={s} u={v.u} uid={uid} tags draw>
            {s.job === 'bathroom' ? <g className="bb-drawn"><g className="bb-lay" style={{ ['--i' as string]: 14 }}><ElecZones s={s} u={v.u} /></g></g> : null}
            {s.job === 'extension' ? <g className="bb-drawn"><g className="bb-lay" style={{ ['--i' as string]: 14 }}><PdGauge s={s} u={v.u} /></g></g> : null}
          </PlanArt>
        </svg>
      </div>
      <div className="bb-legend">
        <span className="scalebar" aria-label="Scale bar, one metre"><i style={{ width: Math.round(1000 / v.u) }} /><span>1 m</span></span>
        <span><i className="k dim" />Dimensions in mm</span>
        <span><i className="k dash" />Overhead</span>
        {s.job === 'extension' ? <><span><i className="k new" />New work</span><span><i className="k pd" />Depth allowed</span><span><i className="k pd h" />Prior approval</span><span><i className="k pd p" />Planning application</span></> : null}
        {s.svc ? <span className="bb-key"><svg viewBox="0 0 14 14" aria-hidden><circle cx="7" cy="7" r="5.5" /><path d="M3.2 3.2l7.6 7.6M10.8 3.2l-7.6 7.6" /></svg>{s.job === 'bathroom' ? 'Soil stack' : 'Drain'}</span> : null}
        {s.job === 'bathroom' ? <span><i className="k zone" />Wiring zones</span> : null}
        <span><b className="bb-reftag">FL-01</b> Finish, see F-401</span>
      </div>
    </>
  )
}

// ---------------------------------------------------------------- A-201 elevations
function ElevSheet({ s }: { s: Scene }) {
  const uid = useId().replace(/:/g, ''), [ref, px] = useWidth<HTMLDivElement>(640)
  const [wall, setWall] = useState<Wall>(() => busiestWall(s))
  const e = elevation(s, wall), ml = px < 430 ? 14 : 28, mr = px < 430 ? 34 : 48
  const vw = e.length / Math.max(0.3, 1 - (ml + mr) / px), u = vw / px
  const max = Math.max(s.length, s.width), k = 44 / max
  return (
    <>
      <div className="bb-wallpick">
        <svg viewBox="-8 -8 60 60" className="key" aria-hidden>
          <rect x={(44 - s.length * k) / 2} y={(44 - s.width * k) / 2} width={s.length * k} height={s.width * k} fill="none" stroke={INK} strokeWidth="1" />
          {(() => { const x0 = (44 - s.length * k) / 2, y0 = (44 - s.width * k) / 2, x1 = x0 + s.length * k, y1 = y0 + s.width * k; const d = wall === 'N' ? `M${x0} ${y0}H${x1}` : wall === 'S' ? `M${x0} ${y1}H${x1}` : wall === 'W' ? `M${x0} ${y0}V${y1}` : `M${x1} ${y0}V${y1}`; return <path d={d} stroke={SANG} strokeWidth="3.5" /> })()}
        </svg>
        <div className="seg" role="group" aria-label="Wall to view">
          {WALLS.map((w) => <button key={w} type="button" aria-pressed={wall === w} onClick={() => setWall(w)}>{WALL_NAME[w]}{s.job === 'extension' && w === 'N' ? ', house' : s.job === 'extension' && w === 'S' ? ', garden' : ''}</button>)}
        </div>
      </div>
      <div ref={ref} className="bb-drawing">
        <svg className="bb-svg" viewBox={`${-ml * u} ${-16 * u} ${vw} ${e.height + 16 * u + 58 * u}`} style={{ ['--u' as string]: u }} role="img" aria-label={`${WALL_NAME[wall]} elevation, ${fmt(e.length)} mm long, ${e.items.length} items`}>
          <ElevArt s={s} wall={wall} u={u} uid={uid} />
        </svg>
      </div>
      <p className="bb-cap">{WALL_NAME[wall]}, seen from inside the room. {e.items.length ? 'Heights and widths in mm, finishes as scheduled on F-401.' : 'Nothing fixed to this wall.'}</p>
    </>
  )
}

// ---------------------------------------------------------------- F-401 finishes: sample board and schedule
function slotQty(s: Scene, slot: Slot) {
  const q = takeoff(s)
  return slot === 'floor' ? `${r1(q.area)} m²` : slot === 'walls' ? `${r1(q.paint)} m²` : slot === 'tile' ? `${r1(q.tile)} m²` : slot === 'worktop' ? `${r1(q.worktop)} m` : slot === 'fronts' ? `${q.fronts} fronts` : s.job === 'extension' ? `${r1(q.glazingM)} m` : `${q.fittings} fittings`
}
const SLOT_WHERE: Record<Slot, string> = { floor: 'Whole floor', walls: 'Walls and ceiling', tile: 'See elevations', worktop: 'All worktops', fronts: 'All unit fronts', metal: 'All fittings' }

function SampleBoard({ s }: { s: Scene }) {
  const uid = useId().replace(/:/g, ''), slots = slotsFor(s), M = (sl: Slot) => mat(s.mats[sl]), has = (sl: Slot) => slots.includes(sl)
  const fill = (sl: Slot) => fillOf(M(sl), uid)
  const paint = M('walls'), metal = M('metal')
  const slabSlot: Slot | null = has('worktop') ? 'worktop' : has('tile') ? 'tile' : null
  const squareSlot: Slot | null = has('worktop') && has('tile') ? 'tile' : null
  const tag = (x: number, y: number, sl: Slot) => <g><RefTag u={2.1} x={x} y={y} code={SLOT[sl].ref} /><text className="nm" x={x + 42} y={y + 6}>{M(sl).name}</text></g>
  const pin = (x: number, y: number) => <g><circle cx={x} cy={y} r={7} fill="#B08D57" stroke="#6E5630" strokeWidth="1.2" /><circle cx={x - 2} cy={y - 2} r={2} fill="#E6CFA2" stroke="none" /></g>
  return (
    <svg className="bb-svg bb-board" viewBox="0 0 1000 640" style={{ ['--u' as string]: 2.1 }} role="img" aria-label={`Sample board: ${slots.map((sl) => M(sl).name).join(', ')}`}>
      <defs>
        {slots.filter((sl) => M(sl).pattern !== 'flat').map((sl) => <MatPattern key={sl} m={M(sl)} id={`${uid}-${M(sl).id}`} u={1.6} />)}
        <pattern id={`${uid}-linen`} width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#E9E4DA" /><path d="M0 3.5H7M3.5 0V7" stroke="#DFD9CB" strokeWidth=".6" /></pattern>
        <filter id={`${uid}-sh`} x="-20%" y="-20%" width="150%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="7" /><feOffset dx="5" dy="9" /><feComponentTransfer><feFuncA type="linear" slope=".3" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="1000" height="640" fill={`url(#${uid}-linen)`} stroke="none" />
      <g filter={`url(#${uid}-sh)`} stroke={INK} strokeWidth="1.4">
        <g transform="translate(46 236) rotate(-2)"><rect width="440" height="350" fill={fill('floor')} /></g>
        {has('fronts') ? <g transform="translate(330 44) rotate(2.5)"><rect width="215" height="300" fill={fill('fronts')} /><rect x="34" y="34" width="147" height="232" fill="none" stroke={mix(M('fronts').hex, INK, 0.45)} strokeWidth="1.2" /><rect x="40" y="40" width="135" height="220" fill="none" stroke={mix(M('fronts').hex, '#FFFFFF', 0.3)} strokeWidth="1" /></g> : null}
        {slabSlot ? <g transform="translate(420 330) rotate(-4)"><rect width="430" height="200" fill={fill(slabSlot)} /><rect y="200" width="430" height={slabSlot === 'worktop' ? 26 : 9} fill={mix(M(slabSlot).hex, INK, 0.22)} /></g> : null}
        {squareSlot ? <g transform="translate(748 96) rotate(6)"><rect width="205" height="205" fill={fill(squareSlot)} /><rect y="205" width="205" height="8" fill={mix(M(squareSlot).hex, INK, 0.25)} /></g> : null}
        <g transform="translate(628 218)">
          {[[-17, mix(paint.hex, '#FFFFFF', 0.45)], [-3, mix(paint.hex, INK, 0.14)], [11, paint.hex]].map(([r, c], i) => <g key={i} transform={`rotate(${r})`}><rect x="-52" y="-190" width="104" height="190" fill={c as string} /><rect x="-52" y="-190" width="104" height="5" fill="#FFFFFF" opacity=".35" stroke="none" /><rect x="-52" y="-44" width="104" height="44" fill="#FBF8F1" /></g>)}
        </g>
        <g transform={`translate(${has('worktop') || has('tile') ? 640 : 560} 580) rotate(-7)`}>
          <rect x="18" y="-4" width="16" height="30" fill={mix(metal.hex, INK, 0.2)} /><rect x="206" y="-4" width="16" height="30" fill={mix(metal.hex, INK, 0.2)} />
          <rect x="0" y="-18" width="240" height="20" rx="10" fill={metal.hex} /><path d="M12 -12H228" stroke={mix(metal.hex, '#FFFFFF', 0.55)} strokeWidth="2" />
        </g>
      </g>
      {pin(266, 250)}{has('fronts') ? pin(440, 58) : null}{slabSlot ? pin(634, 334) : null}{squareSlot ? pin(852, 112) : null}
      {tag(92, 560, 'floor')}
      {has('fronts') ? tag(366, 26, 'fronts') : null}
      {slabSlot ? tag(470, 500, slabSlot) : null}
      {squareSlot ? tag(790, 78, squareSlot) : null}
      {tag(566, 250, 'walls')}
      {tag(has('worktop') || has('tile') ? 700 : 620, 614, 'metal')}
    </svg>
  )
}

function FinishesSheet({ s }: { s: Scene }) {
  const slots = slotsFor(s)
  return (
    <>
      <SampleBoard s={s} />
      <div className="bb-table sched" role="table" aria-label="Finishes schedule">
        <div className="hd" role="row"><span>Ref</span><span>Location</span><span>Material</span><span className="hide-s">Finish</span><span className="n">Quantity</span><span className="hide-s">Range</span></div>
        {slots.map((sl) => { const m = mat(s.mats[sl]); return (
          <div key={sl} role="row"><span><b className="bb-reftag">{SLOT[sl].ref}</b></span><span>{SLOT[sl].name[s.job]}<small>{SLOT_WHERE[sl]}</small></span><span><i className="dot" style={{ background: m.hex }} />{m.name}<small className="show-s">{m.sheen}</small></span><span className="hide-s">{m.sheen}</span><span className="n">{slotQty(s, sl)}</span><span className="hide-s">{TIER_WORD[m.tier]}</span></div>
        ) })}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- Q-501 bill of quantities
function BoqSheet({ s }: { s: Scene }) {
  const rows = billOfQuantities(s)
  return (
    <div className="bb-table boq" role="table" aria-label="Bill of quantities">
      <div className="hd" role="row"><span>Ref</span><span>Item</span><span className="n hide-s">Measured</span><span className="n hide-s">Waste</span><span className="n">To order</span></div>
      {rows.map((r) => <div key={r.ref} role="row"><span><b className="bb-reftag">{r.ref}</b></span><span>{r.item}<small>{r.note}<span className="show-s">. Measured {r.net}, waste {r.waste.toLowerCase()}</span></small></span><span className="n hide-s">{r.net}</span><span className="n hide-s">{r.waste}</span><span className="n"><b>{r.order}</b></span></div>)}
    </div>
  )
}

// ---------------------------------------------------------------- Q-502 options
function OptionsSheet({ opts, chosen, setChosen, locked }: { opts: Option[]; chosen: Finish; setChosen: (f: Finish) => void; locked: boolean }) {
  const o = opts.find((x) => x.key === chosen)!
  return (
    <>
      <div className="bb-opts" role="group" aria-label="Options">
        {opts.map((x) => (
          <button key={x.key} type="button" aria-pressed={chosen === x.key} disabled={locked && chosen !== x.key} onClick={() => setChosen(x.key)}>
            <span className="tier">{x.name}</span>
            <b>{gbp(x.total)}</b>
            <span className="what">{x.what}</span>
            <ul>{x.diffs.map((d) => <li key={d}>{d}</li>)}</ul>
          </button>
        ))}
      </div>
      <div className="bb-table price" role="table" aria-label={`Price breakdown, ${o.name} option`}>
        <div className="hd" role="row"><span>{o.name} option, line by line</span><span className="n hide-s">Quantity</span><span className="n">Price</span></div>
        {grouped(o.lines).map((g) => (
          <div key={g.group} className="grp" role="rowgroup">
            <div role="row" className="gh"><span>{g.group}</span><span className="hide-s" /><span className="n">{gbp(g.total)}</span></div>
            {g.lines.map((l) => <div role="row" key={l.label} className="ln"><span>{l.label}</span><span className="n hide-s">{l.qty ?? ''}</span><span className="n">{gbp(l.total)}</span></div>)}
          </div>
        ))}
        {o.extras.length ? <div className="grp" role="rowgroup"><div role="row" className="gh"><span>Extras</span><span className="hide-s" /><span className="n">{gbp(o.extras.reduce((t, l) => t + l.total, 0))}</span></div>{o.extras.map((l) => <div role="row" key={l.label} className="ln"><span>{l.label}</span><span className="hide-s" /><span className="n">{l.total ? gbp(l.total) : 'In the tiling'}</span></div>)}</div> : null}
        <div role="row" className="sum"><span>Contingency, 5%</span><span className="hide-s" /><span className="n">{gbp(o.contingency)}</span></div>
        <div role="row" className="sum"><span>VAT, 20%</span><span className="hide-s" /><span className="n">{gbp(o.vat)}</span></div>
        <div role="row" className="tot"><span>Total including VAT</span><span className="hide-s" /><span className="n">{gbp(o.total)}</span></div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------- P-601 programme and stage payments
function Gantt({ s, total }: { s: Scene; total: number }) {
  const uid = useId().replace(/:/g, ''), [ref, px] = useWidth<HTMLDivElement>(640)
  const prog = programme(s), pays = payments(total, prog)
  const lab = px < 430 ? 78 : 112, row = 25, top = 22, w = px - lab - 10, dw = w / prog.days, H = top + (prog.lanes.length + 1) * row + 8
  const every = prog.weeks > 9 && px < 520 ? 2 : 1
  return (
    <>
      <div ref={ref} className="bb-drawing flat">
        <svg className="bb-svg bb-gantt" viewBox={`0 0 ${px} ${H}`} style={{ ['--u' as string]: 1 }} role="img" aria-label={`Programme of works: about ${prog.weeks} weeks, ${prog.tasks.length} tasks across ${prog.lanes.length} trades`}>
          <defs><pattern id={`${uid}-dry`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V5" stroke={INK} strokeWidth="1" /></pattern></defs>
          {Array.from({ length: prog.weeks + 1 }, (_, i) => <g key={i}><path className="wk" d={`M${lab + i * 5 * dw} ${top - 4}V${H - 6}`} />{i < prog.weeks && i % every === 0 ? <text className="wkt" x={lab + i * 5 * dw + 3} y={12}>{px < 430 ? '' : 'Week '}{i + 1}</text> : null}</g>)}
          {prog.lanes.map((lane, i) => (
            <g key={lane}>
              <path className="ln" d={`M0 ${top + (i + 1) * row}H${px}`} />
              <text x={0} y={top + i * row + 16}>{lane}</text>
              {prog.tasks.filter((t) => t.lane === lane).map((t) => { const x = lab + t.start * dw, bw = Math.max(2, t.days * dw - 1.5), fits = bw > t.name.length * 5 + 8; return (
                <g key={t.id}><title>{`${t.name}: ${t.days} ${t.days === 1 ? 'day' : 'days'}`}</title>
                  <rect className={t.kind} x={x} y={top + i * row + 5} width={bw} height={15} fill={t.kind === 'dry' ? `url(#${uid}-dry)` : undefined} />
                  {fits ? <text className={`tk ${t.kind}`} x={x + 4} y={top + i * row + 16}>{t.name}</text> : null}
                </g>
              ) })}
            </g>
          ))}
          <text className="pay" x={0} y={top + prog.lanes.length * row + 17}>Payments due</text>
          {pays.map((p, i) => { const x = lab + Math.min(prog.days, p.day) * dw, y = top + prog.lanes.length * row + 13; return <g key={p.key} className="ms"><path d={`M${x} ${top - 4}V${y - 8}`} /><path className="d" d={`M${x} ${y - 8}l8 8l-8 8l-8 -8z`} /><text x={x} y={y + 3.4} textAnchor="middle">{i + 1}</text></g> })}
        </svg>
      </div>
      <div className="bb-legend">
        <span><i className="k work" />On site</span><span><i className="k dry" />Drying, nobody needed</span><span><i className="k wait" />Made off site</span><span><i className="k ms" />Stage payment</span>
      </div>
      <div className="bb-table pay" role="table" aria-label="Stage payments">
        <div className="hd" role="row"><span>Stage</span><span>Due when</span><span className="n hide-s">Share</span><span className="n">Amount</span></div>
        {pays.map((p, i) => <div role="row" key={p.key}><span><i className="num"><span>{i + 1}</span></i>{p.name}</span><span>{p.when}</span><span className="n hide-s">{Math.round(p.share * 100)}%</span><span className="n"><b>{gbp(p.amount)}</b></span></div>)}
        <div role="row" className="tot"><span>Total including VAT</span><span /><span className="n hide-s">100%</span><span className="n">{gbp(total)}</span></div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------- R-701 regulations and planning
function RegsSheet({ s }: { s: Scene }) {
  const flags = regs(s)
  return (
    <>
      <p className="bb-guide-line">{REGS_LINE}</p>
      <ul className="bb-flags">
        {flags.map((f) => (
          <li key={f.id} className={f.status}>
            <span className="st"><svg viewBox="0 0 20 20" aria-hidden>{f.status === 'clear' ? <><circle cx="10" cy="10" r="8" /><path d="M6 10.5l3 3 5-7" /></> : f.status === 'check' ? <><path d="M10 1.5L18.5 10 10 18.5 1.5 10Z" /><path d="M10 6v5M10 13.6v.4" /></> : <><rect x="2.5" y="2.5" width="15" height="15" /><path d="M6 10h8M10.5 6.5L14 10l-3.5 3.5" /></>}</svg>{STATUS[f.status]}</span>
            <div><b>{f.title}</b><p>{f.text}</p><p className="meta"><span>{f.ref}</span><span>{f.who}</span></p></div>
          </li>
        ))}
      </ul>
    </>
  )
}

// ---------------------------------------------------------------- S-801 scope of works
function ScopeSheet({ s, tier, photo, pins }: { s: Scene; tier: Finish; photo: string | null; pins: Pin[] }) {
  const sc = scope(s, tier)
  return (
    <div className="bb-scope">
      <ol>{sc.clauses.map((c, i) => <li key={c.trade}><h4><span>{i + 1}</span>{c.trade}</h4><ol>{c.items.map((t, k) => <li key={k}><span>{i + 1}.{k + 1}</span>{t}</li>)}</ol></li>)}</ol>
      <div className="two">
        <div><h4>Not included</h4><ul>{sc.exclusions.map((t) => <li key={t}>{t}</li>)}</ul></div>
        <div><h4>Assumed</h4><ul>{sc.assumptions.map((t) => <li key={t}>{t}</li>)}</ul></div>
      </div>
      {photo || pins.length ? <div className="photo-app"><h4>Your photo, as sent</h4><div className="pp"><Photo scene={JOBS[s.job].scene} src={photo} pins={pins} /><PinList pins={pins} /></div></div> : null}
    </div>
  )
}

export default function Pack({ scene, opts, chosen, setChosen, locked, photo, pins }: { scene: Scene; opts: Option[]; chosen: Finish; setChosen: (f: Finish) => void; locked: boolean; photo: string | null; pins: Pin[] }) {
  const [key, setKey] = useState('plan')
  const o = opts.find((x) => x.key === chosen)!, s = o.scene
  const i = SHEETS.findIndex((x) => x.key === key), sh = SHEETS[i]
  const notes = check(s).length, flags = regs(s)
  const prog = programme(s)
  const note: Record<string, ReactNode> = {
    plan: <Auto>Drawn from your plan, with {s.items.length} items dimensioned and tagged</Auto>,
    elev: <Auto>Projected from the same plan, at real heights</Auto>,
    model: <Auto>Built from the plan in your chosen finishes</Auto>,
    finishes: <Auto>Quantities measured off the plan for each finish</Auto>,
    boq: <Auto>Taken off the plan, with waste allowances from the price book</Auto>,
    options: <Auto>{o.lines.length + o.extras.length + 2} lines priced from Bramley&rsquo;s price book, three ways</Auto>,
    programme: <Auto>{prog.tasks.length} tasks sequenced from the quantities, payments tied to milestones</Auto>,
    regs: <Auto>{flags.length} checks run against the plan{notes ? `, ${notes} design ${notes === 1 ? 'note' : 'notes'} carried over` : ''}</Auto>,
    scope: <Auto>Written from the plan, clause by clause</Auto>,
  }
  return (
    <div className="bb-pack">
      <nav className="bb-register" aria-label="Sheets in this pack">
        {SHEETS.map((x) => <button key={x.key} type="button" aria-current={key === x.key ? 'true' : undefined} aria-pressed={key === x.key} onClick={() => setKey(x.key)}><span>{x.no}</span>{x.title}</button>)}
      </nav>
      <Sheet no={sh.no} title={sh.title} scale={sh.scale} job={s.job} index={i} note={note[key]}>
        {key === 'plan' && <PlanSheet s={s} key={chosen} />}
        {key === 'elev' && <ElevSheet s={s} />}
        {key === 'model' && <Axo scene={s} />}
        {key === 'finishes' && <FinishesSheet s={s} />}
        {key === 'boq' && <BoqSheet s={s} />}
        {key === 'options' && <OptionsSheet opts={opts} chosen={chosen} setChosen={setChosen} locked={locked} />}
        {key === 'programme' && <Gantt s={s} total={o.total} />}
        {key === 'regs' && <RegsSheet s={s} />}
        {key === 'scope' && <ScopeSheet s={s} tier={chosen} photo={photo} pins={pins} />}
      </Sheet>
      <div className="bb-turn">
        <button type="button" className="small" disabled={i === 0} onClick={() => setKey(SHEETS[i - 1].key)}>Previous sheet</button>
        <span>{o.name} option, {gbp(o.total)} including VAT, about {prog.weeks} weeks</span>
        <button type="button" className="small" disabled={i === SHEETS.length - 1} onClick={() => setKey(SHEETS[i + 1].key)}>Next sheet</button>
      </div>
    </div>
  )
}
