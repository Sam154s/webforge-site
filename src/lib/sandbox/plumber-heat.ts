// Heating planner: room-by-room heat loss, a radiator schedule, boiler sizing, three priced options, a heat pump
// readiness check and a pipe route. Plain code: the same house always gives the same answer.
// The method is the simplified BS EN 12831 sum (fabric plus ventilation). The U-values, air change rates, radiator
// outputs, efficiencies and prices are rules of thumb and example figures for a fictional firm. Every result is an
// estimate that a survey confirms.

export const CELL = 0.5       // metres per grid square on the plan
export const CEILING = 2.4    // metres
export const STOREY = 2.6     // metres, floor to floor, for the pipe route
export const GRID = { w: 22, h: 24 }   // plan size in squares

export type RoomType = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'hall'
export type AgeKey = 'pre1930' | 'y1930' | 'y1976' | 'y2003' | 'y2013'
export type WallKey = 'solid' | 'cavity' | 'filled' | 'modern'
export type GlazKey = 'single' | 'olddouble' | 'double'
export type LoftKey = 'none' | 'mm100' | 'mm270'
export type RegionKey = 'south' | 'north' | 'scotland'
export type WinKey = 'none' | 'small' | 'medium' | 'large'
export type RadType = 'K1' | 'PP' | 'K2' | 'K3'
export type FlowKey = 'f75' | 'f70' | 'f55' | 'f50' | 'f45'
export type TemplateKey = 'terrace' | 'semi' | 'detached'

export type Rad = { type: RadType; mm: number }
export type Room = { id: string; name: string; type: RoomType; floor: 0 | 1; x: number; y: number; w: number; h: number; win: WinKey; rad: Rad | null; wall?: WallKey }
export type House = { template: TemplateKey; age: AgeKey; wall: WallKey; glazing: GlazKey; loft: LoftKey; region: RegionKey; party: { left: boolean; right: boolean }; rooms: Room[] }

// ---------------------------------------------------------------------------------------------- tables
export const ROOM: Record<RoomType, { name: string; ti: number; ach: number }> = {
  living: { name: 'Living room', ti: 21, ach: 1.5 },
  kitchen: { name: 'Kitchen', ti: 18, ach: 2 },
  bedroom: { name: 'Bedroom', ti: 18, ach: 1 },
  bathroom: { name: 'Bathroom', ti: 22, ach: 2 },
  hall: { name: 'Hall or landing', ti: 18, ach: 1.5 },
}
export const WALL: Record<WallKey, { name: string; u: number }> = {
  solid: { name: 'Solid brick', u: 2.1 },
  cavity: { name: 'Cavity, not filled', u: 1.5 },
  filled: { name: 'Cavity, filled', u: 0.55 },
  modern: { name: 'Modern insulated', u: 0.3 },
}
export const GLAZING: Record<GlazKey, { name: string; u: number }> = {
  single: { name: 'Single glazing', u: 4.8 },
  olddouble: { name: 'Older double glazing', u: 2.8 },
  double: { name: 'Modern double glazing', u: 1.4 },
}
export const LOFT: Record<LoftKey, { name: string; u: number }> = {
  none: { name: 'No loft insulation', u: 2.3 },
  mm100: { name: '100 mm', u: 0.4 },
  mm270: { name: '270 mm', u: 0.16 },
}
export const REGION: Record<RegionKey, { name: string; to: number }> = {
  south: { name: 'London and south', to: -2 },
  north: { name: 'North of England', to: -3 },
  scotland: { name: 'Scotland', to: -4 },
}
// quick: the installer's whole-house rule of thumb, used as a sense check beside the room-by-room sum.
// air: share of the full air change rate. floorU: ground floor, insulated in newer homes.
export const AGE: Record<AgeKey, { name: string; wall: WallKey; glazing: GlazKey; loft: LoftKey; air: number; floorU: number; quick: [number, number] }> = {
  pre1930: { name: 'Before 1930', wall: 'solid', glazing: 'olddouble', loft: 'mm100', air: 1, floorU: 0.7, quick: [100, 120] },
  y1930: { name: '1930 to 1975', wall: 'cavity', glazing: 'olddouble', loft: 'mm100', air: 1, floorU: 0.7, quick: [80, 90] },
  y1976: { name: '1976 to 2002', wall: 'filled', glazing: 'olddouble', loft: 'mm100', air: 1, floorU: 0.7, quick: [60, 70] },
  y2003: { name: '2003 to 2012', wall: 'modern', glazing: 'double', loft: 'mm270', air: 0.75, floorU: 0.25, quick: [45, 50] },
  y2013: { name: '2013 or later', wall: 'modern', glazing: 'double', loft: 'mm270', air: 0.5, floorU: 0.25, quick: [30, 40] },
}
export const WINDOW: Record<WinKey, { name: string; m2: number }> = {
  none: { name: 'None', m2: 0 },
  small: { name: 'Small', m2: 1 },
  medium: { name: 'Medium', m2: 1.8 },
  large: { name: 'Large or doors', m2: 3.2 },
}
// Output in watts per metre of length, 600 mm high, at the catalogue condition (75 flow, 65 return, 20 room).
export const RAD: Record<RadType, { name: string; short: string; perM: number; fit: number; perMPrice: number }> = {
  K1: { name: 'Single panel, single fin', short: 'K1', perM: 1000, fit: 110, perMPrice: 60 },
  PP: { name: 'Double panel, single fin', short: 'P+', perM: 1400, fit: 110, perMPrice: 85 },
  K2: { name: 'Double panel, double fin', short: 'K2', perM: 1750, fit: 110, perMPrice: 105 },
  K3: { name: 'Triple panel, triple fin', short: 'K3', perM: 2400, fit: 110, perMPrice: 150 },
}
export const RAD_ORDER: RadType[] = ['K1', 'PP', 'K2', 'K3']
export const RAD_MM = { min: 400, max: 2000, step: 100 }
export const FLOW: Record<FlowKey, { name: string; flow: number; ret: number; note: string }> = {
  f75: { name: '75 / 65', flow: 75, ret: 65, note: 'How older systems were set' },
  f70: { name: '70 / 50', flow: 70, ret: 50, note: 'A condensing boiler as usually set' },
  f55: { name: '55 / 45', flow: 55, ret: 45, note: 'What new systems are designed to' },
  f50: { name: '50 / 40', flow: 50, ret: 40, note: 'Low temperature' },
  f45: { name: '45 / 40', flow: 45, ret: 40, note: 'Heat pump territory' },
}
export const FLOW_ORDER: FlowKey[] = ['f75', 'f70', 'f55', 'f50', 'f45']

