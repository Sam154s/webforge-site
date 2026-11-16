'use client'
// The room planner: drag items in from the list, slide them along the walls, pick finishes. Every move runs the
// snap engine and the design rules in lib/sandbox/builder.ts and re-prices the job. Pointer events, so mouse and touch.
import { useEffect, useId, useRef, useState } from 'react'
import { gbp } from '@/lib/sandbox/journey'
import {
  JOBS, SCHEMES, SLOT, TEMPLATES, addItem, applyScheme, box, check, choices, def, dims, duplicateItem, findSpot, gaps, itemPrice, mat, moveItem, place,
  removeItem, resize, rotateItem, schemeMats, setSize, slotsFor, zones, type Placed, type Scene, type Seg, type Slot,
} from '@/lib/sandbox/builder'
import { Dim, ElecZones, ItemSym, NoteMarks, PdGauge, PlanArt, Swatch, Triangle, ZoneRect, fit, onTone, useWidth } from './draw'

export type SetScene = (next: Scene, o?: { silent?: boolean; from?: Scene }) => void
type Tab = 'layout' | 'finishes' | 'extras'
const fmt = (v: number) => Math.round(v).toLocaleString('en-GB')

/** A marker for the moments the tool does something on its own. */
export function Auto({ children }: { children: React.ReactNode }) {
  return <span className="bb-auto"><i aria-hidden />Automatic<span>{children}</span></span>
}

