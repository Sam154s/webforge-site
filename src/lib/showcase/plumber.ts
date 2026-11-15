// Copied from the ops sandbox (webforge-ops apps/web/src/lib/sandbox) so the site and the sales sandbox give the same figures.
// Boiler fault finder: a catalogue of makes, models, fault codes and parts, and the rules that turn
// "this boiler, this code" into a diagnosis, a part, a stock decision, a fixed price and slots built round the part.
// This is an example catalogue for a fictional firm. A live build loads the firm's own makes, codes, parts and prices.
// Plain code: the same boiler and code always give the same answer. Whole pounds.
// Code meanings were checked against the makers' published lists on 2026-11-15; causes are worded as likely, never certain,
// and a live build is verified against each installation manual. A part marked provisional is confirmed on the visit.
import { tidy } from './journey'

export type Component = 'fan' | 'electrode' | 'hex' | 'gasvalve' | 'pump' | 'sensor' | 'prv' | 'ntc' | 'diverter' | 'condensate' | 'vessel'
export type CheckKind = 'pressure' | 'condensate' | 'reset'
export type Stock = 'van' | 'branch' | 'order'

export type Code = {
  code: string
  sub?: string           // the maker's cause code, where the display shows one
  shows: string          // what the display is telling you, in plain words
  cause: string          // the most likely cause
  component: Component   // highlighted on the schematic
  also?: Component[]     // other things the engineer checks on the same visit
  part: keyof typeof PARTS
  provisional?: boolean  // the part is carried, and only fitted and charged if the engineer confirms it is the cause
  minutes: number
  check?: CheckKind      // a first check the customer can safely do
  gas?: boolean          // an ignition or gas fault: show the gas safety line
  only?: string[]        // model keys this code applies to, where a make uses different codes across its ranges
}
export type Model = { key: string; name: string; kw: number; kind: 'Combi' | 'System' }
export type Make = { key: string; name: string; range: string; prefix: string; k: number; models: Model[]; codes: Code[] }

export const GAS_LINE = 'If you can smell gas, leave the house, do not use switches or flames, and call the National Gas Emergency Service on 0800 111 999.'
export const CASE_LINE = 'Never take the cover off a boiler. Everything we ask you to check is on the outside.'

export const PARTS = {
  electrode: { name: 'Ignition electrode and lead', ref: 'IGN-210', price: 38 },
  fan: { name: 'Fan assembly', ref: 'FAN-118', price: 165 },
  pump: { name: 'Pump head', ref: 'PMP-305', price: 140 },
  sensor: { name: 'Water pressure sensor', ref: 'SNS-072', price: 42 },
  gasvalve: { name: 'Gas valve', ref: 'GAS-140', price: 120 },
  ntc: { name: 'Flow temperature sensor', ref: 'NTC-031', price: 18 },
  prv: { name: 'Pressure relief valve and seals', ref: 'PRV-064', price: 34 },
  diverter: { name: 'Diverter valve cartridge', ref: 'DIV-226', price: 88 },
  hex: { name: 'Heat exchanger clean and seal kit', ref: 'HEX-410', price: 56 },
} as const

export const COMPONENT: Record<Component, string> = {
  fan: 'Fan', electrode: 'Ignition electrode', hex: 'Heat exchanger', gasvalve: 'Gas valve', pump: 'Pump', sensor: 'Pressure sensor',
  prv: 'Pressure relief valve', ntc: 'Flow sensor', diverter: 'Diverter valve', condensate: 'Condensate trap', vessel: 'Expansion vessel',
}

const LOW_CAUSE = 'Pressure has dropped. The usual reasons are a small leak, an expansion vessel that has lost its charge, or radiators bled recently. A relief valve letting water by is less common.'
const low = (code: string, more: Partial<Code> = {}): Code =>
  ({ code, shows: 'Water pressure in the heating system is too low', cause: LOW_CAUSE, component: 'prv', also: ['vessel', 'sensor'], part: 'prv', provisional: true, minutes: 60, check: 'pressure', ...more })
const noFlame = (code: string, shows: string, more: Partial<Code> = {}): Code =>
  ({ code, shows, cause: 'A worn ignition electrode, or a blocked or frozen condensate pipe.', component: 'electrode', also: ['condensate'], part: 'electrode', minutes: 50, check: 'condensate', gas: true, ...more })
const FLAME_LOST = 'Most often the gas supply was interrupted or the flue is not clearing. The engineer checks both first. A failing gas valve is a less common cause.'

