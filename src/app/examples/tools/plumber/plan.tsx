'use client'
// The floor plan, twice: an editor where rooms are dragged, dropped and resized on a half-metre grid, and the
// read-only thermal plan and radiator plan drawn from the same rooms. Outside walls, party walls and the roof over
// each room are worked out from the plan, not asked for.
import { useEffect, useRef, useState } from 'react'
import { CELL, GRID, ROOM, bounds, fits, place, radSpot, runs, type House, type HouseLoss, type Room, type RoomType, type Run, type Schedule } from '@/lib/sandbox/plumber-heat'
import { Defs, Dim } from './symbols'

const U = 20                                   // drawing units per grid square
const m = (cells: number) => (cells * CELL).toFixed(1).replace('.0', '')
export const BANDS: [number, string, string][] = [[40, '#F6F0E2', 'Under 40'], [60, '#F5DFC6', '40 to 60'], [80, '#F2C4A0', '60 to 80'], [100, '#EDA47A', '80 to 100'], [Infinity, '#E67F56', 'Over 100']]
export const shade = (wm2: number) => BANDS.find(([max]) => wm2 < max)![1]
const fmt = (n: number) => n.toLocaleString('en-GB')

const line = (r: Run) => `M${r.x1 * U} ${r.y1 * U} L${r.x2 * U} ${r.y2 * U}`

/** Walls, window and radiator for one room. The window sits in the longest outside wall. */
function Shell({ house, room, rad }: { house: House; room: Room; rad?: 'plain' | 'ok' | 'short' | 'none' }) {
  const rs = runs(house, room)
  const ext = rs.filter((r) => r.kind === 'ext').sort((a, b) => b.cells - a.cells)[0]
  const win = ext && room.win !== 'none' ? (() => {
    const len = Math.min(ext.cells * 0.8, ({ small: 1.6, medium: 3, large: 5.4 } as Record<string, number>)[room.win])
    const horiz = ext.y1 === ext.y2, mid = horiz ? (ext.x1 + ext.x2) / 2 : (ext.y1 + ext.y2) / 2
    const a = (mid - len / 2) * U, b = (mid + len / 2) * U
    return horiz ? { d: `M${a} ${ext.y1 * U} H${b}`, t: `M${a} ${ext.y1 * U - 1.6} H${b} M${a} ${ext.y1 * U + 1.6} H${b} M${a} ${ext.y1 * U - 3} v6 M${b} ${ext.y1 * U - 3} v6` }
      : { d: `M${ext.x1 * U} ${a} V${b}`, t: `M${ext.x1 * U - 1.6} ${a} V${b} M${ext.x1 * U + 1.6} ${a} V${b} M${ext.x1 * U - 3} ${a} h6 M${ext.x1 * U - 3} ${b} h6` }
  })() : null
  const spot = radSpot(house, room)
  const showRad = rad && rad !== 'none' && (room.rad || rad !== 'plain')
  const len = ((room.rad?.mm ?? 800) / 1000 / CELL) * U, sx = (spot.x / CELL) * U, sy = (spot.y / CELL) * U
  const inset = 6.5, horiz = spot.side === 'n' || spot.side === 's'
  const rx = horiz ? sx - len / 2 : sx + (spot.side === 'w' ? inset - 2 : -inset - 2), ry = horiz ? sy + (spot.side === 'n' ? inset - 2 : -inset - 2) : sy - len / 2
  return (
    <>
      {rs.map((r, i) => <path key={i} d={line(r)} className={`wall ${r.kind}`} />)}
      {win ? <><path d={win.d} className="wgap" /><path d={win.t} className="wline" /></> : null}
      {showRad ? <rect x={rx} y={ry} width={horiz ? len : 4} height={horiz ? 4 : len} className={`rad ${rad}`} /> : null}
    </>
  )
}

// ---------------------------------------------------------------------------------------------- the editor
const VB = { x: -26, y: -22, w: GRID.w * U + 38, h: GRID.h * U + 34 }
const TYPES: RoomType[] = ['living', 'kitchen', 'bedroom', 'bathroom', 'hall']

