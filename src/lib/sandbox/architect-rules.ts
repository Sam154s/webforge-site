// Architect designer rules: the permitted development guide, the sun study maths and the RIBA stage programme.
// The planning figures are the householder permitted development limits for England (GPDO 2015, Schedule 2, Part 1,
// and the government's technical guidance). They are shown as a guide only: the practice confirms every one at feasibility,
// because article 4 directions and removed rights are set property by property.
import { HOUSE, PLOT, PLOT_AREA, areas, dormerOf, fee, joins, roofOf, type Block, type Design, type Facing } from './architect-model'

export type Status = 'ok' | 'prior' | 'planning' | 'check'
export const STATUS: Record<Status, string> = { ok: 'Within the guide', prior: 'Prior approval', planning: 'Needs planning', check: 'To confirm' }
export type Check = { id: string; name: string; status: Status; value: string; limit: string; text: string }
/** A dimension to draw in red on the model: two points in metres (x, height, z) and its label. */
export type Mark = { a: [number, number, number]; b: [number, number, number]; text: string }
export type RouteKey = 'pd' | 'prior' | 'householder' | 'full'
export const GUIDE_LINE = 'This is a guide, not a decision. Harlow & Finch confirm every point at feasibility.'

const m = (n: number) => `${n.toFixed(1)} m`
const outb = (b: Block) => b.role === 'garden' || b.role === 'garage'
const edge = (b: Block) => Math.min(b.x - PLOT.x0, PLOT.x1 - (b.x + b.w), b.z - PLOT.z0, PLOT.z1 - (b.z + b.d))

