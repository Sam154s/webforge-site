// Copied from the ops sandbox (webforge-ops apps/web/src/lib/sandbox) so the site and the sales sandbox give the same figures.
// Architect demo maths: floor area, indicative build budget and the practice fee proposal.
// Example rate card for a fictional practice. Whole pounds throughout.
import { tidy } from './journey'

export type Roof = 'flat' | 'gable' | 'hip' | 'mono'
export type Cladding = 'brick' | 'render' | 'timber' | 'zinc'
export type Glazing = 'modest' | 'generous' | 'full'
export type Spec = 'standard' | 'high' | 'premium'

export type Design = {
  type: 'new' | 'extension'
  side: 'rear' | 'side'     // extension only
  width: number             // metres
  depth: number
  storeys: number
  roof: Roof
  cladding: Cladding
  glazing: Glazing
  spec: Spec
}

export const START: Design = { type: 'new', side: 'rear', width: 10, depth: 8, storeys: 2, roof: 'gable', cladding: 'brick', glazing: 'generous', spec: 'high' }

// The existing house in extension mode is fixed.
export const HOUSE = { width: 8, depth: 7, storeys: 2 }

export const LIMITS = {
  new: { width: [6, 16], depth: [6, 14], storeys: [1, 3] },
  extension: { width: [3, 8], depth: [3, 7], storeys: [1, 2] },
} as const

export const ROOFS: [Roof, string][] = [['gable', 'Pitched'], ['hip', 'Hipped'], ['mono', 'Single slope'], ['flat', 'Flat']]
export const CLADDINGS: [Cladding, string, string][] = [['brick', 'Brick', '#A65B41'], ['render', 'Render', '#ECE7DB'], ['timber', 'Timber', '#B88A5B'], ['zinc', 'Zinc', '#646C71']]
export const GLAZINGS: [Glazing, string][] = [['modest', 'Modest'], ['generous', 'Generous'], ['full', 'Floor to ceiling']]
export const SPECS: [Spec, string][] = [['standard', 'Standard'], ['high', 'High'], ['premium', 'Premium']]

const RATE = { new: 2400, extension: 2900 }                      // pounds per square metre, before choices
const K_SPEC: Record<Spec, number> = { standard: 1, high: 1.25, premium: 1.6 }
const K_CLAD: Record<Cladding, number> = { brick: 1, render: 0.97, timber: 1.05, zinc: 1.12 }
const K_GLAZE: Record<Glazing, number> = { modest: 1, generous: 1.06, full: 1.14 }
const K_ROOF: Record<Roof, number> = { flat: 1, gable: 1.03, hip: 1.06, mono: 1.02 }

/** Keep a design inside the limits for its type (switching type can leave sizes out of range). */
export function clamp(d: Design): Design {
  const l = LIMITS[d.type], c = (v: number, [a, b]: readonly [number, number]) => Math.min(b, Math.max(a, v))
  return { ...d, width: c(d.width, l.width), depth: c(d.depth, l.depth), storeys: c(d.storeys, l.storeys) }
}

export const label = <T extends string>(list: readonly (readonly [T, string, ...string[]])[], k: T) => list.find((x) => x[0] === k)![1]

export function price(d: Design) {
  const area = Math.round(d.width * d.depth * d.storeys)
  const perM2 = RATE[d.type] * K_SPEC[d.spec] * K_CLAD[d.cladding] * K_GLAZE[d.glazing] * K_ROOF[d.roof]
  const build = area * perM2
  const buildLow = tidy(build * 0.88), buildHigh = tidy(build * 1.12)
  // Fee: a percentage of the build budget that falls as jobs get bigger, with a floor for small jobs.
  const pct = build < 150_000 ? 0.12 : build < 400_000 ? 0.1 : build < 800_000 ? 0.085 : 0.075
  const fee = Math.max(6500, build * pct)
  const stages: [string, number][] = [
    ['Feasibility and concept design', 0.15], ['Planning application', 0.2], ['Technical design', 0.35], ['Tender and site stage', 0.3],
  ]
  const lines = stages.map(([name, share]) => [name, tidy(fee * share)] as [string, number])
  return { area, perM2: tidy(perM2), buildLow, buildHigh, feePct: pct, lines, fee: lines.reduce((t, l) => t + l[1], 0) }
}

export function summary(d: Design) {
  const size = `${d.width} m wide by ${d.depth} m deep, ${d.storeys === 1 ? 'one storey' : d.storeys === 2 ? 'two storeys' : 'three storeys'}`
  const what = d.type === 'new' ? 'New build home' : `${d.side === 'rear' ? 'Rear' : 'Side'} extension`
  return { what, size }
}
