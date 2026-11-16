// Building company demo: everything in the job pack that is worked out from the scene. Bill of quantities,
// programme, stage payments, the regulations and planning guide, the scope of works and the wall elevations.
// Example rates and rules for a fictional firm. The regulations sheet is guidance: the builder confirms on site.
import { JOBS, SLOT, WALL_OF, def, dims, mat, slotsFor, span, takeoff, wallOf, type Finish, type Job, type Placed, type Scene, type Slot, type Wall } from './builder'

const r1 = (n: number) => Math.round(n * 10) / 10
const low = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const count = (s: Scene, f: (p: Placed) => boolean) => s.items.filter(f).length
const has = (s: Scene, kind: string) => s.items.some((p) => p.kind === kind)
const STONE = ['cloud', 'vein', 'graphite', 'granite', 'terrazzo']

// ------------------------------------------------------------------------------------------ bill of quantities
export type Qty = { ref: string; item: string; net: string; waste: string; order: string; note: string }
const TILE_MM: Record<string, [number, number]> = { metro: [150, 75], grid: [600, 600], slab: [600, 300], check: [200, 200], zellige: [100, 100] }

/** Quantities measured off the plan, with the waste allowance and what gets ordered. */
export function billOfQuantities(s: Scene): Qty[] {
  const q = takeoff(s), slots = slotsFor(s), M = (slot: Slot) => mat(s.mats[slot]), out: Qty[] = []
  const pieces = (m2: number, pattern: string) => { const t = TILE_MM[pattern]; return t ? `${Math.ceil(m2 / ((t[0] * t[1]) / 1e6)).toLocaleString('en-GB')} tiles` : `${r1(m2)} m²` }
  const fl = M('floor'), flOrder = q.area * (1 + q.floorWaste)
  out.push({ ref: SLOT.floor.ref, item: `${fl.name} floor`, net: `${r1(q.area)} m²`, waste: `${Math.round(q.floorWaste * 100)}%`, order: fl.family === 'tile' ? pieces(flOrder, fl.pattern) : `${r1(flOrder)} m²`, note: q.floorWaste > 0.1 ? 'Extra waste for the block pattern' : 'Laid wall to wall' })
  if (slots.includes('tile') && q.tile) out.push({ ref: SLOT.tile.ref, item: `${M('tile').name} wall tiles`, net: `${r1(q.tile)} m²`, waste: '10%', order: pieces(q.tile * 1.1, M('tile').pattern), note: s.job === 'bathroom' ? (s.extras.includes('fulltile') ? 'Every wall, floor to ceiling, less openings' : 'Behind the bath and shower, to 2.1 m') : 'Worktop to wall units, 600 mm high' })
  if (slots.includes('worktop') && q.worktop) out.push({ ref: SLOT.worktop.ref, item: `${M('worktop').name} worktop`, net: `${r1(q.worktop)} m`, waste: STONE.includes(M('worktop').id) ? 'Cut to template' : '10%', order: STONE.includes(M('worktop').id) ? `${r1(q.worktop)} m, templated` : `${Math.ceil((q.worktop * 1.1) / 3)} lengths of 3 m`, note: 'Measured along the front edge' })
  if (slots.includes('fronts') && q.fronts) out.push({ ref: SLOT.fronts.ref, item: `${M('fronts').name} fronts`, net: `${q.fronts} no.`, waste: 'None', order: `${q.fronts} fronts`, note: 'One per 600 mm of unit, two on tall units' })
  out.push({ ref: SLOT.walls.ref, item: `${M('walls').name} paint`, net: `${r1(q.paint)} m²`, waste: 'Two coats', order: `${q.litres} litres, ${Math.ceil(q.litres / 2.5)} tins of 2.5`, note: 'Walls less openings and tiles, plus the ceiling. 12 m² a litre' })
  if (s.job === 'extension') { if (q.glazingM) out.push({ ref: SLOT.metal.ref, item: M('metal').name, net: `${r1(q.glazingM)} m`, waste: 'None', order: `${count(s, (p) => !!def(p.kind).glazed)} units, made to measure`, note: `${r1(q.glazingArea)} m² of glass in all` }) }
  else if (q.fittings) out.push({ ref: SLOT.metal.ref, item: `${M('metal').name} ${s.job === 'kitchen' ? 'tap and handles' : 'brassware'}`, net: `${q.fittings} no.`, waste: 'None', order: `${q.fittings} fittings`, note: s.job === 'kitchen' ? 'One handle a front, plus the tap' : 'One set per fitting with water' })
  if (q.skirting > 0) out.push({ ref: 'JN-01', item: 'Skirting board', net: `${r1(q.skirting)} m`, waste: '10%', order: `${Math.ceil((q.skirting * 1.1) / 2.4)} lengths of 2.4 m`, note: 'Room edge less doorways and unit runs' })
  const board = s.job === 'extension' ? q.area + q.wallGross - q.openArea : s.job === 'bathroom' ? q.area + q.wet : q.area
  out.push({ ref: 'PB-01', item: s.job === 'bathroom' ? 'Moisture board and plasterboard' : 'Plasterboard', net: `${r1(board)} m²`, waste: '10%', order: `${Math.ceil((board * 1.1) / 2.88)} sheets of 2.4 x 1.2 m`, note: s.job === 'extension' ? 'Walls and ceiling' : s.job === 'bathroom' ? 'Ceiling and wet walls' : 'Ceiling' })
  if (s.job === 'bathroom' && q.wet) out.push({ ref: 'WP-01', item: 'Tanking kit', net: `${r1(q.wet)} m²`, waste: '10%', order: `${Math.ceil((q.wet * 1.1) / 4)} kits of 4 m²`, note: 'Behind the bath and shower' })
  if (s.extras.includes('ufh')) out.push({ ref: 'UF-01', item: 'Underfloor heating', net: `${r1(q.area)} m²`, waste: 'None', order: `${r1(q.area * 0.85)} m² heated`, note: 'Not laid under fixed units' })
  if (q.knockM) out.push({ ref: 'ST-01', item: 'Steel beam over the opening', net: `${r1(q.knockM)} m`, waste: 'Bearings', order: `${r1(q.knockM + 0.3)} m, to the engineer's size`, note: '150 mm bearing each end' })
  return out
}