// ---------------------------------------------------------------------------------------------- geometry
const cellsOf = (r: Room) => { const out: string[] = []; for (let i = 0; i < r.w; i++) for (let j = 0; j < r.h; j++) out.push(`${r.x + i},${r.y + j}`); return out }
const filled = (rooms: Room[], floor: number, skip?: string) => new Set(rooms.filter((r) => r.floor === floor && r.id !== skip).flatMap(cellsOf))
export const overlaps = (rooms: Room[], r: Room) => { const f = filled(rooms, r.floor, r.id); return cellsOf(r).some((c) => f.has(c)) }
export const inGrid = (r: Room) => r.x >= 0 && r.y >= 0 && r.w >= 2 && r.h >= 2 && r.x + r.w <= GRID.w && r.y + r.h <= GRID.h
export const fits = (rooms: Room[], r: Room) => inGrid(r) && !overlaps(rooms, r)
export const bounds = (rooms: Room[]) => rooms.length
  ? { x0: Math.min(...rooms.map((r) => r.x)), y0: Math.min(...rooms.map((r) => r.y)), x1: Math.max(...rooms.map((r) => r.x + r.w)), y1: Math.max(...rooms.map((r) => r.y + r.h)) }
  : { x0: 0, y0: 0, x1: 0, y1: 0 }

export type Side = 'n' | 'e' | 's' | 'w'
export type Run = { side: Side; kind: 'ext' | 'party' | 'int'; x1: number; y1: number; x2: number; y2: number; cells: number }

