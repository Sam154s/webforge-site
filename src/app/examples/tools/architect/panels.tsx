// The specialist read-outs beside the model: planning guide, sun study, area schedule, cost plan and programme.
// Every one is worked out by code from the same design. No hooks, so the sheet set can reuse them.
import { gbp, range } from '@/lib/sandbox/journey'
import { PLOT_AREA, type Areas, type CostPlan, type Design, type Facing, fee as feeOf } from '@/lib/sandbox/architect-model'
import { GUIDE_LINE, SEASONS, STATUS, clock, daylight, sunAt, type Planning, type Row, type Status } from '@/lib/sandbox/architect-rules'

/** Marks a moment where the tool did something on its own. */
export function Auto({ children }: { children: React.ReactNode }) {
  return <p className="hf-auto"><i aria-hidden /><b>Automatic</b><span>{children}</span></p>
}

const MARK: Record<Status, string> = { ok: 'M2 6.2L4.8 9L10 3', prior: 'M6 2V7M6 9.2V10', planning: 'M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5', check: 'M6 2V7M6 9.2V10' }
export function Chip({ status }: { status: Status }) {
  return <span className={`hf-chip ${status}`}><svg viewBox="0 0 12 12" aria-hidden><path d={MARK[status]} /></svg>{STATUS[status]}</span>
}

export function PlanningPanel({ design, p, set }: { design: Design; p: Planning; set?: (patch: Partial<Design>) => void }) {
  return (
    <div className="hf-panel">
      <div className={`hf-route ${p.route.key}`}>
        <span className="hf-cap">{design.type === 'new' ? 'Planning route' : 'Permitted development guide'}</span>
        <h3>{p.route.name}</h3>
        <p>{p.route.text}</p>
      </div>
      {set && design.type === 'extension' ? (
        <div className="hf-ask">
          <div className="seg" role="group" aria-label="Your house">
            {([['detached', 'Detached'], ['semi', 'Semi-detached'], ['terrace', 'Terraced']] as const).map(([k, name]) => <button key={k} type="button" aria-pressed={design.house === k} onClick={() => set({ house: k })}>{name}</button>)}
          </div>
          <label className="check"><input type="checkbox" checked={design.conservation} onChange={(e) => set({ conservation: e.target.checked })} /> In a conservation area</label>
        </div>
      ) : null}
      <ul className="hf-checks">
        {p.checks.map((c) => (
          <li key={c.id} className={c.status}>
            <div className="hf-top"><b>{c.name}</b><Chip status={c.status} /></div>
            <div className="fig"><span>{c.value}</span><span className="lim">Guide: {c.limit}</span></div>
            <p>{c.text}</p>
          </li>
        ))}
      </ul>
      {p.marks.length ? <p className="hf-redline"><i aria-hidden />Shown in red on the model: {p.marks.map((m) => m.text).join('; ')}.</p> : null}
      <p className="hf-guide">{GUIDE_LINE}</p>
    </div>
  )
}