// ------------------------------------------------------------------------------------------ programme
export type Task = { id: string; lane: string; name: string; start: number; days: number; kind: 'work' | 'dry' | 'wait'; ms?: 'first' | 'plaster' | 'second' | 'snag' }
type Draft = Omit<Task, 'start'> & { after: string[]; lag?: number }
const up = (n: number) => Math.max(1, Math.ceil(n))

/** The order of works in working days. Durations come from the quantities; drying and lead times are their own bars. */
export function programme(s: Scene): { tasks: Task[]; days: number; weeks: number; lanes: string[] } {
  const q = takeoff(s), d: Draft[] = []
  const t = (id: string, lane: string, name: string, days: number, after: string[], x: Partial<Draft> = {}) => d.push({ id, lane, name, days: up(days), after, kind: 'work', ...x })
  if (s.job === 'kitchen') {
    const stone = STONE.includes(s.mats.worktop)
    t('strip', 'Site', 'Protect, strip out', 1 + q.area / 12, [])
    t('e1', 'Electrician', 'First fix', q.elec > 4 || s.extras.includes('rewire') ? 2 : 1, ['strip'])
    t('p1', 'Plumber', 'First fix', q.wasteRun ? 2 : 1, ['strip'], { ms: 'first' })
    t('skim', 'Plasterer', 'Skim and patch', q.area / 14, ['e1', 'p1'])
    t('dry', 'Plasterer', 'Plaster drying', 5, ['skim'], { kind: 'dry', ms: 'plaster' })
    t('floor', 'Floor layer', 'Lay the floor', q.area / 10, ['skim'], { lag: 3 })
    t('units', 'Kitchen fitter', 'Fit units', q.fronts / 5, ['dry', 'floor'])
    if (stone) { t('tmpl', 'Worktops', 'Template', 1, ['units']); t('cut', 'Worktops', 'Stone cut off site', 7, ['tmpl'], { kind: 'wait' }); t('top', 'Worktops', 'Fit worktops', 1, ['cut']) }
    else t('top', 'Worktops', 'Fit worktops', q.worktop / 5, ['units'])
    t('tile', 'Tiler', 'Splashback', q.tile / 5, ['top'])
    t('e2', 'Electrician', 'Second fix', 1, ['top'])
    t('p2', 'Plumber', 'Second fix', 1, ['top'], { ms: 'second' })
    t('dec', 'Decorator', 'Paint', q.paint / 30, ['tile'])
    t('snag', 'Site', 'Snag and hand over', 1, ['dec', 'e2', 'p2'], { ms: 'snag' })
  } else if (s.job === 'bathroom') {
    t('strip', 'Site', 'Protect, strip out', 1 + q.area / 8, [])
    t('p1', 'Plumber', 'First fix', q.soilRun ? 2 : 1, ['strip'], { ms: 'first' })
    t('e1', 'Electrician', 'First fix', 1, ['strip'])
    t('board', 'Plasterer', 'Board and skim', 1 + q.area / 10, ['p1', 'e1'])
    t('dry', 'Plasterer', 'Plaster drying', 3, ['board'], { kind: 'dry', ms: 'plaster' })
    t('tank', 'Tiler', 'Tank wet walls', 1, ['board'], { lag: 1 })
    t('cure', 'Tiler', 'Tanking cures', 1, ['tank'], { kind: 'dry' })
    t('tile', 'Tiler', 'Tile walls and floor', (q.tile + q.area) / 5, ['cure', 'dry'])
    t('grout', 'Tiler', 'Grout cures', 1, ['tile'], { kind: 'dry' })
    t('p2', 'Plumber', 'Fit sanitaryware', q.water / 3, ['grout'], { ms: 'second' })
    t('e2', 'Electrician', 'Second fix', 1, ['grout'])
    t('dec', 'Decorator', 'Paint', q.paint / 30, ['p2'])
    t('snag', 'Site', 'Snag and hand over', 1, ['dec', 'e2'], { ms: 'snag' })
  } else {
    const pitched = s.extras.includes('pitched'), kitchen = s.items.some((p) => def(p.kind).top)
    t('setup', 'Site', 'Set up, mark out', 2, [])
    t('glass', 'Glazing', 'Glazing made to measure', 25, [], { kind: 'wait' })
    t('found', 'Groundworks', 'Dig and pour foundations', 3 + q.area / 6, ['setup'])
    t('cure', 'Groundworks', 'Concrete cures', 5, ['found'], { kind: 'dry' })
    t('slab', 'Groundworks', 'Drains and floor slab', 3 + (has(s, 'manhole') ? 2 : 0), ['cure'])
    t('walls', 'Bricklayer', 'Walls to roof plate', 3 + (q.W * 2 + q.L) / 2, ['slab'])
    t('roof', 'Roofer', pitched ? 'Pitched roof and tiles' : 'Flat warm roof', 3 + q.area / 7 + (pitched ? 3 : 0), ['walls'])
    t('fit', 'Glazing', 'Fit doors and windows', 2, ['roof', 'glass'])
    if (q.knockM) t('steel', 'Bricklayer', 'Steel in, knock through', 3, ['fit'])
    const shell = q.knockM ? 'steel' : 'fit'
    t('e1', 'Electrician', 'First fix', 2, [shell])
    t('p1', 'Plumber', s.extras.includes('ufh') ? 'First fix and heating pipes' : 'First fix', s.extras.includes('ufh') ? 3 : 2, [shell], { ms: 'first' })
    t('screed', 'Plasterer', 'Floor screed', 1, ['p1', 'e1'])
    t('sdry', 'Plasterer', 'Screed drying', 10, ['screed'], { kind: 'dry' })
    t('skim', 'Plasterer', 'Board and skim', 2 + (q.wallGross + q.area) / 35, ['screed'], { lag: 2 })
    t('dry', 'Plasterer', 'Plaster drying', 7, ['skim'], { kind: 'dry', ms: 'plaster' })
    t('floor', 'Floor layer', 'Lay the floor', q.area / 10, ['sdry', 'dry'])
    if (kitchen || has(s, 'utility') || has(s, 'cloak')) t('units', 'Kitchen fitter', 'Fit kitchen and rooms', 2 + q.fronts / 5 + (has(s, 'utility') ? 2 : 0) + (has(s, 'cloak') ? 2 : 0), ['floor'])
    const fitted = d.some((x) => x.id === 'units') ? 'units' : 'floor'
    t('e2', 'Electrician', 'Second fix', 2, [fitted])
    t('p2', 'Plumber', 'Second fix', 2, [fitted], { ms: 'second' })
    t('dec', 'Decorator', 'Paint', 1 + q.paint / 30, ['e2', 'p2'])
    t('snag', 'Site', 'Snag and hand over', 2, ['dec'], { ms: 'snag' })
  }
  const done = new Map<string, Task>()
  for (const x of d) {   // forward pass: a task starts when everything it waits for has finished
    const { after, lag, ...rest } = x
    const start = Math.max(0, ...after.map((id) => { const a = done.get(id); return a ? (lag ? a.start + lag : a.start + a.days) : 0 }))
    done.set(x.id, { ...rest, start })
  }
  const tasks = [...done.values()], days = Math.max(...tasks.map((x) => x.start + x.days))
  const lanes = [...new Set(tasks.map((x) => x.lane))]
  return { tasks, days, weeks: Math.ceil(days / 5), lanes }
}