/** Every wall of a room, split into runs that face outside, a neighbour's house (party wall) or another room. */
export function runs(house: House, room: Room): Run[] {
  const same = filled(house.rooms, room.floor, room.id), b = bounds(house.rooms), out: Run[] = []
  const add = (side: Side, n: number, at: (i: number) => { nx: number; ny: number; x: number; y: number }, dx: number, dy: number) => {
    let cur: Run | null = null
    for (let i = 0; i < n; i++) {
      const p = at(i)
      const party = (side === 'w' && house.party.left && room.x === b.x0) || (side === 'e' && house.party.right && room.x + room.w === b.x1)
      const kind: Run['kind'] = same.has(`${p.nx},${p.ny}`) ? 'int' : party ? 'party' : 'ext'
      if (cur && cur.kind === kind) { cur.x2 = p.x + dx; cur.y2 = p.y + dy; cur.cells++ }
      else { cur = { side, kind, x1: p.x, y1: p.y, x2: p.x + dx, y2: p.y + dy, cells: 1 }; out.push(cur) }
    }
  }
  add('n', room.w, (i) => ({ nx: room.x + i, ny: room.y - 1, x: room.x + i, y: room.y }), 1, 0)
  add('s', room.w, (i) => ({ nx: room.x + i, ny: room.y + room.h, x: room.x + i, y: room.y + room.h }), 1, 0)
  add('w', room.h, (i) => ({ nx: room.x - 1, ny: room.y + i, x: room.x, y: room.y + i }), 0, 1)
  add('e', room.h, (i) => ({ nx: room.x + room.w, ny: room.y + i, x: room.x + room.w, y: room.y + i }), 0, 1)
  return out
}

const r0 = (n: number) => Math.round(n)
const r1 = (n: number) => Math.round(n * 10) / 10

// ---------------------------------------------------------------------------------------------- heat loss
/** Q = sum(U x A) x (Ti - To) + 0.33 x n x V x (Ti - To), in watts, for one room. */
export function roomLoss(house: House, room: Room) {
  const age = AGE[house.age], kind = ROOM[room.type]
  const dT = kind.ti - REGION[house.region].to
  const area = room.w * room.h * CELL * CELL
  const extLen = runs(house, room).filter((r) => r.kind === 'ext').reduce((t, r) => t + r.cells, 0) * CELL
  const gross = extLen * CEILING
  const winArea = Math.min(WINDOW[room.win].m2, gross * 0.6)
  const wallArea = gross - winArea
  const above = filled(house.rooms, 1)
  const roofArea = room.floor === 1 ? area : cellsOf(room).filter((c) => !above.has(c)).length * CELL * CELL
  const floorArea = room.floor === 0 ? area : 0
  const uWall = WALL[room.wall ?? house.wall].u
  const ach = kind.ach * age.air
  const volume = area * CEILING
  const walls = r0(uWall * wallArea * dT)
  const windows = r0(GLAZING[house.glazing].u * winArea * dT)
  const roof = r0(LOFT[house.loft].u * roofArea * dT)
  const floor = r0(age.floorU * floorArea * dT)
  const air = r0(0.33 * ach * volume * dT)
  const watts = walls + windows + roof + floor + air
  return { id: room.id, name: room.name, type: room.type, ti: kind.ti, dT, area: r1(area), extLen: r1(extLen), wallArea: r1(wallArea), winArea: r1(winArea), roofArea: r1(roofArea), floorArea: r1(floorArea),
    ach: r1(ach * 100) / 100, volume: r1(volume), walls, windows, roof, floor, air, watts, wm2: r0(watts / area) }
}
export type RoomLoss = ReturnType<typeof roomLoss>

export function houseLoss(house: House) {
  const rooms = house.rooms.map((r) => roomLoss(house, r))
  const watts = rooms.reduce((t, r) => t + r.watts, 0)
  const area = r1(rooms.reduce((t, r) => t + r.area, 0))
  const part = (k: 'walls' | 'windows' | 'roof' | 'floor' | 'air') => rooms.reduce((t, r) => t + r[k], 0)
  const quick = AGE[house.age].quick
  const wm2 = area ? r0(watts / area) : 0
  return { rooms, watts, kw: r1(watts / 1000), area, wm2, to: REGION[house.region].to,
    split: { walls: part('walls'), windows: part('windows'), roof: part('roof'), floor: part('floor'), air: part('air') },
    quick, quickWatts: [r0(quick[0] * area), r0(quick[1] * area)] as [number, number],
    against: wm2 < quick[0] ? 'below' : wm2 > quick[1] ? 'above' : 'within' as 'below' | 'above' | 'within' }
}
export type HouseLoss = ReturnType<typeof houseLoss>
export const btu = (watts: number) => r0(watts * 3.412)

// ---------------------------------------------------------------------------------------------- radiators
/** BS EN 442 correction: output falls with the gap between the mean water temperature and the room. */
export const factor = (flow: number, ret: number, room = 20) => { const dT = (flow + ret) / 2 - room; return dT <= 0 ? 0 : Math.pow(dT / 50, 1.3) }
export const flowFactor = (key: FlowKey, room = 20) => factor(FLOW[key].flow, FLOW[key].ret, room)
export const radOutput = (rad: Rad, key: FlowKey, room = 20) => r0(RAD[rad.type].perM * (rad.mm / 1000) * flowFactor(key, room))
export const radLabel = (rad: Rad, count = 1) => `${count > 1 ? `${count} x ` : ''}${RAD[rad.type].short} 600 x ${rad.mm}`
export const radPrice = (rad: Rad) => r0(RAD[rad.type].fit + RAD[rad.type].perMPrice * (rad.mm / 1000))