export function planning(d: Design) {
  const checks: Check[] = [], marks: Mark[] = []
  const add = (id: string, name: string, status: Status, value: string, limit: string, text: string) => checks.push({ id, name, status, value, limit, text })
  const has = (k: string) => d.features.some((f) => f.key === k)
  const basement = d.blocks.some((b) => b.basement)

  if (d.type === 'new') {
    // A new home always needs a full application. These are the things a planning officer looks at first.
    const a = areas(d), house = d.blocks.filter((b) => !outb(b))
    const top = Math.max(...house.map((b) => roofOf(d.blocks, b).top)), near = Math.min(...house.map(edge))
    add('route', 'Planning route', 'planning', 'New home', 'Full application', 'A new home always needs a full planning application. We prepare and submit it for you.')
    add('cover', 'Plot coverage', 'ok', `${Math.round(a.coverage * 100)}% of the plot`, 'No fixed limit', 'How much of the plot is built on. Planners weigh this against the street.')
    add('height', 'Height', top > 9.5 ? 'check' : 'ok', m(top), 'Neighbours about 8.5 m', top > 9.5 ? 'Taller than the houses either side. Expect the planner to ask about this.' : 'In keeping with the two storey houses either side.')
    add('edge', 'Distance to the boundary', near < 1 ? 'check' : 'ok', m(near), '1 m is a common ask', near < 1 ? 'Very close to the boundary. Access, light to neighbours and Party Wall Act notices are worth discussing.' : 'Room to get round the house and keep light to the neighbours.')
    if (has('balcony') || has('terrace')) add('look', 'Balcony or roof terrace', 'check', 'Included', 'Overlooking', 'Planners look hard at overlooking. Privacy screens are often asked for.')
    if (basement) add('base', 'Basement', 'check', 'Included', 'Local policy', 'Many councils have their own basement policy. A structural engineer and Party Wall Act notices are likely.')
    if (near < 1) { const b = house.reduce((p, c) => (edge(c) < edge(p) ? c : p)); marks.push(nearMark(b)) }
    return { route: ROUTES.full, checks, marks, flags: checks.filter((c) => c.status !== 'ok' && c.id !== 'route').length }
  }

  const H = HOUSE, hr = roofOf(d.blocks, H), detached = d.house === 'detached'
  const ext = d.blocks.filter((b) => b.role !== 'existing' && (!outb(b) || joins(b, H)))
  const out = d.blocks.filter((b) => outb(b) && !joins(b, H))
  const cons = d.conservation

  // rear, single storey
  const rear1 = ext.filter((b) => b.storeys === 1 && b.z < H.z), rear2 = ext.filter((b) => b.storeys >= 2 && b.z < H.z)
  if (rear1.length) {
    const b = rear1.reduce((p, c) => (c.z < p.z ? c : p)), depth = H.z - b.z, lim = detached ? 4 : 3, big = detached ? 8 : 6
    const st: Status = depth <= lim ? 'ok' : depth <= big && !cons ? 'prior' : 'planning'
    add('rear1', 'Rear extension, single storey', st, m(depth), `${lim} m`, st === 'ok' ? `Within the ${lim} m depth for a ${d.house === 'detached' ? 'detached' : 'attached'} house.`
      : st === 'prior' ? `Over ${lim} m. Up to ${big} m can go through prior approval, where the council consults your neighbours for 42 days.` : `Deeper than permitted development allows${cons ? ' in a conservation area' : ''}. This needs a planning application.`)
    if (st !== 'ok') marks.push({ a: [b.x + b.w + 0.7, 0.06, H.z], b: [b.x + b.w + 0.7, 0.06, b.z], text: `${m(depth)}, guide ${lim} m` })
  }
  // rear, two storey
  if (rear2.length) {
    const b = rear2.reduce((p, c) => (c.z < p.z ? c : p)), depth = H.z - b.z, gap = b.z - PLOT.z0
    const st: Status = cons || depth > 3 || gap < 7 ? 'planning' : 'ok'
    add('rear2', 'Rear extension, two storey', st, m(depth), '3 m', cons ? 'Two storey rear extensions are not permitted development in a conservation area.'
      : depth > 3 ? 'More than 3 m beyond the rear wall. This needs a planning application.' : gap < 7 ? `Only ${m(gap)} from the rear boundary. The guide asks for 7 m.` : 'Within 3 m of the rear wall and at least 7 m from the rear boundary. The roof pitch should match the house.')
    if (depth > 3) marks.push({ a: [b.x + b.w + 0.7, 0.06, H.z], b: [b.x + b.w + 0.7, 0.06, b.z], text: `${m(depth)}, guide 3 m` })
  }
  // side
  const sides = ext.map((b) => ({ b, over: Math.max(H.x - b.x, b.x + b.w - (H.x + H.w)) })).filter((s) => s.over > 0)
  if (sides.length) {
    const { b, over } = sides.reduce((p, c) => (c.over > p.over ? c : p)), two = sides.some((s) => s.b.storeys > 1), half = H.w / 2
    const st: Status = cons || two || over > half ? 'planning' : 'ok'
    add('side', 'Side extension', st, `${m(over)} wide`, `${m(half)} (half the house)`, cons ? 'Side extensions are not permitted development in a conservation area.'
      : two ? 'A side extension has to be single storey to be permitted development.' : over > half ? 'Wider than half the width of the original house. This needs a planning application.' : 'Single storey and no wider than half the original house.')
    if (st !== 'ok' && !cons) {
      const right = b.x + b.w - (H.x + H.w) >= H.x - b.x, z = Math.max(b.z + b.d, H.z + H.d) + 0.7
      marks.push({ a: [right ? H.x + H.w : H.x, 0.06, z], b: [right ? b.x + b.w : b.x, 0.06, z], text: `${m(over)}, guide ${m(half)}` })
    }
  }
  // forward of the front wall
  const fwd = ext.filter((b) => b.z + b.d > H.z + H.d)
  if (fwd.length) {
    const b = fwd[0], over = b.z + b.d - (H.z + H.d)
    add('front', 'Forward of the front wall', 'planning', m(over), 'Nothing forward', 'Permitted development does not allow building in front of the main elevation.')
    marks.push({ a: [b.x - 0.7, 0.06, H.z + H.d], b: [b.x - 0.7, 0.06, b.z + b.d], text: `${m(over)} forward` })
  }
  // heights
  if (ext.length) {
    const tall = ext.map((b) => ({ b, r: roofOf(d.blocks, b) }))
    const one = tall.filter((t) => t.b.storeys === 1), hi = one.length ? one.reduce((p, c) => (c.r.top > p.r.top ? c : p)) : null
    if (hi) {
      const st: Status = hi.r.top > 4 ? 'planning' : 'ok'
      add('h1', 'Height, single storey', st, m(hi.r.top), '4 m', st === 'ok' ? 'No higher than 4 m.' : 'Higher than 4 m. A lower pitch or a flat roof would bring it back inside the guide.')
      if (st !== 'ok') marks.push(heightMark(hi.b, hi.r.top, `${m(hi.r.top)}, guide 4 m`))
    }
    const top = tall.reduce((p, c) => (c.r.top > p.r.top ? c : p)), eav = tall.reduce((p, c) => (c.r.eave > p.r.eave ? c : p))
    if (top.r.top > hr.top + 0.01 || eav.r.eave > hr.eave + 0.01) {
      add('ridge', 'Higher than the house', 'planning', m(top.r.top), `${m(hr.top)} ridge`, 'New work may not stand above the existing eaves or ridge under permitted development.')
      marks.push(heightMark(top.b, top.r.top, `${m(top.r.top)}, house ${m(hr.top)}`))
    }
    const close = tall.filter((t) => edge(t.b) < 2 && t.r.eave > 3)
    if (close.length) {
      add('eaves', 'Eaves near a boundary', 'planning', m(close[0].r.eave), '3 m within 2 m', 'Within 2 m of a boundary the eaves may be no higher than 3 m.')
      marks.push(heightMark(close[0].b, close[0].r.eave, `${m(close[0].r.eave)} eaves, guide 3 m`))
    }
  }
  // half the land around the house
  const a = areas(d), land = PLOT_AREA - H.w * H.d, used = (a.footprint - H.w * H.d) / land
  add('cover', 'Share of the garden built on', used > 0.5 ? 'planning' : 'ok', `${Math.round(used * 100)}%`, '50%', 'Extensions and outbuildings together may cover no more than half the land around the original house.')
  // outbuildings
  for (const b of out) {
    const r = roofOf(d.blocks, b), name = b.role === 'garden' ? 'Garden room' : 'Garage', near = edge(b) < 2
    let st: Status = 'ok', text = 'Eaves no higher than 2.5 m and set back from the boundaries.', limit = near ? '2.5 m within 2 m' : '4 m, dual pitch'
    if (b.z + b.d > H.z + H.d) { st = 'planning'; text = 'Outbuildings may not sit in front of the main elevation.'; limit = 'Behind the front wall' }
    else if (near && r.top > 2.5) { st = 'planning'; text = 'Within 2 m of a boundary an outbuilding may be no higher than 2.5 m overall. Move it in, or lower the roof.'; marks.push(heightMark(b, r.top, `${m(r.top)}, guide 2.5 m`)) }
    else if (b.roof === 'gable' && r.top > 4) { st = 'planning'; text = 'Higher than 4 m with a dual pitched roof.'; marks.push(heightMark(b, r.top, `${m(r.top)}, guide 4 m`)) }
    else if (b.roof !== 'gable' && r.top > 2.5) { st = 'check'; text = 'The height limit depends on the roof type. We confirm this at feasibility.'; limit = 'Depends on roof' }
    add('out' + b.id, name, st, `${m(r.top)} high`, limit, text)
  }
  // roof and loft
  for (const f of d.features.filter((x) => x.key === 'dormer')) {
    const b = d.blocks.find((x) => x.id === f.block)!
    if (b.role !== 'existing') continue
    const v = dormerOf(d, b).volume, lim = d.house === 'terrace' ? 40 : 50
    add('loft', 'Loft room and dormer', cons ? 'planning' : v > lim ? 'planning' : 'ok', `about ${Math.round(v)} m³`, `${lim} m³`, cons ? 'Roof extensions are not permitted development in a conservation area.'
      : 'Inside the volume allowance, on the rear slope and set back from the eaves. Earlier roof additions count towards the same allowance.')
  }
  if (has('rooflights')) add('rl', 'Rooflights', 'ok', 'Flush', '150 mm proud', 'Rooflights that sit no more than 150 mm proud of the roof are normally permitted development.')
  if (has('balcony') || has('terrace')) add('plat', 'Balcony or roof terrace', 'planning', 'Included', 'Not permitted', 'Balconies and raised platforms are never permitted development. Planners look at overlooking.')
  if (has('porch')) add('porch', 'Porch', 'ok', '2.8 m², 2.7 m high', '3 m², 3 m high', 'Within the porch allowance and more than 2 m from the road boundary.')
  if (has('bay')) add('bay', 'Front bay window', 'planning', 'On the front', 'Nothing forward', 'A bay on the front wall projects forward of the main elevation, so it needs a planning application.')
  if (has('solar')) add('solar', 'Solar panels', 'check', 'On the roof', 'Usually allowed', 'Solar panels are usually permitted development. We confirm the current rules at feasibility.')
  if (basement) add('base', 'Basement', 'planning', 'Included', 'Local policy', 'A basement usually needs a planning application, and Party Wall Act notices to the neighbours.')
  if (ext.length && d.cladding !== 'brick') add('mat', 'Materials', cons ? 'planning' : 'check', `${d.cladding[0].toUpperCase()}${d.cladding.slice(1)} cladding`, 'Similar to the house',
    cons ? 'New cladding is not permitted development in a conservation area.' : 'Permitted development expects materials similar in appearance to the house. Worth checking for this finish.')

  const route = checks.some((c) => c.status === 'planning') ? ROUTES.householder : checks.some((c) => c.status === 'prior') ? ROUTES.prior : ROUTES.pd
  return { route, checks, marks, flags: checks.filter((c) => c.status !== 'ok').length }
}
export type Planning = ReturnType<typeof planning>

