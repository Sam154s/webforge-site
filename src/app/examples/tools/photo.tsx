'use client'
// A photo the customer can pin. Either one of the drawn sample scenes or the customer's own photo, which is read
// in the browser and never uploaded anywhere. Shared by the building company and plumber demos.
import { useRef } from 'react'
import type { Pin } from '@/lib/sandbox/builder'

// Sample images are measured line drawings, ink on paper, in the same hand as the plans the tools produce.
const bars = (x: number, y: number, w: number, h: number, n = 1) => (
  <>
    <rect className="g" x={x} y={y} width={w} height={h} />
    {Array.from({ length: n }, (_, i) => <path key={i} className="h" d={`M${x + ((i + 1) * w) / (n + 1)} ${y} v${h}`} />)}
    <path className="h" d={`M${x} ${y + h / 2} h${w}`} />
  </>
)
const S: Record<string, React.ReactNode> = {
  house: (
    <>
      <rect className="f" x="262" y="34" width="20" height="40" />
      <polygon className="f" points="64,92 200,30 336,92" />
      <rect className="f" x="80" y="92" width="240" height="158" />
      {Array.from({ length: 11 }, (_, i) => <path key={i} className="h" d={`M84 ${104 + i * 13} h232`} />)}
      {bars(102, 108, 50, 46)}{bars(175, 108, 50, 46)}{bars(248, 108, 50, 46)}
      {bars(102, 178, 88, 72, 2)}
      <rect className="f" x="212" y="184" width="36" height="66" /><rect className="g" x="219" y="192" width="22" height="24" /><circle cx="242" cy="222" r="1.6" />
      {bars(266, 184, 40, 38)}
      <path d="M314 92 v158" />
      <path className="k" d="M8 250 h384" />
      {Array.from({ length: 24 }, (_, i) => <path key={i} className="h" d={`M${14 + i * 16} 258 l-7 9`} />)}
      <rect className="f" x="8" y="198" width="72" height="52" />{Array.from({ length: 8 }, (_, i) => <path key={i} className="h" d={`M${16 + i * 8} 198 v52`} />)}
      <rect className="f" x="320" y="198" width="72" height="52" />{Array.from({ length: 8 }, (_, i) => <path key={i} className="h" d={`M${328 + i * 8} 198 v52`} />)}
      <rect className="f" x="338" y="272" width="20" height="13" /><path className="h" d="M338 272 l20 13 M358 272 l-20 13" />
      <text x="12" y="20">Rear of the house, as it is now</text>
    </>
  ),
  kitchen: (
    <>
      <path className="h" d="M10 34 h380" />
      {Array.from({ length: 4 }, (_, i) => <path key={i} className="h" d={`M30 ${132 + i * 12} h240`} />)}
      {Array.from({ length: 11 }, (_, i) => <path key={i} className="h" d={`M${42 + i * 22} 122 v48`} />)}
      <rect className="f" x="30" y="58" width="240" height="64" />{[90, 150, 210].map((x) => <path key={x} d={`M${x} 58 v64`} />)}
      {[82, 98, 142, 158, 202, 218].map((x) => <path key={x} className="h" d={`M${x} 104 v10`} />)}
      {bars(294, 54, 80, 84)}
      <rect className="f" x="30" y="178" width="350" height="74" />{[90, 150, 250, 310].map((x) => <path key={x} d={`M${x} 178 v74`} />)}
      <rect className="f" x="150" y="178" width="100" height="74" /><rect className="g" x="162" y="196" width="76" height="40" /><path className="h" d="M162 188 h76" />
      {[170, 196, 222].map((x) => <path key={x} className="h" d={`M${x - 8} 166 h16`} />)}
      <rect className="f k" x="26" y="170" width="358" height="8" />
      <path d="M330 170 v-24 q0 -8 -10 -8 h-8" /><path className="h" d="M300 178 v22 h58 v-22" />
      <rect className="f" x="56" y="140" width="15" height="11" /><rect className="f" x="116" y="140" width="15" height="11" />
      <path className="h" d="M30 252 v8 h350 v-8" />
      <path className="k" d="M8 260 h384" />
      <text x="12" y="20">Kitchen wall, as it is now</text>
    </>
  ),
  bathroom: (
    <>
      {Array.from({ length: 9 }, (_, i) => <path key={i} className="h" d={`M${20 + i * 45} 34 v228`} />)}
      {Array.from({ length: 5 }, (_, i) => <path key={i} className="h" d={`M10 ${72 + i * 38} h380`} />)}
      <path d="M44 196 v-104 q0 -8 8 -8 h20" /><path className="k" d="M66 84 h18" /><path className="h" d="M70 90 l-3 10 M76 90 v10 M82 90 l3 10" />
      <rect className="f" x="22" y="194" width="176" height="66" rx="7" /><path className="h" d="M30 204 h160" /><path d="M172 194 v-10 h10" />
      <rect className="f" x="236" y="72" width="50" height="58" /><path className="h" d="M244 118 l14 -34 M256 122 l12 -30" />
      <rect className="f" x="230" y="150" width="62" height="16" rx="5" /><rect className="f" x="253" y="166" width="16" height="94" /><path d="M261 150 v-12 h8" />
      <rect className="f" x="318" y="146" width="54" height="42" rx="3" /><circle cx="345" cy="158" r="2" />
      <path className="f" d="M322 204 q0 26 23 26 q23 0 23 -26 z" /><rect className="f" x="334" y="230" width="22" height="30" />
      {bars(318, 46, 54, 62)}
      <path className="k" d="M8 260 h384" />
      <text x="12" y="20">Bathroom wall, as it is now</text>
    </>
  ),
}

export function Photo({ scene, src, pins, onPin }: { scene: string; src?: string | null; pins: Pin[]; onPin?: (x: number, y: number) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const click = (e: React.MouseEvent) => {
    if (!onPin || !box.current) return
    const r = box.current.getBoundingClientRect()
    onPin(Math.min(0.97, Math.max(0.03, (e.clientX - r.left) / r.width)), Math.min(0.97, Math.max(0.03, (e.clientY - r.top) / r.height)))
  }
  return (
    <div className={`photo${onPin ? '' : ' static'}`} ref={box} onClick={click}>
      {src ? <img src={src} alt="The customer's photo" /> : <svg viewBox="0 0 400 300" role="img" aria-label="Sample drawing">{S[scene] ?? S.house}</svg>}
      {pins.map((p, i) => <span key={i} className="pin" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>{i + 1}</span>)}
    </div>
  )
}

export function PhotoPicker({ onFile, own }: { onFile: (url: string | null) => void; own: boolean }) {
  return (
    <div className="row small" style={{ gap: 12 }}>
      <label className="btn small" style={{ opacity: 1, cursor: 'pointer' }}>
        Use your own photo
        <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(URL.createObjectURL(f)) }} />
      </label>
      {own ? <button type="button" className="small ghost" onClick={() => onFile(null)}>Back to the sample</button> : <span className="muted">Sample drawing shown. Your own photo stays in this browser.</span>}
    </div>
  )
}

export function PinList({ pins, onRemove }: { pins: Pin[]; onRemove?: (i: number) => void }) {
  if (!pins.length) return null
  return (
    <ol className="pin-list">
      {pins.map((p, i) => <li key={i}><span className="n">{i + 1}</span><span>{p.label}</span>{onRemove ? <button type="button" onClick={() => onRemove(i)} aria-label={`Remove pin ${i + 1}`}>remove</button> : null}</li>)}
    </ol>
  )
}
