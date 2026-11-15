// Copied from the ops sandbox (webforge-ops apps/web/src/lib/sandbox) so the site and the sales sandbox give the same figures.
// The sandbox journey model. Everything in the sandbox is plain code: no AI call is made anywhere.
// A step is either code or a person. Where AI could be added to a step, `ai` says what it would add;
// the demo still runs that step as code. Pure data and helpers, shared by staff pages and the leave-behind page.

export type Kind = 'code' | 'person'
export type Lever = 'cost' | 'customers' | 'ticket'

export type Step = {
  id: string
  stage: number          // the step fires when the demo reaches this stage
  when: string           // 'At once', 'Day 2' ...
  title: string
  detail: string
  kind: Kind
  lever: Lever
  ai?: string            // what an AI version of this step would add
}

export type Artefact =
  | { type: 'email'; to: string; from: string; subject: string; body: string[]; attach?: string[] }
  | { type: 'text'; to: string; body: string }
  | { type: 'calendar'; title: string; when: string; who: string; note?: string }
  | { type: 'quote'; title: string; lines: [string, string][]; total: [string, string]; note?: string }
  | { type: 'doc'; title: string; rows: [string, string][]; images?: { src: string; label: string }[]; note?: string }

export type Firm = {
  key: 'architect' | 'builder' | 'plumber'
  name: string
  short: string
  url: string
  line: string
  customer: string       // the fictional customer in the walk-through
  owner: string          // the fictional person at the firm
  stages: string[]       // stage names, index 1 upward
}

export const LEVER: Record<Lever, { name: string; plain: string }> = {
  cost: { name: 'Lower cost', plain: 'Admin the team no longer does by hand' },
  customers: { name: 'More customers', plain: 'Enquiries answered and chased before they go cold' },
  ticket: { name: 'Higher ticket', plain: 'A better experience that supports a better price' },
}

export const BOTH_LINE = 'Every step here runs as plain code. We build AI tools and non-AI tools: where a step is marked AI option, we can add AI to it for a monthly running cost.'

export const gbp = (pounds: number) => '£' + Math.round(pounds).toLocaleString('en-GB')
export const range = (low: number, high: number) => (Math.round(low) === Math.round(high) ? gbp(low) : `${gbp(low)} to ${gbp(high)}`)
/** Round to a sensible quoting figure: nearest 5 under 500, 50 under 5,000, 100 under 50,000, else 500. */
export const tidy = (n: number) => { const u = n < 500 ? 5 : n < 5000 ? 50 : n < 50000 ? 100 : 500; return Math.round(n / u) * u }

export const counts = (steps: Step[]) => ({
  total: steps.length,
  code: steps.filter((s) => s.kind === 'code').length,
  person: steps.filter((s) => s.kind === 'person').length,
  ai: steps.filter((s) => s.ai).length,
})

// ------------------------------------------------------------------------------------------ the three firms
export const FIRMS: Record<Firm['key'], Firm> = {
  architect: {
    key: 'architect', name: 'Harlow & Finch Architects', short: 'Harlow & Finch', url: 'harlowfinch.example/design',
    line: 'A 3D designer the customer gets the moment they enquire. They shape the house; the drawings, planning guide and fee follow.',
    customer: 'Alex Morgan', owner: 'Dana Finch',
    stages: ['Enquiry', 'Design', 'Sent', 'Call booked', 'Follow-up'],
  },
  builder: {
    key: 'builder', name: 'Bramley Build Co.', short: 'Bramley Build', url: 'bramleybuild.example/plan',
    line: 'The customer plans the room. Drawings, quantities and three priced options come back the same day.',
    customer: 'Sam Okafor', owner: 'Rob Bramley',
    stages: ['Enquiry', 'Planner', 'Job pack', 'Visit booked', 'Follow-up'],
  },
  plumber: {
    key: 'plumber', name: 'Tidewater Plumbing & Heating', short: 'Tidewater', url: 'tidewater.example/fix',
    line: 'A boiler fault finder that orders the part and books the engineer, and a heating planner that sizes and prices a new system.',
    customer: 'Jo Bennett', owner: 'Chris Tate',
    stages: ['Boiler', 'Diagnosis', 'Part and price', 'Booked', 'After the job'],
  },
}

import { ARCHITECT_STEPS } from './steps/architect'
import { BUILDER_STEPS } from './steps/builder'
import { PLUMBER_STEPS } from './steps/plumber'
export { ARCHITECT_STEPS, BUILDER_STEPS, PLUMBER_STEPS }
export const STEPS = { architect: ARCHITECT_STEPS, builder: BUILDER_STEPS, plumber: PLUMBER_STEPS }
