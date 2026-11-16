// Architect designer model: a design is a handful of blocks snapped to half a metre, plus features hung on them.
// Every figure (floor area, footprint, wall and roof area, the cost plan, the fee) is derived from a half-metre cell grid
// rasterised per storey, so blocks can overlap in any way and the sums still hold.
// Rates are an example rate card for a fictional practice. Plain code: same design in, same figures out.
import { tidy } from './journey'
import type { Cladding, Glazing, Roof, Spec } from './architect'

export const CELL = 0.5
/** The plot in metres. The road runs beyond z1, the back garden runs to z0. */
export const PLOT = { x0: -15, x1: 15, z0: -19, z1: 21 }
export const PLOT_AREA = (PLOT.x1 - PLOT.x0) * (PLOT.z1 - PLOT.z0)
const NX = (PLOT.x1 - PLOT.x0) / CELL, NZ = (PLOT.z1 - PLOT.z0) / CELL

export type Role = 'main' | 'wing' | 'existing' | 'garden' | 'garage'
export type Block = { id: string; x: number; z: number; w: number; d: number; storeys: number; basement: boolean; roof: Roof; role: Role }
export type AttachKey = 'dormer' | 'rooflights' | 'balcony' | 'terrace' | 'porch' | 'solar' | 'bay' | 'chimney' | 'tall'
export type FeatureKey = AttachKey | 'basement' | 'garden' | 'garage'
export type Feature = { key: AttachKey; block: string }
export type Facing = 'N' | 'E' | 'S' | 'W'
export type Design = {
  type: 'new' | 'extension'
  house: 'detached' | 'semi' | 'terrace'   // extension only: the house being extended
  conservation: boolean
  facing: Facing                           // which way the back garden faces
  blocks: Block[]
  features: Feature[]
  cladding: Cladding
  glazing: Glazing
  spec: Spec
}

const B = (id: string, role: Role, x: number, z: number, w: number, d: number, storeys: number, roof: Roof): Block => ({ id, role, x, z, w, d, storeys, roof, basement: false })
/** The house being extended. Fixed: the customer shapes the new work around it. */
export const HOUSE: Block = B('house', 'existing', -4, -3.5, 8, 7, 2, 'gable')

export type Preset = { key: string; name: string; blocks: Block[]; features?: Feature[] }
export const PRESETS: Record<Design['type'], Preset[]> = {
  new: [
    { key: 'bar', name: 'Bar', blocks: [B('b1', 'main', -6.5, -3, 13, 7, 2, 'gable')] },
    { key: 'l', name: 'L shape', blocks: [B('b1', 'main', -7, -1, 13, 6.5, 2, 'gable'), B('b2', 'wing', -7, -9.5, 5.5, 8.5, 2, 'gable')] },
    { key: 't', name: 'T shape', blocks: [B('b1', 'main', -7, 0, 14, 6, 2, 'gable'), B('b2', 'wing', -2.5, -8, 5, 8, 1, 'gable')] },
    { key: 'u', name: 'U shape', blocks: [B('b1', 'main', -7, 0, 14, 5.5, 2, 'hip'), B('b2', 'wing', -7, -7.5, 4.5, 7.5, 1, 'flat'), B('b3', 'wing', 2.5, -7.5, 4.5, 7.5, 1, 'flat')] },
    { key: 'court', name: 'Courtyard', blocks: [B('b1', 'main', -7, 1, 14, 5.5, 2, 'gable'), B('b2', 'wing', -7, -4.5, 4, 5.5, 1, 'flat'), B('b3', 'wing', 3, -4.5, 4, 5.5, 1, 'flat'), B('b4', 'wing', -7, -9, 14, 4.5, 1, 'mono')] },
    { key: 'step', name: 'Stepped', blocks: [B('b1', 'main', -7.5, -3, 5.5, 8, 3, 'flat'), B('b2', 'wing', -2, -3, 5, 8, 2, 'flat'), B('b3', 'wing', 3, -3, 4.5, 8, 1, 'flat')], features: [{ key: 'terrace', block: 'b2' }] },
  ],
  extension: [
    { key: 'rear', name: 'Rear', blocks: [HOUSE, B('b1', 'wing', -4, -7.5, 6.5, 4, 1, 'flat')] },
    { key: 'side', name: 'Side', blocks: [HOUSE, B('b1', 'wing', 4, -3.5, 3.5, 6, 1, 'mono')] },
    { key: 'wrap', name: 'Wraparound', blocks: [HOUSE, B('b1', 'wing', -4, -7.5, 11.5, 4, 1, 'flat'), B('b2', 'wing', 4, -3.5, 3.5, 5.5, 1, 'flat')] },
    { key: 'two', name: 'Two storey rear', blocks: [HOUSE, B('b1', 'wing', -4, -7.5, 6, 4, 2, 'gable')] },
    { key: 'studio', name: 'Rear and garden room', blocks: [HOUSE, B('b1', 'wing', -4, -8.5, 8, 5, 1, 'flat'), B('b2', 'garden', -12, -17, 5, 3.5, 1, 'flat')] },
    { key: 'loft', name: 'Loft and rear', blocks: [HOUSE, B('b1', 'wing', -4, -7, 8, 3.5, 1, 'flat')], features: [{ key: 'dormer', block: 'house' }, { key: 'rooflights', block: 'house' }] },
  ],
}