const COMPASS = (az: number) => ['north', 'north east', 'east', 'south east', 'south', 'south west', 'west', 'north west'][Math.round(az / 45) % 8]
export function SunPath({ day, hour }: { day: number; hour: number }) {
  // altitude against compass bearing: the three arcs are midsummer, the equinoxes and midwinter
  const X = (az: number) => 20 + ((az - 50) / 260) * 300, Y = (alt: number) => 128 - (alt / 65) * 112
  const arc = (dy: number) => {
    const [a, b] = daylight(dy), pts: string[] = []
    for (let i = 0; i <= 40; i++) { const s = sunAt(dy, a + ((b - a) * i) / 40); pts.push(`${X(s.az).toFixed(1)} ${Y(Math.max(0, s.alt)).toFixed(1)}`) }
    return 'M' + pts.join('L')
  }
  const now = sunAt(day, hour)
  return (
    <svg className="hf-sunpath" viewBox="0 0 340 150" role="img" aria-label={`Sun path diagram. The sun is ${Math.round(now.alt)} degrees above the horizon, to the ${COMPASS(now.az)}.`}>
      <path className="axis" d="M20 128H320" />
      {[90, 180, 270].map((az) => <g key={az}><path className="tick" d={`M${X(az)} 16V128`} /><text x={X(az)} y={143} textAnchor="middle">{az === 90 ? 'East' : az === 180 ? 'South' : 'West'}</text></g>)}
      {[20, 40, 60].map((alt) => <g key={alt}><path className="tick" d={`M20 ${Y(alt)}H320`} /><text x={16} y={Y(alt) + 3} textAnchor="end">{alt}°</text></g>)}
      {[172, 80, 355].map((dy) => <path key={dy} className={`arc${Math.abs(dy - day) < 10 || (dy === 80 && day === 264) ? ' on' : ''}`} d={arc(dy)} />)}
      <text x={X(180)} y={Y(62) - 5} textAnchor="middle" className="s">June</text>
      <text x={X(180)} y={Y(38.5) - 5} textAnchor="middle" className="s">March, September</text>
      <text x={X(180)} y={Y(15) - 5} textAnchor="middle" className="s">December</text>
      {now.alt > 0 ? <g><path className="drop" d={`M${X(now.az)} ${Y(now.alt)}V128`} /><circle cx={X(now.az)} cy={Y(now.alt)} r="5" /></g> : null}
    </svg>
  )
}

export function SunPanel({ design, day, hour, setSun, setFacing }: { design: Design; day: number; hour: number; setSun: (day: number, hour: number) => void; setFacing: (f: Facing) => void }) {
  const [rise, down] = daylight(day), lo = Math.ceil(rise * 2) / 2, hi = Math.floor(down * 2) / 2, s = sunAt(day, hour)
  const fit = (dy: number, h: number) => { const [a, b] = daylight(dy); return Math.min(Math.floor(b * 2) / 2, Math.max(Math.ceil(a * 2) / 2, h)) }
  return (
    <div className="hf-panel hf-sun">
      <div className="hf-sun-ctl">
        <div className="ctl"><span className="top-line"><span>Season</span></span>
          <div className="seg" role="group" aria-label="Season">{SEASONS.map((x) => <button key={x.key} type="button" aria-pressed={day === x.day} onClick={() => setSun(x.day, fit(x.day, hour))}>{x.name}</button>)}</div>
        </div>
        <label className="ctl"><span className="top-line"><span>Time of day, {SEASONS.find((x) => x.day === day)?.date}</span><b>{clock(hour)}</b></span>
          <input type="range" min={lo} max={hi} step={0.5} value={hour} onChange={(e) => setSun(day, +e.target.value)} /></label>
        <div className="ctl"><span className="top-line"><span>The back garden faces</span></span>
          <div className="seg" role="group" aria-label="The back garden faces">{([['N', 'North'], ['E', 'East'], ['S', 'South'], ['W', 'West']] as const).map(([k, name]) => <button key={k} type="button" aria-pressed={design.facing === k} onClick={() => setFacing(k)}>{name}</button>)}</div>
        </div>
        <p className="small">Sun {Math.round(s.alt)}° above the horizon, to the {COMPASS(s.az)}. Daylight from {clock(rise)} to {clock(down)}, solar time, for southern England.</p>
      </div>
      <SunPath day={day} hour={hour} />
    </div>
  )
}

