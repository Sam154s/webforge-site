'use client'
// The plan composer: the plot drawn as a site plan, with every block a rectangle the customer can drag to move,
// stretch by its handles, or bring in from the tray. Everything snaps to half a metre and pulls flush to its neighbours.
// Pointer events throughout, so it works the same with a mouse and a finger. Arrow keys nudge the selected block.
import { useRef, useState } from 'react'
import { PLOT, TRAY, addBlock, fix, magnet, outline, roofOf, snap, type Block, type Design } from '@/lib/sandbox/architect-model'
import { northVector } from '@/lib/sandbox/architect-rules'

const VB = { x: PLOT.x0 - 2.5, z: PLOT.z0 - 2.5, w: PLOT.x1 - PLOT.x0 + 5, h: PLOT.z1 - PLOT.z0 + 8 }
type Edge = 'x0' | 'x1' | 'z0' | 'z1'
type Drag = { id: string; edge?: Edge; px: number; pz: number; from: Block }
type Ghost = { t: (typeof TRAY)[number]; x: number; z: number; over: boolean; left: number; top: number }

export const blockName = (b: Block, d: Design) => {
  if (b.role === 'existing') return 'Existing house'
  if (b.role === 'garden') return 'Garden room'
  if (b.role === 'garage') return 'Garage'
  const n = d.blocks.filter((x) => x.role === 'main' || x.role === 'wing').indexOf(b)
  return d.type === 'extension' ? `Extension ${String.fromCharCode(65 + n)}` : `Block ${String.fromCharCode(65 + n)}`
}