export function preset(d: Design, key: string): Design {
  const p = PRESETS[d.type].find((x) => x.key === key) ?? PRESETS[d.type][0]
  return fix({ ...d, blocks: p.blocks.map((b) => ({ ...b })), features: (p.features ?? []).map((f) => ({ ...f })) })
}
export const start = (type: Design['type']): Design =>
  preset({ type, house: 'detached', conservation: false, facing: 'N', blocks: [], features: [], cladding: type === 'new' ? 'brick' : 'timber', glazing: 'generous', spec: 'high' }, type === 'new' ? 'l' : 'rear')

// ------------------------------------------------------------------------------------------ block geometry
export const snap = (v: number) => Math.round(v / CELL) * CELL
export const storeyH = (b: Block) => (b.role === 'garden' || b.role === 'garage' ? 2.2 : 2.7)
export const SIZE = { min: 2.5, max: 16, storeys: 3 }
const outbuilding = (b: Block) => b.role === 'garden' || b.role === 'garage'
const isNew = (b: Block) => b.role !== 'existing'

/** Two blocks touch along a wall or overlap (meeting at a corner only does not count). */
export function joins(a: Block, b: Block) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oz = Math.min(a.z + a.d, b.z + b.d) - Math.max(a.z, b.z)
  return ox >= 0 && oz >= 0 && ox + oz > 0
}

const PITCH = { gable: 0.36, hip: 0.32, mono: 0.2 }
export const OVERHANG = 0.3
const natural = (b: Block) => (b.roof === 'flat' ? 0.3 : (b.w >= b.d ? b.d : b.w) * PITCH[b.roof])

/** The roof of one block. A wing's ridge is held at or below the ridge of the bigger block it runs into, so junctions stay clean. */
export function roofOf(blocks: Block[], b: Block) {
  const along = b.w >= b.d, span = along ? b.d : b.w, run = along ? b.w : b.d
  const eave = b.storeys * storeyH(b)
  let rise = natural(b)
  if (b.roof !== 'flat') {
    const me = blocks.indexOf(b)
    const caps = blocks.filter((a, i) => a !== b && joins(a, b) && (a.w * a.d > b.w * b.d || (a.w * a.d === b.w * b.d && i < me))).map((a) => a.storeys * storeyH(a) + natural(a))
    const cap = caps.length ? Math.max(...caps) : Infinity
    if (cap > eave + 0.6) rise = Math.min(rise, cap - eave)
  }
  return { along, span, run, eave, rise, top: eave + rise }
}
export type RoofGeo = ReturnType<typeof roofOf>

/** Height of the roof surface above the eaves at a plan point, in metres. Used to seat rooflights, panels, dormers and the section cut. */
export function roofAt(b: Block, r: RoofGeo, x: number, z: number) {
  const lx = x - (b.x + b.w / 2), lz = z - (b.z + b.d / 2)
  if (Math.abs(lx) > b.w / 2 + OVERHANG || Math.abs(lz) > b.d / 2 + OVERHANG) return 0
  if (b.roof === 'flat') return r.rise
  const across = r.along ? lz : lx, al = r.along ? lx : lz, a = r.span / 2 + OVERHANG, e = r.run / 2 + OVERHANG
  if (b.roof === 'mono') return r.rise * (a - across) / (2 * a)          // high side to the garden (or to the left)
  const side = r.rise * (1 - Math.abs(across) / a)
  if (b.roof === 'gable') return Math.max(0, side)
  const flat = Math.max(0.01, (r.run - r.span) / 2)
  return Math.max(0, Math.min(side, r.rise * (e - Math.abs(al)) / (e - flat)))
}