export const MAKES: Make[] = [
  { key: 'vaillant', name: 'Vaillant', range: 'ecoTEC', prefix: 'VL', k: 1.1,
    models: [{ key: 'plus832', name: 'ecoTEC plus 832', kw: 32, kind: 'Combi' }, { key: 'pro28', name: 'ecoTEC pro 28', kw: 28, kind: 'Combi' }, { key: 'plus618', name: 'ecoTEC plus 618', kw: 18, kind: 'System' }],
    codes: [
      low('F22'),
      noFlame('F28', 'The boiler tried to light and failed'),
      { code: 'F29', shows: 'The flame went out while the boiler was running', cause: FLAME_LOST, component: 'gasvalve', part: 'gasvalve', provisional: true, minutes: 75, check: 'reset', gas: true },
      { code: 'F75', shows: 'No change in pressure when the pump started', cause: 'Usually a failed water pressure sensor. The pump is checked on the same visit.', component: 'sensor', also: ['pump'], part: 'sensor', minutes: 45 },
      { code: 'F24', shows: 'Water is heating up too quickly', cause: 'Poor circulation: a seized or worn pump, air in the system or low pressure.', component: 'pump', part: 'pump', provisional: true, minutes: 70, check: 'reset' },
    ] },
  { key: 'worcester', name: 'Worcester Bosch', range: 'Greenstar i', prefix: 'WB', k: 1.15,
    models: [{ key: '30i', name: 'Greenstar 30i', kw: 30, kind: 'Combi' }, { key: '25i', name: 'Greenstar 25i', kw: 25, kind: 'Combi' }],
    codes: [
      noFlame('EA', 'No flame was detected', { sub: '227' }),
      { code: 'E9', sub: '219 or 224', shows: 'The overheat thermostat has tripped', cause: 'Water is not moving through the boiler: the pump is seized or worn.', component: 'pump', part: 'pump', minutes: 70, check: 'reset' },
      { code: 'A1', sub: '281', shows: 'The pump is stuck or running dry', cause: 'The pump has seized, or there is too little water in the system for it to move. Check the pressure gauge first.', component: 'pump', part: 'pump', minutes: 70, check: 'pressure' },
      { code: 'C6', sub: '215 or 216', shows: 'The fan speed is wrong', cause: 'The fan is running too fast or too slow, usually a worn fan assembly.', component: 'fan', part: 'fan', minutes: 60 },
      { code: 'E2', sub: '222 or 223', shows: 'The flow temperature sensor is not reading', cause: 'A failed flow temperature sensor.', component: 'ntc', part: 'ntc', minutes: 35 },
    ] },
  { key: 'baxi', name: 'Baxi', range: '600 and Duo-tec', prefix: 'BX', k: 1,
    models: [{ key: '630', name: '630 Combi', kw: 30, kind: 'Combi' }, { key: 'duotec28', name: 'Duo-tec Combi 28', kw: 28, kind: 'Combi' }, { key: 'platinum32', name: 'Platinum+ 32', kw: 32, kind: 'Combi' }],
    codes: [
      // Baxi uses a different low pressure code on each family: E118 on the 600 range, E119 on Duo-tec and Platinum.
      low('E118', { only: ['630'] }),
      low('E119', { only: ['duotec28', 'platinum32'] }),
      noFlame('E133', 'Gas supply or ignition fault'),
      { code: 'E110', shows: 'The boiler has overheated', cause: 'Water is not moving through the boiler: a jammed pump or air in the system.', component: 'pump', part: 'pump', provisional: true, minutes: 70, check: 'reset' },
      { code: 'E160', shows: 'Fan fault', cause: 'A worn fan assembly.', component: 'fan', part: 'fan', minutes: 60 },
      { code: 'E20', shows: 'The heating temperature sensor is not reading', cause: 'A failed flow temperature sensor.', component: 'ntc', part: 'ntc', minutes: 35 },
    ] },
  { key: 'ideal', name: 'Ideal', range: 'Logic', prefix: 'ID', k: 0.95,
    models: [{ key: 'logic30', name: 'Logic Combi 30', kw: 30, kind: 'Combi' }, { key: 'logic24', name: 'Logic Combi 24', kw: 24, kind: 'Combi' }, { key: 'logicmax35', name: 'Logic Max Combi 35', kw: 35, kind: 'Combi' }],
    codes: [
      low('F1'),
      noFlame('L2', 'Ignition lockout'),
      { code: 'F2', shows: 'The flame was lost', cause: 'Low gas pressure, a flue that is not clearing, or a failing gas valve. The engineer checks supply and flue first.', component: 'gasvalve', part: 'gasvalve', provisional: true, minutes: 75, check: 'reset', gas: true },
      { code: 'F3', shows: 'Fan fault', cause: 'A worn fan assembly.', component: 'fan', part: 'fan', minutes: 60 },
      { code: 'L1', shows: 'No water flow, the boiler has overheated', cause: 'Water is not moving through the boiler: the pump is seized or worn.', component: 'pump', part: 'pump', minutes: 70, check: 'reset' },
    ] },
]