export const ROUTES: Record<RouteKey, { key: RouteKey; name: string; text: string; weeks: number }> = {
  pd: { key: 'pd', name: 'Likely permitted development', text: 'On these figures no planning application is needed. We would still confirm it in writing before work starts.', weeks: 0 },
  prior: { key: 'prior', name: 'Prior approval', text: 'A lighter route than a full application. The council consults your neighbours for 42 days.', weeks: 6 },
  householder: { key: 'householder', name: 'Householder planning application', text: 'One or more points go beyond permitted development, so this needs a householder application. Decisions usually take 8 weeks.', weeks: 8 },
  full: { key: 'full', name: 'Full planning application', text: 'A new home needs a full application. Decisions usually take 8 weeks from validation.', weeks: 8 },
}

function heightMark(b: Block, h: number, text: string): Mark {
  const x = b.x + b.w + 0.5, z = b.z + b.d + 0.5
  return { a: [x, 0, z], b: [x, h, z], text }
}
function nearMark(b: Block): Mark {
  const gaps: [number, Mark][] = [
    [b.x - PLOT.x0, { a: [PLOT.x0, 0.06, b.z + b.d / 2], b: [b.x, 0.06, b.z + b.d / 2], text: '' }],
    [PLOT.x1 - b.x - b.w, { a: [b.x + b.w, 0.06, b.z + b.d / 2], b: [PLOT.x1, 0.06, b.z + b.d / 2], text: '' }],
    [b.z - PLOT.z0, { a: [b.x + b.w / 2, 0.06, PLOT.z0], b: [b.x + b.w / 2, 0.06, b.z], text: '' }],
    [PLOT.z1 - b.z - b.d, { a: [b.x + b.w / 2, 0.06, b.z + b.d], b: [b.x + b.w / 2, 0.06, PLOT.z1], text: '' }],
  ]
  const [gap, mark] = gaps.reduce((p, c) => (c[0] < p[0] ? c : p))
  return { ...mark, text: `${m(gap)} to boundary` }
}