// ------------------------------------------------------------------------------------------ the cell grid
type Cells = Uint8Array
const has = (b: Block, level: number) => (level < 0 ? b.basement : level < b.storeys)
function raster(blocks: Block[], level: number): Cells {
  const c = new Uint8Array(NX * NZ)
  for (const b of blocks) {
    if (!has(b, level)) continue
    const i0 = Math.max(0, Math.round((b.x - PLOT.x0) / CELL)), i1 = Math.min(NX, Math.round((b.x + b.w - PLOT.x0) / CELL))
    const k0 = Math.max(0, Math.round((b.z - PLOT.z0) / CELL)), k1 = Math.min(NZ, Math.round((b.z + b.d - PLOT.z0) / CELL))
    for (let k = k0; k < k1; k++) c.fill(1, k * NX + i0, k * NX + i1)
  }
  return c
}
const at = (c: Cells, i: number, k: number) => (i < 0 || k < 0 || i >= NX || k >= NZ ? 0 : c[k * NX + i])
const NEIGH = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

export const LEVELS = [{ level: -1, code: 'B1', name: 'Basement' }, { level: 0, code: '00', name: 'Ground floor' }, { level: 1, code: '01', name: 'First floor' }, { level: 2, code: '02', name: 'Second floor' }] as const

/** The outline of everything built at one level, as wall segments in metres. `kind` says whether the wall belongs to new work. */
export function outline(d: Design, level: number) {
  const all = raster(d.blocks, level), old = raster(d.blocks.filter((b) => !isNew(b)), level)
  const segs: { x1: number; z1: number; x2: number; z2: number; fresh: boolean }[] = []
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    if (!all[k * NX + i]) continue
    const x = PLOT.x0 + i * CELL, z = PLOT.z0 + k * CELL, fresh = !old[k * NX + i]
    if (!at(all, i + 1, k)) segs.push({ x1: x + CELL, z1: z, x2: x + CELL, z2: z + CELL, fresh })
    if (!at(all, i - 1, k)) segs.push({ x1: x, z1: z, x2: x, z2: z + CELL, fresh })
    if (!at(all, i, k + 1)) segs.push({ x1: x, z1: z + CELL, x2: x + CELL, z2: z + CELL, fresh })
    if (!at(all, i, k - 1)) segs.push({ x1: x, z1: z, x2: x + CELL, z2: z, fresh })
  }
  // join collinear half-metre pieces into long walls so drawings stay light
  const out: typeof segs = []
  const key = (s: (typeof segs)[number]) => (s.x1 === s.x2 ? `v${s.x1}${s.fresh}` : `h${s.z1}${s.fresh}`)
  const groups = new Map<string, typeof segs>()
  for (const s of segs) { const g = groups.get(key(s)); if (g) g.push(s); else groups.set(key(s), [s]) }
  for (const g of groups.values()) {
    const v = g[0].x1 === g[0].x2
    g.sort((a, b) => (v ? a.z1 - b.z1 : a.x1 - b.x1))
    let cur = { ...g[0] }
    for (const s of g.slice(1)) {
      if (v ? s.z1 === cur.z2 : s.x1 === cur.x2) { cur.x2 = s.x2; cur.z2 = s.z2 } else { out.push(cur); cur = { ...s } }
    }
    out.push(cur)
  }
  return out
}

