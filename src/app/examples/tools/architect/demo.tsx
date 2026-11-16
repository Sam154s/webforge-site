'use client'
import { useMemo, useRef, useState } from 'react'
import { ARCHITECT_STEPS, FIRMS, gbp, range, type Artefact } from '@/lib/sandbox/journey'
import { CLADDINGS, GLAZINGS, ROOFS, SPECS, label } from '@/lib/sandbox/architect'
import { FEATURES, PRESETS, SIZE, areas, canRemove, costPlan, featureDelta, featureState, fee as feeOf, fix, patchBlock, preset, removeBlock, start, summary, toggleFeature, type Design, type FeatureKey } from '@/lib/sandbox/architect-model'
import { GUIDE_LINE, STATUS, planning, programme } from '@/lib/sandbox/architect-rules'
import Stage, { FirmHead } from '../stage'
import View3D, { type Look, type Mode, type Shots, type ViewHandle, type ViewName } from './view3d'
import Composer, { blockName } from './composer'
import { AreasPanel, Auto, CostPanel, PlanningPanel, ProgrammePanel, SunPanel } from './panels'
import SheetSet from './sheets'
import './architect.css'

const firm = FIRMS.architect
const SLOTS = ['Tuesday, 10:00', 'Wednesday, 14:30', 'Friday, 09:00']
const first = firm.customer.split(' ')[0], surname = firm.customer.split(' ')[1], owner = firm.owner.split(' ')[0]
const JOB = 'HF-0412'
const VIEWS: [ViewName, string][] = [['axo', '3D'], ['front', 'Front'], ['rear', 'Rear'], ['right', 'Side'], ['plan', 'Plan']]
const MODES: [Mode, string][] = [['model', 'Model'], ['blueprint', 'Blueprint'], ['evening', 'Evening']]
type Insight = 'planning' | 'sun' | 'areas' | 'cost' | 'programme'
const signed = (n: number) => (n < 0 ? '-' : '+') + gbp(Math.abs(n))