// ------------------------------------------------------------------------------------------ stage payments
export const STAGES: { key: 'deposit' | 'first' | 'plaster' | 'second' | 'snag'; name: string; share: number }[] = [
  { key: 'deposit', name: 'Deposit, on acceptance', share: 0.1 },
  { key: 'first', name: 'First fix complete', share: 0.25 },
  { key: 'plaster', name: 'Plastered and dry', share: 0.3 },
  { key: 'second', name: 'Second fix complete', share: 0.3 },
  { key: 'snag', name: 'Retention, after snag sign-off', share: 0.05 },
]
/** Stage payments tied to programme milestones. Whole pounds; the last stage takes the rounding so they sum to the total. */
export function payments(total: number, prog: ReturnType<typeof programme>) {
  let paid = 0
  return STAGES.map((st, i) => {
    const amount = i === STAGES.length - 1 ? total - paid : Math.round(total * st.share)
    paid += amount
    const task = prog.tasks.filter((t) => t.ms === st.key).sort((a, b) => b.start + b.days - (a.start + a.days))[0]
    const day = st.key === 'deposit' ? 0 : task ? task.start + task.days : prog.days
    return { ...st, amount, day, when: st.key === 'deposit' ? 'Before we start' : `Week ${Math.max(1, Math.ceil(day / 5))}` }
  })
}