/** A figure that counts to its new value, so the price is seen to move when the plan does. */
export function Count({ value }: { value: number }) {
  const [shown, setShown] = useState(value), from = useRef(value)
  useEffect(() => {
    const a = from.current, t0 = performance.now()
    if (a === value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { from.current = value; setShown(value); return }
    let raf = 0
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 420), e = 1 - Math.pow(1 - k, 3); const v = a + (value - a) * e; from.current = v; setShown(v); if (k < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{gbp(shown)}</>
}

function PaletteIcon({ kind, s, uid }: { kind: string; s: Scene; uid: string }) {
  const d = def(kind), [w, dp] = dims({ kind }), pad = Math.max(w, dp) * 0.16 + 60, open = d.mount === 'opening'
  const vb = open ? [-pad, -pad * 0.6, w + 2 * pad, Math.min(w, 900) + dp + pad * 1.2] : [-pad, -pad - (kind === 'table' ? 300 : 0), w + 2 * pad, dp + 2 * pad + (kind === 'bar' || kind === 'table' ? 380 : 0)]
  const u = Math.max(vb[2] / 64, vb[3] / 40)
  const f = { top: mat(s.mats.worktop).hex, front: mat(s.mats.fronts).hex, metal: s.job === 'extension' ? '#D5D7D4' : mat(s.mats.metal).hex }
  return (
    <svg className="bb-svg bb-pi" viewBox={vb.join(' ')} style={{ ['--u' as string]: u }} aria-hidden>
      {open ? <rect x={-pad} y={0} width={w + 2 * pad} height={dp} fill="#D9D2C2" /> : null}
      <g className={`bb-m-${d.mount}`}><ItemSym p={{ id: uid, kind, x: 0, y: 0, rot: 0 }} f={f} /></g>
    </svg>
  )
}

export default function Planner({ scene, set, undo, canUndo, reset, pickLayout }: {
  scene: Scene; set: SetScene; undo: () => void; canUndo: boolean; reset: () => void; pickLayout: (key: string) => void
}) {
  const uid = useId().replace(/:/g, '')
  const [wrap, px] = useWidth<HTMLDivElement>(560)
  const svg = useRef<SVGSVGElement>(null)
  const live = useRef(scene); live.current = scene
  const drag = useRef<null | { type: 'item'; id: string; dx: number; dy: number; from: Scene; moved: boolean } | { type: 'size'; axis: 'L' | 'W'; from: Scene }>(null)
  const dragged = useRef(false)
  const [sel, setSel] = useState<string | null>(null)
  const [moving, setMoving] = useState<string | null>(null)
  const [guides, setGuides] = useState<Seg[]>([])
  const [frozen, setFrozen] = useState<ReturnType<typeof fit> | null>(null)
  const [tab, setTab] = useState<Tab>('layout')
  const [over, setOver] = useState<{ clear: boolean; tri: boolean; elec: boolean }>({ clear: false, tri: false, elec: false })

  const job = JOBS[scene.job], ext = scene.job === 'extension'
  const view = frozen ?? fit(scene, px, px < 430 ? 40 : 58), u = view.u
  const warnings = check(scene)
  const selected = scene.items.find((p) => p.id === sel) ?? null
  const flagged = warnings.filter((w) => w.level === 'warn').flatMap((w) => w.ids)
  useEffect(() => { if (sel && !scene.items.some((p) => p.id === sel)) setSel(null) }, [scene, sel])

  const toMm = (e: { clientX: number; clientY: number }): [number, number] | null => {
    const m = svg.current?.getScreenCTM(); if (!m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return [p.x, p.y]
  }

  // ---- dragging an item that is already on the plan
  const itemProps = (p: Placed) => {
    const d = def(p.kind), [w, dp] = dims(p)
    return {
      tabIndex: 0, role: 'button', 'aria-label': `${d.name}, ${fmt(w)} by ${fmt(d.mount === 'opening' ? d.h : dp)} mm. Arrow keys move it, R turns it, Delete removes it.`, 'aria-pressed': sel === p.id,
      onFocus: () => setSel(p.id),
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button) return
        const pt = toMm(e); if (!pt) return
        e.stopPropagation()
        const b = box(p)
        drag.current = { type: 'item', id: p.id, dx: pt[0] - (b.x + b.w / 2), dy: pt[1] - (b.y + b.h / 2), from: live.current, moved: false }
        svg.current?.setPointerCapture(e.pointerId); setSel(p.id)
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        const cur = live.current, b = box(p), step: Record<string, [number, number]> = { ArrowLeft: [-50, 0], ArrowRight: [50, 0], ArrowUp: [0, -50], ArrowDown: [0, 50] }
        if (step[e.key]) { e.preventDefault(); set(moveItem(cur, place(cur, p, b.x + b.w / 2 + step[e.key][0], b.y + b.h / 2 + step[e.key][1]).p)) }
        else if (e.key === 'r' || e.key === 'R') set(rotateItem(cur, p.id))
        else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); set(removeItem(cur, p.id)) }
      },
    }
  }
  const onMove = (e: React.PointerEvent) => {
    const g = drag.current; if (!g) return
    const pt = toMm(e); if (!pt) return
    const cur = live.current
    if (g.type === 'item') {
      const it = cur.items.find((p) => p.id === g.id); if (!it) return
      const r = place(cur, it, pt[0] - g.dx, pt[1] - g.dy)
      if (r.p.x !== it.x || r.p.y !== it.y || r.p.rot !== it.rot) { g.moved = true; setMoving(g.id); set(moveItem(cur, r.p), { silent: true }) }
      setGuides(r.guides)
    } else set(resize(g.from, g.axis === 'L' ? pt[0] : g.from.length, g.axis === 'W' ? pt[1] : g.from.width), { silent: true })
  }
  const onUp = (e: React.PointerEvent) => {
    const g = drag.current; if (!g) return
    drag.current = null; setMoving(null); setGuides([]); setFrozen(null)
    if (svg.current?.hasPointerCapture(e.pointerId)) svg.current.releasePointerCapture(e.pointerId)
    if (g.type === 'size' ? (live.current.length !== g.from.length || live.current.width !== g.from.width) : g.moved) set(live.current, { from: g.from })
  }
  const grip = (axis: 'L' | 'W') => (e: React.PointerEvent) => {
    if (e.button) return
    e.stopPropagation(); drag.current = { type: 'size', axis, from: live.current }; setFrozen(view); svg.current?.setPointerCapture(e.pointerId)
  }

  // ---- bringing a new item in from the list: drag with a mouse, or tap and it lands on the first free spot
  const bring = (kind: string) => (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || e.button) return
    const from = live.current, id = findSpot(from, kind).id, sx = e.clientX, sy = e.clientY
    let active = false, added = false
    const move = (ev: PointerEvent) => {
      if (!active && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return
      active = true
      const pt = toMm(ev), inside = pt && pt[0] > -500 && pt[0] < from.length + 500 && pt[1] > -500 && pt[1] < from.width + 500
      if (pt && inside) { const r = place(from, { id, kind, x: 0, y: 0, rot: 0 }, pt[0], pt[1]); added = true; set(addItem(from, r.p), { silent: true }); setGuides(r.guides); setSel(id); setMoving(id) }
      else if (added) { added = false; set(from, { silent: true }); setMoving(null); setGuides([]) }
    }
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up)
      if (!active) return
      dragged.current = true; setTimeout(() => { dragged.current = false }, 0)
      setMoving(null); setGuides([])
      if (added) set(live.current, { from })
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  const tapAdd = (kind: string) => () => {
    if (dragged.current) return
    const p = findSpot(live.current, kind); set(addItem(live.current, p)); setSel(p.id)
  }

  const showGaps = selected ? gaps(scene, selected) : []
  const zoneList = [
    ...(over.clear ? scene.items.flatMap((p) => zones(scene, p).map((z) => ({ z, bad: false }))) : selected ? zones(scene, selected).map((z) => ({ z, bad: false })) : []),
    ...warnings.filter((w) => w.zone).map((w) => ({ z: w.zone!, bad: true })),
  ]
  const stepper = (label: string, value: number, by: (d: number) => void, range: [number, number]) => (
    <div className="bb-step"><span>{label}</span>
      <button type="button" aria-label={`${label}: 100 mm less`} disabled={value <= range[0]} onClick={() => by(-100)}>&minus;</button>
      <output>{fmt(value)}</output>
      <button type="button" aria-label={`${label}: 100 mm more`} disabled={value >= range[1]} onClick={() => by(100)}>+</button>
    </div>
  )
  const slots = slotsFor(scene)

  return (
    <div className="bb-planner">
      <div className="bb-layouts" role="group" aria-label="Starting layout">
        {TEMPLATES[scene.job].map((t, i) => (
          <button key={t.key} type="button" aria-pressed={scene.layout === t.key} onClick={() => { setSel(null); pickLayout(t.key) }}>
            <span className="n">{String.fromCharCode(65 + i)}</span><span><b>{t.name}</b><span>{t.line}</span></span>
          </button>
        ))}
      </div>

      <div className="bb-bar">
        {stepper(ext ? 'Width across' : 'Length', scene.length, (d) => set(resize(scene, scene.length + d, scene.width)), job.size.length)}
        {stepper(ext ? 'Depth out' : 'Width', scene.width, (d) => set(resize(scene, scene.length, scene.width + d)), job.size.width)}
        <span className="grow" />
        <button type="button" className="small" disabled={!canUndo} onClick={undo}>Undo</button>
        <button type="button" className="small" onClick={() => { setSel(null); reset() }}>Reset to suggested</button>
      </div>

      <div className="bb-work">
        <div className="bb-side">
          <div className="bb-tabs" role="group" aria-label="What to change">
            {([['layout', 'Fittings'], ['finishes', 'Finishes'], ['extras', ext ? 'Site and extras' : 'Extras']] as [Tab, string][]).map(([k, name]) => <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>{name}</button>)}
          </div>

          {tab === 'layout' && (
            <>
              <p className="bb-hint">Drag on to the plan, or tap to add.</p>
              <div className="bb-palette">
                {job.palette.map((kind) => { const d = def(kind); return (
                  <button key={kind} type="button" className="bb-pal" onPointerDown={bring(kind)} onClick={tapAdd(kind)} title={d.name}>
                    <PaletteIcon kind={kind} s={scene} uid={`${uid}p`} />
                    <span className="nm">{d.name.split(',')[0]}</span>
                    <span className="pr">{d.free ? 'Layout only' : `${gbp(itemPrice({ id: '', kind, x: 0, y: 0, rot: 0 }, 'better'))}${d.per ? ' a run' : ''}`}</span>
                  </button>
                ) })}
              </div>
            </>
          )}

          {tab === 'finishes' && (
            <div className="bb-fin">
              <p className="bb-hint">Start from a scheme, then swap any one finish.</p>
              <div className="bb-schemes" role="group" aria-label="Colour scheme">
                {SCHEMES.map((sc) => { const mm = schemeMats(scene.job, sc.key); return (
                  <button key={sc.key} type="button" aria-pressed={scene.scheme === sc.key && slots.every((sl) => scene.mats[sl] === mm[sl])} onClick={() => set(applyScheme(scene, sc.key))}>
                    <span className="fan" aria-hidden>{slots.slice(0, 5).map((sl) => <i key={sl} style={{ background: mat(mm[sl]).hex }} />)}</span>
                    <span><b>{sc.name}</b><span>{sc.line}</span></span>
                  </button>
                ) })}
              </div>
              {slots.map((slot: Slot) => { const cur = mat(scene.mats[slot]); return (
                <div key={slot} className="bb-slot">
                  <p><span className="ref">{SLOT[slot].ref}</span><b>{SLOT[slot].name[scene.job]}</b><span className="cur">{cur.name}, {gbp(cur.price)} a {cur.unit}</span></p>
                  <div className="bb-chips" role="group" aria-label={SLOT[slot].name[scene.job]}>
                    {choices(scene.job, slot).map((m) => (
                      <button key={m.id} type="button" aria-pressed={cur.id === m.id} aria-label={`${m.name}, ${m.sheen}`} title={`${m.name}. ${m.sheen}`} onClick={() => set({ ...scene, mats: { ...scene.mats, [slot]: m.id } })}>
                        <Swatch m={m} uid={`${uid}s`} />
                        {cur.id === m.id ? <svg className="tick" viewBox="0 0 20 20" aria-hidden><path d="M4 11l4 4 8-11" stroke={onTone(m.hex)} /></svg> : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) })}
            </div>
          )}

          {tab === 'extras' && (
            <div className="bb-fin">
              {ext ? (
                <>
                  <div className="ctl"><span className="top-line"><span>Your house is</span></span>
                    <div className="seg" role="group" aria-label="House type">{(['attached', 'detached'] as const).map((h) => <button key={h} type="button" aria-pressed={scene.site.house === h} onClick={() => set({ ...scene, site: { ...scene.site, house: h } })}>{h === 'attached' ? 'Semi or terrace' : 'Detached'}</button>)}</div>
                  </div>
                  <label className="ctl"><span className="top-line"><span>Side wall to the boundary</span><b>{(scene.site.boundary / 1000).toFixed(1)} m</b></span>
                    <input type="range" min={0} max={4000} step={100} value={scene.site.boundary} onChange={(e) => set({ ...scene, site: { ...scene.site, boundary: +e.target.value } }, { silent: true })} /></label>
                </>
              ) : null}
              <div className="checks">
                {job.extras.map(([k, name, fixed, per]) => (
                  <label key={k} className="check"><input type="checkbox" checked={scene.extras.includes(k)} onChange={(e) => set({ ...scene, extras: e.target.checked ? [...scene.extras, k] : scene.extras.filter((x) => x !== k) })} />
                    <span>{name}<span className="pr">{k === 'fulltile' ? 'Priced by the square metre of tile' : `${gbp(fixed + (per ?? 0) * (scene.length * scene.width) / 1e6)}`}</span></span></label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bb-stagecol">
          <div className="bb-selbar" aria-live="polite">
            {selected ? (() => { const d = def(selected.kind), [w, dp] = dims(selected); return (
              <>
                <span className="what"><b>{d.name.split(',')[0]}</b><span>{fmt(w)} x {fmt(d.mount === 'opening' ? d.h : dp)} mm{d.free ? '' : `, ${gbp(itemPrice(selected, 'better'))}`}</span></span>
                {d.sizes ? <span className="sizes" role="group" aria-label="Size">{d.sizes.map(([sw], i) => <button key={i} type="button" aria-pressed={(selected.v ?? 0) === i} onClick={() => set(setSize(scene, selected.id, i))}>{fmt(sw)}</button>)}</span> : null}
                <span className="acts">
                  <button type="button" onClick={() => set(rotateItem(scene, selected.id))}>Turn</button>
                  <button type="button" onClick={() => set(duplicateItem(scene, selected.id))}>Copy</button>
                  <button type="button" onClick={() => { set(removeItem(scene, selected.id)); setSel(null) }}>Remove</button>
                </span>
              </>
            ) })() : <span className="idle">Drag anything on the plan. Wall items turn and lock to the nearest wall. Tap an item for sizes, turn, copy and remove.</span>}
          </div>

          <div className="bb-sheetbox" ref={wrap}>
            <svg ref={svg} className={`bb-svg bb-plan${moving ? ' dragging' : ''}`} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={{ ['--u' as string]: u }}
              role="group" aria-label={`Plan of your ${job.name.toLowerCase()}, ${fmt(scene.length)} by ${fmt(scene.width)} mm, ${scene.items.length} items`}
              onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerDown={() => setSel(null)}>
              <PlanArt s={scene} u={u} uid={uid} item={itemProps} selected={sel} flagged={flagged} dims={!moving}>
                {over.elec && scene.job === 'bathroom' ? <ElecZones s={scene} u={u} /> : null}
                {over.tri && scene.job === 'kitchen' ? <Triangle s={scene} u={u} /> : null}
                {zoneList.map((z, i) => <ZoneRect key={i} z={z.z} bad={z.bad} u={u} />)}
                {guides.map((g, i) => <path key={i} className="bb-guide" d={`M${g.x1} ${g.y1}L${g.x2} ${g.y2}`} />)}
                {showGaps.map((g, i) => <Dim key={i} u={u} cls="live" {...g} />)}
                <NoteMarks s={scene} warnings={warnings} u={u} />
                {ext ? <PdGauge s={scene} u={u} /> : null}
                <g className="bb-grip" onPointerDown={grip('L')} role="presentation"><title>Drag to change the room size</title><rect x={scene.length + 75 - 5 * u} y={scene.width - 40 * u} width={10 * u} height={30 * u} rx={3 * u} /><path d={`M${scene.length + 75 - 1.5 * u} ${scene.width - 32 * u}v${14 * u}M${scene.length + 75 + 1.5 * u} ${scene.width - 32 * u}v${14 * u}`} /></g>
                <g className="bb-grip" onPointerDown={grip('W')} role="presentation"><title>Drag to change the room size</title><rect x={scene.length - 40 * u} y={scene.width + 75 - 5 * u} width={30 * u} height={10 * u} rx={3 * u} /><path d={`M${scene.length - 32 * u} ${scene.width + 75 - 1.5 * u}h${14 * u}M${scene.length - 32 * u} ${scene.width + 75 + 1.5 * u}h${14 * u}`} /></g>
              </PlanArt>
            </svg>
          </div>

          <div className="bb-under">
            <div className="bb-over" role="group" aria-label="Show on the plan">
              <button type="button" aria-pressed={over.clear} onClick={() => setOver({ ...over, clear: !over.clear })}>Clear space</button>
              {scene.job === 'kitchen' ? <button type="button" aria-pressed={over.tri} onClick={() => setOver({ ...over, tri: !over.tri })}>Work triangle</button> : null}
              {scene.job === 'bathroom' ? <button type="button" aria-pressed={over.elec} onClick={() => setOver({ ...over, elec: !over.elec })}>Wiring zones</button> : null}
            </div>
            {ext ? <span className="bb-legend mini"><span><i className="k pd" />Depth allowed</span><span><i className="k pd h" />Prior approval</span><span><i className="k pd p" />Planning</span></span> : null}
            {scene.svc ? <span className="bb-key"><svg viewBox="0 0 14 14" aria-hidden><circle cx="7" cy="7" r="5.5" /><path d="M3.2 3.2l7.6 7.6M10.8 3.2l-7.6 7.6" /></svg>{scene.job === 'bathroom' ? 'Soil stack' : 'Drain'}</span> : null}
            <Auto>{ext ? 'Planning gauge and design rules run on every move' : 'Design rules run on every move'}</Auto>
          </div>

          <ol className="bb-notes" aria-label="Design notes">
            {warnings.length === 0 ? <li className="ok"><span className="mk" aria-hidden><svg viewBox="0 0 20 20"><path d="M4 11l4 4 8-11" /></svg></span><span>No notes. This plan passes every one of Bramley&rsquo;s design rules.</span></li> : null}
            {warnings.map((w, i) => (
              <li key={i} className={w.level} onPointerEnter={() => w.ids[0] && setSel(w.ids[0])}>
                <span className="mk" aria-hidden><svg viewBox="0 0 20 20">{w.level === 'warn' ? <path d="M10 2.5L18.5 17H1.5Z" /> : <circle cx="10" cy="10" r="7.5" />}<text x="10" y={w.level === 'warn' ? 15 : 13.6} textAnchor="middle">{i + 1}</text></svg></span>
                <span><b>{w.level === 'warn' ? 'Worth a look. ' : 'Note. '}</b>{w.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