export default function Composer({ design, selected, onSelect, onChange }: {
  design: Design; selected: string | null; onSelect: (id: string | null) => void; onChange: (d: Design, why: string, select?: string) => void
}) {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<Drag | null>(null)
  const [busy, setBusy] = useState(false)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)

  const toPlan = (cx: number, cy: number) => {
    const m = svg.current!.getScreenCTM()!.inverse(), p = new DOMPoint(cx, cy).matrixTransform(m)
    return { x: p.x, z: p.y }
  }
  const down = (e: React.PointerEvent, b: Block, edge?: Edge) => {
    e.stopPropagation()
    onSelect(b.id)
    if (b.role === 'existing') return
    const p = toPlan(e.clientX, e.clientY)
    drag.current = { id: b.id, edge, px: p.x, pz: p.z, from: b }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setBusy(true)
  }
  const move = (e: React.PointerEvent) => {
    const g = drag.current
    if (!g) return
    const p = toPlan(e.clientX, e.clientY), dx = snap(p.x - g.px), dz = snap(p.z - g.pz), f = g.from
    let r = { x: f.x, z: f.z, w: f.w, d: f.d }
    if (!g.edge) r = { ...r, x: f.x + dx, z: f.z + dz }
    if (g.edge === 'x0') { const w = Math.max(2.5, f.w - dx); r = { ...r, x: f.x + f.w - w, w } }
    if (g.edge === 'x1') r.w = Math.max(2.5, f.w + dx)
    if (g.edge === 'z0') { const dp = Math.max(2.5, f.d - dz); r = { ...r, z: f.z + f.d - dp, d: dp } }
    if (g.edge === 'z1') r.d = Math.max(2.5, f.d + dz)
    const m = magnet(design, g.id, r, g.edge ? { [g.edge]: true } : {})
    const next = fix({ ...design, blocks: design.blocks.map((b) => (b.id === g.id ? { ...b, ...m } : b)) })
    const nb = next.blocks.find((b) => b.id === g.id)!, ob = design.blocks.find((b) => b.id === g.id)!
    if (nb.x !== ob.x || nb.z !== ob.z || nb.w !== ob.w || nb.d !== ob.d) onChange(next, g.edge ? 'Resized' : 'Moved')
  }
  const up = () => { drag.current = null; setBusy(false) }
  const key = (e: React.KeyboardEvent, b: Block) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, -0.5], ArrowDown: [0, 0.5] }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(b.id); return }
    const s = step[e.key]
    if (!s || b.role === 'existing') return
    e.preventDefault(); onSelect(b.id)
    onChange(fix({ ...design, blocks: design.blocks.map((x) => (x.id === b.id ? { ...x, x: x.x + s[0], z: x.z + s[1] } : x)) }), 'Moved')
  }

  // ---- the tray: drag a new block onto the plan, or tap to drop it behind the house
  const ghostAt = (t: (typeof TRAY)[number], cx: number, cy: number): Ghost => {
    const box = svg.current!.getBoundingClientRect(), over = cx >= box.left && cx <= box.right && cy >= box.top && cy <= box.bottom
    const p = toPlan(cx, cy), raw = { x: snap(p.x - t.w / 2), z: snap(p.z - t.d / 2), w: t.w, d: t.d }, m = magnet(design, '', raw, {})
    return { t, x: Math.min(PLOT.x1 - t.w, Math.max(PLOT.x0, m.x)), z: Math.min(PLOT.z1 - t.d, Math.max(PLOT.z0, m.z)), over, left: cx, top: cy }
  }
  const trayDown = (e: React.PointerEvent, t: (typeof TRAY)[number]) => {
    start.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setGhost(ghostAt(t, e.clientX, e.clientY))
  }
  const trayMove = (e: React.PointerEvent, t: (typeof TRAY)[number]) => { if (start.current) setGhost(ghostAt(t, e.clientX, e.clientY)) }
  const trayUp = (e: React.PointerEvent, t: (typeof TRAY)[number]) => {
    const s = start.current
    start.current = null; setGhost(null)
    if (!s) return
    const g = ghostAt(t, e.clientX, e.clientY), tap = Math.hypot(e.clientX - s.x, e.clientY - s.y) < 8
    if (tap) return drop(t)
    if (!g.over) return
    const [next, id] = addBlock(design, t, g.x + t.w / 2, g.z + t.d / 2)
    onChange(next, `${t.name} added`, id)
  }
  const drop = (t: (typeof TRAY)[number]) => {
    const house = design.blocks.filter((b) => b.role !== 'garden' && b.role !== 'garage')
    const x0 = Math.min(...house.map((b) => b.x)), z0 = Math.min(...house.map((b) => b.z)), x1 = Math.max(...house.map((b) => b.x + b.w)), z1 = Math.max(...house.map((b) => b.z + b.d))
    const at = t.role === 'garden' ? [-9, -15] : t.role === 'garage' ? [x1 + t.w / 2, z1 - t.d / 2] : [x0 + t.w / 2 + (house.length % 2 ? 0 : 3), z0 - t.d / 2]
    const [next, id] = addBlock(design, t, at[0], at[1])
    onChange(next, `${t.name} added`, id)
  }

  const walls = outline(design, 0), n = northVector(design.facing)
  const sel = design.blocks.find((b) => b.id === selected)
  const rot = (Math.atan2(n.x, -n.z) * 180) / Math.PI
  const handles = (b: Block): [Edge, number, number][] => [['x0', b.x, b.z + b.d / 2], ['x1', b.x + b.w, b.z + b.d / 2], ['z0', b.x + b.w / 2, b.z], ['z1', b.x + b.w / 2, b.z + b.d]]

  return (
    <div className="hf-compose">
      <svg ref={svg} className={`hf-plan${busy ? ' busy' : ''}`} viewBox={`${VB.x} ${VB.z} ${VB.w} ${VB.h}`} role="group" aria-label="Site plan. Drag a block to move it, drag a handle to resize it."
        onPointerDown={() => onSelect(null)} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <defs>
          <pattern id="hf-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" className="grid" /></pattern>
          <pattern id="hf-old" width=".7" height=".7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V.7" className="old" /></pattern>
        </defs>
        <rect x={PLOT.x0} y={PLOT.z0} width={PLOT.x1 - PLOT.x0} height={PLOT.z1 - PLOT.z0} fill="url(#hf-grid)" />
        <rect className="road" x={VB.x} y={PLOT.z1 + 0.8} width={VB.w} height={3.4} />
        <text className="tag" x={0} y={PLOT.z1 + 2.9} textAnchor="middle">Road</text>
        <text className="tag" x={0} y={PLOT.z0 + 1.7} textAnchor="middle">Garden</text>
        <rect className="plot" x={PLOT.x0} y={PLOT.z0} width={PLOT.x1 - PLOT.x0} height={PLOT.z1 - PLOT.z0} />
        <g transform={`translate(${PLOT.x1 - 2.6} ${PLOT.z0 + 2.8}) rotate(${rot})`} className="north"><circle r="1.5" /><path d="M0 -1.9L.75 .9L0 .45L-.75 .9Z" /></g>

        {design.blocks.map((b) => {
          const r = roofOf(design.blocks, b), on = b.id === selected, pitched = b.roof === 'gable' || b.roof === 'hip'
          return (
            <g key={b.id} className={`blk ${b.role}${on ? ' on' : ''}`} tabIndex={0} role="button" aria-pressed={on}
              aria-label={`${blockName(b, design)}, ${b.w} by ${b.d} metres, ${b.storeys} ${b.storeys === 1 ? 'storey' : 'storeys'}${b.role === 'existing' ? ', fixed' : ''}`}
              onPointerDown={(e) => down(e, b)} onKeyDown={(e) => key(e, b)}>
              <rect x={b.x} y={b.z} width={b.w} height={b.d} />
              {pitched ? (r.along ? <path className="ridge" d={`M${b.x + (b.roof === 'hip' ? b.d / 2 : 0)} ${b.z + b.d / 2}H${b.x + b.w - (b.roof === 'hip' ? b.d / 2 : 0)}`} /> : <path className="ridge" d={`M${b.x + b.w / 2} ${b.z + (b.roof === 'hip' ? b.w / 2 : 0)}V${b.z + b.d - (b.roof === 'hip' ? b.w / 2 : 0)}`} />) : null}
              <text x={b.x + b.w / 2} y={b.z + b.d / 2 + 0.55} textAnchor="middle" className="st">{b.storeys}{b.basement ? '+B' : ''}</text>
            </g>
          )
        })}
        {walls.map((s, i) => <path key={i} className={s.fresh ? 'wall' : 'wall was'} d={`M${s.x1} ${s.z1}L${s.x2} ${s.z2}`} />)}

        {sel ? (
          <g className="sel">
            <rect x={sel.x} y={sel.z} width={sel.w} height={sel.d} />
            <path d={`M${sel.x} ${sel.z - 1.2}H${sel.x + sel.w}M${sel.x} ${sel.z - 1.6}v.8M${sel.x + sel.w} ${sel.z - 1.6}v.8M${sel.x - 1.2} ${sel.z}V${sel.z + sel.d}M${sel.x - 1.6} ${sel.z}h.8M${sel.x - 1.6} ${sel.z + sel.d}h.8`} />
            <text x={sel.x + sel.w / 2} y={sel.z - 1.6} textAnchor="middle">{sel.w.toFixed(1)} m</text>
            <text x={sel.x - 1.6} y={sel.z + sel.d / 2} textAnchor="middle" transform={`rotate(-90 ${sel.x - 1.6} ${sel.z + sel.d / 2})`}>{sel.d.toFixed(1)} m</text>
            {sel.role !== 'existing' ? handles(sel).map(([edge, x, z]) => (
              <g key={edge} className="handle" onPointerDown={(e) => down(e, sel, edge)}>
                <rect className="hit" x={x - 1.3} y={z - 1.3} width={2.6} height={2.6} />
                <rect x={x - 0.45} y={z - 0.45} width={0.9} height={0.9} />
              </g>
            )) : null}
          </g>
        ) : null}
        {ghost?.over ? <rect className="ghost" x={ghost.x} y={ghost.z} width={ghost.t.w} height={ghost.t.d} /> : null}
      </svg>

      <div className="hf-tray" role="group" aria-label="Add a block">
        <span className="hf-cap">Drag onto the plan, or tap to add</span>
        {TRAY.map((t) => (
          <button key={t.name} type="button" className="small" onPointerDown={(e) => trayDown(e, t)} onPointerMove={(e) => trayMove(e, t)} onPointerUp={(e) => trayUp(e, t)} onPointerCancel={() => { start.current = null; setGhost(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(t) } }}>
            <svg viewBox="0 0 16 12" aria-hidden><rect x={8 - t.w} y={6 - t.d * 0.8} width={t.w * 2} height={t.d * 1.6} /></svg>{t.name}
          </button>
        ))}
      </div>
      {ghost && !ghost.over ? <span className="hf-drag" style={{ left: ghost.left, top: ghost.top }} aria-hidden>{ghost.t.name}</span> : null}
    </div>
  )
}