// ------------------------------------------------------------------------------------------ sun study
export const LAT = 51.5
export const SEASONS = [
  { key: 'spring', name: 'Spring', date: '21 March', day: 80 },
  { key: 'summer', name: 'Summer', date: '21 June', day: 172 },
  { key: 'autumn', name: 'Autumn', date: '21 September', day: 264 },
  { key: 'winter', name: 'Winter', date: '21 December', day: 355 },
] as const
export type SeasonKey = (typeof SEASONS)[number]['key']
const rad = Math.PI / 180

/** Sun altitude and compass bearing in degrees for a day of the year and a solar hour, at the latitude of southern England. */
export function sunAt(day: number, hour: number, lat = LAT) {
  const dec = 23.44 * Math.sin(rad * (360 / 365) * (284 + day)) * rad, H = 15 * (hour - 12) * rad, la = lat * rad
  const alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H))
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(la) - Math.tan(dec) * Math.cos(la)) / rad + 180
  return { alt: alt / rad, az: (az + 360) % 360 }
}
/** Sunrise and sunset as solar hours. */
export function daylight(day: number, lat = LAT): [number, number] {
  const dec = 23.44 * Math.sin(rad * (360 / 365) * (284 + day)) * rad
  const h = Math.acos(-Math.tan(lat * rad) * Math.tan(dec)) / rad / 15
  return [12 - h, 12 + h]
}
const GARDEN: Record<Facing, number> = { N: 0, E: 90, S: 180, W: 270 }
/** Direction to the sun in model space (x right, y up, z towards the road), given which way the garden faces. */
export function sunVector(facing: Facing, day: number, hour: number) {
  const s = sunAt(day, hour), b = (s.az - GARDEN[facing]) * rad, c = Math.cos(s.alt * rad)
  return { x: Math.sin(b) * c, y: Math.sin(s.alt * rad), z: -Math.cos(b) * c, alt: s.alt, az: s.az }
}
/** Direction of north in model space, for the north point. */
export const northVector = (facing: Facing) => ({ x: Math.sin(-GARDEN[facing] * rad), z: -Math.cos(-GARDEN[facing] * rad) })
export const clock = (hour: number) => `${Math.floor(hour)}:${String(Math.round((hour % 1) * 60)).padStart(2, '0')}`

