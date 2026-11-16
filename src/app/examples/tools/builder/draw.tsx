'use client'
// The drawing hand shared by the planner and the job pack: materials rendered at true scale, plan symbols,
// dimension lines, the plan itself and the wall elevations. Everything is drawn in millimetres; `u` is how many
// millimetres one screen pixel covers, so line weights and lettering stay the same size at any zoom.
import { useEffect, useRef, useState, type ReactNode, type SVGProps } from 'react'
import { SLOT, WALL_OF, WALL_T, box, def, dims, mat, slotsFor, span, takeoff, wallOf, zones, type Box, type Material, type Placed, type Scene, type Slot, type Wall, type Warning, type Zone } from '@/lib/sandbox/builder'
import { elevation, pdDepth } from '@/lib/sandbox/builder-pack'

export const INK = '#1B2430', SANG = '#B4472E', PAPER = '#F4EFE4', CARD = '#FBF8F1', WASH = '#9DB4C0', CER = '#FCFBF7', STEEL = '#D5D7D4'
const T = WALL_T
const f1 = (n: number) => Math.round(n * 10) / 10
const fmt = (v: number) => Math.round(v).toLocaleString('en-GB')

export function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const A = p(a), B = p(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
const dark = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 110 }
/** Ink or paper, whichever reads on this colour. */
export const onTone = (hex: string) => (dark(hex) ? '#F4EFE4' : INK)
function rng(seed: number) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const seedOf = (s: string) => [...s].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)

/** Measure an element's width so a drawing knows its own scale. */
export function useWidth<E extends Element>(initial = 640): [React.RefObject<E>, number] {
  const ref = useRef<E>(null), [w, setW] = useState(initial)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(() => { const r = el.getBoundingClientRect().width; if (r > 0) setW(r) })
    ro.observe(el); return () => ro.disconnect()
  }, [])
  return [ref, w]
}

