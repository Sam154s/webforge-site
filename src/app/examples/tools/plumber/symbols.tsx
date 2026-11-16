// The Tidewater drawing kit: one set of symbols, balloons, dimension lines and plate furniture shared by the boiler
// schematic, the thermal plan and the pipework diagram, so every drawing reads as a page from the same manual.
// Symbols are drawn round their own centre and placed with x and y. Line weights come from plumber.css (.th .hv).
import type { ReactNode } from 'react'
import type { Component } from '@/lib/sandbox/plumber'

type At = { x: number; y: number; cls?: string; s?: number }
const g = ({ x, y, cls, s }: At, body: ReactNode) => <g className={`sym ${cls ?? ''}`} transform={`translate(${x} ${y})${s ? ` scale(${s})` : ''}`}>{body}</g>

export const Fan = (p: At) => g(p, <><circle r="16" className="fill" /><path d="M0 0 C4 -6 3 -12 0 -15 M0 0 C7 -1 12 3 13 8 M0 0 C-7 -1 -12 3 -13 8" /><circle r="2.5" className="ink" /></>)
export const Hex = (p: At) => g(p, <><rect x="-56" y="-32" width="112" height="64" className="fill" /><path d="M-46 -20 H46 M-46 -10 H46 M-46 0 H46 M-46 10 H46 M-46 20 H46" className="th" /><path d="M46 -20 a5 5 0 0 1 0 10 M-46 -10 a5 5 0 0 0 0 10 M46 0 a5 5 0 0 1 0 10 M-46 10 a5 5 0 0 0 0 10" className="th" /></>)
export const Electrode = (p: At) => g(p, <><path d="M16 -8 L2 -1" /><rect x="14" y="-12" width="8" height="8" className="fill" transform="rotate(-27 18 -8)" /><path d="M0 0 l-6 -2 M0 0 l-5 3 M0 0 l-2 5" className="th" /><circle r="2" className="ink" /></>)
export const Thermistor = (p: At) => g(p, <><circle r="6.5" className="fill" /><text y="3" textAnchor="middle">T</text></>)
export const PressureSensor = (p: At) => g(p, <><circle r="6.5" className="fill" /><text y="3" textAnchor="middle">P</text></>)
export const Valve = (p: At) => g(p, <path d="M-9 -6 L9 6 V-6 L-9 6 Z" className="fill" />)
export const GasValve = (p: At) => g(p, <><path d="M-12 -7 L12 7 V-7 L-12 7 Z" className="fill" /><path d="M0 0 V-9" /><rect x="-7" y="-17" width="14" height="8" className="fill" /><path d="M-4 -13 h8" className="th" /></>)
export const Pump = (p: At) => g(p, <><circle r="13" className="fill" /><path d="M-6 6 L0 -8 L6 6 Z" className="ink" /></>)
export const Diverter = (p: At) => g(p, <><path d="M0 0 L-6 -10 H6 Z M0 0 L-6 10 H6 Z M0 0 L10 -6 V6 Z" className="fill" /><circle r="1.6" className="ink" /></>)
export const Prv = (p: At) => g(p, <><path d="M-8 -6 L0 0 L-8 6 Z M0 0 L-6 8 H6 Z" className="fill" /><path d="M0 0 V-4 l3 -2 l-6 -3 l6 -3 l-6 -3 l3 -2" className="th" /></>)
export const Trap = (p: At) => g(p, <path d="M-10 -8 V2 a5 5 0 0 0 10 0 V-3 a5 5 0 0 1 10 0 V4" />)
export const Vessel = (p: At) => g(p, <><rect x="-11" y="-40" width="22" height="80" rx="11" className="fill" /><path d="M-11 4 q11 -9 22 0" className="th" /><path d="M-5 -22 h10 M0 -27 v10" className="th" /></>)
/** A radiator in elevation: a fluted panel with a valve at each end. */
export const RadFace = (p: At & { w?: number }) => { const w = p.w ?? 40; return g(p, <><rect x={-w / 2} y="-9" width={w} height="18" className="fill" />{Array.from({ length: Math.floor(w / 5) - 1 }, (_, i) => <path key={i} d={`M${-w / 2 + 5 * (i + 1)} -6 v12`} className="th" />)}</>) }
export const Boiler = (p: At) => g(p, <><rect x="-13" y="-18" width="26" height="36" rx="1.5" className="fill" /><path d="M-13 9 h26" className="th" /><circle cy="-4" r="5" className="th" /><path d="M-6 18 v5 M0 18 v5 M6 18 v5" className="th" /></>)
export const Cylinder = (p: At) => g(p, <><path d="M-12 -18 a12 5 0 0 1 24 0 V18 a12 5 0 0 1 -24 0 Z" className="fill" /><path d="M-12 -18 a12 5 0 0 0 24 0" className="th" /><path d="M-7 12 h14 l-14 -5 h14 l-14 -5 h14" className="th" /></>)