function Seg<K extends string>({ name, value, options, onPick }: { name: string; value: K; options: readonly (readonly [K, string, ...string[]])[]; onPick: (k: K) => void }) {
  return (
    <div className="ctl"><span className="top-line"><span>{name}</span></span>
      <div className="seg" role="group" aria-label={name}>
        {options.map(([k, text, sw]) => (
          <button key={k} type="button" aria-pressed={value === k} onClick={() => onPick(k)}>
            {sw ? <span className="sw" style={{ background: sw }} aria-hidden /> : null}{text}
          </button>
        ))}
      </div>
    </div>
  )
}
function Step({ name, value, unit, min, max, step, onChange }: { name: string; value: number; unit: string; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return (
    <div className="hf-step"><span>{name}</span>
      <button type="button" aria-label={`${name}: less`} disabled={value <= min} onClick={() => onChange(value - step)}>-</button>
      <b>{unit ? value.toFixed(1) : value}{unit}</b>
      <button type="button" aria-label={`${name}: more`} disabled={value >= max} onClick={() => onChange(value + step)}>+</button>
    </div>
  )
}

export default function ArchitectDemo() {
  const [stage, setStage] = useState(0)
  const [d, setD] = useState<Design>(() => start('new'))
  const [sel, setSel] = useState<string | null>(null)
  const [tab, setTab] = useState<'shape' | 'features' | 'finish'>('shape')
  const [insight, setInsight] = useState<Insight>('cost')
  const [view, setView] = useState<ViewName>('axo')
  const [mode, setMode] = useState<Mode>('model')
  const [section, setSection] = useState<number | null>(null)
  const [explode, setExplode] = useState(0)
  const [sun, setSun] = useState({ day: 172, hour: 14.5 })
  const [last, setLast] = useState<{ why: string; build: number; fee: number } | null>(null)
  const [saves, setSaves] = useState(0)
  const [assemble, setAssemble] = useState(0)
  const [shots, setShots] = useState<Shots | null>(null)
  const [slot, setSlot] = useState('')
  const view3d = useRef<ViewHandle>(null)

  const m = useMemo(() => {
    const c = costPlan(d), p = planning(d)
    return { a: areas(d), c, f: feeOf(c.build), p, prog: programme(d, c.build), s: summary(d) }
  }, [d])
  const { a, c, f, p, prog, s } = m
  const tray = useMemo(() => FEATURES.map((ft) => ({ ...ft, state: featureState(d, ft.key, sel ?? undefined), delta: featureDelta(d, ft.key, sel ?? undefined) })), [d, sel])
  const look: Look = useMemo(() => ({ view, mode, section, explode, day: sun.day, hour: sun.hour, marks: p.marks, selected: sel }), [view, mode, section, explode, sun, p, sel])

  const change = (next: Design, why: string, select?: string | null) => {
    if (next === d) return
    const nb = costPlan(next).build
    if (nb !== c.build) setLast({ why, build: Math.round((nb - c.build) / 100) * 100, fee: feeOf(nb).total - f.total })
    setD(next); setSaves((n) => n + 1)
    if (select !== undefined) setSel(select)
  }
  const block = d.blocks.find((b) => b.id === sel) ?? null
  const patch = (pt: Parameters<typeof patchBlock>[2], why: string) => { if (block) change(patchBlock(d, block.id, pt), why) }
  const feature = (key: FeatureKey, name: string) => {
    const was = featureState(d, key, sel ?? undefined).on
    const [next, id] = toggleFeature(d, key, sel ?? undefined)
    change(next, `${name} ${was ? 'removed' : 'added'}`, id ?? null)
  }
  const pick = (key: string) => { change(preset(d, key), 'New shape', null); setAssemble((n) => n + 1) }
  const begin = (type: Design['type']) => { setD(start(type)); setSel(null); setLast(null); setInsight(type === 'new' ? 'cost' : 'planning') }

  const restart = () => { setStage(0); begin('new'); setShots(null); setSlot(''); setView('axo'); setMode('model'); setSection(null); setExplode(0); setSaves(0); setTab('shape') }
  const send = () => { setShots(view3d.current?.shots() ?? null); setStage(3) }
  const project = `${surname} residence, ${d.type === 'new' ? 'new home' : 'extension'}`
  const flags = p.checks.filter((x) => x.status !== 'ok')
  const when = slot || SLOTS[0]

  const proposal: Artefact = {
    type: 'quote', title: 'Fee proposal', lines: f.lines.map(([k, v]) => [k, gbp(v)]), total: ['Architect fee, before VAT', gbp(f.total)],
    note: `${Math.round(f.pct * 1000) / 10}% fee band on an indicative build budget of ${range(c.low, c.high)}. Programme about ${prog.months} months from brief to keys.`,
  }
  const artefacts: Record<string, Artefact | Artefact[]> = {
    a1: { type: 'doc', title: 'Enquiry record', rows: [['Name', firm.customer], ['Project', d.type === 'new' ? 'A new home' : 'An extension'], ['Source', 'Website form'], ['Logged as', `${JOB}, practice enquiry list`]] },
    a2: { type: 'email', to: firm.customer, from: firm.name, subject: 'Your design link from Harlow & Finch', attach: ['Open the 3D designer'],
      body: [`Hello ${first},`, 'Thank you for getting in touch. Before we speak, have a go at shaping what you have in mind. It takes about five minutes and there are no wrong answers.', 'When you send it over, you will get a set of drawings to keep and we will get the same set.'] },
    a3: { type: 'doc', title: 'Live design record', rows: [['Shape', s.shape], ['New floor area', `${s.area} m²`], ['Features', s.extrasLine], ['Finish', `${label(CLADDINGS, d.cladding)}, ${label(GLAZINGS, d.glazing).toLowerCase()} glazing, ${label(SPECS, d.spec).toLowerCase()} finish`], ['Build budget', range(c.low, c.high)], ['Saved', `${saves} ${saves === 1 ? 'change' : 'changes'} so far, each one saved`]],
      note: 'The practice sees this record update while the customer is still designing.' },
    a4: { type: 'doc', title: 'Sheet set, 7 sheets', images: shots ? [shots.hero, shots.plan, shots.section] : undefined,
      rows: [['SK00', 'Cover, evening view'], ['SK01', 'Concept model and site plan'], ['SK02', 'Floor plans'], ['SK03', 'Elevations'], ['SK04', 'Section and exploded axonometric'], ['SK05', 'Sun study'], ['SK06', 'Areas, planning guide, cost plan and programme']] },
    a5: { type: 'doc', title: 'Planning guide', rows: [['Likely route', p.route.name], ...p.checks.filter((x) => x.id !== 'route').map((x) => [x.name, `${x.value}. ${STATUS[x.status]}`] as [string, string])], note: GUIDE_LINE },
    a6: [
      { type: 'doc', title: 'Area schedule', rows: [...a.levels.map((l) => [`${l.code} ${l.name}`, `${Math.round(l.added)} m² new${l.existing ? `, ${Math.round(l.existing)} m² existing` : ''}`] as [string, string]), ['Footprint', `${Math.round(a.footprint)} m², ${Math.round(a.coverage * 100)}% of the plot`], ['External wall', `${Math.round(a.wall)} m²`], ['Roof', `${Math.round(a.roofSurface)} m²`]] },
      { type: 'quote', title: 'Cost plan by element', lines: [...c.elements, ...c.features].map((l) => [l.name, gbp(l.cost)]), total: ['Build budget with site costs and contingency', range(c.low, c.high)], note: `About ${gbp(c.perM2)} per m². ${c.vat}` },
    ],
    a7: proposal,
    a8: [
      { type: 'email', to: firm.customer, from: firm.name, subject: 'Your design set and fee proposal', attach: ['Sheet set SK00 to SK06 (PDF)', 'Fee proposal (PDF)'],
        body: [`Hello ${first},`, `Here is the design you put together: ${s.what.toLowerCase()}, ${s.shape}, about ${s.area} m² of new floor.`, `On our guide the planning route is: ${p.route.name.toLowerCase()}. Your fee proposal is attached. Pick a time on the page for a call with ${owner} and we will talk it through.`] },
      { type: 'email', to: `${firm.owner}, ${firm.short}`, from: 'Design tool', subject: `New brief: ${firm.customer}, ${s.what.toLowerCase()}, ${s.area} m²`, attach: ['Sheet set (PDF)', 'One page brief'],
        body: [`${s.what}. ${s.shape}. Features: ${s.extrasLine}.`, `Planning route on the guide: ${p.route.name.toLowerCase()}. ${flags.length ? `Flags: ${flags.filter((x) => x.id !== 'route').map((x) => x.name.toLowerCase()).join(', ') || 'none'}.` : 'No flags.'}`, `Fee proposal sent at ${gbp(f.total)}. Build budget ${range(c.low, c.high)}.`] },
    ],
    a9: { type: 'doc', title: `Free slots in ${owner}'s diary`, rows: SLOTS.map((t, i) => [`Slot ${i + 1}`, t] as [string, string]), note: 'Read from the diary at the moment of sending, so no slot is offered twice.' },
    a10: { type: 'calendar', title: `Design call: ${firm.customer}`, when, who: `${firm.owner} and ${firm.customer}`, note: 'Sheet set and one page brief attached to the invite.' },
    a11: { type: 'text', to: firm.customer, body: `Hello ${first}, a reminder of your design call with ${owner} at Harlow & Finch tomorrow, ${when.split(', ')[1]}. Reply here if you need to move it.` },
    a12: { type: 'doc', title: `Call brief for ${owner}`, rows: [['Project', `${s.what}, ${s.area} m² new`], ['Planning route', p.route.name], ['Talk about', flags.filter((x) => x.id !== 'route').slice(0, 3).map((x) => x.name).join(', ') || 'Nothing flagged'], ['Biggest costs', [...c.elements, ...c.features].sort((x, y) => y.cost - x.cost).slice(0, 2).map((l) => `${l.name} ${gbp(l.cost)}`).join(', ')], ['Ask', 'Budget ceiling, move-in date, who else decides']], note: 'Built by code from the design. It is on the invite before the call.' },
    a13: { type: 'email', to: firm.customer, from: firm.name, subject: 'Your design and proposal', attach: ['Sheet set (PDF)'],
      body: [`Hello ${first},`, 'It was good to talk through your design. The proposal is still open on your page whenever you are ready.', `If anything in it needs changing, reply to this and ${owner} will pick it up.`] },
    a14: { type: 'email', to: firm.customer, from: firm.name, subject: 'Shall we keep your design on file?', attach: ['Sheet set (PDF)'],
      body: [`Hello ${first},`, 'A last note from us. Your drawings and proposal stay on your page for another month.', 'If now is not the time, no reply is needed and we will not chase again.'] },
    a15: { type: 'doc', title: 'Appointment accepted', rows: [['Accepted', 'Online, by the customer'], ['Fee agreed', `${gbp(f.total)} before VAT`], ['Design', `${JOB}, revision A`]] },
    a16: { type: 'doc', title: 'Project opened', rows: [['Project file', `${JOB} ${project}, sheet set inside`], ['First invoice', `${gbp(f.lines[0][1])} for ${f.lines[0][0].toLowerCase()}`], ['Measured survey', 'Requested, three dates offered'], ['Programme', `${prog.weeks} weeks, about ${prog.months} months`]] },
  }

  const tool = (on: boolean, name: string, toggle: () => void) => <button type="button" className="small" aria-pressed={on} onClick={toggle}>{name}</button>

  return (
    <Stage firm={firm} steps={ARCHITECT_STEPS} stage={stage} artefacts={artefacts} onRestart={restart} next={{ href: '/examples/builder', label: 'Next: building company' }}>
      <FirmHead firm={firm} right={stage >= 2 ? `${JOB} ${project}` : 'Start a project'} />

      {stage === 0 && (
        <>
          <h2>Thinking about building?</h2>
          <p className="lede">Tell us what you have in mind and we will send you a design tool straight away, so you can try your ideas before we speak.</p>
          <div className="hf-kinds" role="group" aria-label="What are you planning?">
            <button type="button" aria-pressed={d.type === 'new'} onClick={() => begin('new')}>
              <svg viewBox="0 0 64 40" aria-hidden><path d="M6 34H58M12 34V18L26 8L40 18V34M40 22H52V34M20 34V26H27V34" /></svg>
              <b>A new home</b><span>Shape it from blocks, storey by storey.</span></button>
            <button type="button" aria-pressed={d.type === 'extension'} onClick={() => begin('extension')}>
              <svg viewBox="0 0 64 40" aria-hidden><path d="M6 34H58M12 34V16L24 8L36 16V34" /><path className="new" d="M36 22H54V34H36M40 34V27H46V34" /></svg>
              <b>An extension</b><span>See what fits without a planning application.</span></button>
          </div>
          <div><button className="primary" type="button" onClick={() => setStage(1)}>Send my enquiry</button></div>
        </>
      )}

      {stage === 1 && (
        <div className="done-card">
          <h2>Thank you, {first}.</h2>
          <p className="lede">Your design link is in your inbox already. You can also open it from here.</p>
          <Auto>Your enquiry was logged and your own designer link was emailed the moment you pressed send.</Auto>
          <button className="primary" type="button" onClick={() => { setStage(2); setAssemble((n) => n + 1) }}>Open the 3D designer</button>
        </div>
      )}

      {stage === 2 && (
        <>
          <div className="hf-intro">
            <p className="lede">Pick a shape, drag the blocks on the plan, add what you want. Every figure keeps up with you.</p>
            <Auto>Saved as you go{saves ? `, ${saves} ${saves === 1 ? 'change' : 'changes'}` : ''}. {firm.short} can see this design live.</Auto>
          </div>

          <div className="hf-board" data-mode={mode}>
            <div className="hf-bar">
              <div className="hf-segs" role="group" aria-label="View">{VIEWS.map(([v, name]) => <button key={v} type="button" aria-pressed={view === v} onClick={() => { setView(v); if (v !== 'axo') setExplode(0); if (v === 'plan') setSection(null) }}>{name}</button>)}</div>
              <div className="hf-segs" role="group" aria-label="Presentation">{MODES.map(([k, name]) => <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)}>{name}</button>)}</div>
            </div>
            <View3D ref={view3d} design={d} look={look} assemble={assemble}>
              <div className="hf-stamp" aria-hidden><b>{project}</b><span>{view === 'axo' ? 'Concept model' : view === 'plan' ? 'Site plan, 1:200' : `${VIEWS.find((v) => v[0] === view)![1]} elevation, 1:100`}{section !== null ? ', section' : ''}{explode ? ', exploded' : ''}</span></div>
              <span className="hf-hint">{view === 'axo' ? 'Drag to turn. Scroll or pinch to zoom.' : view === 'plan' ? 'To scale. Site boundary in red.' : 'True elevation, to scale.'}</span>
            </View3D>
            <div className="hf-tools">
              <div className="hf-tool-btns" role="group" aria-label="Drawing tools">
                {tool(section !== null, 'Section cut', () => { setSection(section === null ? 0.3 : null); setExplode(0); if (view === 'plan') setView('axo') })}
                {tool(explode > 0, 'Exploded view', () => { setExplode(explode ? 0 : 1); setSection(null); setView('axo') })}
                {tool(insight === 'sun', 'Sun study', () => setInsight(insight === 'sun' ? 'cost' : 'sun'))}
              </div>
              {section !== null ? <label className="hf-slide"><span>{d.type === 'new' ? 'Cut position, road to garden' : 'Cut position, garden to road'}</span><input type="range" min={0.02} max={0.98} step={0.01} value={section} onChange={(e) => setSection(+e.target.value)} /></label> : null}
              {explode > 0 ? <label className="hf-slide"><span>Pull the levels apart</span><input type="range" min={0.05} max={1} step={0.01} value={explode} onChange={(e) => setExplode(+e.target.value)} /></label> : null}
            </div>
          </div>

          <div className="hf-work">
            <div className="hf-left">
              <div className="ctl"><span className="top-line"><span>1. Start from a shape</span></span>
                <div className="seg hf-presets" role="group" aria-label="Shape presets">
                  {PRESETS[d.type].map((ps) => <button key={ps.key} type="button" aria-pressed={JSON.stringify(ps.blocks) === JSON.stringify(d.blocks)} onClick={() => pick(ps.key)}>
                    <svg viewBox="-9 -11 18 18" aria-hidden>{ps.blocks.map((b) => <rect key={b.id} className={b.role} x={b.x} y={b.z} width={b.w} height={b.d} />)}</svg>{ps.name}</button>)}
                </div>
              </div>
              <span className="top-line hf-num"><span>2. Drag the blocks</span></span>
              <Composer design={d} selected={sel} onSelect={(id) => { setSel(id); if (id) setTab('shape') }} onChange={change} />
            </div>

            <div className="hf-right">
              <div className="hf-tabs" role="group" aria-label="Design options">
                {([['shape', 'Block'], ['features', 'Features'], ['finish', 'Finish']] as const).map(([k, name]) => <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>{name}{k === 'features' && s.extras.length ? <i>{s.extras.length}</i> : null}</button>)}
              </div>

              {tab === 'shape' && (block ? (
                <div className="hf-insp">
                  <h3>{blockName(block, d)}</h3>
                  {block.role === 'existing' ? <p className="small">The house as it stands, 8.0 m by 7.0 m, two storeys. It stays put: shape the new work around it.</p> : (
                    <>
                      <Step name="Width" unit=" m" value={block.w} min={SIZE.min} max={SIZE.max} step={0.5} onChange={(w) => patch({ w }, 'Resized')} />
                      <Step name="Depth" unit=" m" value={block.d} min={SIZE.min} max={SIZE.max} step={0.5} onChange={(dp) => patch({ d: dp }, 'Resized')} />
                      {block.role === 'main' || block.role === 'wing' ? <Step name="Storeys" unit="" value={block.storeys} min={1} max={SIZE.storeys} step={1} onChange={(n) => patch({ storeys: n }, n > block.storeys ? 'Storey added' : 'Storey removed')} /> : null}
                      <Seg name="Roof" value={block.roof} options={ROOFS} onPick={(roof) => patch({ roof }, 'Roof changed')} />
                      {block.role === 'main' || block.role === 'wing' ? <label className="check"><input type="checkbox" checked={block.basement} onChange={(e) => patch({ basement: e.target.checked }, e.target.checked ? 'Basement added' : 'Basement removed')} /> Basement under this block</label> : null}
                      {d.features.filter((x) => x.block === block.id).length ? <p className="small">On this block: {d.features.filter((x) => x.block === block.id).map((x) => FEATURES.find((ft) => ft.key === x.key)!.name.toLowerCase()).join(', ')}.</p> : null}
                      <button type="button" className="small" disabled={!canRemove(d, block.id)} onClick={() => change(removeBlock(d, block.id), `${blockName(block, d)} removed`, null)}>Remove this block</button>
                    </>
                  )}
                </div>
              ) : <p className="hf-empty">Tap a block on the plan to change its size, storeys and roof. Drag it to move it. Drag a new wing in from the tray under the plan.</p>)}

              {tab === 'features' && (
                <div className="hf-feats" role="group" aria-label="Features">
                  <p className="small">3. Add features. {block && block.role !== 'existing' ? `They go on ${blockName(block, d).toLowerCase()} where they fit.` : 'Select a block first to choose where they go.'}</p>
                  {tray.map((ft) => (
                    <button key={ft.key} type="button" aria-pressed={ft.state.on} disabled={!ft.state.on && !ft.delta} onClick={() => feature(ft.key, ft.name)} title={ft.blurb}>
                      <span className="nm">{ft.name}{ft.state.count > 1 || (ft.state.count === 1 && !ft.state.on) ? <i>{ft.state.count}</i> : null}</span>
                      <span className="pr">{ft.delta ? `${ft.state.on ? 'Added' : 'Adds'} ${gbp(ft.delta.build)}` : ft.state.why}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'finish' && (
                <div className="hf-insp">
                  <Seg name="Cladding" value={d.cladding} options={CLADDINGS} onPick={(cladding) => change(fix({ ...d, cladding }), 'Cladding changed')} />
                  <Seg name="Glazing" value={d.glazing} options={GLAZINGS} onPick={(glazing) => change(fix({ ...d, glazing }), 'Glazing changed')} />
                  <Seg name="Finish level" value={d.spec} options={SPECS} onPick={(spec) => change(fix({ ...d, spec }), 'Finish level changed')} />
                </div>
              )}
            </div>
          </div>

          <div className="hf-insight">
            <div className="hf-tabs wide" role="group" aria-label="Read-outs">
              {([['planning', d.type === 'new' ? 'Planning guide' : 'Permitted development'], ['cost', 'Cost plan'], ['areas', 'Areas'], ['sun', 'Sun study'], ['programme', 'Programme']] as [Insight, string][]).map(([k, name]) => (
                <button key={k} type="button" aria-pressed={insight === k} onClick={() => setInsight(k)}>{name}{k === 'planning' && p.flags ? <i className="flag">{p.flags}</i> : null}</button>
              ))}
            </div>
            {insight === 'planning' && <><Auto>Checked against the guide every time a wall moves.</Auto><PlanningPanel design={d} p={p} set={(pt) => change(fix({ ...d, ...pt }), 'Planning details changed')} /></>}
            {insight === 'cost' && <><Auto>Priced from the practice rate card on every change.</Auto><CostPanel c={c} /></>}
            {insight === 'areas' && <><Auto>Measured from the model, level by level.</Auto><AreasPanel design={d} a={a} /></>}
            {insight === 'sun' && <SunPanel design={d} day={sun.day} hour={sun.hour} setSun={(day, hour) => setSun({ day, hour })} setFacing={(facing) => change(fix({ ...d, facing }), 'Garden direction changed')} />}
            {insight === 'programme' && <><Auto>Programme and stage fees follow the design and its planning route.</Auto><ProgrammePanel {...prog} /></>}
          </div>

          <div className="tool-foot hf-foot">
            <div className="tool-figs">
              <div><b>{s.area} m²</b><span className="small muted">new floor area</span></div>
              <div><b>{range(c.low, c.high)}</b><span className="small muted">indicative build budget</span></div>
              <div><b>{gbp(f.total)}</b><span className="small muted">architect fee</span></div>
            </div>
            {last ? <p className="hf-last" aria-live="polite"><b>{last.why}</b> {signed(last.build)} build, {signed(last.fee)} fee</p> : null}
            <button className="primary" type="button" onClick={send}>Send my design to {firm.short}</button>
          </div>
        </>
      )}

      {stage >= 3 && (
        <div className="done-card hf-done">
          <h2>{stage === 3 ? 'Your design is with us.' : stage === 4 ? 'Your call is booked.' : 'A week later.'}</h2>
          <p className="lede">
            {stage === 3 ? `Your drawings and a fee proposal of ${gbp(f.total)} are in your inbox. Pick a time to talk it through with ${owner}.`
              : stage === 4 ? `${slot}. The invite is in your diary with your drawings attached.`
                : 'The call happened, the follow-ups went out on their own, and the proposal was accepted on the page.'}
          </p>
          {stage === 3 && (
            <ul className="hf-did">
              <li><i aria-hidden />Seven sheets drawn from your model</li>
              <li><i aria-hidden />Planning guide run: {p.route.name.toLowerCase()}</li>
              <li><i aria-hidden />Area schedule and cost plan built</li>
              <li><i aria-hidden />Fee proposal priced from the rate card</li>
              <li><i aria-hidden />Sent to you and to {owner}</li>
              <li><i aria-hidden />Call times read from {owner}&rsquo;s diary</li>
            </ul>
          )}
          {stage === 3 && (
            <div className="hf-book">
              <div className="slots" role="group" aria-label="Call times">{SLOTS.map((t) => <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)}>{t}</button>)}</div>
              <button className="primary" type="button" disabled={!slot} onClick={() => setStage(4)}>Book this call</button>
            </div>
          )}
          {stage === 4 && <><Auto>The call went into both diaries with your drawings attached. A reminder text is set for the day before.</Auto><button className="primary" type="button" onClick={() => setStage(5)}>Fast forward a week</button></>}
          {stage === 5 && <Auto>Reminder, two follow-ups, acceptance and the project file all ran without anyone at the practice lifting a finger.</Auto>}
          {shots ? <SheetSet design={d} shots={shots} a={a} c={c} p={p} prog={prog} project={project} job={JOB} /> : null}
          <dl className="hf-facts fee">
            {f.lines.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{gbp(v)}</dd></div>)}
            <div className="tot"><dt>Architect fee, before VAT</dt><dd>{gbp(f.total)}</dd></div>
          </dl>
          {stage === 5 && <button type="button" onClick={restart}>Start again</button>}
        </div>
      )}
    </Stage>
  )
}