// When the display shows nothing, three symptoms cover most calls.
export const NO_CODE: Code[] = [
  { code: 'none-1', shows: 'Heating works but there is no hot water', cause: 'A stuck diverter valve, which sends heat to the taps or the radiators.', component: 'diverter', part: 'diverter', minutes: 80 },
  { code: 'none-2', shows: 'Banging or kettle noises when it fires', cause: 'Scale on the heat exchanger.', component: 'hex', part: 'hex', minutes: 110 },
  { code: 'none-3', shows: 'Water dripping from under the boiler', cause: 'Often the pressure relief valve letting water by, or a joint that has started to weep.', component: 'prv', also: ['vessel'], part: 'prv', provisional: true, minutes: 60 },
]

export const CHECKS: Record<CheckKind, { title: string; steps: string[]; ask: string }> = {
  pressure: {
    title: 'Check the pressure first. You may not need us.',
    steps: ['Find the pressure gauge on the front of the boiler and set the reading below.', 'If it is under 1 bar, open the filling loop under the boiler until it reads 1.2, then close it.', 'Press reset once.'],
    ask: 'Has the code cleared and the pressure held?',
  },
  condensate: {
    title: 'Check the condensate pipe first.',
    steps: ['In freezing weather the plastic waste pipe outside can ice up. Pour warm, not boiling, water along it.', 'Check other gas appliances, such as the hob, still light.', 'Press reset once.'],
    ask: 'Did the boiler light and stay lit?',
  },
  reset: {
    title: 'Try one reset.',
    steps: ['Press and hold reset for three seconds.', 'Wait two minutes for the boiler to run through its start-up.', 'Do not reset more than once. Repeated resets can hide a real fault.'],
    ask: 'Did the code clear and stay clear?',
  },
}

export const STOCK: Record<Stock, { name: string; line: string; slots: string[] }> = {
  van: { name: 'On the van', line: 'Reserved on the engineer\'s van now.', slots: ['Today, 2 pm to 4 pm', 'Today, 4 pm to 6 pm', 'Tomorrow, 8 am to 10 am'] },
  branch: { name: 'At the trade counter', line: 'Reserved for collection on the way to you.', slots: ['Today, 4 pm to 6 pm', 'Tomorrow, 8 am to 10 am', 'Tomorrow, 10 am to 12 pm'] },
  order: { name: 'Ordered from the supplier', line: 'Ordered now, delivered to us by 10 am tomorrow.', slots: ['Tomorrow, 12 pm to 2 pm', 'Tomorrow, 2 pm to 4 pm', 'The day after, 8 am to 10 am'] },
}

export type Answers = { make: string; model: string; code: string; pressure: number; vulnerable: boolean; age?: number; repeat?: boolean }
export const START: Answers = { make: 'vaillant', model: 'plus832', code: 'F22', pressure: 0.4, vulnerable: false, age: 9, repeat: false }

const RATE = 84   // pounds per hour, Gas Safe engineer
const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return h }

export const make = (key: string) => MAKES.find((m) => m.key === key) ?? MAKES[0]
/** The codes for a make, and for one model where a make uses different codes across its ranges. */
export const codesFor = (m: Make, model?: string) => [...m.codes.filter((c) => !model || !c.only || c.only.includes(model)), ...NO_CODE]
export const firstCode = (m: Make, model: string) => codesFor(m, model)[0].code