export function Editor({ house, onRooms, sel, onSel, floor, onFloor }: { house: House; onRooms: (rooms: Room[]) => void; sel: string | null; onSel: (id: string | null) => void; floor: 0 | 1; onFloor: (f: 0 | 1) => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{ id: string; mode: 'move' | 'size'; dx: number; dy: number } | null>(null)
  const [ghost, setGhost] = useState<{ type: RoomType; x: number; y: number } | null>(null)
  const pal = useRef<{ type: RoomType; x: number; y: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)
  const [full, setFull] = useState(false)
  const on = house.rooms.filter((r) => r.floor === floor), other = house.rooms.filter((r) => r.floor !== floor)

  const cell = (cx: number, cy: number) => {
    const r = svg.current!.getBoundingClientRect(), k = VB.w / r.width
    return { x: ((cx - r.left) * k + VB.x) / U, y: ((cy - r.top) * k + VB.y) / U, inside: cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom }
  }
  const swap = (next: Room) => { if (fits(house.rooms, next)) onRooms(house.rooms.map((r) => (r.id === next.id ? next : r))) }
  const down = (e: React.PointerEvent, room: Room, mode: 'move' | 'size') => {
    e.stopPropagation(); onSel(room.id)
    const c = cell(e.clientX, e.clientY)
    drag.current = { id: room.id, mode, dx: c.x - room.x, dy: c.y - room.y }
    svg.current!.setPointerCapture(e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return
    const room = house.rooms.find((r) => r.id === d.id); if (!room) return
    const c = cell(e.clientX, e.clientY)
    const next = d.mode === 'move' ? { ...room, x: Math.round(c.x - d.dx), y: Math.round(c.y - d.dy) } : { ...room, w: Math.max(2, Math.round(c.x - room.x)), h: Math.max(2, Math.round(c.y - room.y)) }
    if (next.x !== room.x || next.y !== room.y || next.w !== room.w || next.h !== room.h) swap(next)
  }
  const up = () => { drag.current = null }
  const key = (e: React.KeyboardEvent, room: Room) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    const s = step[e.key]; if (!s) return
    e.preventDefault()
    swap(e.shiftKey ? { ...room, w: Math.max(2, room.w + s[0]), h: Math.max(2, room.h + s[1]) } : { ...room, x: room.x + s[0], y: room.y + s[1] })
  }
  const add = (type: RoomType, at?: { x: number; y: number }) => {
    const room = place(house, type, floor, at)
    if (!room) { setFull(true); return }
    setFull(false); onRooms([...house.rooms, room]); onSel(room.id)
  }

  // Dragging a room type from the palette onto the plan. A plain click or tap drops it in the first free space.
  useEffect(() => {
    const mv = (e: PointerEvent) => {
      const p = pal.current; if (!p) return
      if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) p.moved = true
      if (p.moved) setGhost({ type: p.type, x: e.clientX, y: e.clientY })
    }
    const end = (e: PointerEvent) => {
      const p = pal.current; pal.current = null; setGhost(null)
      if (!p || !p.moved) return
      skipClick.current = true; setTimeout(() => { skipClick.current = false }, 0)
      const c = cell(e.clientX, e.clientY)
      if (c.inside) add(p.type, { x: c.x - 3, y: c.y - 3 })
    }
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end)
    return () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end) }
  })

  return (
    <div className="tw-ed">
      <div className="bar">
        <div className="seg" role="group" aria-label="Floor">{(['Ground floor', 'First floor'] as const).map((n, i) => <button key={n} type="button" aria-pressed={floor === i} onClick={() => { onFloor(i as 0 | 1); onSel(null) }}>{n}</button>)}</div>
        <div className="pal" role="group" aria-label="Add a room">
          <span className="lbl">Drag a room on, or tap to add</span>
          <div className="seg">{TYPES.map((t) => (
            <button key={t} type="button" onPointerDown={(e) => { pal.current = { type: t, x: e.clientX, y: e.clientY, moved: false } }} onClick={() => { if (!skipClick.current) add(t) }}>{ROOM[t].name.replace(' or landing', '').replace(' room', '')}</button>
          ))}</div>
        </div>
      </div>
      {full ? <p className="small" role="status">No free space on this floor. Move or shrink a room first.</p> : null}
      <svg ref={svg} className="tw-svg tw-plan edit" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerDown={() => onSel(null)} role="group" aria-label={`${floor ? 'First' : 'Ground'} floor plan. ${on.length} rooms. Drag to move, drag a corner to resize, or use the arrow keys.`}>
        <Defs />
        <defs>
          <pattern id="tw-grid" width={U * 2} height={U * 2} patternUnits="userSpaceOnUse"><path d={`M${U} 0 V${U * 2} M0 ${U} H${U * 2}`} className="g1" /><path d={`M0 0 H${U * 2} M0 0 V${U * 2}`} className="g2" /></pattern>
        </defs>
        <rect x="0" y="0" width={GRID.w * U} height={GRID.h * U} fill="url(#tw-grid)" className="paper" />
        {Array.from({ length: GRID.w / 4 + 1 }, (_, i) => <text key={`x${i}`} x={i * U * 4} y="-8" className="rule" textAnchor="middle">{i * 2}</text>)}
        {Array.from({ length: GRID.h / 4 + 1 }, (_, i) => <text key={`y${i}`} x="-8" y={i * U * 4 + 3} className="rule" textAnchor="end">{i * 2}</text>)}
        <text x={GRID.w * U + 9} y="-8" className="rule" textAnchor="end">m</text>
        {other.map((r) => <rect key={r.id} x={r.x * U} y={r.y * U} width={r.w * U} height={r.h * U} className="ghost" />)}
        {on.map((r) => (
          <g key={r.id} className={`room${sel === r.id ? ' sel' : ''}`} tabIndex={0} role="button" aria-pressed={sel === r.id} aria-label={`${r.name}, ${m(r.w)} by ${m(r.h)} metres`}
            onPointerDown={(e) => down(e, r, 'move')} onKeyDown={(e) => key(e, r)} onFocus={() => onSel(r.id)}>
            <rect x={r.x * U} y={r.y * U} width={r.w * U} height={r.h * U} className="body" />
            <Shell house={house} room={r} rad="plain" />
            <text x={r.x * U + 7} y={r.y * U + 16} className="nm">{r.name}</text>
            <text x={r.x * U + 7} y={r.y * U + 28} className="sz">{m(r.w)} × {m(r.h)} m</text>
            {sel === r.id ? <>
              <Dim x1={r.x * U} y1={r.y * U} x2={(r.x + r.w) * U} y2={r.y * U} off={-11} label={`${m(r.w)} m`} />
              <rect x={(r.x + r.w) * U - 16} y={(r.y + r.h) * U - 16} width="26" height="26" className="hit" onPointerDown={(e) => down(e, r, 'size')} />
              <path d={`M${(r.x + r.w) * U - 9} ${(r.y + r.h) * U} h9 v-9 Z`} className="grip" />
            </> : null}
          </g>
        ))}
      </svg>
      <div className="tw-legend">
        <span><svg viewBox="0 0 30 8" className="tw-svg tw-plan" aria-hidden><path d="M1 4 H29" className="wall ext" /></svg>Outside wall</span>
        <span><svg viewBox="0 0 30 8" className="tw-svg tw-plan" aria-hidden><path d="M1 4 H29" className="wall party" /></svg>Neighbour&rsquo;s wall</span>
        <span><svg viewBox="0 0 30 8" className="tw-svg tw-plan" aria-hidden><path d="M1 4 H29" className="wall int" /></svg>Inside wall</span>
        <span><svg viewBox="0 0 30 8" className="tw-svg tw-plan" aria-hidden><rect x="1" y="1" width="28" height="6" className="ghost" /></svg>Other floor</span>
      </div>
      {ghost ? <div className="tw-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden>{ROOM[ghost.type].name}</div> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------------------------- the thermal plan
export function Thermal({ house, loss, floor, mode, sched }: { house: House; loss: HouseLoss; floor: 0 | 1; mode: 'heat' | 'rads'; sched?: Schedule }) {
  const b = bounds(house.rooms), on = house.rooms.filter((r) => r.floor === floor)
  const x0 = b.x0 * U, y0 = b.y0 * U, w = (b.x1 - b.x0) * U, h = (b.y1 - b.y0) * U
  const fb = bounds(on)
  const total = on.reduce((t, r) => t + (loss.rooms.find((x) => x.id === r.id)?.watts ?? 0), 0)
  return (
    <svg className="tw-svg tw-plan" viewBox={`${x0 - 34} ${y0 - 40} ${w + 48} ${h + 78}`} role="img"
      aria-label={`${floor ? 'First' : 'Ground'} floor ${mode === 'heat' ? 'thermal plan' : 'radiator plan'}. ${on.map((r) => { const l = loss.rooms.find((x) => x.id === r.id)!; return `${r.name} ${l.watts} watts` }).join(', ')}.`}>
      <Defs />
      <text x={x0} y={y0 - 28} className="flr">{floor ? 'First floor' : 'Ground floor'}</text>
      <text x={x0 + w} y={y0 - 28} className="flr tot" textAnchor="end">{fmt(total)} W</text>
      {on.map((r, i) => {
        const l = loss.rooms.find((x) => x.id === r.id)!, s = sched?.rows.find((x) => x.id === r.id)
        const cx = (r.x + r.w / 2) * U, cy = (r.y + r.h / 2) * U
        return (
          <g key={r.id} className="cell" style={{ animationDelay: `${i * 70}ms` }}>
            <rect x={r.x * U} y={r.y * U} width={r.w * U} height={r.h * U} fill={mode === 'heat' ? shade(l.wm2) : '#FBF9F4'} stroke="none" />
            <Shell house={house} room={r} rad={mode === 'rads' ? (s?.status ?? 'none') : 'plain'} />
            <text x={cx} y={cy - 11} textAnchor="middle" className="nm">{r.name}</text>
            {mode === 'heat' ? <>
              <text x={cx} y={cy + 5} textAnchor="middle" className="w">{fmt(l.watts)} W</text>
              <text x={cx} y={cy + 17} textAnchor="middle" className="sz">{l.wm2} W/m² · {l.ti}°</text>
            </> : <>
              <text x={cx} y={cy + 4} textAnchor="middle" className="w sm">{fmt(l.watts)} W</text>
              <text x={cx} y={cy + 17} textAnchor="middle" className={`st ${s?.status}`}>{s?.status === 'ok' ? 'Radiator OK' : s?.status === 'none' ? 'No radiator' : `Short by ${fmt(s?.short ?? 0)} W`}</text>
            </>}
          </g>
        )
      })}
      {on.length ? <>
        <Dim x1={fb.x0 * U} y1={fb.y0 * U} x2={fb.x1 * U} y2={fb.y0 * U} off={-12} label={`${m(fb.x1 - fb.x0)} m`} />
        <Dim x1={fb.x0 * U} y1={fb.y0 * U} x2={fb.x0 * U} y2={fb.y1 * U} off={-14} label={`${m(fb.y1 - fb.y0)} m`} />
      </> : <text x={x0 + w / 2} y={y0 + h / 2} textAnchor="middle" className="sz">No rooms on this floor</text>}
      {/* scale bar: two metres in one-metre steps */}
      <g transform={`translate(${x0} ${y0 + h + 16})`}><path d={`M0 0 H${U * 4} M0 -3 V3 M${U * 2} -3 V3 M${U * 4} -3 V3`} className="th" /><rect x="0" y="-1.5" width={U * 2} height="3" className="ink" /><text x="0" y="13" className="rule">0</text><text x={U * 2} y="13" className="rule" textAnchor="middle">1</text><text x={U * 4} y="13" className="rule" textAnchor="middle">2 m</text></g>
    </svg>
  )
}