/** Areas by level and the envelope of the new work. Existing fabric is counted separately so extension figures are for what is added. */
export function areas(d: Design) {
  const old = d.blocks.filter((b) => !isNew(b))
  let wall = 0, junction = 0
  const roofSeen = new Uint8Array(NX * NZ)
  const levels = LEVELS.map((L) => {
    const all = raster(d.blocks, L.level), was = raster(old, L.level)
    let total = 0, added = 0, edges = 0
    for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
      const c = k * NX + i
      if (!all[c]) continue
      total++
      if (was[c]) continue
      added++
      if (L.level >= 0) roofSeen[c] = 1
      for (const [di, dk] of NEIGH) {
        if (!at(all, i + di, k + dk)) edges++
        else if (L.level === 0 && at(was, i + di, k + dk)) junction++
      }
    }
    if (L.level >= 0) wall += edges * CELL * 2.7
    return { ...L, total: total * CELL * CELL, added: added * CELL * CELL, existing: (total - added) * CELL * CELL, perimeter: edges * CELL }
  }).filter((l) => l.total > 0)

  // roof: each roofed cell belongs to the tallest new block over it; pitched roofs have more surface than their plan area
  let roofPlan = 0, roofSurface = 0, roofCost = 0
  const fresh = d.blocks.filter(isNew)
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    if (!roofSeen[k * NX + i]) continue
    const x = PLOT.x0 + (i + 0.5) * CELL, z = PLOT.z0 + (k + 0.5) * CELL
    let own: Block | null = null
    for (const b of fresh) if (x > b.x && x < b.x + b.w && z > b.z && z < b.z + b.d && (!own || b.storeys > own.storeys)) own = b
    const roof = own?.roof ?? 'flat'
    const f = roof === 'flat' ? 1 : Math.hypot(1, 2 * PITCH[roof] / (roof === 'mono' ? 2 : 1))
    roofPlan += CELL * CELL; roofSurface += CELL * CELL * f; roofCost += CELL * CELL * f * RATE.roof[roof]
  }
  const sum = (pick: (l: (typeof levels)[number]) => number, from = -1) => levels.filter((l) => l.level >= from).reduce((t, l) => t + pick(l), 0)
  const ground = levels.find((l) => l.level === 0)
  return {
    levels,
    gia: sum((l) => l.total), added: sum((l) => l.added), existing: sum((l) => l.existing),
    aboveGround: sum((l) => l.added, 0), upper: sum((l) => l.added, 1), basement: levels.find((l) => l.level === -1)?.added ?? 0,
    footprint: ground?.total ?? 0, footprintAdded: ground?.added ?? 0,
    coverage: (ground?.total ?? 0) / PLOT_AREA,
    wall, roofPlan, roofSurface, roofCost, junction: junction * CELL,
    upperLevels: levels.filter((l) => l.level >= 1 && l.added > 0).length,
  }
}
export type Areas = ReturnType<typeof areas>

// ------------------------------------------------------------------------------------------ editing
const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** Keep every block on the grid, inside the plot and inside the size limits, and drop features that no longer have a home. */
export function fix(d: Design): Design {
  const blocks = d.blocks.map((b) => {
    if (b.role === 'existing') return { ...HOUSE }
    const w = clampN(snap(b.w), SIZE.min, SIZE.max), dp = clampN(snap(b.d), SIZE.min, SIZE.max)
    return {
      ...b, w, d: dp, x: clampN(snap(b.x), PLOT.x0, PLOT.x1 - w), z: clampN(snap(b.z), PLOT.z0, PLOT.z1 - dp),
      storeys: outbuilding(b) ? 1 : clampN(Math.round(b.storeys), 1, SIZE.storeys), basement: outbuilding(b) ? false : b.basement,
    }
  })
  const withTerrace = new Set(d.features.filter((f) => f.key === 'terrace').map((f) => f.block))
  const next = { ...d, blocks }
  const seen = new Set<string>()
  const features = d.features.filter((f) => {
    const b = blocks.find((x) => x.id === f.block), id = f.key + f.block
    if (!b || seen.has(id) || !fits(next, f.key, b) || (f.key === 'dormer' && withTerrace.has(f.block))) return false
    seen.add(id); return true
  })
  return { ...next, features }
}

/** Pull a moving or stretching block flush with its neighbours when it comes within reach. */
export function magnet(d: Design, id: string, r: { x: number; z: number; w: number; d: number }, edges: { x0?: boolean; x1?: boolean; z0?: boolean; z1?: boolean }, reach = 0.75) {
  const others = d.blocks.filter((b) => b.id !== id)
  const pull = (mine: number[], theirs: number[]) => {
    let best = 0, gap = reach + 1e-6
    for (const m of mine) for (const t of theirs) if (Math.abs(t - m) < gap) { gap = Math.abs(t - m); best = t - m }
    return best
  }
  const near = (b: Block, axis: 'x' | 'z') => (axis === 'x' ? b.z <= r.z + r.d + 1 && b.z + b.d >= r.z - 1 : b.x <= r.x + r.w + 1 && b.x + b.w >= r.x - 1)
  const xs = others.filter((b) => near(b, 'x')).flatMap((b) => [b.x, b.x + b.w]), zs = others.filter((b) => near(b, 'z')).flatMap((b) => [b.z, b.z + b.d])
  const out = { ...r }
  const move = !edges.x0 && !edges.x1 && !edges.z0 && !edges.z1
  if (move) { out.x += pull([r.x, r.x + r.w], xs); out.z += pull([r.z, r.z + r.d], zs); return out }
  if (edges.x0) { const p = pull([r.x], xs); out.x += p; out.w -= p }
  if (edges.x1) out.w += pull([r.x + r.w], xs)
  if (edges.z0) { const p = pull([r.z], zs); out.z += p; out.d -= p }
  if (edges.z1) out.d += pull([r.z + r.d], zs)
  return out
}