const n1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString('en-GB')
export function AreasPanel({ design, a }: { design: Design; a: Areas }) {
  const ext = design.type === 'extension', max = Math.max(...a.levels.map((l) => l.total))
  return (
    <div className="hf-panel">
      <table className="hf-table">
        <thead><tr><th>Level</th><th></th>{ext ? <th className="n">Existing</th> : null}<th className="n">{ext ? 'New' : 'Area'}</th>{ext ? <th className="n">Total</th> : null}</tr></thead>
        <tbody>
          {[...a.levels].reverse().map((l) => (
            <tr key={l.code}><td><b>{l.code}</b> {l.name}</td>
              <td className="bar"><i style={{ width: `${(l.existing / max) * 100}%` }} className="was" /><i style={{ width: `${(l.added / max) * 100}%` }} /></td>
              {ext ? <td className="n">{n1(l.existing)} m²</td> : null}<td className="n">{n1(l.added)} m²</td>{ext ? <td className="n">{n1(l.total)} m²</td> : null}</tr>
          ))}
          <tr className="total"><td>Gross floor area</td><td></td>{ext ? <td className="n">{n1(a.existing)} m²</td> : null}<td className="n">{n1(a.added)} m²</td>{ext ? <td className="n">{n1(a.gia)} m²</td> : null}</tr>
        </tbody>
      </table>
      <dl className="hf-facts">
        <div><dt>Footprint</dt><dd>{n1(a.footprint)} m²</dd></div>
        <div><dt>Plot covered</dt><dd>{Math.round(a.coverage * 100)}% of {PLOT_AREA.toLocaleString('en-GB')} m²</dd></div>
        <div><dt>External wall, new</dt><dd>{n1(a.wall)} m²</dd></div>
        <div><dt>Roof, new</dt><dd>{n1(a.roofSurface)} m²</dd></div>
      </dl>
      <p className="hf-guide">Measured to the outside of the walls, from the half-metre grid the model is built on.</p>
    </div>
  )
}

export function CostPanel({ c, compact = false }: { c: CostPlan; compact?: boolean }) {
  const f = feeOf(c.build), all = [...c.elements, ...c.features], tot = c.net
  return (
    <div className="hf-panel">
      <div className="hf-stack" role="img" aria-label="Build budget by element">
        {all.filter((l) => l.cost > 0).map((l, i) => <i key={l.key + i} className={i >= c.elements.length ? 'feat' : `e${i % 3}`} style={{ width: `${(l.cost / tot) * 100}%` }} title={`${l.name}: ${gbp(l.cost)}`} />)}
      </div>
      <table className="hf-table cost">
        <tbody>
          {c.elements.map((l) => <tr key={l.key}><td>{l.name}</td><td className="basis">{l.basis}</td><td className="n">{gbp(l.cost)}</td></tr>)}
          {c.features.length ? <tr className="head"><td colSpan={3}>Features you added</td></tr> : null}
          {c.features.map((l, i) => <tr key={l.key + i} className="hf-f"><td>{l.name}</td><td className="basis">{l.basis}</td><td className="n">{gbp(l.cost)}</td></tr>)}
          <tr className="sub"><td>Works</td><td></td><td className="n">{gbp(c.net)}</td></tr>
          {compact ? null : <tr><td>Site set-up and management</td><td className="basis">12%</td><td className="n">{gbp(c.prelims)}</td></tr>}
          {compact ? null : <tr><td>Contingency</td><td className="basis">10%</td><td className="n">{gbp(c.contingency)}</td></tr>}
          <tr className="total"><td>Indicative build budget</td><td></td><td className="n">{range(c.low, c.high)}</td></tr>
          <tr className="fee"><td>Architect fee</td><td className="basis">{Math.round(f.pct * 1000) / 10}% band</td><td className="n">{gbp(f.total)}</td></tr>
        </tbody>
      </table>
      <p className="hf-guide">About {gbp(c.perM2)} per m². {c.vat} Example rates for a fictional practice.</p>
    </div>
  )
}

export function ProgrammePanel({ rows, weeks, months }: { rows: Row[]; weeks: number; months: number }) {
  return (
    <div className="hf-panel">
      <div className="hf-gantt">
        {rows.map((r) => (
          <div className="row" key={r.name}>
            <span className="code">{r.code}</span>
            <span className="name">{r.name}</span>
            <span className="track"><i style={{ left: `${(r.start / weeks) * 100}%`, width: `${(r.weeks / weeks) * 100}%` }} />{r.gate ? <em style={{ left: `${((r.start + r.weeks) / weeks) * 100}%` }} title={r.gate} /> : null}</span>
            <span className="wk">{r.weeks} wk</span>
            <span className="fee">{r.fee ? gbp(r.fee) : ''}</span>
            {r.gate ? <span className="gate">{r.gate}</span> : null}
          </div>
        ))}
      </div>
      <p className="hf-guide">RIBA Plan of Work stages. About {months} months from brief to keys. Example durations that scale with the size of the design and the planning route.</p>
    </div>
  )
}