// ------------------------------------------------------------------------------------------ materials at true scale
/** One material as an SVG pattern in millimetres: real tile sizes and bonds, timber grain, stone veining. */
export function MatPattern({ m, id, u }: { m: Material; id: string; u: number }) {
  const j = Math.max(0.7 * u, 0.6), dk = mix(m.hex, dark(m.hex) ? '#FFFFFF' : INK, dark(m.hex) ? 0.22 : 0.3), lt = mix(m.hex, '#FFFFFF', 0.4), r = rng(seedOf(m.id))
  const line = { stroke: dk, strokeWidth: j, fill: 'none' }
  const P = (w: number, h: number, body: ReactNode, rot = 0) => (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse" patternTransform={rot ? `rotate(${rot})` : undefined}><rect width={w} height={h} fill={m.hex} />{body}</pattern>
  )
  switch (m.pattern) {
    case 'metro': return P(150, 150, <path d="M0 0H150M0 75H150M0 0V75M75 75V150" {...line} />)
    case 'grid': return P(600, 600, <path d="M0 0H600M0 0V600" {...line} />)
    case 'slab': return P(600, 600, <><path d="M0 0H600M0 300H600M0 0V300M300 300V600" {...line} />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${r() * 500} ${r() * 600}h${40 + r() * 90}`} stroke={dk} strokeWidth={j * 0.6} opacity=".5" />)}</>)
    case 'check': return P(400, 400, <><rect width="200" height="200" fill={m.hex2} /><rect x="200" y="200" width="200" height="200" fill={m.hex2} /><path d="M0 0H400M0 200H400M0 0V400M200 0V400" stroke={mix(m.hex, INK, 0.35)} strokeWidth={j * 0.7} /></>)
    case 'zellige': return P(400, 400, <>{Array.from({ length: 16 }, (_, i) => <rect key={i} x={(i % 4) * 100} y={Math.floor(i / 4) * 100} width="100" height="100" fill={r() > 0.5 ? '#FFFFFF' : '#000000'} opacity={0.03 + r() * 0.13} />)}<path d="M0 0H400M0 100H400M0 200H400M0 300H400M0 0V400M100 0V400M200 0V400M300 0V400" stroke={lt} strokeWidth={j} opacity=".7" /></>)
    case 'plank': return P(1800, 720, <path d="M0 0H1800M0 180H1800M0 360H1800M0 540H1800M300 0V180M1250 180V360M780 360V540M1560 540V720" {...line} />)
    case 'herringbone': {
      const w = 70, l = 280, out: ReactNode[] = []
      for (let i = -9; i <= 9; i++) for (let k = -2; k <= 3; k++) {
        const x = i * w + k * l, y = i * w - k * l
        if (x > 2 * l || y > 2 * l || x + l + w < 0 || y + l < -l) continue
        out.push(<rect key={`h${i}.${k}`} x={x} y={y} width={l} height={w} {...line} />, <rect key={`v${i}.${k}`} x={x + l} y={y + w - l} width={w} height={l} {...line} />)
      }
      return P(2 * l, 2 * l, out, 45)
    }
    case 'parquet': return P(600, 600, <path d="M0 0H600M0 300H600M0 0V600M300 0V600M0 75H300M0 150H300M0 225H300M375 0V300M450 0V300M525 0V300M75 300V600M150 300V600M225 300V600M300 375H600M300 450H600M300 525H600" {...line} />)
    case 'concrete': return P(1200, 1200, <>{Array.from({ length: 46 }, (_, i) => <circle key={i} cx={r() * 1200} cy={r() * 1200} r={3 + r() * 9} fill={r() > 0.5 ? lt : dk} opacity=".28" />)}<path d="M0 0H1200M0 0V1200" stroke={dk} strokeWidth={j * 0.7} opacity=".6" /></>)
    case 'timber': return P(1200, 300, <>{Array.from({ length: 7 }, (_, i) => { const y = 20 + i * 40 + r() * 14, a = (r() - 0.5) * 30; return <path key={i} d={`M0 ${y}C300 ${y + a} 500 ${y - a} 700 ${y + a * 0.6}S1000 ${y - a * 0.5} 1200 ${y}`} stroke={dk} strokeWidth={j * (0.6 + r() * 0.6)} fill="none" opacity={0.35 + r() * 0.3} /> })}</>)
    case 'vein': return P(1500, 1100, <>{Array.from({ length: 4 }, (_, i) => { let x = r() * 300, y = r() * 1100, d = `M${x} ${y}`; for (let k = 0; k < 7; k++) { x += 150 + r() * 120; y += (r() - 0.45) * 190; d += `L${f1(x)} ${f1(y)}` } return <path key={i} d={d} stroke={m.hex2 ?? dk} strokeWidth={j * (0.8 + r() * 1.6)} fill="none" opacity={0.45 + r() * 0.4} strokeLinejoin="round" /> })}</>)
    case 'speck': return P(240, 240, <>{Array.from({ length: 34 }, (_, i) => <circle key={i} cx={r() * 240} cy={r() * 240} r={1.5 + r() * 3.5} fill={r() > 0.5 ? lt : dk} opacity=".5" />)}</>)
    case 'terrazzo': return P(420, 420, <>{Array.from({ length: 30 }, (_, i) => { const x = r() * 400, y = r() * 400, s = 9 + r() * 22, a = r() * 180; return <polygon key={i} points={`0,${-s} ${s * 0.8},${-s * 0.2} ${s * 0.5},${s * 0.8} ${-s * 0.6},${s * 0.6} ${-s * 0.9},${-s * 0.3}`} transform={`translate(${f1(x)} ${f1(y)}) rotate(${Math.round(a)})`} fill={[m.hex2 ?? dk, '#55664F', '#3C4146', '#D9B5A3'][i % 4]} opacity=".85" /> })}</>)
    case 'brushed': return P(60, 24, <path d="M0 6H60M0 14H38M44 20H60" stroke={lt} strokeWidth={j * 0.7} opacity=".7" />)
    default: return null
  }
}
export const fillOf = (m: Material, uid: string) => (m.pattern === 'flat' ? m.hex : `url(#${uid}-${m.id})`)
export function MatDefs({ mats, uid, u }: { mats: Material[]; uid: string; u: number }) {
  return <>{[...new Map(mats.map((m) => [m.id, m])).values()].filter((m) => m.pattern !== 'flat').map((m) => <MatPattern key={m.id} m={m} id={`${uid}-${m.id}`} u={u} />)}</>
}

/** A square of one material at true scale, for choosing between finishes. */
export function Swatch({ m, mm = 520, uid }: { m: Material; mm?: number; uid: string }) {
  return (
    <svg className="bb-sw" viewBox={`0 0 ${mm} ${mm}`} aria-hidden>
      <defs><MatPattern m={m} id={`${uid}-${m.id}`} u={mm / 44} /></defs>
      <rect width={mm} height={mm} fill={fillOf(m, uid)} />
    </svg>
  )
}

// ------------------------------------------------------------------------------------------ dimension lines and tags
/** A dimension line with oblique ticks and its figure, drawn outside the thing it measures. */
export function Dim({ x1, y1, x2, y2, u, label, cls = '' }: { x1: number; y1: number; x2: number; y2: number; u: number; label?: string; cls?: string }) {
  const len = Math.hypot(x2 - x1, y2 - y1), t = 3.5 * u, vert = Math.abs(x2 - x1) < 1
  const text = label ?? fmt(len)
  const fits = len / u > text.length * 5.6 + 6
  const tick = (x: number, y: number) => `M${x - t} ${y + t}L${x + t} ${y - t}`
  return (
    <g className={`bb-dim ${cls}`}>
      <path d={`M${x1} ${y1}L${x2} ${y2}${tick(x1, y1)}${tick(x2, y2)}`} pathLength={1} />
      {fits ? <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} dy={-3.5 * u} textAnchor="middle" transform={vert ? `rotate(-90 ${(x1 + x2) / 2} ${(y1 + y2) / 2})` : undefined}>{text}</text> : null}
    </g>
  )
}
/** A finishes reference tag (FL-01): the same tag repeats on the plan, the elevations and the schedule. */
export function RefTag({ x, y, u, code, tx, ty }: { x: number; y: number; u: number; code: string; tx?: number; ty?: number }) {
  const w = 34 * u, h = 13 * u
  return (
    <g className="bb-ref">
      {tx !== undefined && ty !== undefined ? <><path d={`M${x} ${y}L${tx} ${ty}`} /><circle cx={tx} cy={ty} r={1.6 * u} /></> : null}
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} />
      <text x={x} y={y} dy={3.2 * u} textAnchor="middle">{code}</text>
    </g>
  )
}

// ------------------------------------------------------------------------------------------ plan symbols
type Fills = { top: string; front: string; metal: string }
const tf = (p: Placed) => { const b = box(p); return p.rot === 0 ? `translate(${b.x} ${b.y})` : p.rot === 180 ? `translate(${b.x + b.w} ${b.y + b.h}) rotate(180)` : p.rot === 90 ? `translate(${b.x + b.w} ${b.y}) rotate(90)` : `translate(${b.x} ${b.y + b.h}) rotate(-90)` }

/** The plan symbol for an item, in its own frame: width along x, depth along y, the wall at y = 0. */
function symbol(kind: string, w: number, d: number, f: Fills): ReactNode {
  const R = (x: number, y: number, ww: number, hh: number, cls: string, fill = 'none', rx = 0) => <rect key={`${x}.${y}.${ww}.${cls}`} x={x} y={y} width={ww} height={hh} className={cls} fill={fill} rx={rx} />
  const rings = (n: number, cy = d / 2) => Array.from({ length: n }, (_, i) => { const cx = (w * (i + 0.5)) / n, y = n > 2 ? cy + (i % 2 ? 110 : -110) : cy; return <g key={i}><circle cx={cx} cy={y} r={85} className="bb-d" /><circle cx={cx} cy={y} r={38} className="bb-d" /></g> })
  const door = <path className="bb-d" d={`M0 ${d - 22}H${w}`} />
  switch (kind) {
    case 'base': return <>{R(0, 0, w, d, 'bb-o', f.top)}{door}</>
    case 'drawer': return <>{R(0, 0, w, d, 'bb-o', f.top)}{door}<path className="bb-d" d={`M${w * 0.3} ${d - 70}H${w * 0.7}M${w * 0.3} ${d - 120}H${w * 0.7}`} /></>
    case 'dw': return <>{R(0, 0, w, d, 'bb-o', f.top)}{door}{R(50, 50, w - 100, d - 130, 'bb-h')}</>
    case 'sink': return <>{R(0, 0, w, d, 'bb-o', f.top)}{door}{R(w * 0.1, 150, w * 0.42, d - 260, 'bb-o', CER, 36)}<circle cx={w * 0.31} cy={d / 2 + 20} r={22} className="bb-d" />
      <path className="bb-d" d={[0, 1, 2, 3, 4].map((i) => `M${w * 0.6 + i * w * 0.07} 170V${d - 130}`).join('')} /><circle cx={w * 0.31} cy={95} r={26} className="bb-o" fill={f.metal} /><path className="bb-o" d={`M${w * 0.31} 95V190`} /></>
    case 'hob': return <>{R(0, 0, w, d, 'bb-o', f.top)}{door}{R(30, 60, w - 60, d - 150, 'bb-o', '#2A2C30', 12)}<g className="bb-inv">{rings(w >= 900 ? 5 : 4, d / 2 - 15)}</g></>
    case 'krun': return <>{R(0, 0, w, d, 'bb-o', f.top)}{door}{Array.from({ length: Math.round(w / 600) - 1 }, (_, i) => <path key={i} className="bb-d" d={`M${((i + 1) * w) / Math.round(w / 600)} ${d - 22}V${d}`} />)}
      {R(w * 0.14, 150, 420, d - 260, 'bb-o', CER, 36)}<circle cx={w * 0.14 + 210} cy={95} r={26} className="bb-o" fill={f.metal} />{R(w * 0.6, 60, 560, d - 150, 'bb-o', '#2A2C30', 12)}</>
    case 'range': return <>{R(0, 0, w, d, 'bb-o', STEEL)}<g>{rings(5, d / 2 - 20)}</g><path className="bb-o" d={`M40 ${d + 30}H${w - 40}`} /></>
    case 'larder': case 'oven': return <>{R(0, 0, w, d, 'bb-o', f.front)}<path className={dark(f.front) ? 'bb-d bb-inv' : 'bb-d'} d={`M0 0L${w} ${d}M${w} 0L0 ${d}`} /></>
    case 'fridge': return <>{R(0, 0, w, d, 'bb-o', STEEL)}<path className="bb-d" d={`M0 0L${w} ${d}M${w} 0L0 ${d}`} /></>
    case 'wallu': case 'boiler': return <>{R(0, 0, w, d, 'bb-h')}<path className="bb-h" d={`M0 ${d}L${w} 0`} /></>
    case 'hood': return <>{R(0, 0, w, d, 'bb-h')}{R(w * 0.2, 0, w * 0.6, d * 0.55, 'bb-h')}</>
    case 'mirror': return <>{R(0, 0, w, d, 'bb-h', WASH)}</>
    case 'island': return <>{R(0, 0, w, d, 'bb-o', f.top)}{R(40, 40, w - 80, d - 80, 'bb-h')}<path className="bb-d" d={`M${w / 2} 40V${d - 40}`} /></>
    case 'bar': return <>{R(0, 0, w, d, 'bb-o', f.top)}{Array.from({ length: Math.round(w / 600) }, (_, i) => <circle key={i} cx={(w * (i + 0.5)) / Math.round(w / 600)} cy={d + 210} r={170} className="bb-d" fill={CARD} />)}</>
    case 'table': { const n = Math.max(2, Math.round(w / 650)); return <>{Array.from({ length: n * 2 }, (_, i) => R((w * ((i % n) + 0.5)) / n - 210, i < n ? -330 : d - 90, 420, 420, 'bb-d', CARD, 60))}{R(0, 0, w, d, 'bb-o', '#EFE6D2', 40)}</> }
    case 'sofa': return <>{R(0, 0, w, d, 'bb-o', '#E9E2D2', 70)}{R(0, 0, w, d * 0.28, 'bb-d', 'none', 60)}{R(0, 0, 170, d, 'bb-d', 'none', 60)}{R(w - 170, 0, 170, d, 'bb-d', 'none', 60)}<path className="bb-d" d={`M${w / 2} ${d * 0.28}V${d}`} /></>
    case 'bath': return <>{R(0, 0, w, d, 'bb-o', CER)}{R(70, 70, w - 140, d - 140, 'bb-o', WASH, (d - 140) / 2.4)}<circle cx={190} cy={d / 2} r={24} className="bb-d" /><circle cx={70} cy={d / 2 - 70} r={22} className="bb-o" fill={f.metal} /><circle cx={70} cy={d / 2 + 70} r={22} className="bb-o" fill={f.metal} /></>
    case 'fsbath': return <>{R(0, 0, w, d, 'bb-o', CER, d / 2)}{R(75, 75, w - 150, d - 150, 'bb-o', WASH, (d - 150) / 2)}<circle cx={w / 2} cy={d / 2} r={24} className="bb-d" /><circle cx={w / 2} cy={-40} r={26} className="bb-o" fill={f.metal} /></>
    case 'tray': return <>{R(0, 0, w, d, 'bb-o', WASH)}<path className="bb-d" d={`M0 0L${w} ${d}M${w} 0L0 ${d}`} /><circle cx={w / 2} cy={d / 2} r={45} className="bb-o" fill={CER} /><path className="bb-g" d={`M0 ${d}H${w}V0`} /><circle cx={60} cy={60} r={30} className="bb-o" fill={f.metal} /></>
    case 'walkin': return <>{R(0, 0, w, d, 'bb-d', WASH)}{R(w * 0.2, 70, w * 0.6, 60, 'bb-o', CER)}<path className="bb-g" d={`M0 ${d}H${w * 0.72}`} /><circle cx={60} cy={d / 2} r={30} className="bb-o" fill={f.metal} /></>
    case 'wc': return <>{R(0, 0, w, 190, 'bb-o', CER, 20)}<ellipse cx={w / 2} cy={190 + (d - 190) / 2} rx={w * 0.46} ry={(d - 190) / 2} className="bb-o" fill={CER} /><ellipse cx={w / 2} cy={190 + (d - 190) / 2 + 20} rx={w * 0.28} ry={(d - 190) / 2 - 60} className="bb-d" /></>
    case 'wcwh': return <>{R(-90, 0, w + 180, 180, 'bb-o', '#EEE7D8')}<ellipse cx={w / 2} cy={180 + (d - 180) / 2} rx={w * 0.48} ry={(d - 180) / 2} className="bb-o" fill={CER} /><ellipse cx={w / 2} cy={180 + (d - 180) / 2 + 20} rx={w * 0.3} ry={(d - 180) / 2 - 60} className="bb-d" />{R(w / 2 - 90, 60, 180, 60, 'bb-d', 'none', 12)}</>
    case 'basin': return <>{R(0, 0, w, d, 'bb-o', CER, 110)}<ellipse cx={w / 2} cy={d * 0.56} rx={w * 0.34} ry={d * 0.28} className="bb-d" /><circle cx={w / 2} cy={70} r={24} className="bb-o" fill={f.metal} /></>
    case 'vanity': return <>{R(0, 0, w, d, 'bb-o', f.front)}<ellipse cx={w / 2} cy={d * 0.54} rx={Math.min(w * 0.36, 250)} ry={d * 0.3} className="bb-o" fill={CER} /><circle cx={w / 2} cy={62} r={24} className="bb-o" fill={f.metal} /></>
    case 'towel': return <>{R(0, 0, w, d, 'bb-o', f.metal)}<path className="bb-d" d={[1, 2, 3, 4].map((i) => `M${(w * i) / 5} 0V${d}`).join('')} /></>
    case 'niche': return <>{R(0, -90, w, 90, 'bb-o', CARD)}{R(0, 0, w, d, 'bb-h')}</>
    case 'fan': return <><circle cx={w / 2} cy={d / 2} r={w / 2} className="bb-h" fill={CARD} /><path className="bb-h" d={`M${w * 0.15} ${d * 0.15}L${w * 0.85} ${d * 0.85}M${w * 0.85} ${d * 0.15}L${w * 0.15} ${d * 0.85}`} /></>
    case 'rooflight': return <>{R(0, 0, w, d, 'bb-h', WASH)}<path className="bb-h" d={`M0 0L${w} ${d}M${w} 0L0 ${d}`} /></>
    case 'lantern': return <>{R(0, 0, w, d, 'bb-h', WASH)}<path className="bb-h" d={`M0 0L${w / 2} ${w / 2}L${w} 0M0 ${d}L${w / 2} ${d - w / 2}L${w} ${d}M${w / 2} ${w / 2}V${d - w / 2}`} /></>
    case 'stud': return <>{R(0, 0, w, d, 'bb-o bb-new', 'url(#bb-newhatch)')}</>
    case 'utility': return <><path className="bb-o bb-new bb-heavy" d={`M${w} 0V${d}H${w * 0.5}M${w * 0.5 - 760} ${d}H0`} /><path className="bb-d" d={`M${w * 0.5} ${d}v-760a760 760 0 0 0 -760 760`} />{R(0, 0, w - 60, 600, 'bb-o', f.top)}<circle cx={380} cy={300} r={210} className="bb-d" /><circle cx={980} cy={300} r={210} className="bb-d" /></>
    case 'cloak': return <><path className="bb-o bb-new bb-heavy" d={`M0 0V${d}h70M${w} 0V${d}h-70`} /><path className="bb-d" d={`M70 ${d}v-760a760 760 0 0 1 760 760`} />{R(w / 2 - 190, 0, 380, 170, 'bb-o', CER, 20)}<ellipse cx={w / 2} cy={390} rx={170} ry={220} className="bb-o" fill={CER} />{R(w - 330, 700, 330, 260, 'bb-o', CER, 60)}</>
    case 'burner': return <>{R(0, 0, w, d, 'bb-h', '#DDD5C3')}{R(w * 0.24, 130, w * 0.52, d * 0.42, 'bb-o', '#3C4146', 20)}<circle cx={w / 2} cy={130 + d * 0.16} r={75} className="bb-d bb-inv" /></>
    case 'manhole': return <>{R(0, 0, w, d, 'bb-o bb-new', CARD)}<path className="bb-d bb-new" d={`M0 0L${w} ${d}M${w} 0L0 ${d}`} /></>
    // openings: y = 0 is the outside face of the wall, y = T the inside face
    case 'door': return <>{R(0, -2, w, T + 4, 'bb-gap')}<path className="bb-o" d={`M0 0V${T}M${w} 0V${T}`} /><path className="bb-o bb-heavy" d={`M0 ${T}V${T + w}`} /><path className="bb-d" d={`M0 ${T + w}A${w} ${w} 0 0 0 ${w} ${T}`} /></>
    case 'window': case 'xwindow': return <>{R(0, -2, w, T + 4, 'bb-gap')}{R(0, 0, w, T, kind === 'xwindow' ? 'bb-o bb-new' : 'bb-o', WASH)}<path className="bb-d" d={`M0 ${T / 2}H${w}`} /></>
    case 'bifold': { const n = Math.max(3, Math.round(w / 850)), k = 210; return <>{R(0, -2, w, T + 4, 'bb-gap')}<path className="bb-o bb-new" d={`M0 0V${T}M${w} 0V${T}`} /><path className="bb-d bb-new" d={`M0 ${T / 2}H${w}`} /><path className="bb-d" d={Array.from({ length: n - 1 }, (_, i) => `M${((i + 1) * w) / n} ${T * 0.2}V${T * 0.8}`).join('')} /><path className="bb-o bb-new bb-heavy" d={`M${w} ${T * 0.3}` + Array.from({ length: 4 }, (_, i) => `l${-k * 0.45} ${i % 2 ? k : -k}`).join('')} /></> }
    case 'slider': return <>{R(0, -2, w, T + 4, 'bb-gap')}{R(0, 0, w, T, 'bb-o bb-new', 'none')}<path className="bb-o bb-new bb-heavy" d={`M0 ${T * 0.36}H${w * 0.54}M${w * 0.46} ${T * 0.64}H${w}`} /><path className="bb-d" d={`M${w * 0.6} ${T * 0.36}h${w * 0.2}m-${w * 0.05} -30l${w * 0.05} 30`} /></>
    case 'french': return <>{R(0, -2, w, T + 4, 'bb-gap')}<path className="bb-o bb-new" d={`M0 0V${T}M${w} 0V${T}`} /><path className="bb-o bb-new bb-heavy" d={`M0 0V${-w / 2}M${w} 0V${-w / 2}`} /><path className="bb-d" d={`M0 ${-w / 2}A${w / 2} ${w / 2} 0 0 1 ${w / 2} 0A${w / 2} ${w / 2} 0 0 1 ${w} ${-w / 2}`} /></>
    case 'knock': return <>{R(0, -2, w, T + 4, 'bb-gap')}<path className="bb-h" d={`M0 0H${w}M0 ${T}H${w}`} /><path className="bb-o bb-new" d={`M0 0V${T}M${w} 0V${T}`} /><path className="bb-steel" d={`M-150 ${T / 2}H${w + 150}`} /></>
    default: return R(0, 0, w, d, 'bb-o', CARD)
  }
}

const LABELLED = ['larder', 'oven', 'fridge', 'dw', 'island', 'range', 'utility', 'cloak', 'lantern', 'rooflight', 'stud', 'manhole', 'boiler', 'table', 'sofa']
const ORDER = ['ground', 'floor', 'wall', 'opening', 'high', 'ceiling']
export const fillsFor = (s: Scene, uid: string): Fills => ({ top: fillOf(mat(s.mats.worktop), uid), front: fillOf(mat(s.mats.fronts), uid), metal: s.job === 'extension' ? STEEL : mat(s.mats.metal).hex })

export function ItemSym({ p, f }: { p: Placed; f: Fills }) {
  const [w, d] = dims(p)
  return <g transform={tf(p)}>{symbol(p.kind, w, d, f)}</g>
}

/** The runs of dimensions along one wall: where each unit starts and stops. */
export function chain(s: Scene, wall: Wall): number[] {
  const len = wall === 'N' || wall === 'S' ? s.length : s.width
  const its = s.items.filter((p) => { const d = def(p.kind); return d.mount === 'wall' && wallOf(s, p) === wall })
  const use = its.length ? its : s.items.filter((p) => def(p.kind).mount === 'opening' && WALL_OF[p.rot] === wall)
  if (!use.length) return []
  return [...new Set([0, len, ...use.flatMap((p) => span(p))])].sort((a, b) => a - b)
}

/** Fit a room into a drawing `px` wide with `m` pixels of margin for dimensions: the view box and its scale. */
export function fit(s: Scene, px: number, m = 58) {
  const vw = (s.length + 2 * T) / Math.max(0.3, 1 - (2 * m) / px), u = vw / px, mg = m * u
  return { u, x: -T - mg, y: -T - mg, w: vw, h: s.width + 2 * T + 2 * mg }
}

/** A free patch of floor for the floor tag: the grid point furthest from every fixture and wall. */
function floorSpot(s: Scene): [number, number] {
  const boxes = s.items.filter((p) => ['wall', 'floor', 'ceiling'].includes(def(p.kind).mount)).map(box)
  let best: [number, number] = [s.length / 2, s.width / 2], score = -1
  for (let x = 300; x < s.length; x += 150) for (let y = 300; y < s.width; y += 150) {
    const d = Math.min(x, y, s.length - x, s.width - y, ...boxes.map((b) => Math.hypot(Math.max(b.x - x, 0, x - b.x - b.w), Math.max(b.y - y, 0, y - b.y - b.h))))
    if (d > score) { score = d; best = [x, y] }
  }
  return best
}

export type PlanProps = {
  s: Scene; u: number; uid: string
  dims?: boolean; tags?: boolean; labels?: boolean; draw?: boolean
  item?: (p: Placed) => SVGProps<SVGGElement>      // extra props for each item group: the planner makes them draggable
  selected?: string | null; flagged?: string[]
  children?: ReactNode
}

/** The floor plan, to scale: hatched walls, the floor finish, every item as a plan symbol, dimension chains and tags. */
export function PlanArt({ s, u, uid, dims: showDims = true, tags = false, labels = true, draw = false, item, selected, flagged = [], children }: PlanProps) {
  const L = s.length, W = s.width, f = fillsFor(s, uid), ext = s.job === 'extension'
  const mats = slotsFor(s).map((slot) => mat(s.mats[slot]))
  const items = [...s.items].sort((a, b) => ORDER.indexOf(def(a.kind).mount) - ORDER.indexOf(def(b.kind).mount))
  const o1 = T + 15 * u, o2 = T + 36 * u
  const chains = showDims ? (['N', 'S', 'W', 'E'] as Wall[]).map((w) => [w, chain(s, w)] as const).filter(([w, c]) => c.length > 2 && !(ext && (w === 'E' || w === 'N'))) : []
  const hasS = chains.some(([w]) => w === 'S'), hasE = chains.some(([w]) => w === 'E')
  const q = tags ? takeoff(s) : null
  const tagList: { code: string; x: number; y: number; tx?: number; ty?: number }[] = []
  if (tags && q) {
    const slots = slotsFor(s), [fx, fy] = floorSpot(s)
    tagList.push({ code: SLOT.floor.ref, x: fx, y: fy })
    const c = (p: Placed) => { const b = box(p); return [b.x + b.w / 2, b.y + b.h / 2] }
    const out = (p: Placed, k: number, t = 0): [number, number] => { const [cx, cy] = c(p), b = box(p); return p.rot === 0 ? [cx + t * b.w, b.y + b.h + k] : p.rot === 180 ? [cx + t * b.w, b.y - k] : p.rot === 90 ? [b.x - k, cy + t * b.h] : [b.x + b.w + k, cy + t * b.h] }
    const used: Placed[] = []
    const pick = (ok: (p: Placed) => boolean) => { const p = s.items.filter((x) => ok(x) && !used.includes(x)).sort((a, b) => dims(b)[0] - dims(a)[0])[0] ?? s.items.find(ok); if (p) used.push(p); return p }
    const top = slots.includes('worktop') ? pick((p) => !!def(p.kind).top && !def(p.kind).water && !def(p.kind).cooks) ?? pick((p) => !!def(p.kind).top) : undefined
    if (top) { const [x, y] = out(top, 20 * u, -0.22), [tx, ty] = out(top, -dims(top)[1] / 2, -0.22); tagList.push({ code: SLOT.worktop.ref, x, y, tx, ty }) }
    const fr = slots.includes('fronts') ? pick((p) => !!def(p.kind).front && (s.job !== 'kitchen' || !!def(p.kind).tall || p.kind === 'wallu')) ?? pick((p) => !!def(p.kind).front) : undefined
    if (fr) { const t = fr === top ? 0.22 : 0, [x, y] = out(fr, 20 * u, t), [tx, ty] = out(fr, 0, t); tagList.push({ code: SLOT.fronts.ref, x, y, tx, ty }) }
    const tl = slots.includes('tile') && q.tile ? pick((p) => !!wallOf(s, p) && (s.job === 'bathroom' ? !!def(p.kind).wet : !!def(p.kind).top)) : undefined
    if (tl) { const b = box(tl), [cx, cy] = c(tl); const at: [number, number] = tl.rot === 0 ? [cx + b.w * 0.3, 0] : tl.rot === 180 ? [cx + b.w * 0.3, W] : tl.rot === 90 ? [L, cy + b.h * 0.3] : [0, cy + b.h * 0.3]; const [x, y] = [at[0] + (tl.rot === 90 ? 26 * u : tl.rot === 270 ? -26 * u : 0), at[1] + (tl.rot === 0 ? -22 * u : tl.rot === 180 ? 22 * u : 0)]; tagList.push({ code: SLOT.tile.ref, x, y, tx: at[0], ty: at[1] }) }
    const mt = ext ? pick((p) => !!def(p.kind).glazed && def(p.kind).mount === 'opening') : s.items.find((p) => ['sink', 'basin', 'vanity', 'bath'].includes(p.kind)) ?? pick((p) => !!def(p.kind).water)
    if (mt) { const [x, y] = out(mt, (ext ? 24 : 20) * u, ext ? 0.32 : 0), [tx, ty] = ext ? out(mt, -T / 2, 0.32) : c(mt); tagList.push({ code: SLOT.metal.ref, x, y, tx, ty }) }
    // the paint tag sits in the widest clear stretch of wall that has open floor in front of it
    const solids = s.items.filter((p) => ['wall', 'floor'].includes(def(p.kind).mount)).map(box), k = 24 * u
    let pt = [L / 2, W, L / 2, W - k], bestGap = -1
    for (const wall of ['S', 'E', 'W', 'N'] as Wall[]) {
      const len = wall === 'N' || wall === 'S' ? L : W
      const cuts = [0, ...s.items.filter((p) => (def(p.kind).mount === 'opening' ? WALL_OF[p.rot] : wallOf(s, p)) === wall).map((p) => span(p)).sort((a, b) => a[0] - b[0]).flat(), len]
      for (let i = 0; i < cuts.length; i += 2) {
        const a = (cuts[i] + cuts[i + 1]) / 2, gap = cuts[i + 1] - cuts[i]
        const c = wall === 'N' ? [a, 0, a, k] : wall === 'S' ? [a, W, a, W - k] : wall === 'W' ? [0, a, k + 8 * u, a] : [L, a, L - k - 8 * u, a]
        const blocked = solids.some((bx) => c[2] > bx.x - 18 * u && c[2] < bx.x + bx.w + 18 * u && c[3] > bx.y - 8 * u && c[3] < bx.y + bx.h + 8 * u)
        if (gap - (blocked ? 1e6 : 0) > bestGap) { bestGap = gap - (blocked ? 1e6 : 0); pt = c }
      }
    }
    tagList.push({ code: SLOT.walls.ref, x: pt[2], y: pt[3], tx: pt[0], ty: pt[1] })
  }
  return (
    <>
      <defs>
        <pattern id="bb-wallhatch" width={5 * u} height={5 * u} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={5 * u} height={5 * u} fill={CARD} /><path d={`M0 0V${5 * u}`} stroke={INK} strokeWidth={0.7 * u} /></pattern>
        <pattern id="bb-newhatch" width={5 * u} height={5 * u} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={5 * u} height={5 * u} fill={CARD} /><path d={`M0 0V${5 * u}`} stroke={SANG} strokeWidth={0.8 * u} /></pattern>
        <pattern id="bb-oldhatch" width={4 * u} height={4 * u} patternUnits="userSpaceOnUse"><rect width={4 * u} height={4 * u} fill="#DAD3C4" /></pattern>
        <MatDefs mats={mats} uid={uid} u={u} />
      </defs>
      <g className={draw ? 'bb-drawn' : undefined}>
        {ext ? <g className="bb-lay" style={{ ['--i' as string]: 0 }}><rect x={-T - 9 * u} y={-T - 30 * u} width={L + 2 * T + 18 * u} height={30 * u} fill="url(#bb-oldhatch)" opacity=".5" /><path className="bb-h" d={`M${-T - 9 * u} ${-T}V${-T - 30 * u}M${L + T + 9 * u} ${-T}V${-T - 30 * u}`} /><text className="bb-lab" x={L / 2} y={-T - 12 * u} textAnchor="middle">Existing house</text></g> : null}
        <rect className="bb-floor bb-lay" style={{ ['--i' as string]: 1 }} x={0} y={0} width={L} height={W} fill={fillOf(mat(s.mats.floor), uid)} />
        {ext ? <>
          <path className="bb-wall bb-new bb-lay" style={{ ['--i' as string]: 0 }} fillRule="evenodd" fill="url(#bb-newhatch)" pathLength={1} d={`M${-T} 0V${W + T}H${L + T}V0H${L}V${W}H0V0Z`} />
          <path className="bb-wall bb-lay" style={{ ['--i' as string]: 0 }} fill="url(#bb-oldhatch)" pathLength={1} d={`M${-T - 9 * u} ${-T}H${L + T + 9 * u}V0H${-T - 9 * u}Z`} />
        </> : <path className="bb-wall bb-lay" style={{ ['--i' as string]: 0 }} fillRule="evenodd" fill="url(#bb-wallhatch)" pathLength={1} d={`M${-T} ${-T}H${L + T}V${W + T}H${-T}ZM0 0V${W}H${L}V0Z`} />}
        {s.svc ? (() => { const w = s.svc.wall, a = s.svc.at, k = T / 2; const [x, y] = w === 'N' ? [a, -k] : w === 'S' ? [a, W + k] : w === 'W' ? [-k, a] : [L + k, a]; const r = Math.min(T * 0.42, 5 * u); return <g className="bb-svc bb-lay" style={{ ['--i' as string]: 2 }}><circle cx={x} cy={y} r={r} /><path d={`M${x - r * 0.7} ${y - r * 0.7}L${x + r * 0.7} ${y + r * 0.7}M${x + r * 0.7} ${y - r * 0.7}L${x - r * 0.7} ${y + r * 0.7}`} /></g> })() : null}
        {items.map((p, i) => {
          const d = def(p.kind), extra = item?.(p) ?? {}
          return (
            <g key={p.id} {...extra} className={`bb-item bb-lay bb-m-${d.mount}${selected === p.id ? ' sel' : ''}${flagged.includes(p.id) ? ' flag' : ''} ${extra.className ?? ''}`} style={{ ['--i' as string]: 3 + i * 0.5 }}>
              <ItemSym p={p} f={f} />
            </g>
          )
        })}
        {labels ? <g className="bb-lay" style={{ ['--i' as string]: 3 + items.length * 0.5 }}>{items.map((p) => {
          const d = def(p.kind), b = box(p)
          if (d.mount === 'opening') {
            if (!['knock', 'bifold', 'slider', 'french'].includes(p.kind)) return null
            const wall = WALL_OF[p.rot], side = wall === 'W' || wall === 'E'
            const x = side ? (wall === 'W' ? 12 * u : L - 6 * u) : b.x + b.w / 2, y = wall === 'N' ? 13 * u : wall === 'S' ? W - 7 * u : b.y + b.h / 2
            return <text key={p.id} className="bb-lab bb-newt" x={x} y={y} textAnchor="middle" transform={side ? `rotate(-90 ${x} ${y})` : undefined}>{d.tag} {fmt(dims(p)[0])}</text>
          }
          if (!LABELLED.includes(p.kind) || b.w / u < d.tag.length * 5.4 + 4 || b.h / u < 13) return null
          const fill = d.top ? mat(s.mats.worktop).hex : d.front ? mat(s.mats.fronts).hex : null
          const dy = p.kind === 'utility' ? (p.rot === 0 ? b.h * 0.2 : p.rot === 180 ? -b.h * 0.2 : 0) : p.kind === 'cloak' ? (p.rot === 0 ? b.h * 0.3 : p.rot === 180 ? -b.h * 0.3 : 0) : 0
          const dx = p.kind === 'utility' || p.kind === 'cloak' ? (p.rot === 90 ? -b.w * 0.25 : p.rot === 270 ? b.w * 0.25 : 0) : 0
          return <text key={p.id} className={`bb-lab${fill && dark(fill) ? ' inv' : ''}${d.mount === 'high' || d.mount === 'ceiling' ? ' soft' : ''}`} x={b.x + b.w / 2 + dx} y={b.y + b.h / 2 + dy + 3.2 * u} textAnchor="middle">{d.tag}</text>
        })}</g> : null}
        {showDims ? <g className="bb-lay" style={{ ['--i' as string]: 5 + items.length * 0.5 }}>
          {chains.map(([w, c]) => c.slice(1).map((v, i) => { const a = c[i]; return w === 'N' ? <Dim key={w + i} u={u} x1={a} y1={-o1} x2={v} y2={-o1} /> : w === 'S' ? <Dim key={w + i} u={u} x1={a} y1={W + o1} x2={v} y2={W + o1} /> : w === 'W' ? <Dim key={w + i} u={u} x1={-o1} y1={v} x2={-o1} y2={a} /> : <Dim key={w + i} u={u} x1={L + o1} y1={v} x2={L + o1} y2={a} /> }))}
          <Dim u={u} x1={0} y1={W + (hasS ? o2 : o1)} x2={L} y2={W + (hasS ? o2 : o1)} cls="over" />
          {ext ? null : <Dim u={u} x1={L + (hasE ? o2 : o1)} y1={W} x2={L + (hasE ? o2 : o1)} y2={0} cls="over" />}
        </g> : null}
        {tagList.length ? <g className="bb-lay" style={{ ['--i' as string]: 7 + items.length * 0.5 }}>{tagList.map((t) => <RefTag key={t.code} u={u} {...t} />)}</g> : null}
      </g>
      {children}
    </>
  )
}

/** The permitted development gauge for a rear extension: the depth measured against the limits, beside the plan. */
export function PdGauge({ s, u }: { s: Scene; u: number }) {
  const lim = pdDepth(s.site.house), W = s.width, x = s.length + T + 16 * u, bw = 6 * u
  const end = Math.max(W, lim.pd * 1000) + 26 * u
  const band = (a: number, b: number, cls: string) => (Math.min(b, end) > a ? <rect x={x} y={a} width={bw} height={Math.min(b, end) - a} className={cls} /> : null)
  const state = W <= lim.pd * 1000 ? 'ok' : W <= lim.prior * 1000 ? 'prior' : 'plan'
  const near = (v: number) => Math.abs(W - v * 1000) < 13 * u
  return (
    <g className="bb-pd" data-state={state}>
      {band(0, lim.pd * 1000, 'ok')}{band(lim.pd * 1000, lim.prior * 1000, 'prior')}{band(lim.prior * 1000, 1e6, 'plan')}
      {[lim.pd, lim.prior].filter((v) => v * 1000 <= end).map((v) => <g key={v}><path d={`M${x - 2 * u} ${v * 1000}H${x + bw + 4 * u}`} />{near(v) ? null : <text x={x + bw + 7 * u} y={v * 1000 + 3 * u}>{v} m</text>}</g>)}
      <path className="mark" d={`M${x - 2 * u} ${W}l${-7 * u} ${-4.5 * u}v${9 * u}z`} />
      <text className="depth" x={x + bw + 7 * u} y={W + 3.5 * u}>{fmt(W)}</text>
      <text className="cap" x={x} y={-5 * u}>Depth</text>
    </g>
  )
}

/** Zone overlay for a clear space, amber when something is in it. */
export function ZoneRect({ z, bad, u }: { z: Zone | Box; bad?: boolean; u: number }) {
  return <rect className={`bb-zone${bad ? ' bad' : ''}`} x={z.x} y={z.y} width={Math.max(0, z.w)} height={Math.max(0, z.h)} rx={2 * u} />
}
/** Numbered markers for the design notes, sitting on the first item each note is about. */
export function NoteMarks({ s, warnings, u }: { s: Scene; warnings: Warning[]; u: number }) {
  const seen = new Map<string, number>()
  return <>{warnings.map((w, i) => {
    const p = s.items.find((x) => x.id === w.ids[0]); if (!p) return null
    const b = box(p), k = seen.get(p.id) ?? 0; seen.set(p.id, k + 1)
    const x = Math.min(s.length - 8 * u, Math.max(8 * u, b.x + b.w - 2 * u - k * 15 * u)), y = Math.min(s.width - 8 * u, Math.max(8 * u, b.y + 2 * u)), r = 7 * u
    return <g key={i} className={`bb-mark ${w.level}`}>{w.level === 'warn' ? <path d={`M${x} ${y - r * 1.15}L${x + r * 1.1} ${y + r * 0.8}H${x - r * 1.1}Z`} /> : <circle cx={x} cy={y} r={r} />}<text x={x} y={y + (w.level === 'warn' ? 4.2 : 3.2) * u} textAnchor="middle">{i + 1}</text></g>
  })}</>
}
/** The bathroom wiring zones: zone 1 is the bath or shower itself, zone 2 reaches 600 mm beyond it. */
export function ElecZones({ s, u }: { s: Scene; u: number }) {
  const wet = s.items.filter((p) => def(p.kind).wet).map(box)
  const clip = (b: Box) => { const x = Math.max(0, b.x), y = Math.max(0, b.y); return { x, y, w: Math.min(s.length, b.x + b.w) - x, h: Math.min(s.width, b.y + b.h) - y } }
  return <g className="bb-ez">{wet.map((b, i) => { const z2 = clip({ x: b.x - 600, y: b.y - 600, w: b.w + 1200, h: b.h + 1200 }); return <g key={i}><rect className="z2" {...{ x: z2.x, y: z2.y, width: z2.w, height: z2.h }} /><rect className="z1" x={b.x} y={b.y} width={b.w} height={b.h} /><text x={b.x + b.w - 5 * u} y={b.y + b.h - 5 * u} textAnchor="end">Zone 1</text><text x={z2.x + z2.w - 5 * u} y={z2.y + z2.h - 5 * u} textAnchor="end">Zone 2</text></g> })}</g>
}
export function Triangle({ s, u }: { s: Scene; u: number }) {
  const c = (k: (p: Placed) => boolean) => { const p = s.items.find(k); if (!p) return null; const b = box(p); return [b.x + b.w / 2, b.y + b.h / 2] }
  const a = c((p) => p.kind === 'sink'), b = c((p) => !!def(p.kind).cooks), f = c((p) => p.kind === 'fridge')
  if (!a || !b || !f) return null
  const sum = Math.hypot(a[0] - b[0], a[1] - b[1]) + Math.hypot(b[0] - f[0], b[1] - f[1]) + Math.hypot(f[0] - a[0], f[1] - a[1])
  return <g className="bb-tri"><path d={`M${a}L${b}L${f}Z`} /><text x={(a[0] + b[0] + f[0]) / 3} y={(a[1] + b[1] + f[1]) / 3 + 3 * u} textAnchor="middle">{(sum / 1000).toFixed(1)} m walk</text></g>
}
export { zones }

// ------------------------------------------------------------------------------------------ wall elevations
function elevSym(kind: string, w: number, h: number, f: Fills & { tile: string }, u: number): ReactNode {
  const R = (x: number, y: number, ww: number, hh: number, cls: string, fill = 'none', rx = 0) => <rect key={`${x}.${y}.${ww}.${cls}`} x={x} y={y} width={ww} height={hh} className={cls} fill={fill} rx={rx} />
  const n = Math.max(1, Math.round(w / 600)), mw = w / n
  const handle = (x: number, y: number, vert = false) => <path key={`${x}.${y}`} d={vert ? `M${x} ${y}v150` : `M${x - 75} ${y}h150`} stroke={f.metal} strokeWidth={Math.max(18, 2.2 * u)} strokeLinecap="round" />
  const hOut = (x: number, y: number, vert = false) => <path key={`o${x}.${y}`} className="bb-d" d={vert ? `M${x} ${y}v150` : `M${x - 75} ${y}h150`} strokeWidth={Math.max(18, 2.2 * u) + 1.2 * u} strokeLinecap="round" />
  const H = (x: number, y: number, vert = false) => <g key={`g${x}.${y}`}>{hOut(x, y, vert)}{handle(x, y, vert)}</g>
  // y runs down from the top of the item (0) to its base (h)
  const carcass = (drawers: boolean) => <>{R(0, 0, w, h, 'bb-o', f.front)}{R(0, h - 150, w, 150, 'bb-o', mix(INK, PAPER, 0.25))}{Array.from({ length: n }, (_, i) => <g key={i}>{i ? <path className="bb-d" d={`M${i * mw} 0V${h - 150}`} /> : null}{drawers ? <><path className="bb-d" d={`M${i * mw} ${(h - 150) / 3}h${mw}M${i * mw} ${((h - 150) * 2) / 3}h${mw}`} />{[0, 1, 2].map((k) => H(i * mw + mw / 2, ((h - 150) * (k + 0.5)) / 3 - 60))}</> : H(i * mw + mw / 2, 70)}</g>)}</>
  const slab = <rect x={-10} y={-40} width={w + 20} height={40} className="bb-o" fill={f.top} />
  switch (kind) {
    case 'base': case 'dw': case 'island': return <>{carcass(false)}{slab}</>
    case 'drawer': return <>{carcass(true)}{slab}</>
    case 'sink': return <>{carcass(false)}{slab}<path d={`M${w * 0.31} -40v-230a70 70 0 0 1 140 0v40`} fill="none" stroke={f.metal} strokeWidth={Math.max(24, 2.6 * u)} strokeLinecap="round" /><path className="bb-d" d={`M${w * 0.31} -40v-230a70 70 0 0 1 140 0v40`} /></>
    case 'hob': return <>{carcass(false)}{slab}{R(30, -55, w - 60, 15, 'bb-o', '#2A2C30')}</>
    case 'krun': return <>{carcass(false)}{slab}{R(w * 0.6, -55, 560, 15, 'bb-o', '#2A2C30')}<path d={`M${w * 0.14 + 210} -40v-230a70 70 0 0 1 140 0v40`} fill="none" stroke={STEEL} strokeWidth={Math.max(24, 2.6 * u)} strokeLinecap="round" /></>
    case 'bar': return <>{R(0, 40, 60, h - 40, 'bb-o', f.front)}{R(w - 60, 40, 60, h - 40, 'bb-o', f.front)}{R(-10, 0, w + 20, 40, 'bb-o', f.top)}</>
    case 'range': return <>{R(0, 0, w, h, 'bb-o', STEEL)}{R(0, h - 100, w, 100, 'bb-o', '#3C4146')}{R(40, 170, w * 0.55 - 60, h - 320, 'bb-o', '#2A2C30', 16)}{R(w * 0.55 + 20, 170, w * 0.45 - 60, h - 320, 'bb-o', '#2A2C30', 16)}{Array.from({ length: 6 }, (_, i) => <circle key={i} cx={(w * (i + 0.7)) / 6.4} cy={85} r={30} className="bb-o" fill={CARD} />)}</>
    case 'larder': return <>{R(0, 0, w, h, 'bb-o', f.front)}{R(0, h - 150, w, 150, 'bb-o', mix(INK, PAPER, 0.25))}<path className="bb-d" d={`M0 ${h - 870}H${w}`} />{H(w - 90, h - 870 - 230, true)}{H(w - 90, h - 870 + 80, true)}</>
    case 'oven': return <>{R(0, 0, w, h, 'bb-o', f.front)}{R(0, h - 150, w, 150, 'bb-o', mix(INK, PAPER, 0.25))}{R(0, h - 1460, w, 590, 'bb-o', '#2A2C30')}{R(60, h - 1330, w - 120, 380, 'bb-d bb-inv', 'none', 14)}<path className="bb-d bb-inv" d={`M70 ${h - 1400}H${w - 70}`} />{H(w / 2, h - 600)}{H(w / 2, h - 1560)}</>
    case 'fridge': return <>{R(0, 0, w, h, 'bb-o', STEEL)}<path className="bb-d" d={`M0 ${h * 0.58}H${w}`} /><path className="bb-o" d={`M60 ${h * 0.58 - 300}v220M60 ${h * 0.58 + 80}v220`} /></>
    case 'wallu': case 'boiler': return <>{R(0, 0, w, h, 'bb-o', f.front)}{Array.from({ length: n }, (_, i) => <g key={i}>{i ? <path className="bb-d" d={`M${i * mw} 0V${h}`} /> : null}{H(i * mw + mw / 2, h - 70)}</g>)}{kind === 'boiler' ? <path className="bb-h" d={`M60 60H${w - 60}V${h - 120}H60Z`} /> : null}</>
    case 'hood': return <><path className="bb-o" fill={STEEL} d={`M${w * 0.3} 0H${w * 0.7}V${h - 110}L${w} ${h - 40}V${h}H0V${h - 40}L${w * 0.3} ${h - 110}Z`} /></>
    case 'bath': return <>{R(0, 0, w, h, 'bb-o', CER)}<path className="bb-d" d={`M0 40H${w}`} /><path d={`M110 0v-120h90`} fill="none" stroke={f.metal} strokeWidth={Math.max(22, 2.4 * u)} strokeLinecap="round" /></>
    case 'fsbath': return <path className="bb-o" fill={CER} d={`M0 0H${w}C${w} ${h * 0.7} ${w * 0.9} ${h} ${w * 0.8} ${h}H${w * 0.2}C${w * 0.1} ${h} 0 ${h * 0.7} 0 0Z`} />
    case 'tray': return <>{R(0, 0, w, h, 'bb-o', WASH)}{R(0, h - 40, w, 40, 'bb-o', CER)}<path className="bb-d" d={`M${w / 2} 0V${h - 40}`} /><path d={`M110 ${h - 1250}V180h160`} fill="none" stroke={f.metal} strokeWidth={Math.max(20, 2.2 * u)} strokeLinecap="round" /></>
    case 'walkin': return <>{R(0, 0, w * 0.72, h, 'bb-o', WASH)}<path className="bb-d" d={`M0 ${h}H${w}`} /><path d={`M${w * 0.86} ${h - 1150}V200h-180`} fill="none" stroke={f.metal} strokeWidth={Math.max(20, 2.2 * u)} strokeLinecap="round" />{R(w * 0.86 - 280, 170, 200, 40, 'bb-o', f.metal, 10)}</>
    case 'wc': return <>{R(0, 0, w, 380, 'bb-o', CER, 24)}<path className="bb-o" fill={CER} d={`M${w * 0.08} 380H${w * 0.92}C${w * 0.92} 620 ${w * 0.78} ${h} ${w * 0.7} ${h}H${w * 0.3}C${w * 0.22} ${h} ${w * 0.08} 620 ${w * 0.08} 380Z`} />{R(w / 2 - 40, 60, 80, 36, 'bb-o', f.metal, 10)}</>
    case 'wcwh': return <>{R(-90, 0, w + 180, h, 'bb-o', f.tile)}{R(w / 2 - 120, 130, 240, 150, 'bb-o', f.metal, 14)}<path className="bb-o" fill={CER} d={`M0 ${h - 470}H${w}C${w} ${h - 200} ${w * 0.8} ${h - 130} ${w / 2} ${h - 130}S0 ${h - 200} 0 ${h - 470}Z`} /></>
    case 'basin': return <>{R(w * 0.36, 150, w * 0.28, h - 150, 'bb-o', CER)}<path className="bb-o" fill={CER} d={`M0 0H${w}C${w} 110 ${w * 0.8} 170 ${w * 0.7} 170H${w * 0.3}C${w * 0.2} 170 0 110 0 0Z`} /><path d={`M${w / 2} 0v-110h70`} fill="none" stroke={f.metal} strokeWidth={Math.max(20, 2.2 * u)} strokeLinecap="round" /></>
    case 'vanity': return <>{R(0, 60, w, h - 260, 'bb-o', f.front)}{Array.from({ length: n }, (_, i) => <g key={i}>{i ? <path className="bb-d" d={`M${i * mw} 60V${h - 200}`} /> : null}{H(i * mw + mw / 2, 130)}</g>)}{R(-10, 0, w + 20, 60, 'bb-o', CER, 8)}<path d={`M${w / 2} 0v-130h80`} fill="none" stroke={f.metal} strokeWidth={Math.max(20, 2.2 * u)} strokeLinecap="round" /></>
    case 'towel': return <>{R(0, 0, w, h, 'bb-o', 'none', 20)}{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${50 + i * 100}h${w}`} stroke={f.metal} strokeWidth={Math.max(18, 2 * u)} />)}{R(0, 0, w, h, 'bb-o', 'none', 20)}</>
    case 'mirror': return <>{R(0, 0, w, h, 'bb-o', mix(WASH, '#FFFFFF', 0.45))}<path className="bb-d" d={`M${w * 0.2} ${h * 0.5}L${w * 0.5} ${h * 0.15}M${w * 0.35} ${h * 0.75}L${w * 0.8} ${h * 0.22}`} />{n > 1 ? <path className="bb-d" d={`M${w / 2} 0V${h}`} /> : null}</>
    case 'niche': return <>{R(0, 0, w, h, 'bb-o', mix(INK, PAPER, 0.82))}<path className="bb-d" d={`M0 ${h / 2}H${w}`} /></>
    case 'door': return <>{R(0, 0, w, h, 'bb-o', CARD)}{R(70, 70, w - 140, h * 0.42, 'bb-d')}{R(70, h * 0.42 + 140, w - 140, h * 0.58 - 210, 'bb-d')}<circle cx={w - 70} cy={h - 1000} r={28} className="bb-o" fill={f.metal} /></>
    case 'window': case 'xwindow': return <>{R(0, 0, w, h, 'bb-o', mix(WASH, '#FFFFFF', 0.35))}{R(45, 45, w - 90, h - 90, 'bb-d')}{w > 800 ? <path className="bb-o" d={`M${w / 2} 0V${h}`} /> : null}<path className="bb-o" d={`M-40 ${h}H${w + 40}`} /></>
    case 'bifold': case 'slider': case 'french': { const k = kind === 'french' ? 2 : kind === 'slider' ? (w > 3200 ? 3 : 2) : Math.max(3, Math.round(w / 850)); return <>{R(0, 0, w, h, 'bb-o', mix(WASH, '#FFFFFF', 0.35))}{Array.from({ length: k }, (_, i) => R((i * w) / k + 30, 30, w / k - 60, h - 60, 'bb-o', 'none'))}{Array.from({ length: k }, (_, i) => <path key={i} className="bb-d" d={kind === 'slider' ? `M${((i + 0.35) * w) / k} ${h / 2}h${(w / k) * 0.3}` : `M${(i * w) / k + 30} 30L${((i + (i % 2 ? 0 : 1)) * w) / k + (i % 2 ? 30 : -30)} ${h / 2}L${(i * w) / k + 30} ${h - 30}`} />)}<rect x={0} y={0} width={w} height={h} fill="none" stroke={f.metal} strokeWidth={Math.max(30, 3 * u)} /></> }
    case 'knock': return <>{R(0, 0, w, h, 'bb-h', mix(INK, PAPER, 0.9))}<path className="bb-steel" d={`M-150 -110H${w + 150}`} /><path className="bb-o bb-new" d={`M-150 -200H${w + 150}V-20H-150Z`} /></>
    case 'utility': case 'cloak': return <>{R(0, 0, w, h, 'bb-o bb-new', CARD)}{R(w / 2 - 381, h - 2040, 762, 2040, 'bb-o', CARD)}<circle cx={w / 2 + 300} cy={h - 1000} r={28} className="bb-o" /></>
    case 'burner': return <>{R(w * 0.24, h - 700, w * 0.52, 620, 'bb-o', '#3C4146', 20)}{R(w * 0.3, h - 620, w * 0.4, 330, 'bb-d bb-inv', 'none', 12)}{R(w * 0.45, -1500, w * 0.1, h - 700 + 1500, 'bb-o', '#3C4146')}{R(0, h - 80, w, 80, 'bb-o', '#B9B2A2')}</>
    default: return R(0, 0, w, h, 'bb-o', CARD)
  }
}

/** One wall, seen square on from inside the room: the same items as the plan, at their real heights, in the chosen finishes. */
export function ElevArt({ s, wall, u, uid }: { s: Scene; wall: Wall; u: number; uid: string }) {
  const e = elevation(s, wall), H = e.height, L = e.length, slots = slotsFor(s)
  const tileM = mat(s.mats.tile), paint = mat(s.mats.walls)
  const f = { ...fillsFor(s, uid), tile: slots.includes('tile') ? fillOf(tileM, uid) : paint.hex }
  const Y = (z: number) => H - z   // drawing y for a height off the floor
  const tiles: Box[] = []
  if (slots.includes('tile')) {
    if (s.job === 'bathroom') { if (s.extras.includes('fulltile')) tiles.push({ x: 0, y: 0, w: L, h: H }); else for (const i of e.items) if (def(i.kind).wet) tiles.push({ x: i.x, y: Y(2100), w: i.w, h: 2100 }) }
    else for (const i of e.items) if (def(i.kind).top && !i.opening) tiles.push({ x: i.x, y: Y(1510), w: i.w, h: 600 })
  }
  // a return wall with a bath or shower against the corner is tiled too
  if (s.job === 'bathroom' && !s.extras.includes('fulltile')) for (const p of s.items) {
    const d = def(p.kind), w = wallOf(s, p)
    if (!d.wet || !w || w === wall) continue
    const b = box(p), touches = wall === 'N' ? b.y === 0 : wall === 'S' ? b.y + b.h === s.width : wall === 'W' ? b.x === 0 : b.x + b.w === s.length
    if (!touches) continue
    const [a, z] = wall === 'N' || wall === 'S' ? [b.x, b.x + b.w] : [b.y, b.y + b.h]
    tiles.push({ x: wall === 'N' || wall === 'E' ? a : L - z, y: Y(2100), w: z - a, h: 2100 })
  }
  const sorted = [...e.items].sort((a, b) => Number(b.opening) - Number(a.opening))
  const tops = e.items.filter((i) => def(i.kind).top)
  const first = (ok: (k: string) => boolean) => e.items.find((i) => ok(i.kind))
  const tg: { code: string; x: number; y: number; tx: number; ty: number }[] = []
  const frontI = first((k) => !!def(k).front && (!!def(k).tall || def(k).mount === 'high')) ?? first((k) => !!def(k).front)
  if (slots.includes('fronts') && frontI) tg.push({ code: SLOT.fronts.ref, x: frontI.x + frontI.w / 2, y: Y(frontI.z + frontI.h * 0.5), tx: frontI.x + frontI.w / 2, ty: Y(frontI.z + frontI.h * 0.5) })
  if (slots.includes('worktop') && tops[0]) { const t = tops[tops.length - 1]; tg.push({ code: SLOT.worktop.ref, x: t.x + t.w / 2, y: Y(910) - 22 * u, tx: t.x + t.w / 2, ty: Y(890) }) }
  if (tiles[0]) { const t = tiles[0]; tg.push({ code: SLOT.tile.ref, x: t.x + t.w * 0.3, y: t.y + t.h * (s.job === 'bathroom' ? 0.3 : 0.5), tx: t.x + t.w * 0.3, ty: t.y + t.h * (s.job === 'bathroom' ? 0.3 : 0.5) }) }
  // paint tag: the widest clear stretch of wall above 2.2 m
  const cuts = [0, ...e.items.filter((i) => i.z + i.h > 2150).flatMap((i) => [i.x, i.x + i.w]).sort((a, b) => a - b), L]
  let px = L / 2, gap = 0
  for (let i = 0; i < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > gap) { gap = cuts[i + 1] - cuts[i]; px = (cuts[i] + cuts[i + 1]) / 2 }
  if (!(s.job === 'bathroom' && s.extras.includes('fulltile'))) tg.push({ code: SLOT.walls.ref, x: px, y: Y(2290), tx: px, ty: Y(2290) })
  const marks = [...new Set([0, ...(tops.length ? [910] : []), ...e.items.filter((i) => def(i.kind).mount === 'high' && ['wallu', 'mirror'].includes(i.kind)).flatMap((i) => [i.z, i.z + i.h]), ...(tiles.length && s.job === 'bathroom' && !s.extras.includes('fulltile') ? [2100] : []), H])].sort((a, b) => a - b)
  const breaks = [...new Set([0, L, ...e.items.filter((i) => i.z === 0 || i.opening).flatMap((i) => [i.x, i.x + i.w])])].sort((a, b) => a - b)
  return (
    <>
      <defs><MatDefs mats={slots.map((sl) => mat(s.mats[sl]))} uid={uid} u={u} /></defs>
      <rect x={0} y={0} width={L} height={H} fill={paint.hex} className="bb-o" />
      {tiles.map((t, i) => <rect key={i} x={t.x} y={t.y} width={t.w} height={t.h} fill={f.tile} className="bb-d" />)}
      {sorted.map((i) => <g key={i.id} transform={`translate(${i.x} ${Y(i.z + i.h)})`}>{elevSym(i.kind, i.w, i.h, f, u)}</g>)}
      <path className="bb-ground" d={`M${-22 * u} ${H}H${L + 22 * u}`} />
      <path className="bb-o bb-heavy" d={`M0 ${H}V0H${L}V${H}`} />
      {breaks.length > 2 ? breaks.slice(1).map((v, i) => <Dim key={i} u={u} x1={breaks[i]} y1={H + 16 * u} x2={v} y2={H + 16 * u} />) : null}
      <Dim u={u} x1={0} y1={H + (breaks.length > 2 ? 36 : 16) * u} x2={L} y2={H + (breaks.length > 2 ? 36 : 16) * u} cls="over" />
      {marks.slice(1).map((v, i) => <Dim key={v} u={u} x1={L + 16 * u} y1={Y(marks[i])} x2={L + 16 * u} y2={Y(v)} />)}
      {tg.map((t) => <RefTag key={t.code} u={u} code={t.code} x={t.x} y={t.y} />)}
    </>
  )
}