export type Suggest = { how: 'keep' | 'deeper' | 'longer' | 'new' | 'two'; rad: Rad; count: number; output: number; price: number; line: string }

/** The smallest change that covers the room: keep it, swap for a deeper panel of the same width, then go longer. */
export function suggest(need: number, key: FlowKey, ti: number, existing: Rad | null): Suggest {
  const out = (rad: Rad, count = 1) => radOutput(rad, key, ti) * count
  const done = (how: Suggest['how'], rad: Rad, count: number, line: string): Suggest => ({ how, rad, count, output: out(rad, count), price: how === 'keep' ? 0 : radPrice(rad) * count, line })
  if (existing && out(existing) >= need) return done('keep', existing, 1, 'Keep the radiator you have')
  if (existing) {
    for (const type of RAD_ORDER.slice(RAD_ORDER.indexOf(existing.type) + 1)) {
      const rad = { type, mm: existing.mm }
      if (out(rad) >= need) return done('deeper', rad, 1, 'Same width, deeper panel')
    }
  }
  for (const type of ['K2', 'K3'] as RadType[]) {
    for (let mm = Math.max(RAD_MM.min, existing?.mm ?? RAD_MM.min); mm <= RAD_MM.max; mm += RAD_MM.step) {
      const rad = { type, mm }
      if (out(rad) >= need) return done(existing ? 'longer' : 'new', rad, 1, existing ? 'Longer and deeper' : 'New radiator')
    }
  }
  for (let mm = RAD_MM.min; mm <= RAD_MM.max; mm += RAD_MM.step) {
    const rad = { type: 'K3' as RadType, mm }
    if (out(rad, 2) >= need) return done('two', rad, 2, 'Two radiators to share the load')
  }
  return done('two', { type: 'K3', mm: RAD_MM.max }, 2, 'Two radiators, and worth insulating first')
}

export function schedule(house: House, key: FlowKey) {
  const rows = house.rooms.map((room) => {
    const loss = roomLoss(house, room)
    const have = room.rad ? radOutput(room.rad, key, loss.ti) : 0
    const s = suggest(loss.watts, key, loss.ti, room.rad)
    return { id: room.id, name: room.name, floor: room.floor, ti: loss.ti, need: loss.watts, rad: room.rad, have, status: (!room.rad ? 'none' : have >= loss.watts ? 'ok' : 'short') as 'ok' | 'short' | 'none',
      short: Math.max(0, loss.watts - have), pct: loss.watts ? r0((have / loss.watts) * 100) : 100, suggest: s }
  })
  const change = rows.filter((r) => r.suggest.how !== 'keep')
  return { key, rows, change: change.length, cost: change.reduce((t, r) => t + r.suggest.price, 0), ok: rows.length - change.length }
}
export type Schedule = ReturnType<typeof schedule>

// ---------------------------------------------------------------------------------------------- hot water and boiler size
export type HotWater = { people: number; mains: number; together: boolean }
export const HW_START: HotWater = { people: 3, mains: 14, together: false }
const RISE = 35                    // degrees of temperature rise for hot water at the tap
export const lpm = (kw: number) => r1(kw / (RISE * 0.0698))            // kW = L/min x rise x 0.0698
export const kwFor = (litres: number) => r1(litres * RISE * 0.0698)
export const COMBI_KW = [24, 30, 35, 40]
export const SYSTEM_KW = [12, 15, 18, 24, 30, 35]
export const CYLINDER_L = [150, 180, 210, 250, 300]
const up = (list: number[], n: number) => list.find((x) => x >= n) ?? list[list.length - 1]
/** Minutes to reheat a cylinder from cold: litres x 4.18 x rise / (kW x 60). */
export const reheat = (litres: number, kw: number, rise = 50) => r0((litres * 4.18 * rise) / (kw * 60))

