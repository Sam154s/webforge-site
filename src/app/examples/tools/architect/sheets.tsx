'use client'
// The numbered sheet set the customer receives: a cover and SK01 to SK06, each with a title block.
// Model views are renders of the customer's own design; plans and diagrams are drawn by code from the same data.
import { useState } from 'react'
import { LEVELS, outline, type Areas, type CostPlan, type Design } from '@/lib/sandbox/architect-model'
import { GUIDE_LINE, type Planning, type Row } from '@/lib/sandbox/architect-rules'
import type { Shots } from './view3d'
import { AreasPanel, Chip, CostPanel, ProgrammePanel, SunPath } from './panels'
import { blockName } from './composer'

function FloorPlan({ design, level }: { design: Design; level: number }) {
  const house = design.blocks.filter((b) => b.role !== 'garden' && b.role !== 'garage')
  const x0 = Math.min(...house.map((b) => b.x)), x1 = Math.max(...house.map((b) => b.x + b.w)), z0 = Math.min(...house.map((b) => b.z)), z1 = Math.max(...house.map((b) => b.z + b.d))
  const here = house.filter((b) => (level < 0 ? b.basement : level < b.storeys))
  const walls = outline({ ...design, blocks: house }, level), L = LEVELS.find((l) => l.level === level)!
  const pad = 3.2, vb = `${x0 - pad} ${z0 - pad} ${x1 - x0 + pad * 2} ${z1 - z0 + pad * 2}`
  return (
    <figure className="hf-fp">
      <svg viewBox={vb} role="img" aria-label={`${L.name} plan`}>
        <rect className="ghost" x={x0} y={z0} width={x1 - x0} height={z1 - z0} />
        {here.map((b) => <rect key={b.id} className={b.role === 'existing' ? 'zone was' : 'zone'} x={b.x} y={b.z} width={b.w} height={b.d} />)}
        {walls.map((s, i) => <path key={i} className={s.fresh ? 'wall' : 'wall was'} d={`M${s.x1} ${s.z1}L${s.x2} ${s.z2}`} />)}
        {here.map((b) => <g key={b.id}><text className="nm" x={b.x + b.w / 2} y={b.z + b.d / 2 - 0.1} textAnchor="middle">{blockName(b, design)}</text><text className="ar" x={b.x + b.w / 2} y={b.z + b.d / 2 + 0.8} textAnchor="middle">{b.w.toFixed(1)} x {b.d.toFixed(1)} m</text></g>)}
        <path className="dim" d={`M${x0} ${z0 - 1.5}H${x1}M${x0} ${z0 - 1.9}v.8M${x1} ${z0 - 1.9}v.8M${x0 - 1.5} ${z0}V${z1}M${x0 - 1.9} ${z0}h.8M${x0 - 1.9} ${z1}h.8`} />
        <text x={(x0 + x1) / 2} y={z0 - 1.9} textAnchor="middle">{(x1 - x0).toFixed(1)} m</text>
        <text x={x0 - 1.9} y={(z0 + z1) / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 1.9} ${(z0 + z1) / 2})`}>{(z1 - z0).toFixed(1)} m</text>
        <path className="bar" d={`M${x1 - 5} ${z1 + 2}h5`} /><text x={x1 - 2.5} y={z1 + 1.6} textAnchor="middle">5 m</text>
      </svg>
      <figcaption><b>{L.code}</b> {L.name}</figcaption>
    </figure>
  )
}

function Fig({ shot, n, scale, className }: { shot: { src: string; label: string }; n: string; scale?: string; className?: string }) {
  return <figure className={className}><img src={shot.src} alt={shot.label} /><figcaption><b>{n}</b> {shot.label}{scale ? `, ${scale}` : ''}</figcaption></figure>
}

export default function SheetSet({ design, shots, a, c, p, prog, project, job }: {
  design: Design; shots: Shots; a: Areas; c: CostPlan; p: Planning; prog: { rows: Row[]; weeks: number; months: number }; project: string; job: string
}) {
  const [at, setAt] = useState(0)
  const sheets: { no: string; title: string; scale: string; body: React.ReactNode }[] = [
    { no: 'SK00', title: 'Cover', scale: 'Not to scale', body: (
      <div className="hf-cover"><img src={shots.evening.src} alt="Evening view of your design" />
        <div className="over"><span>{job}</span><h3>{project}</h3><p>Concept design set, for discussion</p></div></div>
    ) },
    { no: 'SK01', title: 'Concept model and site plan', scale: '1:200', body: (
      <div className="hf-sk two-one"><Fig shot={shots.hero} n="01" className="main" /><Fig shot={shots.plan} n="02" scale="1:200. Site boundary in red" /></div>
    ) },
    { no: 'SK02', title: 'Floor plans', scale: '1:100', body: (
      <div className="hf-sk plans">{a.levels.map((l) => <FloorPlan key={l.code} design={design} level={l.level} />)}</div>
    ) },
    { no: 'SK03', title: 'Elevations', scale: '1:100', body: (
      <div className="hf-sk grid2">{shots.elevations.map((s, i) => <Fig key={s.label} shot={s} n={`0${i + 1}`} scale="1:100" />)}</div>
    ) },
    { no: 'SK04', title: 'Section and exploded axonometric', scale: '1:100', body: (
      <div className="hf-sk stack2"><Fig shot={shots.section} n="01" scale="1:100. Cut walls and floors in solid ink" /><Fig shot={shots.exploded} n="02" scale="level by level" /></div>
    ) },
    { no: 'SK05', title: 'Sun study', scale: '1:500', body: (
      <div className="hf-sk sun"><div className="nine">{shots.sun.map((s) => <figure key={s.label}><img src={s.src} alt={`Shadows, ${s.label}`} /><figcaption>{s.label}</figcaption></figure>)}</div>
        <div className="side"><SunPath day={172} hour={12} /><p className="hf-guide">Shadows from real sun angles for southern England, with the back garden facing {({ N: 'north', E: 'east', S: 'south', W: 'west' })[design.facing]}.</p></div></div>
    ) },
    { no: 'SK06', title: 'Areas, planning guide, cost plan and programme', scale: 'Schedules', body: (
      <div className="hf-sk sched">
        <section><h4>Area schedule</h4><AreasPanel design={design} a={a} /></section>
        <section><h4>Cost plan by element</h4><CostPanel c={c} compact /></section>
        <section><h4>Planning guide: {p.route.name.toLowerCase()}</h4>
          <ul className="hf-mini">{p.checks.map((x) => <li key={x.id}><span>{x.name}</span><span>{x.value}</span><Chip status={x.status} /></li>)}</ul>
          <p className="hf-guide">{GUIDE_LINE}</p></section>
        <section><h4>Programme</h4><ProgrammePanel {...prog} /></section>
      </div>
    ) },
  ]
  return (
    <div className="hf-sheetset">
      <div className="hf-sheet-tabs" role="group" aria-label="Sheets">
        {sheets.map((s, i) => <button key={s.no} type="button" className="small" aria-pressed={at === i} onClick={() => setAt(i)}>{s.no}</button>)}
        <button type="button" className="small ghost" onClick={() => window.print()}>Print the set</button>
      </div>
      {sheets.map((s, i) => (
        <article key={s.no} className={`hf-sheet${i === at ? '' : ' off'}`} aria-label={`${s.no} ${s.title}`}>
          <div className="hf-sheet-body">{s.body}</div>
          <div className="hf-tb">
            <div className="wide"><span>Practice</span><b>Harlow &amp; Finch Architects</b></div>
            <div className="wide"><span>Project</span><b>{project}</b></div>
            <div className="wide"><span>Drawing</span><b>{s.title}</b></div>
            <div><span>Number</span><b>{job}-{s.no}</b></div>
            <div><span>Scale</span><b>{s.scale}</b></div>
            <div><span>Status</span><b>Concept</b></div>
            <div><span>Rev</span><b>A</b></div>
          </div>
        </article>
      ))}
      <div className="hf-sheet-nav">
        <button type="button" className="small" disabled={at === 0} onClick={() => setAt(at - 1)}>Previous sheet</button>
        <span className="small">{sheets[at].no} · {sheets[at].title} · sheet {at + 1} of {sheets.length}</span>
        <button type="button" className="small" disabled={at === sheets.length - 1} onClick={() => setAt(at + 1)}>Next sheet</button>
      </div>
    </div>
  )
}