export const SYMBOL: Record<Component, (p: At) => ReactNode> = {
  fan: Fan, hex: Hex, electrode: Electrode, ntc: Thermistor, gasvalve: GasValve, pump: Pump, diverter: Diverter, sensor: PressureSensor, prv: Prv, condensate: Trap, vessel: Vessel,
}

export function Balloon({ x, y, n, state }: { x: number; y: number; n: number | string; state?: 'hot' | 'also' }) {
  return <g className={`bal ${state ?? ''}`}><circle cx={x} cy={y} r={state === 'hot' ? 10 : 8.5} /><text x={x} y={y + (state === 'hot' ? 4 : 3.4)}>{n}</text></g>
}

/** A dimension line with slashed ends and its figure, drawn off the object by `off` (negative is above or left). */
export function Dim({ x1, y1, x2, y2, off, label }: { x1: number; y1: number; x2: number; y2: number; off: number; label: string }) {
  const horiz = y1 === y2
  const ax = horiz ? x1 : x1 + off, ay = horiz ? y1 + off : y1, bx = horiz ? x2 : x2 + off, by = horiz ? y2 + off : y2
  const tick = (x: number, y: number) => `M${x - 3} ${y + 3} L${x + 3} ${y - 3}`
  const ext = horiz ? `M${x1} ${y1 + off * 0.3} V${ay + Math.sign(off) * 4} M${x2} ${y2 + off * 0.3} V${by + Math.sign(off) * 4}` : `M${x1 + off * 0.3} ${y1} H${ax + Math.sign(off) * 4} M${x2 + off * 0.3} ${y2} H${bx + Math.sign(off) * 4}`
  const mx = (ax + bx) / 2, my = (ay + by) / 2
  return (
    <g className="dimg">
      <path className="dim" d={`M${ax} ${ay} L${bx} ${by} ${tick(ax, ay)} ${tick(bx, by)} ${ext}`} />
      {horiz ? <text className="dimt" x={mx} y={my - 3.5}>{label}</text> : <text className="dimt" x={mx - 3.5} y={my} transform={`rotate(-90 ${mx - 3.5} ${my})`}>{label}</text>}
    </g>
  )
}

/** Patterns every drawing can use: the fault hatch, the cut-wall hatch. */
export const Defs = () => (
  <defs>
    <pattern id="tw-hot-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#FBF9F4" /><path d="M0 0 V5" stroke="#E4572E" strokeWidth="1.1" /></pattern>
    <pattern id="tw-wall-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#FBF9F4" /><path d="M0 0 V4" stroke="#14171A" strokeWidth=".9" /></pattern>
  </defs>
)

/** The plate: border, header with a figure number, the drawing, then anything under it (a key, a legend) and a title block. */
export function Plate({ fig, title, sheet, night, children, under, tb, className }: {
  fig: string; title: string; sheet?: string; night?: boolean; children: ReactNode; under?: ReactNode; tb?: [string, string][]; className?: string
}) {
  return (
    <figure className={`tw-plate${night ? ' night' : ''}${className ? ` ${className}` : ''}`}>
      <div className="in">
        <figcaption className="tw-plate-head"><b><em>{fig}</em>{title}</b>{sheet ? <span>{sheet}</span> : null}</figcaption>
        <div className="tw-plate-body">{children}</div>
        {under}
        {tb ? <div className="tw-tb">{tb.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div> : null}
      </div>
    </figure>
  )
}

/** Marks a moment where code did something, inside the customer's own screen. */
export const Auto = ({ children }: { children: ReactNode }) => <p className="tw-auto"><i aria-hidden /><span><b>Done automatically.</b> {children}</span></p>

export const LineKey = ({ items }: { items: [string, string][] }) => (
  <div className="tw-legend">
    {items.map(([cls, name]) => <span key={name}><svg viewBox="0 0 30 8" className="tw-svg" aria-hidden><path d="M1 4 H29" className={cls} /></svg>{name}</span>)}
  </div>
)