export function sizeBoiler(house: House, hw: HotWater) {
  const loss = houseLoss(house)
  const bathrooms = Math.max(1, house.rooms.filter((r) => r.type === 'bathroom').length)
  const system = bathrooms >= 2 && hw.together
  const why: string[] = []
  if (system) {
    const kw = up(SYSTEM_KW, loss.kw + 2.5)
    const cylinder = Math.max(180, up(CYLINDER_L, hw.people * 45))
    why.push(`${bathrooms} bathrooms used at the same time is more than a combi can supply well, so hot water is stored in a cylinder.`)
    why.push(`Boiler: heat loss ${loss.kw} kW plus 2.5 kW to reheat the cylinder, rounded up to ${kw} kW.`)
    why.push(`Cylinder: ${hw.people} people x 45 litres a day = ${hw.people * 45} litres, rounded up to ${cylinder} litres. Reheats from cold in about ${reheat(cylinder, kw)} minutes.`)
    return { kind: 'system' as const, kw, bathrooms, cylinder, reheat: reheat(cylinder, kw), tap: null, heat: loss.kw, why, lowMains: false }
  }
  const want = bathrooms >= 2 ? 12.3 : 9.8
  const kw = up(COMBI_KW, Math.max(kwFor(Math.min(want, hw.mains)), loss.kw))
  const tap = Math.min(lpm(kw), hw.mains)
  why.push(bathrooms >= 2 ? `${bathrooms} bathrooms, not used at the same time: a combi is enough and there is no cylinder to find room for.` : 'One bathroom: a combi heats water as you use it and needs no cylinder.')
  why.push(`Hot water sets the size, not the heating. ${kw} kW gives ${lpm(kw)} litres a minute at the tap; the house only needs ${loss.kw} kW for heating.`)
  if (hw.mains < 10) why.push(`Your mains gave ${hw.mains} litres a minute, which is on the low side for a combi. Worth checking at survey.`)
  return { kind: 'combi' as const, kw, bathrooms, cylinder: null, reheat: null, tap, heat: loss.kw, why, lowMains: hw.mains < 10 }
}
export type Sizing = ReturnType<typeof sizeBoiler>

// ---------------------------------------------------------------------------------------------- the price book (example figures)
export const BOOK = {
  boiler: { combi: { 24: 840, 30: 900, 35: 980, 40: 1080 }, system: { 12: 800, 15: 830, 18: 860, 24: 920, 30: 990, 35: 1070 } } as Record<'combi' | 'system', Record<number, number>>,
  premium: 320,                 // step up to the longer-warranty range
  fit: { combi: 650, system: 720 },
  cylinder: { 150: 760, 180: 820, 210: 890, 250: 980, 300: 1090 } as Record<number, number>,
  cylinderFit: 380,
  flue: 90, filter: 100, flush: 140,
  control: 120,                 // programmer and room thermostat with load compensation
  weather: 240,                 // weather compensation and smart control
  balance: 180,                 // set up and balance for low flow temperature
  vat: 0.2,
}
export type Option = { key: 'essential' | 'recommended' | 'ready'; name: string; line: string; flow: FlowKey; warranty: number; lines: [string, number][]; net: number; vat: number; total: number; rads: number }

export function options(house: House, hw: HotWater): Option[] {
  const s = sizeBoiler(house, hw)
  const base = (premium: boolean): [string, number][] => [
    [`${s.kw} kW ${s.kind} boiler${premium ? ', 10 year warranty range' : ', 7 year warranty range'}`, BOOK.boiler[s.kind][s.kw] + (premium ? BOOK.premium : 0)],
    ...(s.cylinder ? [[`${s.cylinder} litre unvented cylinder, supplied and fitted`, BOOK.cylinder[s.cylinder] + BOOK.cylinderFit]] as [string, number][] : []),
    ['Fitting, by a Gas Safe engineer', BOOK.fit[s.kind]],
    ['Flue kit', BOOK.flue],
    ['Magnetic filter', BOOK.filter],
    ['System flush and inhibitor', BOOK.flush],
  ]
  const build = (key: Option['key'], name: string, line: string, flow: FlowKey, warranty: number, lines: [string, number][], rads: number): Option => {
    const net = lines.reduce((t, l) => t + l[1], 0), vat = r0(net * BOOK.vat)
    return { key, name, line, flow, warranty, lines, net, vat, total: net + vat, rads }
  }
  const s55 = schedule(house, 'f55'), s45 = schedule(house, 'f45')
  return [
    build('essential', 'Essential', 'A sound replacement. Radiators stay as they are.', 'f70', 7,
      [...base(false), ['Programmer and thermostat with load compensation', BOOK.control]], 0),
    build('recommended', 'Recommended', 'Designed to run at 55 degrees, where a condensing boiler is at its best.', 'f55', 10,
      [...base(true), ['Weather compensation and smart control', BOOK.weather], ...(s55.change ? [[`${s55.change} radiator${s55.change === 1 ? '' : 's'} upsized for 55 degree flow`, s55.cost]] as [string, number][] : []), ['Set up and balance', BOOK.balance]], s55.change),
    build('ready', 'Heat pump ready', 'Runs at 45 degrees now, so a heat pump can take over later with no radiator work.', 'f45', 10,
      [...base(true), ['Weather compensation and smart control', BOOK.weather], ...(s45.change ? [[`${s45.change} radiator${s45.change === 1 ? '' : 's'} upsized for 45 degree flow`, s45.cost]] as [string, number][] : []), ['Set up and balance', BOOK.balance]], s45.change),
  ]
}