export function diagnose(a: Answers, rate: number = RATE) {
  const m = make(a.make)
  const model = m.models.find((x) => x.key === a.model) ?? m.models[0]
  const list = codesFor(m, model.key)
  const code = list.find((c) => c.code === a.code) ?? list[0]
  const p = PARTS[code.part]
  const h = hash(m.key + model.key + code.part)
  const stock: Stock = (['van', 'branch', 'order'] as const)[h % 3]
  const partPrice = tidy(p.price * m.k * (model.kw >= 30 ? 1.08 : 1))
  const labour = tidy((code.minutes / 60) * rate)
  const total = tidy((partPrice + labour) * 1.2)
  const s = STOCK[stock]
  // A household that cannot wait gets the first slot the part allows, marked as a priority visit.
  const slots = a.vulnerable ? [`Priority: ${s.slots[0].toLowerCase()}`, ...s.slots.slice(1)] : s.slots
  return {
    make: m, model, code, hasCode: !code.code.startsWith('none'),
    part: { ...p, ref: `${m.prefix}-${p.ref}`, price: partPrice },
    stock, stockName: s.name, stockLine: s.line, order: stock === 'order' ? `PO-${10000 + (h * 7) % 89999}` : null,
    labour, total, slots, check: code.check ? CHECKS[code.check] : null, checkKind: code.check ?? null,
    lowPressure: code.check === 'pressure' && a.pressure < 1,
    provisional: !!code.provisional, labourOnly: tidy(labour * 1.2),
  }
}

// ---------------------------------------------------------------------------------------------- repair or replace
// A rule of thumb, shown to the customer as a sum and never as a push: the repair always goes ahead if they want it.
export const REPLACEMENT = { combi: 2300, combiLarge: 2450, system: 2750 }   // example installed prices including VAT
export const THIS_YEAR = 2026
export const replacementFrom = (model: Model) => (model.kind === 'System' ? REPLACEMENT.system : model.kw >= 30 ? REPLACEMENT.combiLarge : REPLACEMENT.combi)

export function advise(a: Answers) {
  const d = diagnose(a)
  const age = Math.max(0, Math.round(a.age ?? 9))
  const replacement = replacementFrom(d.model)
  const sum = age * d.total
  const reasons: string[] = []
  if (sum > replacement) reasons.push(`Age times repair price comes to more than a new boiler.`)
  if (age >= 15) reasons.push('It is 15 years old or more.')
  if (THIS_YEAR - age < 2005) reasons.push('It was fitted before 2005, so it is probably not a condensing boiler and uses more gas.')
  if (a.repeat) reasons.push('It has already had a repair in the last 12 months.')
  return { age, fitted: THIS_YEAR - age, repair: d.total, sum, replacement, over: sum > replacement, reasons, suggest: reasons.length > 0,
    line: reasons.length ? 'Worth seeing a replacement price next to the repair.' : 'Repair it. A boiler this age is worth fixing.' }
}

// ---------------------------------------------------------------------------------------------- boiler passport
// The record the job writes to. It is what makes next year's service book itself. Dates are worked from one example day.
export const TODAY = '2026-11-16'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const parse = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)) }
const iso = (d: Date) => d.toISOString().slice(0, 10)
export const addDays = (date: string, n: number) => { const d = parse(date); d.setUTCDate(d.getUTCDate() + n); return iso(d) }
/** Calendar months on, clamped to the end of a shorter month (31 January plus one month is 28 February). */
export const addMonths = (date: string, n: number) => {
  const d = parse(date), day = d.getUTCDate()
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n)
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, last)); return iso(d)
}
export const nice = (date: string) => { const d = parse(date); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` }
export const visitDate = (slot: string) => addDays(TODAY, /the day after/i.test(slot) ? 2 : /tomorrow/i.test(slot) ? 1 : 0)

export function passport(a: Answers, slot: string) {
  const d = diagnose(a), adv = advise(a)
  const visit = visitDate(slot || d.slots[0])
  const h = hash(d.make.key + d.model.key + 'serial')
  return {
    number: `TW-${d.make.prefix}-${String(1000 + (h % 9000))}`,
    make: d.make.name, model: d.model.name, output: `${d.model.kw} kW ${d.model.kind.toLowerCase()}`,
    fitted: adv.fitted, age: adv.age,
    visit, part: d.part, guarantee: addMonths(visit, 12), reminder: addMonths(visit, 11), service: addMonths(visit, 12),
    entries: [
      { date: TODAY, what: 'Boiler added to our records', detail: `${d.make.name} ${d.model.name}, fitted about ${adv.fitted}` },
      { date: TODAY, what: d.hasCode ? `Fault ${d.code.code} reported` : 'Fault reported', detail: d.code.shows },
      { date: visit, what: 'Repair visit', detail: `${d.part.name}, ${d.part.ref}, fitted` },
      { date: addMonths(visit, 11), what: 'Service reminder goes out', detail: 'With three slots to choose from' },
      { date: addMonths(visit, 12), what: 'Annual service due, part guarantee ends', detail: 'Keeps the record complete' },
    ],
  }
}
