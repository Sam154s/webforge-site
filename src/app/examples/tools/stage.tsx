'use client'
// The walk-through shell shared by the three demos: the customer's screen in the example firm's brand on the left,
// the journal on the right. The demo owns its own state and tells the stage which stage it has reached.
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BOTH_LINE, type Artefact, type Firm, type Step } from '@/lib/sandbox/journey'
import Journal, { Counts, type Filter } from './journal'
import './ops-base.css'
import './sandbox.css'

const FILTERS: [Filter, string][] = [['all', 'All'], ['code', 'Code'], ['person', 'Person'], ['ai', 'AI option']]

export function FirmHead({ firm, right }: { firm: Firm; right?: string }) {
  return (
    <div className="firm-head">
      <span className="firm-logo"><i aria-hidden />{firm.name}</span>
      {right ? <span className="small">{right}</span> : null}
    </div>
  )
}

export default function Stage({ firm, steps, stage, artefacts, onRestart, next, children }: {
  firm: Firm; steps: Step[]; stage: number; artefacts: Record<string, Artefact | Artefact[] | undefined>
  onRestart: () => void; next: { href: string; label: string }; children: React.ReactNode
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const box = useRef<HTMLDivElement>(null)
  const last = Math.max(...steps.map((s) => s.stage))

  // Keep the newest step in view inside the journal's own scroll area (on phones the journal is not a scroller).
  useEffect(() => {
    const el = box.current
    if (!el || stage === 0) { el?.scrollTo({ top: 0 }); return }
    if (el.scrollHeight <= el.clientHeight) return
    const first = el.querySelectorAll('.jstep')[steps.filter((s) => s.stage < stage).length] as HTMLElement | undefined
    if (first) el.scrollTo({ top: Math.max(0, first.offsetTop - 120), behavior: 'smooth' })
  }, [stage, steps])

  return (
    <main>
      <header className="page-head">
        <p className="kicker"><Link href="/examples">All three examples</Link> · fictional example firm, nothing is really sent</p>
        <h1>{firm.name}</h1>
        <p className="lede">{firm.line}</p>
        <div className="actions">
          <button className="small" type="button" onClick={onRestart}>Start again</button>
          <Link className="btn small primary" href={next.href}>{next.label} <span className="chip" aria-hidden>→</span></Link>
        </div>
      </header>

      <ol className="stepper" style={{ marginBottom: 32 }}>
        {firm.stages.map((name, i) => (
          <li key={name} className={stage > i + 1 || (stage === last && i + 1 === last) ? 'done' : stage === i + 1 ? 'now' : ''}><span className="kicker">{name}</span></li>
        ))}
      </ol>

      <div className="stage">
        <section className="device" data-firm={firm.key} aria-label="The customer's screen">
          <div className="device-bar"><span className="dots" aria-hidden><i /><i /><i /></span><span className="url">{firm.url}</span><span className="who">Customer&rsquo;s screen</span></div>
          <div className="device-body" key={stage === 0 ? 'start' : 'run'}>{children}</div>
        </section>

        <aside className="journal" ref={box} aria-label="What happens behind the scenes">
          <div className="journal-head">
            <div className="sec-head" style={{ paddingBottom: 0 }}><h2>Behind the scenes</h2><span className="aside">{stage === 0 ? 'waiting' : `stage ${Math.min(stage, last)} of ${last}`}</span></div>
            <Counts steps={steps} />
            <div className="pills" role="group" aria-label="Highlight">
              {FILTERS.map(([k, name]) => <button key={k} type="button" aria-current={filter === k ? 'true' : undefined} onClick={() => setFilter(k)}>{name}</button>)}
            </div>
          </div>
          <Journal steps={steps} upto={stage} artefacts={artefacts} filter={filter} live done={stage >= last} />
          <p className="both small" style={{ marginTop: 24 }}>{BOTH_LINE}</p>
        </aside>
      </div>
      <div className="tool-cta">
        <p><strong>This is not what we sell.</strong> It shows how fast we can get into an unfamiliar business. Yours is next. It starts with a free 30 minute call.</p>
        <Link className="btn primary" href="/start">Book an intro call <span className="chip" aria-hidden>→</span></Link>
      </div>
    </main>
  )
}