// ---------------------------------------------------------------------------------------------- heat pump
// Seasonal efficiency by flow temperature: defaults, product specific. 50 degrees is taken midway between 45 and 55.
export const SCOP: Record<'f55' | 'f50' | 'f45', number> = { f55: 3.0, f50: 3.4, f45: 3.8 }
export const HP_FLOWS = ['f55', 'f50', 'f45'] as const
export type HpFlow = (typeof HP_FLOWS)[number]
export const BOILER_EFF = 0.85
export const GRANT = { scheme: 'Boiler Upgrade Scheme', where: 'England and Wales', amount: 7500, checked: '15 November 2026', source: 'gov.uk/apply-boiler-upgrade-scheme' }
export const HP_PRICE: [number, number] = [8000, 14000]      // typical installed range before the grant, from published guides
export type Rates = { gasKwh: number; gasP: number; elecP: number }
export const RATES_START: Rates = { gasKwh: 12000, gasP: 6, elecP: 26 }

/** heat = gas used x boiler efficiency. Gas cost = gas used x gas price. Heat pump cost = heat / SCOP x electricity price. */
export function running(r: Rates, flow: HpFlow) {
  const heat = r0(r.gasKwh * BOILER_EFF)
  const gas = r0((r.gasKwh * r.gasP) / 100)
  const kwh = r0(heat / SCOP[flow])
  const pump = r0((kwh * r.elecP) / 100)
  return { heat, gas, kwh, pump, diff: pump - gas, scop: SCOP[flow] }
}
export type Site = { outdoor: boolean; cylinder: boolean }
export const SITE_START: Site = { outdoor: true, cylinder: true }

export function readiness(house: House, site: Site, flow: HpFlow) {
  const loss = houseLoss(house), sch = schedule(house, flow)
  const upgrades: string[] = []
  if (sch.change) upgrades.push(`${sch.change} of ${sch.rows.length} radiators upsized`)
  if (!site.cylinder) upgrades.push('space found for a hot water cylinder')
  const verdict = !site.outdoor ? 'notyet' : upgrades.length ? 'upgrades' : 'ready'
  return { verdict: verdict as 'ready' | 'upgrades' | 'notyet', capacity: loss.kw, schedule: sch, upgrades,
    line: verdict === 'ready' ? 'Ready for a heat pump as it stands.' : verdict === 'upgrades' ? 'Ready with upgrades.' : 'Not yet: the outdoor unit needs a place to stand.',
    after: [Math.max(0, HP_PRICE[0] - GRANT.amount), HP_PRICE[1] - GRANT.amount + sch.cost] as [number, number] }
}

// ---------------------------------------------------------------------------------------------- pipe route
// Trade rule for copper at an 11 degree drop (boilers), and at a 5 degree drop with water held to about 1 m/s (heat pumps).
const PIPE: Record<11 | 5, [number, number][]> = { 11: [[15, 6], [22, 13], [28, 22]], 5: [[15, 3], [22, 6.7], [28, 11]] }
export const pipeSize = (kw: number, drop: 11 | 5 = 11) => PIPE[drop].find(([, max]) => kw <= max)?.[0] ?? 35
/** Litres a second down a pipe: kW / (4.18 x temperature drop). */
export const pipeFlow = (kw: number, drop: number) => Math.round((kw / (4.18 * drop)) * 1000) / 1000

export type Pipe = { kind: 'riser' | 'main' | 'branch'; floor: 0 | 1; a: [number, number, number]; b: [number, number, number]; kw: number; mm: number; m: number }
export type Emitter = { id: string; name: string; floor: 0 | 1; x: number; y: number; side: Side; watts: number; run: number }