export function patchBlock(d: Design, id: string, patch: Partial<Block>): Design {
  return fix({ ...d, blocks: d.blocks.map((b) => (b.id === id && b.role !== 'existing' ? { ...b, ...patch } : b)) })
}
const newId = (d: Design) => { let n = 1; while (d.blocks.some((b) => b.id === `b${n}`)) n++; return `b${n}` }
export const TRAY: { role: Role; name: string; w: number; d: number; storeys: number; roof: Roof }[] = [
  { role: 'wing', name: 'Wing', w: 5, d: 6, storeys: 1, roof: 'flat' },
  { role: 'wing', name: 'Two storey wing', w: 5, d: 5, storeys: 2, roof: 'gable' },
  { role: 'garden', name: 'Garden room', w: 5, d: 3.5, storeys: 1, roof: 'flat' },
  { role: 'garage', name: 'Garage', w: 3.5, d: 6, storeys: 1, roof: 'flat' },
]
/** Add a block centred on a plan point. Returns the design and the new block's id. */
export function addBlock(d: Design, t: (typeof TRAY)[number], cx: number, cz: number): [Design, string] {
  const id = newId(d)
  const raw = { x: snap(cx - t.w / 2), z: snap(cz - t.d / 2), w: t.w, d: t.d }
  const m = magnet(d, id, raw, {})
  return [fix({ ...d, blocks: [...d.blocks, { id, role: t.role, storeys: t.storeys, roof: t.roof, basement: false, ...raw, x: m.x, z: m.z }] }), id]
}
export function removeBlock(d: Design, id: string): Design {
  const b = d.blocks.find((x) => x.id === id)
  if (!b || b.role === 'existing' || d.blocks.filter((x) => x.role === 'main' || x.role === 'wing').length <= 1 && !outbuilding(b)) return d
  return fix({ ...d, blocks: d.blocks.filter((x) => x.id !== id) })
}
export const canRemove = (d: Design, id: string) => removeBlock(d, id) !== d

// ------------------------------------------------------------------------------------------ features
export const FEATURES: { key: FeatureKey; name: string; blurb: string; needs?: string }[] = [
  { key: 'basement', name: 'Basement', blurb: 'A full level below ground under the block.' },
  { key: 'dormer', name: 'Loft room and dormer', blurb: 'A room in the roof with a dormer to the garden.', needs: 'Needs a pitched roof' },
  { key: 'rooflights', name: 'Rooflights', blurb: 'Three rooflights for daylight deep in the plan.' },
  { key: 'balcony', name: 'Balcony', blurb: 'A first floor balcony with a glass guard.', needs: 'Needs two storeys' },
  { key: 'terrace', name: 'Roof terrace', blurb: 'A flat roof you can walk out onto.' },
  { key: 'porch', name: 'Porch', blurb: 'A covered front door.' },
  { key: 'garden', name: 'Garden room', blurb: 'A separate studio in the garden. Drag it where you like.' },
  { key: 'solar', name: 'Solar panels', blurb: 'An array on the best facing roof.' },
  { key: 'garage', name: 'Garage', blurb: 'A single garage. Drag it into place.' },
  { key: 'bay', name: 'Bay window', blurb: 'A bay to the front room.' },
  { key: 'chimney', name: 'Stove and chimney', blurb: 'A wood burner with a flue through the roof.' },
  { key: 'tall', name: 'Double height window', blurb: 'Two storeys of glass facing the garden.', needs: 'Needs two storeys' },
]
export const featureName = (k: FeatureKey) => FEATURES.find((f) => f.key === k)!.name

