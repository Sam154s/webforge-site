// Fig. 5: the planned pipework as an isometric, drawn white on blue like a contractor's print. Flow is a solid line,
// return a dashed one. Pipe sizes come from the load each run carries, so they change when the heat source does.
import { CEILING, CELL, STOREY, route, type House } from '@/lib/sandbox/plumber-heat'

const S = 21
const LIFT = 6     // floors are drawn lifted apart so each can be read: an exploded isometric
const Q = (x: number, y: number, z: number): [number, number] => [(x - y) * 0.866 * S, (x + y) * 0.5 * S - z * S]
// Route heights are in real metres; stretch them so one storey becomes one lift.
const P = (x: number, y: number, z: number) => Q(x, y, (z / STOREY) * LIFT)
const pts = (list: [number, number][]) => list.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
const path = (list: [number, number][]) => 'M' + list.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')

export default function Iso({ house, drop }: { house: House; drop: 11 | 5 }) {
  const r = route(house, drop)
  const rooms = house.rooms
  const xs = rooms.flatMap((q) => [q.x * CELL, (q.x + q.w) * CELL]), ys = rooms.flatMap((q) => [q.y * CELL, (q.y + q.h) * CELL])
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  const upper = rooms.some((q) => q.floor === 1)
  const top = (upper ? LIFT : 0) + CEILING
  const corners = [Q(x0, y0, 0), Q(x1, y0, 0), Q(x1, y1, 0), Q(x0, y1, 0), Q(x0, y0, top), Q(x1, y0, top), Q(x1, y1, top), Q(x0, y1, top)]
  const minX = Math.min(...corners.map((c) => c[0])) - 64, maxX = Math.max(...corners.map((c) => c[0])) + 30
  const minY = Math.min(...corners.map((c) => c[1])) - 16, maxY = Math.max(...corners.map((c) => c[1])) + 30
  const b = r.boiler
  const tagged = r.pipes.filter((p) => p.kind !== 'branch' && p.m >= 1.4)
  return (
    <svg className="tw-iso" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} role="img"
      aria-label={`Isometric pipework diagram. ${r.emitters.length} radiators on a ${r.primary} millimetre primary. The longest run is to ${r.index?.name}, ${r.index?.run} metres.`}>
      <defs><pattern id="tw-night-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" className="grid" /></pattern></defs>
      <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="url(#tw-night-grid)" />
      {[0, 1].map((f) => rooms.filter((q) => q.floor === f).map((q) => {
        const z = f * STOREY, a = q.x * CELL, c = q.y * CELL, w = q.w * CELL, h = q.h * CELL
        return <polygon key={q.id} className="slab" points={pts([P(a, c, z), P(a + w, c, z), P(a + w, c + h, z), P(a, c + h, z)])} />
      }))}
      {/* each floor as a faint box, so walls and ceiling height read without hiding the pipes */}
      {(upper ? [0, 1] : [0]).map((f) => { const z = f * LIFT; return (
        <g key={f}>
          <path className="frame" d={[[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => path([Q(x, y, z), Q(x, y, z + CEILING)])).join(' ') + ' ' + path([Q(x0, y0, z + CEILING), Q(x1, y0, z + CEILING), Q(x1, y1, z + CEILING), Q(x0, y1, z + CEILING), Q(x0, y0, z + CEILING)])} />
          <text className="flabel" x={Q(x0, y1, z)[0] - 4} y={Q(x0, y1, z)[1] + 14} textAnchor="end">{f ? 'First floor' : 'Ground floor'}</text>
        </g>
      ) })}
      {/* return, then flow on top */}
      <g className="draw">
        {r.pipes.map((p, i) => <path key={`r${i}`} className="ret" transform="translate(2.6 2.6)" d={path([P(...p.a), P(...p.b)])} />)}
        {r.pipes.map((p, i) => <path key={`f${i}`} className={`flow${p.mm >= 22 ? ' big' : ''}`} d={path([P(...p.a), P(...p.b)])} />)}
        {r.emitters.map((e) => { const z = e.floor * LIFT; return <path key={e.id} className="flow" d={path([Q(e.x, e.y, z), Q(e.x, e.y, z + 0.2)])} /> })}
        <path className={`flow${r.primary >= 22 ? ' big' : ''}`} d={path([Q(b.x, b.y, 0), Q(b.x, b.y, 1.2)])} /><path className="ret" transform="translate(2.6 2.6)" d={path([Q(b.x, b.y, 0), Q(b.x, b.y, 1.2)])} />
      </g>
      {/* radiators */}
      {r.emitters.map((e) => {
        const z = e.floor * LIFT + 0.2, along = e.side === 'n' || e.side === 's', half = 0.5
        const q: [number, number][] = along ? [Q(e.x - half, e.y, z), Q(e.x + half, e.y, z), Q(e.x + half, e.y, z + 0.6), Q(e.x - half, e.y, z + 0.6)] : [Q(e.x, e.y - half, z), Q(e.x, e.y + half, z), Q(e.x, e.y + half, z + 0.6), Q(e.x, e.y - half, z + 0.6)]
        const t = Q(e.x, e.y, z + 0.6), index = r.index?.id === e.id
        return (
          <g key={e.id} className={index ? 'em index' : 'em'}>
            <polygon className="rad" points={pts(q)} />
            <text x={t[0]} y={t[1] - 4} textAnchor="middle">{e.name}</text>
          </g>
        )
      })}
      {/* heat source */}
      {(() => {
        const z = 1.2, w = 0.25, d = 0.2, h = 0.75, x = b.x, y = b.y
        const A = Q(x - w, y + d, z), B = Q(x + w, y + d, z), C = Q(x + w, y - d, z), A2 = Q(x - w, y + d, z + h), B2 = Q(x + w, y + d, z + h), C2 = Q(x + w, y - d, z + h), D2 = Q(x - w, y - d, z + h)
        const t = Q(x, y, z + h)
        return <g className="src"><polygon points={pts([A, B, B2, A2])} /><polygon points={pts([B, C, C2, B2])} /><polygon points={pts([A2, B2, C2, D2])} /><path className="lead" d={`M${A2[0]} ${A2[1]} l-16 -12`} /><text x={A2[0] - 18} y={A2[1] - 14} textAnchor="end">{drop === 5 ? 'Heat pump feed' : 'Boiler'}</text></g>
      })()}
      {(() => { const m = Q(b.x, b.y, 0.6); return <g className="tag" transform={`translate(${(m[0] - 22).toFixed(1)} ${m[1].toFixed(1)})`}><path d="M13 1.5 H20" /><rect x="-13" y="-4" width="26" height="11" rx="1" /><text y="4.5" textAnchor="middle">{r.primary} mm</text></g> })()}
      {/* pipe size tags on the mains and the riser */}
      {tagged.map((p, i) => {
        const mid = P((p.a[0] + p.b[0]) / 2, (p.a[1] + p.b[1]) / 2, (p.a[2] + p.b[2]) / 2)
        return <g key={i} className="tag" transform={`translate(${mid[0].toFixed(1)} ${(mid[1] + 13).toFixed(1)})`}><path d="M0 -10 V-4" /><rect x="-13" y="-4" width="26" height="11" rx="1" /><text y="4.5" textAnchor="middle">{p.mm} mm</text></g>
      })}
    </svg>
  )
}