/** Where a radiator goes: the middle of the room's longest outside wall, or the top wall if it has none. Metres. */
export function radSpot(house: House, room: Room): { x: number; y: number; side: Side } {
  const ext = runs(house, room).filter((r) => r.kind === 'ext').sort((p, q) => q.cells - p.cells)[0]
  const r = ext ?? { side: 'n' as Side, x1: room.x, y1: room.y, x2: room.x + room.w, y2: room.y }
  return { x: ((r.x1 + r.x2) / 2) * CELL, y: ((r.y1 + r.y2) / 2) * CELL, side: r.side }
}

/** A two-pipe layout: a main along each floor from the boiler, a branch to each radiator, a riser between floors. */
export function route(house: House, drop: 11 | 5 = 11) {
  const ground = house.rooms.filter((r) => r.floor === 0)
  const home = ground.find((r) => r.type === 'kitchen') ?? ground[0] ?? house.rooms[0]
  if (!home) return { boiler: { x: 0, y: 0, room: '' }, pipes: [] as Pipe[], emitters: [] as Emitter[], index: null as Emitter | null, total: 0, primary: 15 }
  const bx = (home.x + 1) * CELL, by = (home.y + home.h / 2) * CELL
  const emitters: Emitter[] = house.rooms.map((room) => {
    const p = radSpot(house, room)
    return { id: room.id, name: room.name, floor: room.floor, ...p, watts: roomLoss(house, room).watts, run: r1(Math.abs(p.x - bx) + Math.abs(p.y - by) + room.floor * STOREY) }
  })
  const pipes: Pipe[] = []
  const add = (kind: Pipe['kind'], floor: 0 | 1, a: Pipe['a'], b: Pipe['b'], watts: number) => {
    const m = r1(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]))
    if (m > 0 && watts > 0) pipes.push({ kind, floor, a, b, kw: r1(watts / 1000), mm: pipeSize(watts / 1000, drop), m })
  }
  for (const floor of [0, 1] as const) {
    const z = floor * STOREY, on = emitters.filter((e) => e.floor === floor)
    if (!on.length) continue
    if (floor === 1) add('riser', 1, [bx, by, 0], [bx, by, z], on.reduce((t, e) => t + e.watts, 0))
    for (const dir of [-1, 1]) {
      const side = on.filter((e) => (dir < 0 ? e.x < bx : e.x >= bx)).sort((p, q) => dir * (p.x - q.x))
      let from = bx
      side.forEach((e, i) => {
        add('main', floor, [from, by, z], [e.x, by, z], side.slice(i).reduce((t, q) => t + q.watts, 0))
        add('branch', floor, [e.x, by, z], [e.x, e.y, z], e.watts)
        from = e.x
      })
    }
  }
  const index = emitters.reduce((far, e) => (e.run > far.run ? e : far), emitters[0])
  const total = emitters.reduce((t, e) => t + e.watts, 0)
  return { boiler: { x: bx, y: by, room: home.name }, pipes, emitters, index, total, primary: pipeSize(total / 1000, drop),
    metres: r1(pipes.reduce((t, p) => t + p.m, 0) * 2) }
}

// ---------------------------------------------------------------------------------------------- house templates
const room = (id: string, name: string, type: RoomType, floor: 0 | 1, x: number, y: number, w: number, h: number, win: WinKey, type2: RadType | null, mm = 0): Room =>
  ({ id, name, type, floor, x, y, w, h, win, rad: type2 ? { type: type2, mm } : null })