/** The block with the front door: the house being extended, or the block nearest the road. */
export function frontBlock(d: Design) {
  const pool = d.blocks.filter((b) => b.role === 'existing' || b.role === 'main' || b.role === 'wing')
  return pool.find((b) => b.role === 'existing') ?? pool.reduce((a, b) => (b.z + b.d > a.z + a.d ? b : a), pool[0])
}
/** Can this feature sit on this block? */
export function fits(d: Design, key: AttachKey, b: Block): boolean {
  if (outbuilding(b)) return key === 'rooflights' || key === 'solar'
  if (key === 'dormer') return (b.roof === 'gable' || b.roof === 'hip') && Math.min(b.w, b.d) >= 5
  if (key === 'balcony') return b.storeys >= 2
  if (key === 'tall') return b.storeys >= 2 && b.role !== 'existing'
  if (key === 'terrace') return b.role !== 'existing' && b.roof === 'flat'
  if (key === 'porch' || key === 'bay') return b === frontBlock(d) || b.id === frontBlock(d)?.id
  return true
}
const biggest = (list: Block[]) => list.reduce<Block | null>((a, b) => (!a || b.w * b.d * b.storeys > a.w * a.d * a.storeys ? b : a), null)

/** Where a feature would go, whether it is there already, and what stands in the way if it cannot be placed. */
export function featureState(d: Design, key: FeatureKey, selected?: string): { on: boolean; target: string | null; count: number; why?: string } {
  const sel = d.blocks.find((b) => b.id === selected)
  if (key === 'garden' || key === 'garage') {
    const have = d.blocks.filter((b) => b.role === key)
    return { on: have.length > 0, target: have[0]?.id ?? null, count: have.length }
  }
  if (key === 'basement') {
    const pool = d.blocks.filter((b) => b.role === 'main' || b.role === 'wing')
    const t = sel && pool.includes(sel) ? sel : pool.find((b) => b.basement) ?? biggest(pool)
    return { on: !!t?.basement, target: t?.id ?? null, count: pool.filter((b) => b.basement).length }
  }
  const have = d.features.filter((f) => f.key === key)
  // a terrace makes its own flat roof, so any new block can take one
  const ok = (b: Block) => (key === 'terrace' ? fits(d, key, { ...b, roof: 'flat' }) : fits(d, key, b))
  const pool = d.blocks.filter(ok)
  let t: Block | null = sel && ok(sel) ? sel : pool.find((b) => have.some((f) => f.block === b.id)) ?? null
  if (!t) {
    if (key === 'terrace') t = pool.filter((b) => pool.some((a) => a !== b && joins(a, b) && a.storeys > b.storeys))[0] ?? pool.find((b) => b.roof === 'flat') ?? pool[pool.length - 1] ?? null
    else if (key === 'solar' || key === 'rooflights' || key === 'chimney') t = biggest(pool.filter((b) => !outbuilding(b))) ?? pool[0] ?? null
    else t = biggest(pool)
  }
  return { on: !!t && have.some((f) => f.block === t.id), target: t?.id ?? null, count: have.length, why: t ? undefined : FEATURES.find((f) => f.key === key)!.needs ?? 'Add a block first' }
}

/** Add the feature if it is not there, take it away if it is. Returns the design and the block to select. */
export function toggleFeature(d: Design, key: FeatureKey, selected?: string): [Design, string | undefined] {
  const s = featureState(d, key, selected)
  if (key === 'garden' || key === 'garage') {
    if (s.on) return [fix({ ...d, blocks: d.blocks.filter((b) => b.id !== s.target) }), undefined]
    const t = TRAY.find((x) => x.role === key)!
    const [x, z] = key === 'garden' ? [-9, -15] : [10.5, 3]
    return addBlock(d, t, x, z)
  }
  if (!s.target) return [d, selected]
  if (key === 'basement') return [patchBlock(d, s.target, { basement: !s.on }), s.target]
  if (s.on) return [fix({ ...d, features: d.features.filter((f) => !(f.key === key && f.block === s.target)) }), s.target]
  const blocks = key === 'terrace' ? d.blocks.map((b) => (b.id === s.target ? { ...b, roof: 'flat' as const } : b)) : d.blocks
  return [fix({ ...d, blocks, features: [...d.features, { key, block: s.target }] }), s.target]
}

/** Which roof slope a roof feature sits on: -1 is the garden side (or left), +1 the road side (or right). */
export function slopes(d: Design, b: Block) {
  const r = roofOf(d.blocks, b), on = (k: AttachKey) => d.features.some((f) => f.key === k && f.block === b.id)
  const dormer = on('dormer') ? -1 : 0
  // bearing each slope faces, given which way the garden (the -z side) looks
  const g = { N: 0, E: 90, S: 180, W: 270 }[d.facing]
  const bearing = (s: number) => (g + (r.along ? (s < 0 ? 0 : 180) : s < 0 ? 270 : 90)) % 360
  const south = (s: number) => Math.abs(((bearing(s) - 180 + 540) % 360) - 180)
  let solar = b.roof === 'mono' ? 1 : south(-1) <= south(1) ? -1 : 1
  if (dormer && solar === dormer && b.roof !== 'mono') solar = 1
  const roofl = b.roof === 'mono' ? 1 : on('solar') && solar === 1 && !dormer ? -1 : 1
  return { dormer, solar: on('solar') ? solar : 0, rooflights: on('rooflights') ? roofl : 0, shared: on('solar') && on('rooflights') && solar === roofl, bearing: bearing(solar) }
}