// ------------------------------------------------------------------------------------------ regulations and planning guide
export type Flag = { id: string; status: 'clear' | 'check' | 'needed'; title: string; text: string; ref: string; who: string }
export const REGS_LINE = 'This sheet is a guide worked out from your plan, not a ruling. Bramley confirms every point on the site visit and with Building Control where it applies.'
export const STATUS: Record<Flag['status'], string> = { clear: 'Clear', check: 'To check', needed: 'We arrange' }

/** Permitted development depth for a single storey rear extension, in metres: the plain limit and the prior approval limit. */
export const pdDepth = (house: Scene['site']['house']) => (house === 'detached' ? { pd: 4, prior: 8 } : { pd: 3, prior: 6 })

export function regs(s: Scene): Flag[] {
  const q = takeoff(s), f: Flag[] = [], add = (id: string, status: Flag['status'], title: string, text: string, ref: string, who: string) => f.push({ id, status, title, text, ref, who })
  const asbestos = () => add('asbestos', 'check', 'Asbestos', 'Homes built before 2000 can have asbestos in old floor tiles, ceilings and boxing. We look before any strip out starts.', 'Control of Asbestos Regulations 2012', 'Rob, on the site visit')
  if (s.job === 'kitchen') {
    const circuit = q.cooker || s.extras.includes('rewire')
    add('elec', circuit ? 'needed' : 'clear', 'Electrics', circuit ? 'A new circuit is notifiable work. Our electrician tests it, certifies it and notifies Building Control for you.' : 'No new circuits in this plan. Alterations are tested and certified.', 'Building Regulations Part P', 'Bramley electrician')
    add('vent', has(s, 'hood') ? 'clear' : 'check', 'Ventilation', has(s, 'hood') ? 'An extractor is drawn over the hob. We duct it outside where the route allows.' : 'No extractor is drawn. A kitchen wants extract ventilation near the hob.', 'Building Regulations Part F', 'Rob, on the site visit')
    add('drain', q.wasteRun ? 'check' : 'clear', 'Drainage', q.wasteRun ? `The sink waste runs ${r1(q.wasteRun + 3)} m to the drain. Rob checks the fall on site.` : 'The sink stays within easy reach of the existing drain.', 'Building Regulations Part H', 'Bramley plumber')
    if (has(s, 'boiler')) add('gas', 'check', 'Gas', 'The boiler stays where it is, in a new housing. Any gas work is done by a Gas Safe registered engineer.', 'Gas Safety Regulations', 'Gas Safe engineer')
    add('plan', 'clear', 'Planning', 'An internal refit does not normally need planning permission. A listed building is different, so we ask.', 'Planning', 'No action')
    asbestos()
  } else if (s.job === 'bathroom') {
    add('elec', 'needed', 'Electrics', 'Electrical work in a bathroom is notifiable. Our electrician tests it, certifies it and notifies Building Control for you.', 'Building Regulations Part P', 'Bramley electrician')
    add('zones', 'clear', 'Wiring zones', 'Fittings near the bath and shower are picked to suit the bathroom zones in the wiring regulations. The zones are drawn on your plan.', 'BS 7671, section 701', 'Bramley electrician')
    const fan = has(s, 'fan'), win = has(s, 'window')
    add('vent', fan ? 'clear' : 'check', 'Ventilation', fan ? 'An extractor fan is drawn, ducted to the outside.' : win ? 'There is a window but no fan. Worth checking with Building Control whether a fan is wanted as well.' : 'No fan and no window. A bathroom needs extract ventilation.', 'Building Regulations Part F', fan ? 'Bramley electrician' : 'Rob, on the site visit')
    add('drain', q.soilRun ? 'check' : 'clear', 'Drainage', q.soilRun ? `The WC has moved away from the soil stack, with ${r1(q.soilRun + 2)} m of new soil pipe. Rob checks the fall and the route on site.` : 'The WC stays close to the existing soil stack.', 'Building Regulations Part H', 'Bramley plumber')
    add('plan', 'clear', 'Planning', 'An internal refit does not normally need planning permission. A listed building is different, so we ask.', 'Planning', 'No action')
    asbestos()
  } else {
    const depth = s.width / 1000, lim = pdDepth(s.site.house), kind = s.site.house === 'detached' ? 'a detached house' : 'a semi or terrace'
    add('depth', depth <= lim.pd ? 'clear' : depth <= lim.prior ? 'check' : 'needed', 'Planning: depth',
      depth <= lim.pd ? `${r1(depth)} m out from the house is within the ${lim.pd} m normally allowed for ${kind} without a planning application.`
        : depth <= lim.prior ? `${r1(depth)} m is past the ${lim.pd} m normally allowed for ${kind}. Up to ${lim.prior} m can go through prior approval, where the council asks the neighbours.`
          : `${r1(depth)} m is past the ${lim.prior} m prior approval limit for ${kind}. This one needs a full planning application.`,
      'Permitted development, Class A', depth <= lim.pd ? 'No action' : 'We prepare the application')
    const pitched = s.extras.includes('pitched')
    add('height', 'clear', 'Planning: height', `${pitched ? 'Pitched roof, about 3.9 m to the ridge and 2.6 m at the eaves' : 'Flat roof, about 3.0 m high'}. The usual limits are 4 m overall and 3 m at the eaves within 2 m of a boundary.`, 'Permitted development, Class A', 'No action')
    add('garden', 'check', 'Planning: garden and area', 'Extensions and outbuildings together must not cover more than half the garden. Conservation areas and listed buildings have their own rules. We check your address.', 'Permitted development, Class A', 'Rob, on the site visit')
    add('regs', 'needed', 'Building Regulations', 'Always needed for an extension. We make the application and book each inspection as the work reaches it.', 'Building Regulations', 'Bramley')
    if (q.knockM) add('steel', 'needed', 'Structure', `The ${r1(q.knockM)} m opening into the house needs a steel beam sized by a structural engineer.`, 'Building Regulations Part A', 'Structural engineer')
    add('party', s.site.boundary < 3000 ? 'check' : 'clear', 'Party wall', s.site.boundary < 3000 ? `The side wall is ${r1(s.site.boundary / 1000)} m from the boundary. Foundations this close to a neighbour's building usually need a party wall notice.` : 'The side wall is 3 m or more from the boundary.', 'Party Wall etc. Act 1996', s.site.boundary < 3000 ? 'Party wall surveyor' : 'No action')
    const pct = Math.round((q.glazingArea / q.area) * 100)
    add('glass', pct > 25 ? 'check' : 'clear', 'Glazing and heat loss', pct > 25 ? `Glass is ${pct}% of the floor area. Over about a quarter, it is worth checking with Building Control whether a heat loss calculation is wanted.` : `Glass is ${pct}% of the floor area, under the usual quarter.`, 'Building Regulations Part L', pct > 25 ? 'We ask Building Control' : 'No action')
    add('drains', has(s, 'manhole') ? 'check' : 'clear', 'Drains', has(s, 'manhole') ? 'You marked a drain or manhole. Building over or near a shared sewer may need a build-over agreement with the water company. Worth checking early.' : 'No drain is marked. Rob lifts the covers on the site visit.', 'Building Regulations Part H', has(s, 'manhole') ? 'We ask the water company' : 'Rob, on the site visit')
    if (has(s, 'burner')) add('stove', 'needed', 'Stove and flue', 'The stove and flue are fitted and signed off by a registered installer.', 'Building Regulations Part J', 'Registered installer')
    add('elec', 'needed', 'Electrics', 'New circuits are notifiable. Our electrician tests, certifies and notifies Building Control for you.', 'Building Regulations Part P', 'Bramley electrician')
  }
  return f
}