export const TEMPLATES: Record<TemplateKey, { name: string; line: string; age: AgeKey; party: { left: boolean; right: boolean }; rooms: Room[] }> = {
  terrace: { name: 'Mid terrace', line: 'Two up, two down with a kitchen at the back', age: 'pre1930', party: { left: true, right: true }, rooms: [
    room('t1', 'Front room', 'living', 0, 2, 1, 9, 8, 'medium', 'K2', 1200),
    room('t2', 'Back room', 'living', 0, 2, 9, 9, 7, 'medium', 'K2', 1000),
    room('t3', 'Kitchen', 'kitchen', 0, 2, 16, 6, 6, 'small', 'K1', 800),
    room('t4', 'Bedroom 1', 'bedroom', 1, 2, 1, 9, 8, 'medium', 'K1', 1200),
    room('t5', 'Bedroom 2', 'bedroom', 1, 2, 9, 5, 7, 'small', 'K1', 800),
    room('t6', 'Bathroom', 'bathroom', 1, 7, 9, 4, 7, 'small', 'K1', 600),
  ] },
  semi: { name: 'Semi-detached', line: 'Three bedrooms, hall to one side', age: 'y1930', party: { left: true, right: false }, rooms: [
    room('s1', 'Living room', 'living', 0, 2, 1, 8, 9, 'large', 'K2', 1400),
    room('s2', 'Hall', 'hall', 0, 10, 1, 4, 9, 'small', 'K2', 600),
    room('s3', 'Kitchen diner', 'kitchen', 0, 2, 10, 12, 6, 'large', 'K2', 1000),
    room('s4', 'Bedroom 1', 'bedroom', 1, 2, 1, 8, 9, 'medium', 'K1', 1400),
    room('s5', 'Landing', 'hall', 1, 10, 1, 4, 4, 'none', null),
    room('s6', 'Bedroom 3', 'bedroom', 1, 10, 5, 4, 5, 'small', 'K1', 600),
    room('s7', 'Bedroom 2', 'bedroom', 1, 2, 10, 7, 6, 'medium', 'K1', 1000),
    room('s8', 'Bathroom', 'bathroom', 1, 9, 10, 5, 6, 'small', 'K1', 800),
  ] },
  detached: { name: 'Detached', line: 'Four bedrooms, two bathrooms', age: 'y2003', party: { left: false, right: false }, rooms: [
    room('d1', 'Living room', 'living', 0, 2, 1, 10, 9, 'large', 'K2', 1400),
    room('d2', 'Hall', 'hall', 0, 12, 1, 4, 9, 'small', 'K1', 800),
    room('d3', 'Study', 'living', 0, 16, 1, 4, 9, 'medium', 'K1', 800),
    room('d4', 'Kitchen diner', 'kitchen', 0, 2, 10, 18, 7, 'large', 'K2', 1600),
    room('d5', 'Bedroom 1', 'bedroom', 1, 2, 1, 9, 9, 'medium', 'K1', 1200),
    room('d6', 'Bathroom', 'bathroom', 1, 11, 1, 5, 5, 'small', 'K1', 600),
    room('d7', 'En suite', 'bathroom', 1, 11, 6, 5, 4, 'none', 'K1', 400),
    room('d8', 'Bedroom 2', 'bedroom', 1, 16, 1, 4, 9, 'medium', 'K1', 800),
    room('d9', 'Bedroom 3', 'bedroom', 1, 2, 10, 9, 7, 'medium', 'K1', 1000),
    room('d10', 'Bedroom 4', 'bedroom', 1, 11, 10, 9, 7, 'medium', 'K1', 1000),
  ] },
}
export function start(template: TemplateKey = 'semi'): House {
  const t = TEMPLATES[template], a = AGE[t.age]
  return { template, age: t.age, wall: a.wall, glazing: a.glazing, loft: a.loft, region: 'south', party: { ...t.party }, rooms: t.rooms.map((r) => ({ ...r, rad: r.rad ? { ...r.rad } : null })) }
}
/** Changing the age band resets the fabric to what a house of that age usually has. The customer can then correct it. */
export const withAge = (house: House, age: AgeKey): House => ({ ...house, age, wall: AGE[age].wall, glazing: AGE[age].glazing, loft: AGE[age].loft })

/** A new room goes in the first free spot on its floor, scanning left to right, top to bottom. Null if the plan is full. */
export function place(house: House, type: RoomType, floor: 0 | 1, at?: { x: number; y: number }): Room | null {
  const size: Record<RoomType, [number, number]> = { living: [8, 8], kitchen: [7, 6], bedroom: [6, 6], bathroom: [4, 5], hall: [4, 6] }
  const [w, h] = size[type]
  const n = house.rooms.filter((r) => r.type === type).length + 1
  let id = 1; while (house.rooms.some((r) => r.id === `r${id}`)) id++
  const make = (x: number, y: number): Room => ({ id: `r${id}`, name: `${ROOM[type].name.split(' ')[0]} ${n}`, type, floor, x, y, w, h, win: type === 'hall' ? 'none' : 'medium', rad: null })
  if (at) { const r = make(Math.round(at.x), Math.round(at.y)); if (fits(house.rooms, r)) return r }
  for (let y = 0; y + h <= GRID.h; y++) for (let x = 0; x + w <= GRID.w; x++) { const r = make(x, y); if (fits(house.rooms, r)) return r }
  return null
}