/** The solar array for a block: panel count and peak output. */
export function solarArray(d: Design, b: Block) {
  const r = roofOf(d.blocks, b)
  const slope = b.roof === 'flat' ? r.span * 0.8 : Math.hypot(r.span / (b.roof === 'mono' ? 1 : 2), r.rise)
  const cols = Math.max(2, Math.min(6, Math.floor((r.run - 1.6) / 1.15))), rows = slope * (slopes(d, b).shared ? 0.55 : 0.8) >= 3.6 ? 2 : 1
  const panels = cols * rows
  return { panels, cols, rows, kwp: Math.round(panels * 0.42 * 10) / 10 }
}
/** The dormer on a block: its size and the volume it adds to the roof. */
export function dormerOf(d: Design, b: Block) {
  const r = roofOf(d.blocks, b)
  const width = Math.min(r.run - 1.2, 6), a = r.span / 2 + OVERHANG, slope = r.rise / a
  const setback = 0.6, top = r.rise - 0.3, faceH = Math.max(0.4, top - r.rise * (1 - (r.span / 2 - setback) / a)), back = faceH / slope
  return { width, faceH, back, setback, top, volume: width * faceH * back / 2 }
}

// ------------------------------------------------------------------------------------------ rate card and cost plan
export const RATE = {
  substructure: 320,                                         // per m2 of new ground floor
  basement: 3800,                                            // per m2 of basement, fitted out
  wall: { brick: 310, render: 260, timber: 330, zinc: 420 }, // per m2 of external wall
  upper: 190, stair: 5500,                                   // per m2 of upper floor, and a stair per upper level
  roof: { flat: 210, gable: 240, hip: 270, mono: 230 },      // per m2 of roof surface
  glazing: 720, glazed: { modest: 0.16, generous: 0.26, full: 0.4 },
  fitout: { standard: 780, high: 1150, premium: 1700 },      // per m2 of floor
  existing: 9500, junction: 650,                             // work to the house being extended, plus per metre of junction
  garden: 2200, garage: 1400,                                // per m2
  dormer: 48000, rooflights: 4500, balcony: 9000, terrace: 22000, porch: 7500, bay: 7000, chimney: 5500, tall: 16000, solar: 1200,
  prelims: 0.12, contingency: 0.1,
} as const

export type CostLine = { key: string; name: string; basis: string; cost: number }
const m2 = (n: number) => `${Math.round(n)} m²`

