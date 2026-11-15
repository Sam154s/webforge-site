// Copied from the ops sandbox (webforge-ops apps/web/src/lib/sandbox) so the site and the sales sandbox give the same figures.
// "Now do yours": a journey and three lever figures for the prospect's own business, from a sector template
// and a handful of numbers typed in on the call. Pure code: the saved row holds only the inputs, and this
// file turns them back into the page, so the staff view and the leave-behind link always agree.
import type { Step } from './journey'

export type Inputs = {
  v: 1
  sector: string
  enquiries: number       // a month
  winRate: number         // percent of enquiries that become jobs
  jobValue: number        // pounds, average job
  margin: number          // percent of job value kept as margin
  adminMinutes: number    // per enquiry today: replying, booking, quoting, chasing
  hourCost: number        // pounds per hour of the person doing that admin
}

export type Sector = {
  key: string; name: string; demo: 'architect' | 'builder' | 'plumber'
  tool: { name: string; does: string; gets: string }
  defaults: Omit<Inputs, 'v' | 'sector'>
  nouns: { job: string; visit: string; price: string }
}

const d = (enquiries: number, winRate: number, jobValue: number, margin: number, adminMinutes: number, hourCost: number) => ({ enquiries, winRate, jobValue, margin, adminMinutes, hourCost })

export const SECTORS: Sector[] = [
  { key: 'architect', name: 'Architect or designer', demo: 'architect', defaults: d(12, 25, 14000, 45, 150, 45),
    tool: { name: 'A 3D designer in your brand', does: 'Shapes the building or room they have in mind', gets: 'A design sheet for them and a full brief for you' },
    nouns: { job: 'project', visit: 'first call', price: 'fee proposal' } },
  { key: 'builder', name: 'Builder or renovator', demo: 'builder', defaults: d(25, 20, 18000, 22, 120, 35),
    tool: { name: 'A photo job pack', does: 'Marks up photos of the job and picks a finish', gets: 'Three priced options and a scale plan' },
    nouns: { job: 'job', visit: 'site visit', price: 'quote' } },
  { key: 'trades', name: 'Plumbing, heating or electrical', demo: 'plumber', defaults: d(90, 55, 240, 45, 25, 28),
    tool: { name: 'A photo fault finder', does: 'Photographs the problem and answers four questions', gets: 'A fixed price and a booked slot' },
    nouns: { job: 'job', visit: 'visit', price: 'fixed price' } },
  { key: 'fitted', name: 'Kitchens, bathrooms or joinery', demo: 'builder', defaults: d(30, 22, 9500, 30, 110, 32),
    tool: { name: 'A room planner', does: 'Lays out the room and picks ranges and finishes', gets: 'A priced design with three options' },
    nouns: { job: 'job', visit: 'survey', price: 'quote' } },
  { key: 'outdoor', name: 'Landscaping or roofing', demo: 'builder', defaults: d(35, 25, 6500, 30, 90, 30),
    tool: { name: 'A photo estimator', does: 'Outlines the area on a photo and picks materials', gets: 'A priced estimate and a visit slot' },
    nouns: { job: 'job', visit: 'survey', price: 'estimate' } },
  { key: 'agent', name: 'Estate or letting agent', demo: 'architect', defaults: d(60, 12, 4200, 60, 60, 26),
    tool: { name: 'An instant valuation pack', does: 'Enters their property and uploads photos', gets: 'A valuation range and a booked appraisal' },
    nouns: { job: 'instruction', visit: 'appraisal', price: 'fee quote' } },
  { key: 'accountant', name: 'Accountant or bookkeeper', demo: 'plumber', defaults: d(18, 35, 2400, 55, 90, 40),
    tool: { name: 'A fee builder', does: 'Answers a short set of questions about their business', gets: 'A fixed monthly fee and an onboarding checklist' },
    nouns: { job: 'client', visit: 'intro call', price: 'fee quote' } },
  { key: 'other', name: 'Another service business', demo: 'builder', defaults: d(30, 30, 1500, 40, 60, 30),
    tool: { name: 'A self-serve estimator', does: 'Describes what they need with photos or a few choices', gets: 'A price and a booked next step' },
    nouns: { job: 'job', visit: 'first meeting', price: 'quote' } },
]

export const sector = (key: string) => SECTORS.find((s) => s.key === key) ?? SECTORS[SECTORS.length - 1]

export const FIELDS: { key: keyof Omit<Inputs, 'v' | 'sector'>; label: string; unit: string; min: number; max: number }[] = [
  { key: 'enquiries', label: 'Enquiries a month', unit: '', min: 1, max: 5000 },
  { key: 'winRate', label: 'Enquiries that become jobs', unit: '%', min: 1, max: 100 },
  { key: 'jobValue', label: 'Average job value', unit: '£', min: 1, max: 5_000_000 },
  { key: 'margin', label: 'Margin on a job', unit: '%', min: 1, max: 100 },
  { key: 'adminMinutes', label: 'Admin per enquiry today', unit: 'min', min: 0, max: 2000 },
  { key: 'hourCost', label: 'Cost of an admin hour', unit: '£', min: 1, max: 1000 },
]

