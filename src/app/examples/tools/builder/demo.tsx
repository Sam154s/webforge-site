'use client'
// The Bramley Build Co. walk-through: enquiry, room planner, job pack, site visit, follow-up.
// One Scene is the source of truth. The planner edits it; the pack, the prices and every journal artefact derive from it.
import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { FIRMS, gbp, type Artefact } from '@/lib/sandbox/journey'
import { BUILDER_STAGES, BUILDER_STEPS } from '@/lib/sandbox/steps/builder'
import { JOBS, SCHEMES, SLOT, TEMPLATES, check, def, fromTemplate, mat, options, quote, slotsFor, takeoff, type Finish, type Job, type Pin, type Scene } from '@/lib/sandbox/builder'
import { SHEETS, STATUS, billOfQuantities, jobNo, payments, programme, regs } from '@/lib/sandbox/builder-pack'
import Stage, { FirmHead } from '../stage'
import { Photo, PhotoPicker, PinList } from '../photo'
import { PlanArt, fit } from './draw'
import Planner, { Auto, Count, type SetScene } from './planner'
import Pack from './pack'
import './builder.css'

const firm = { ...FIRMS.builder, stages: BUILDER_STAGES, url: 'bramleybuild.example/plan', line: 'The customer plans the room. A priced, drawn and checked job pack comes out.' }
const first = firm.customer.split(' ')[0], rob = firm.owner.split(' ')[0]
const SLOTS = ['Monday, 08:30', 'Tuesday, 16:00', 'Thursday, 12:00']
const fmt = (v: number) => Math.round(v).toLocaleString('en-GB')

function Thumb({ job }: { job: Job }) {
  const uid = useId().replace(/:/g, ''), s = useMemo(() => fromTemplate(job), [job]), v = fit(s, 220, job === 'extension' ? 26 : 12)
  return <svg className="bb-svg bb-thumb" viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} style={{ ['--u' as string]: v.u }} aria-hidden><PlanArt s={s} u={v.u} uid={uid} dims={false} labels={false} /></svg>
}