// ------------------------------------------------------------------------------------------ scope of works
export type Clause = { trade: string; items: string[] }
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1])
const n = (v: number, one: string, many = one + 's') => `${v === 1 ? 'one' : v} ${v === 1 ? one : many}`

/** A scope of works written from the scene: numbered clauses by trade, then what is left out and what is assumed. */
export function scope(s: Scene, tier: Finish): { clauses: Clause[]; exclusions: string[]; assumptions: string[] } {
  const q = takeoff(s), c: Clause[] = [], M = (slot: Slot) => mat(s.mats[slot]), slots = slotsFor(s)
  const kinds = (f: (p: Placed) => boolean) => { const m = new Map<string, number>(); for (const p of s.items.filter(f)) m.set(p.kind, (m.get(p.kind) ?? 0) + 1); return [...m].map(([k, v]) => n(v, low(def(k).name.split(',')[0]))) }
  const size = `${s.length.toLocaleString('en-GB')} by ${s.width.toLocaleString('en-GB')} mm`
  const range = tier === 'good' ? 'trade range' : tier === 'better' ? 'mid range' : 'top range'
  const finishes = [
    `Lay ${M('floor').name} (${low(M('floor').sheen)}) to ${r1(q.area)} m² of floor.`,
    ...(slots.includes('tile') && q.tile ? [`Fix ${M('tile').name} tiles to ${r1(q.tile)} m² of wall.`] : []),
    `Paint walls and ceiling in ${M('walls').name}, two coats, ${r1(q.paint)} m².`,
  ]
  if (s.job === 'kitchen') {
    c.push({ trade: 'Strip out', items: [`Protect floors and doorways. Strip out the existing kitchen, ${size}, and clear the waste.`] })
    c.push({ trade: 'Units and worktops', items: [
      `Supply and fit ${range} units: ${list(kinds((p) => def(p.kind).group === 'Units' && !def(p.kind).free))}.`,
      `Fronts in ${M('fronts').name} (${low(M('fronts').sheen)}) with ${M('metal').name} handles.`,
      `Fit ${r1(q.worktop)} m of ${M('worktop').name} worktop (${low(M('worktop').sheen)})${STONE.includes(M('worktop').id) ? ', templated on site and cut off site' : ''}.`,
    ] })
    const apps = kinds((p) => def(p.kind).group === 'Appliances')
    if (apps.length) c.push({ trade: 'Appliances', items: [`Supply, fit and connect ${list(apps)}.`] })
    c.push({ trade: 'Plumbing', items: [`Connect ${n(q.water, 'water point')}.`, ...(q.wasteRun ? [`Extend the sink waste ${r1(q.wasteRun)} m to the existing drain.`] : [])] })
    c.push({ trade: 'Electrics', items: [`Wire ${n(q.elec, 'appliance point')}${q.cooker ? ' and a new cooker circuit' : ''}. Test and certify.`] })
    c.push({ trade: 'Finishes', items: finishes })
  } else if (s.job === 'bathroom') {
    c.push({ trade: 'Strip out', items: [`Protect the route in. Strip out the existing bathroom, ${size}, and clear the waste.`] })
    c.push({ trade: 'Sanitaryware', items: [`Supply and fit ${range} sanitaryware: ${list(kinds((p) => def(p.kind).group === 'Sanitaryware'))}.`, `Brassware in ${M('metal').name}.`, ...(slots.includes('fronts') ? [`Vanity front in ${M('fronts').name}.`] : [])] })
    c.push({ trade: 'Plumbing', items: [`Connect ${n(q.water, 'fitting')} to hot, cold and waste.`, ...(q.soilRun ? [`Run ${r1(q.soilRun)} m of new soil pipe to the stack.`] : [])] })
    c.push({ trade: 'Waterproofing', items: [q.wet ? `Tank ${r1(q.wet)} m² of wall behind the bath and shower before tiling.` : 'No wet walls to tank.', ...(s.extras.includes('wetroom') ? ['Form a wet room floor with a fall to the drain and tank it.'] : [])] })
    c.push({ trade: 'Electrics', items: [`Wire ${n(Math.max(1, q.elec), 'point')} to suit the bathroom zones. Test and certify.`] })
    c.push({ trade: 'Finishes', items: finishes })
  } else {
    const glazed = kinds((p) => !!def(p.kind).glazed)
    c.push({ trade: 'Groundworks', items: [`Dig and pour foundations for a single storey rear extension, ${size} inside, ${r1(q.area)} m².`, 'Lay an insulated floor slab and connect the drains.'] })
    c.push({ trade: 'Structure', items: ['Build insulated cavity walls to the roof plate.', s.extras.includes('pitched') ? 'Build a pitched tiled roof.' : 'Build a flat warm roof with a single ply covering.', ...(q.knockM ? [`Form a ${r1(q.knockM)} m opening into the house with a steel beam to the engineer's design.`] : [])] })
    if (glazed.length) c.push({ trade: 'Glazing and doors', items: [`Supply and fit ${list(glazed)} in ${M('metal').name}.`] })
    const rooms = kinds((p) => ['Rooms', 'Units'].includes(def(p.kind).group) || p.kind === 'stud')
    if (rooms.length) c.push({ trade: 'Rooms and fittings', items: [`Build and fit ${list(rooms)}.`, ...(slots.includes('worktop') ? [`Kitchen fronts in ${M('fronts').name}, worktops in ${M('worktop').name}.`] : [])] })
    c.push({ trade: 'Services', items: ['First and second fix electrics with new circuits. Test and certify.', s.extras.includes('ufh') ? 'Wet underfloor heating in the screed, on its own zone.' : 'Extend the heating with radiators.'] })
    c.push({ trade: 'Finishes', items: ['Plasterboard and skim walls and ceiling.', ...finishes] })
  }
  const named = JOBS[s.job].extras.filter((e) => s.extras.includes(e[0]) && !['pitched', 'wetroom'].includes(e[0])).map((e) => e[1] + '.')
  if (named.length) c.push({ trade: 'Extras', items: named })
  return {
    clauses: c,
    exclusions: s.job === 'extension' ? ['Planning and party wall fees charged by others.', 'Kitchen appliances unless drawn.', 'Garden landscaping beyond making good.', 'Moving meters or the boiler.']
      : ['Work to other rooms.', 'Moving the boiler or the meters.', 'Asbestos removal, if any is found.', 'Decorating beyond this room.'],
    assumptions: ['Sizes are the ones you drew. Rob measures on the site visit and the price is confirmed then.', 'Walls and floors are sound once stripped. Hidden problems are priced before we carry on.', 'Clear access and somewhere to stand a skip.', `A simple written contract in plain English covers the work, the stage payments and the ${tier === 'best' ? 'ten' : 'two'} year guarantee.`],
  }
}