/** Coerce anything (a form post, a saved row) into valid inputs. Out-of-range values fall back to the sector default. */
export function clean(raw: Record<string, unknown>): Inputs {
  const s = sector(String(raw.sector ?? ''))
  const out = { v: 1, sector: s.key } as Inputs
  for (const f of FIELDS) {
    const n = Number(raw[f.key])
    out[f.key] = Number.isFinite(n) && n >= f.min && n <= f.max ? Math.round(n) : s.defaults[f.key]
  }
  return out
}

// What we assume the journey changes. Stated on the page, low to high, never a single figure.
export const ASSUME = {
  adminCut: [0.5, 0.8],       // share of per-enquiry admin the code removes
  winPoints: [2, 5],          // extra enquiries in every 100 that become jobs, from instant reply and follow-up
  priceLift: [0.03, 0.08],    // price rise the better experience supports
} as const

export function levers(i: Inputs) {
  const perYear = i.enquiries * 12
  const jobs = perYear * (i.winRate / 100)
  const room = Math.max(0, 100 - i.winRate)
  const m = i.margin / 100
  const lo = 0, hi = 1
  const cost = [lo, hi].map((k) => perYear * (i.adminMinutes / 60) * ASSUME.adminCut[k] * i.hourCost)
  const hours = [lo, hi].map((k) => perYear * (i.adminMinutes / 60) * ASSUME.adminCut[k])
  const extraJobs = [lo, hi].map((k) => perYear * (Math.min(ASSUME.winPoints[k], room) / 100))
  const customers = extraJobs.map((j) => j * i.jobValue * m)
  const ticket = [lo, hi].map((k) => jobs * i.jobValue * ASSUME.priceLift[k])   // a price rise is all margin
  return {
    jobs: Math.round(jobs),
    cost: { low: cost[0], high: cost[1], hours: [Math.round(hours[0]), Math.round(hours[1])] },
    customers: { low: customers[0], high: customers[1], jobs: [Math.round(extraJobs[0]), Math.round(extraJobs[1])] },
    ticket: { low: ticket[0], high: ticket[1] },
    total: { low: cost[0] + customers[0] + ticket[0], high: cost[1] + customers[1] + ticket[1] },
  }
}

/** The journey we would build, worded for the sector. */
export function journey(sectorKey: string): Step[] {
  const s = sector(sectorKey), n = s.nouns
  return [
    { id: 'y1', stage: 1, when: 'At once', title: 'Enquiry logged', detail: 'Every enquiry lands in one list the moment it is made. Nobody retypes it.', kind: 'code', lever: 'cost' },
    { id: 'y2', stage: 1, when: 'At once', title: 'Your tool sent to the customer', detail: `${s.tool.name}, sent while they are still interested.`, kind: 'code', lever: 'customers' },
    { id: 'y3', stage: 1, when: 'Same visit', title: 'Customer uses the tool', detail: `${s.tool.does}.`, kind: 'code', lever: 'ticket', ai: 'Read what the customer uploads or types, so they answer fewer questions.' },
    { id: 'y4', stage: 1, when: 'On send', title: 'Their output built', detail: `${s.tool.gets}.`, kind: 'code', lever: 'ticket' },
    { id: 'y5', stage: 1, when: 'On send', title: `${cap(n.price)} priced from your own rates`, detail: 'Your price book, written down once and applied the same way every time.', kind: 'code', lever: 'cost' },
    { id: 'y6', stage: 1, when: 'On send', title: 'Sent to the customer and to you', detail: `You see the ${n.job} before you speak to them.`, kind: 'code', lever: 'cost', ai: 'Write a personal covering note in your own voice.' },
    { id: 'y7', stage: 1, when: 'On send', title: `${cap(n.visit)} booked from your diary`, detail: 'The customer picks a free slot. It lands in both diaries.', kind: 'code', lever: 'customers' },
    { id: 'y8', stage: 1, when: 'On the day', title: `You take the ${n.visit}`, detail: 'The step that needs a person, with the facts already gathered.', kind: 'person', lever: 'ticket' },
    { id: 'y9', stage: 1, when: 'Day 2 and day 6', title: 'Follow-ups, then stop', detail: `Two nudges if the ${n.price} is unopened. Then the enquiry is marked quiet.`, kind: 'code', lever: 'customers', ai: 'Read replies and draft answers for you to approve.' },
    { id: 'y10', stage: 1, when: 'On accept', title: 'Accepted online', detail: `The customer accepts on the page and the ${n.job} is opened.`, kind: 'code', lever: 'cost' },
    { id: 'y11', stage: 1, when: 'After the job', title: 'Review request and repeat reminder', detail: 'Asked once after a clean job. Past customers hear from you when it is useful to them.', kind: 'code', lever: 'customers' },
  ]
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