// ------------------------------------------------------------------------------------------ programme
export type Row = { code: string; name: string; start: number; weeks: number; fee: number; gate?: string }
/** RIBA Plan of Work stages as a programme in weeks. Durations are example figures that scale with size and planning route. */
export function programme(d: Design, build: number) {
  const p = planning(d), a = areas(d), f = fee(build).lines
  const steps: [string, string, number, number, string?][] = [
    ['0-1', 'Brief and feasibility', 3, 0, 'Measured survey'],
    ['2', 'Concept design', Math.round(4 + a.added / 80), f[0][1]],
    ['3', 'Planning', (p.route.key === 'pd' ? 3 : 5) + p.route.weeks, f[1][1], p.route.key === 'pd' ? 'Permitted development confirmed' : p.route.key === 'prior' ? 'Prior approval, 42 days' : 'Planning decision, 8 weeks'],
    ['4', 'Technical design', Math.round(8 + a.added / 40), f[2][1], 'Building Regulations'],
    ['4', 'Tender', 4, 0, 'Builder appointed, start on site'],
    ['5', 'Construction', Math.round(d.type === 'new' ? 14 + a.added * 0.14 : 8 + a.added * 0.2), f[3][1], 'Practical completion'],
    ['6', 'Handover', 2, 0, 'Keys handed over'],
  ]
  let t = 0
  const rows: Row[] = steps.map(([code, name, weeks, fe, gate]) => { const r = { code, name, start: t, weeks, fee: fe, gate }; t += weeks; return r })
  return { rows, weeks: t, months: Math.round(t / 4.345) }
}