export function costPlan(d: Design) {
  const house = { ...d, blocks: d.blocks.filter((b) => !outbuilding(b)) }
  const a = areas(house), R = RATE
  const glazed = a.wall * R.glazed[d.glazing]
  const elements: CostLine[] = [
    { key: 'sub', name: 'Foundations and ground slab', basis: `${m2(a.footprintAdded)} at £${R.substructure}`, cost: a.footprintAdded * R.substructure },
    { key: 'wall', name: 'Frame and external walls', basis: `${m2(a.wall - glazed)} of wall`, cost: (a.wall - glazed) * R.wall[d.cladding] },
    { key: 'upper', name: 'Upper floors and stairs', basis: a.upper ? `${m2(a.upper)}, ${a.upperLevels === 1 ? 'one stair' : `${a.upperLevels} stairs`}` : 'none', cost: a.upper * R.upper + a.upperLevels * R.stair },
    { key: 'roof', name: 'Roof', basis: `${m2(a.roofSurface)} of roof`, cost: a.roofCost },
    { key: 'glaze', name: 'Windows and external doors', basis: `${m2(glazed)} of glass`, cost: glazed * R.glazing },
    { key: 'fit', name: 'Fit-out and services', basis: `${m2(a.aboveGround)} at £${R.fitout[d.spec].toLocaleString('en-GB')}`, cost: a.aboveGround * R.fitout[d.spec] },
  ]
  if (d.type === 'extension') elements.push({ key: 'old', name: 'Work to the existing house', basis: `${a.junction.toFixed(1)} m of junction`, cost: R.existing + a.junction * R.junction })

  const features: CostLine[] = []
  if (a.basement) features.push({ key: 'basement', name: 'Basement', basis: `${m2(a.basement)} at £${R.basement.toLocaleString('en-GB')}`, cost: a.basement * R.basement })
  for (const b of d.blocks.filter(outbuilding)) {
    const k = b.role as 'garden' | 'garage'
    features.push({ key: k, name: featureName(k), basis: `${m2(b.w * b.d)} at £${R[k].toLocaleString('en-GB')}`, cost: b.w * b.d * R[k] })
  }
  for (const f of d.features) {
    const b = d.blocks.find((x) => x.id === f.block)!
    if (f.key === 'solar') { const s = solarArray(d, b); features.push({ key: 'solar', name: 'Solar panels', basis: `${s.panels} panels, ${s.kwp} kWp`, cost: s.kwp * R.solar }) }
    else features.push({ key: f.key, name: featureName(f.key), basis: f.key === 'rooflights' ? 'three' : 'one', cost: R[f.key] })
  }
  const sum = (l: CostLine[]) => l.reduce((t, x) => t + x.cost, 0)
  const net = sum(elements) + sum(features), prelims = net * R.prelims, contingency = (net + prelims) * R.contingency
  const build = net + prelims + contingency
  const round = (l: CostLine[]) => l.map((x) => ({ ...x, cost: Math.round(x.cost) }))
  return {
    elements: round(elements), features: round(features), net: Math.round(net), prelims: Math.round(prelims), contingency: Math.round(contingency),
    build: Math.round(build), low: tidy(build * 0.92), high: tidy(build * 1.1),
    area: Math.round(areas(d).added), perM2: a.aboveGround + a.basement > 0 ? tidy(build / (a.aboveGround + a.basement)) : 0,
    vat: d.type === 'new' ? 'Before VAT. A new home is normally zero rated.' : 'Before VAT. Extensions normally carry VAT at 20%.',
  }
}
export type CostPlan = ReturnType<typeof costPlan>

const STAGES: [string, number][] = [['Feasibility and concept design', 0.15], ['Planning application', 0.2], ['Technical design', 0.35], ['Tender and site stage', 0.3]]
/** The practice fee: a percentage of the build budget that falls as jobs get bigger, with a floor for small jobs. */
export function fee(build: number) {
  const pct = build < 150_000 ? 0.12 : build < 400_000 ? 0.1 : build < 800_000 ? 0.085 : 0.075
  const raw = Math.max(6500, build * pct)
  const lines = STAGES.map(([name, share]) => [name, tidy(raw * share)] as [string, number])
  return { pct, lines, total: lines.reduce((t, l) => t + l[1], 0) }
}

/** What adding (or keeping) one feature is worth: the change in build budget and in fee. The upsell figure on every tray button. */
export function featureDelta(d: Design, key: FeatureKey, selected?: string) {
  const s = featureState(d, key, selected)
  if (!s.target && key !== 'garden' && key !== 'garage') return null
  const [other] = toggleFeature(d, key, selected)
  const a = costPlan(d).build, b = costPlan(other).build
  return { build: tidy(Math.abs(a - b)), fee: Math.abs(fee(a).total - fee(b).total) }
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six']
export function summary(d: Design) {
  const fresh = d.blocks.filter((b) => b.role === 'main' || b.role === 'wing'), a = areas(d)
  const top = Math.max(...fresh.map((b) => b.storeys))
  const what = d.type === 'new' ? 'New build home' : 'Extension to a ' + (d.house === 'semi' ? 'semi-detached' : d.house === 'terrace' ? 'terraced' : 'detached') + ' house'
  const shape = `${WORDS[fresh.length] ?? fresh.length} ${fresh.length === 1 ? 'block' : 'blocks'}, up to ${WORDS[top]} ${top === 1 ? 'storey' : 'storeys'}`
  const names = [...(a.basement ? ['basement'] : []), ...d.blocks.filter(outbuilding).map((b) => featureName(b.role as FeatureKey).toLowerCase()), ...d.features.map((f) => featureName(f.key).toLowerCase())]
  const extras = [...new Set(names)]
  return { what, shape, area: Math.round(a.added), extras, extrasLine: extras.length ? extras.join(', ') : 'none' }
}

/** Where the walk-through lands: an L-shaped new home, not an empty plot. */
export const START = start('new')
