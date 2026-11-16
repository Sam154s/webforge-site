// Fig. 1: a line schematic of a combination boiler, drawn as a service manual plate. Numbered balloons with a key,
// flow and return told apart by line style, and the component the fault code points to picked out in the signal colour.
import { COMPONENT, type Component } from '@/lib/sandbox/plumber'
import { Balloon, Defs, LineKey, Plate, SYMBOL } from './symbols'

// Reading order for the key, and where each symbol sits, where its leader lands and where its balloon goes.
const ORDER: Component[] = ['fan', 'hex', 'electrode', 'vessel', 'gasvalve', 'ntc', 'sensor', 'condensate', 'pump', 'diverter', 'prv']
const AT: Record<Component, { x: number; y: number; tx: number; ty: number; bx: number; by: number }> = {
  fan: { x: 180, y: 82, tx: 197, ty: 82, bx: 326, by: 82 },
  hex: { x: 180, y: 142, tx: 237, ty: 128, bx: 326, by: 120 },
  electrode: { x: 232, y: 162, tx: 254, ty: 152, bx: 326, by: 156 },
  vessel: { x: 94, y: 160, tx: 82, ty: 160, bx: 34, by: 160 },
  gasvalve: { x: 180, y: 232, tx: 167, ty: 230, bx: 34, by: 226 },
  ntc: { x: 136, y: 258, tx: 129, ty: 258, bx: 34, by: 258 },
  sensor: { x: 277, y: 214, tx: 284, ty: 214, bx: 326, by: 206 },
  condensate: { x: 212, y: 244, tx: 224, ty: 240, bx: 326, by: 234 },
  pump: { x: 260, y: 266, tx: 274, ty: 266, bx: 326, by: 266 },
  diverter: { x: 136, y: 296, tx: 128, ty: 298, bx: 34, by: 300 },
  prv: { x: 278, y: 340, tx: 286, ty: 338, bx: 326, by: 332 },
}

export default function Schematic({ hot, also = [], display, title, sheet }: { hot: Component; also?: Component[]; display: string; title: string; sheet: string }) {
  const state = (k: Component) => (k === hot ? 'hot' : also.includes(k) ? 'also' : undefined)
  return (
    <Plate fig="Fig. 1" title="Boiler schematic" sheet="Not to scale"
      under={<>
        <ol className="tw-key">
          {ORDER.map((k, i) => <li key={k} className={state(k) ?? ''}><span className="n">{i + 1}</span><span>{COMPONENT[k]}{k === hot ? <em>Fault</em> : also.includes(k) ? <em>Also checked</em> : null}</span></li>)}
        </ol>
        <LineKey items={[['flow', 'Heating flow'], ['ret', 'Heating return'], ['gas', 'Gas'], ['water', 'Tap water']]} />
      </>}
      tb={[['Drawing', sheet], ['Title', title], ['Display', display || 'No code'], ['Date', '16 Nov 2026'], ['Rev', 'A']]}>
      <svg className="tw-svg" viewBox="0 0 360 420" role="img" aria-label={`Boiler schematic with ${ORDER.length} numbered parts. Part ${ORDER.indexOf(hot) + 1}, ${COMPONENT[hot]}, is marked as the likely fault.`}>
        <Defs />
        {/* casing and flue */}
        <rect x="70" y="44" width="220" height="328" rx="4" className="hv" />
        <path d="M164 44 V26 H196 V44 M172 44 V30 H188 V44" className="th" />
        <path d="M180 44 V66 M180 98 V110" className="th" />
        {/* gas, behind the plate heat exchanger */}
        <path d="M180 396 V239 M180 215 V174" className="gas" />
        {/* heating flow: solid */}
        <path d="M136 174 V286 M136 306 V336 H100 V396 M146 296 H158" className="flow draw" pathLength={1} />
        {/* heating return: dashed */}
        <path d="M260 396 V279 M260 253 V196 H224 V174 M214 318 H260" className="ret" />
        {/* tap water through the plate heat exchanger */}
        <path d="M220 396 V340 H200 V326 M172 326 V350 H140 V396" className="water" />
        {/* small bore: vessel, sensor, relief valve discharge, condensate drain */}
        <path d="M94 200 V208 H136 M260 214 H270 M260 340 H270 M284 346 V382 M222 248 H240 V382 M212 174 V236" className="th" />
        <path d="M136 226 l-4 -8 h8 Z M260 306 l-4 8 h8 Z" className="ink" />
        {/* plate heat exchanger: drawn for context */}
        <rect x="158" y="282" width="56" height="44" className="fill" />{[291, 300, 309, 318].map((y) => <path key={y} d={`M158 ${y} H214`} className="th" />)}
        {/* the display, as the customer sees it */}
        <rect x="82" y="54" width="48" height="22" rx="2" className="screen" /><text x="106" y="70" className="code">{display || '··'}</text>
        {/* pipe tails */}
        {[[100, 'Flow'], [140, 'Hot'], [180, 'Gas'], [220, 'Cold'], [260, 'Return']].map(([x, t]) => <text key={t} x={x} y="410" textAnchor="middle" className="tiny">{t}</text>)}

        {ORDER.map((k) => <g key={k}>{SYMBOL[k]({ x: AT[k].x, y: AT[k].y, cls: k === hot ? 'hot' : '' })}</g>)}

        {/* balloons and leaders */}
        <g className="pop">
          {ORDER.map((k, i) => {
            const a = AT[k], s = state(k), left = a.bx < 180
            return <g key={k}><path className={`lead ${s ?? ''}`} d={`M${a.tx} ${a.ty} L${a.bx + (left ? 9 : -9)} ${a.by}`} /><circle cx={a.tx} cy={a.ty} r="1.4" className="ink" /><Balloon x={a.bx} y={a.by} n={i + 1} state={s} /></g>
          })}
        </g>
      </svg>
    </Plate>
  )
}