export default function BuilderDemo() {
  const [stage, setStage] = useState(0)
  const [scene, setScene] = useState<Scene>(() => fromTemplate('kitchen'))
  const [past, setPast] = useState<Scene[]>([])
  const [chosen, setChosen] = useState<Finish>('better')
  const [pins, setPins] = useState<Pin[]>([])
  const [pinLabel, setPinLabel] = useState(JOBS.kitchen.pins[0])
  const [photo, setPhoto] = useState<string | null>(null)
  const [slot, setSlot] = useState('')
  const live = useRef(scene); live.current = scene

  const set: SetScene = useCallback((next, o) => {
    if (o?.from) setPast((p) => [...p.slice(-40), o.from!]); else if (!o?.silent) setPast((p) => [...p.slice(-40), live.current])
    setScene(next)
  }, [])
  const undo = () => setPast((p) => { if (p.length) setScene(p[p.length - 1]); return p.slice(0, -1) })
  const pickJob = (job: Job) => { setScene(fromTemplate(job)); setPast([]); setPins([]); setPinLabel(JOBS[job].pins[0]); setPhoto(null); setChosen('better') }
  const pickLayout = (key: string) => set(fromTemplate(scene.job, key))
  const restart = () => { setStage(0); pickJob('kitchen'); setSlot('') }

  const j = JOBS[scene.job]
  const opts = useMemo(() => options(scene), [scene])
  const o = opts.find((x) => x.key === chosen)!
  const liveQuote = opts[1]
  const q = useMemo(() => takeoff(scene), [scene])
  const notes = useMemo(() => check(scene), [scene])
  const prog = useMemo(() => programme(o.scene), [o])
  const pays = useMemo(() => payments(o.total, prog), [o, prog])
  const flags = useMemo(() => regs(o.scene), [o])
  const template = TEMPLATES[scene.job].find((t) => t.key === scene.layout)!
  const size = `${fmt(scene.length)} by ${fmt(scene.width)} mm`
  const counts = [...scene.items.reduce((m, p) => m.set(def(p.kind).tag, (m.get(def(p.kind).tag) ?? 0) + 1), new Map<string, number>())].map(([k, n]) => (n > 1 ? `${k} x ${n}` : k)).join(', ')
  const finishes = slotsFor(scene).map((sl) => `${SLOT[sl].ref} ${mat(scene.mats[sl]).name}`).join(', ')
  const toCheck = flags.filter((f) => f.status !== 'clear')

  const artefacts: Record<string, Artefact | Artefact[]> = {
    b1: { type: 'doc', title: 'Job board card', rows: [['Job', `${jobNo(scene.job)}, ${j.name.toLowerCase()}`], ['Customer', `${firm.customer}, BS7`], ['Source', 'Website, plan your room'], ['Status', 'Planner link sent, waiting for a plan']] },
    b2: [
      { type: 'email', to: firm.customer, from: firm.name, subject: `Your ${j.name.toLowerCase()}: plan it and price it`, attach: ['Open your planner'],
        body: [`Hello ${first},`, 'Thanks for getting in touch. Your planner is ready. It opens with a furnished layout, so move things about until it looks like the room you want.', 'Ten minutes and you will have drawings, quantities and three prices, before anyone has to visit.'] },
      { type: 'text', to: firm.customer, body: `Bramley Build: your ${j.name.toLowerCase()} planner is ready. bramleybuild.example/plan` },
    ],
    b3: { type: 'doc', title: 'Planner set up', rows: [['Fittings list', `${j.palette.length} ${j.name.toLowerCase()} items, real sizes`], ['Price book', `${j.name}, three ranges`], ['Starting layout', `${template.name}: ${template.line.toLowerCase()}`], ['Scheme', SCHEMES.find((x) => x.key === scene.scheme)!.name], ['Design rules', 'Checked on every move']] },
    b4: { type: 'doc', title: 'Plan, as saved', rows: [['Room', `${size}, ${q.area.toFixed(1)} m²`], ['On the plan', counts], ['Finishes', finishes], ['Design notes', notes.length ? notes.map((w, i) => `${i + 1}. ${w.text}`).join(' ') : 'None. Passes every rule.'], ['Running price', `${gbp(liveQuote.total)} including VAT`], ...(pins.length || photo ? [['Photo', `${photo ? 'Customer photo' : 'Sample drawing'} with ${pins.length} ${pins.length === 1 ? 'note' : 'notes'}`] as [string, string]] : [])],
      note: 'Saved as data: sizes in millimetres, every item and finish by reference.' },
    b5: { type: 'doc', title: 'Drawing register', rows: SHEETS.map((s) => [s.no, `${s.title}${s.scale === 'None' ? '' : `, ${s.scale.toLowerCase()}`}`] as [string, string]), note: `${SHEETS.length} sheets, each with a title block, drawn from the plan.` },
    b6: { type: 'doc', title: 'Bill of quantities', rows: billOfQuantities(o.scene).map((r) => [`${r.ref} ${r.item}`, `${r.net}, order ${r.order}`] as [string, string]), note: 'Measured off the plan. Waste allowances from the price book.' },
    b7: { type: 'quote', title: `${o.name} option, ${o.lines.length + o.extras.length} lines`,
      lines: opts.map((x) => [`${x.name}: ${x.diffs[1] ?? x.diffs[0]}`, gbp(x.total)] as [string, string]),
      total: [`Chosen: ${o.name.toLowerCase()}, including VAT`, gbp(o.total)], note: `About ${prog.weeks} weeks on site. Confirmed after the site visit.` },
    b8: { type: 'doc', title: 'Regulations and planning check', rows: flags.map((f) => [f.title, `${STATUS[f.status]}. ${f.who}.`] as [string, string]), note: `${flags.length} checks, ${toCheck.length} for ${rob} to follow up. A guide: confirmed on the site visit.` },
    b9: [
      { type: 'email', to: firm.customer, from: firm.name, subject: 'Your job pack: drawings, quantities and three prices', attach: ['Job pack, 9 sheets (PDF)'],
        body: [`Hello ${first},`, `Your pack is ready. The three options run from ${gbp(opts[0].total)} to ${gbp(opts[2].total)} including VAT, and the pack shows exactly what changes between them.`, `Pick a time for ${rob} to come and measure up. He confirms the figure on the day.`] },
      { type: 'email', to: `${firm.owner}, ${firm.short}`, from: 'Room planner', subject: `New job: ${j.name.toLowerCase()}, ${q.area.toFixed(1)} m², ${firm.customer}`, attach: ['Job pack, 9 sheets (PDF)', 'Plan data', ...(photo ? ['Customer photo'] : [])],
        body: [`${j.name}, ${size}. ${scene.items.length} items on the plan. Leaning towards ${o.name.toLowerCase()} at ${gbp(o.total)}.`, toCheck.length ? `To check on site: ${toCheck.map((f) => f.title.toLowerCase()).join(', ')}.` : 'Nothing flagged to check.', notes.length ? `Design notes: ${notes.map((w) => w.text).join(' ')}` : 'The plan passes every design rule.'] },
    ],
    b10: { type: 'doc', title: 'Free slots, from the diary', rows: SLOTS.map((t, i) => [t, ['Already in BS7 that morning', 'After the Redland job', 'Between two visits nearby'][i]] as [string, string]), note: 'Read from the diary. Grouped by area to save driving.' },
    b11: [
      { type: 'calendar', title: `Site visit: ${firm.customer}, ${j.name.toLowerCase()}`, when: slot || SLOTS[0], who: `${firm.owner} at the customer's address`, note: `Job pack ${jobNo(scene.job)} attached.` },
      { type: 'text', to: firm.customer, body: `Bramley Build: ${rob} is with you ${(slot || SLOTS[0]).replace(',', ' at')} to measure up. He has your plan. Reply C to change.` },
    ],
    b12: { type: 'doc', title: 'Measure-up checklist', rows: [['Check the room', `${size}, ceiling ${fmt(scene.height)} mm`], ...toCheck.slice(0, 4).map((f) => [f.title, f.text] as [string, string]), ['Confirm', `${o.name} option at ${gbp(o.total)}`]], note: 'Written by the pack, ticked off by a person.' },
    b13: { type: 'email', to: firm.customer, from: firm.name, subject: 'Your three options are still open', attach: ['Job pack, 9 sheets (PDF)'],
      body: [`Hello ${first},`, `Good to meet you on site. ${rob} has confirmed the sizes, and your three options are still open on your page.`, 'Reply to this if you want to change anything on the plan.'] },
    b14: { type: 'email', to: firm.customer, from: firm.name, subject: 'Shall we keep your dates?',
      body: [`Hello ${first},`, `We are holding a start date for your ${j.name.toLowerCase()} until Friday. If now is not the time, no problem at all. Your plan stays saved.`] },
    b15: [
      { type: 'quote', title: `Accepted: ${o.name.toLowerCase()} option`, lines: pays.map((p, i) => [`${i + 1}. ${p.name} (${p.when.toLowerCase()})`, gbp(p.amount)] as [string, string]), total: ['Total including VAT', gbp(o.total)], note: 'Deposit invoice sent now. Each later invoice is raised when its milestone is ticked off.' },
      { type: 'calendar', title: `Start on site: ${j.name.toLowerCase()}, ${firm.customer}`, when: 'Monday, week 1', who: `${firm.short} team`, note: `About ${prog.weeks} weeks. Materials ordered from the bill of quantities.` },
    ],
  }

  return (
    <Stage firm={firm} steps={BUILDER_STEPS} stage={stage} artefacts={artefacts} onRestart={restart} next={{ href: '/examples/plumber', label: 'Next: plumber' }}>
      <FirmHead firm={firm} right={stage >= 2 ? `${j.name}, ${jobNo(scene.job)}` : 'Plan your room'} />

      {stage === 0 && (
        <>
          <h2>Plan the room yourself. Get it drawn, checked and priced today.</h2>
          <p className="lede">Pick your job. We start you on a furnished layout, you move things until it is right, and you get a full job pack before anyone has to visit.</p>
          <div className="bb-jobs" role="group" aria-label="What is the job?">
            {(Object.keys(JOBS) as Job[]).map((k) => <button key={k} type="button" aria-pressed={scene.job === k} onClick={() => pickJob(k)}><Thumb job={k} /><b>{JOBS[k].name}</b><span>{JOBS[k].blurb}</span></button>)}
          </div>
          <ol className="bb-steps3">
            <li><b>1 Plan</b>Drag fittings on to a plan of your room, to the millimetre.</li>
            <li><b>2 Choose</b>Pick a scheme, then swap any finish.</li>
            <li><b>3 Pack</b>Drawings, quantities, three prices and a programme.</li>
          </ol>
          <div><button className="primary" type="button" onClick={() => setStage(1)}>Start my {j.name.toLowerCase()} plan</button></div>
        </>
      )}

      {stage === 1 && (
        <div className="done-card">
          <h2>Thanks, {first}. Your planner is ready.</h2>
          <p className="lede">We have sent the link by email and text so you can come back to it. It opens on a furnished {j.name.toLowerCase()} layout, with our fittings and prices already loaded.</p>
          <Auto>Enquiry logged and planner link sent, the moment you pressed the button</Auto>
          <button className="primary" type="button" onClick={() => setStage(2)}>Open my planner</button>
        </div>
      )}

      {stage === 2 && (
        <>
          <Planner scene={scene} set={set} undo={undo} canUndo={past.length > 0} reset={() => set(fromTemplate(scene.job, scene.layout))} pickLayout={pickLayout} />
          <details className="bb-photo">
            <summary>Add a photo of the room <span>optional, it travels with your pack</span></summary>
            <div className="bb-photo-in">
              <div className="stack">
                <Photo scene={j.scene} src={photo} pins={pins} onPin={(x, y) => setPins((p) => [...p, { x, y, label: pinLabel }].slice(0, 8))} />
                <PhotoPicker own={!!photo} onFile={(u) => { setPhoto(u); setPins([]) }} />
              </div>
              <div className="stack">
                <div className="ctl"><span className="top-line"><span>Pick a note, then tap the photo where it applies</span></span>
                  <div className="seg" role="group" aria-label="Note to pin">{j.pins.map((l) => <button key={l} type="button" aria-pressed={pinLabel === l} onClick={() => setPinLabel(l)}>{l}</button>)}</div>
                </div>
                <PinList pins={pins} onRemove={(i) => setPins((p) => p.filter((_, k) => k !== i))} />
              </div>
            </div>
          </details>
          <div className="tool-foot">
            <div className="tool-figs">
              <div><b><Count value={liveQuote.total} /></b><span className="small muted">as drawn, mid range, including VAT</span></div>
              <div className="sm"><b>{q.area.toFixed(1)} m²</b><span className="small muted">{scene.items.length} items placed</span></div>
            </div>
            <div className="bb-foot-r"><Auto>Re-priced from the price book on every move</Auto><button className="primary" type="button" onClick={() => { setChosen('better'); setStage(3) }}>Build my job pack</button></div>
          </div>
        </>
      )}

      {stage >= 3 && (
        <>
          <div className="bb-packhead">
            <h2>{stage === 3 ? 'Your job pack' : stage === 4 ? 'Your site visit is booked.' : 'Two weeks later.'}</h2>
            <p className="lede">{stage === 3 ? `Nine sheets, all worked out from the plan you drew. Turn through them, then pick a time for ${rob} to measure up.` : stage === 4 ? `${slot}. ${rob} has your pack, so he arrives knowing the job.` : `${rob} measured up and confirmed the price. You accepted the ${o.name.toLowerCase()} option and paid the deposit on the page.`}</p>
          </div>
          <Pack scene={scene} opts={opts} chosen={chosen} setChosen={setChosen} locked={stage > 3} photo={photo} pins={pins} />
          {stage === 3 && (
            <div className="bb-book">
              <div><h3>Book {rob} to measure up</h3><p className="small muted">The price is confirmed on the day. Change the plan any time before then.</p></div>
              <div className="slots" role="group" aria-label="Visit times">{SLOTS.map((t) => <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)}>{t}</button>)}</div>
              <div className="bb-foot-r"><Auto>Slots read from {rob}&rsquo;s diary</Auto><button type="button" className="small" onClick={() => setStage(2)}>Back to the planner</button><button className="primary" type="button" disabled={!slot} onClick={() => setStage(4)}>Book the site visit</button></div>
            </div>
          )}
          {stage === 4 && <div className="bb-book"><Auto>Both diaries updated, pack attached, reminder text queued</Auto><div><button className="primary" type="button" onClick={() => setStage(5)}>Fast forward two weeks</button></div></div>}
          {stage === 5 && <div className="bb-book"><Auto>Deposit invoice raised, {pays.length - 1} stage invoices lined up against the programme</Auto><div><button type="button" onClick={restart}>Start again</button></div></div>}
        </>
      )}
    </Stage>
  )
}