// ------------------------------------------------------------------------------------------ elevations
export type ElevItem = { id: string; kind: string; x: number; w: number; z: number; h: number; opening: boolean }
/** What you see looking square at a wall from inside the room: items on that wall, left to right, with their heights. */
export function elevation(s: Scene, wall: Wall): { length: number; height: number; items: ElevItem[] } {
  const length = wall === 'N' || wall === 'S' ? s.length : s.width
  const items = s.items.filter((p) => (def(p.kind).mount === 'opening' ? WALL_OF[p.rot] : wallOf(s, p)) === wall).map((p) => {
    const d = def(p.kind), [a, z] = span(p), w = z - a
    return { id: p.id, kind: p.kind, x: wall === 'N' || wall === 'E' ? a : length - z, w, z: d.z, h: d.h, opening: d.mount === 'opening' }
  }).sort((a, b) => a.x - b.x)
  return { length, height: s.height, items }
}
/** The wall with the most on it: the one worth showing first. */
export const busiestWall = (s: Scene): Wall => (['N', 'E', 'S', 'W'] as Wall[]).map((w) => [w, elevation(s, w).items.filter((i) => !i.opening).reduce((t, i) => t + i.w, 0)] as [Wall, number]).sort((a, b) => b[1] - a[1])[0][0]

// ------------------------------------------------------------------------------------------ the drawing register
export const SHEETS: { no: string; key: string; title: string; scale: string }[] = [
  { no: 'A-101', key: 'plan', title: 'Floor plan', scale: '1:25' },
  { no: 'A-201', key: 'elev', title: 'Wall elevations', scale: '1:25' },
  { no: 'A-301', key: 'model', title: 'Ink model', scale: 'Not to scale' },
  { no: 'F-401', key: 'finishes', title: 'Finishes', scale: 'Samples at 1:4' },
  { no: 'Q-501', key: 'boq', title: 'Bill of quantities', scale: 'None' },
  { no: 'Q-502', key: 'options', title: 'Three priced options', scale: 'None' },
  { no: 'P-601', key: 'programme', title: 'Programme and stage payments', scale: 'Working days' },
  { no: 'R-701', key: 'regs', title: 'Regulations and planning', scale: 'None' },
  { no: 'S-801', key: 'scope', title: 'Scope of works', scale: 'None' },
]
export const jobNo = (job: Job) => ({ kitchen: 'BB-2611-K', bathroom: 'BB-2611-B', extension: 'BB-2611-X' })[job]
