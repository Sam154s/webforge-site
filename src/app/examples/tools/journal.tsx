// The journey journal: one flowing list of steps, each marked code or person, with the AI option where one exists
// and whatever the step produced (an email, a diary entry, a quote) shown under it.
// No hooks, so the same component serves the live demos (client) and the leave-behind page (server).
import { LEVER, counts, type Artefact, type Lever, type Step } from '@/lib/sandbox/journey'

export type Filter = 'all' | 'code' | 'person' | 'ai'

export function Art({ a }: { a: Artefact }) {
  if (a.type === 'email') return (
    <div className="art email">
      <div className="art-kind"><span>Email</span><span>simulated, nothing is sent</span></div>
      <dl><dt>To</dt><dd>{a.to}</dd><dt>From</dt><dd>{a.from}</dd></dl>
      <p className="subject">{a.subject}</p>
      <div className="body">{a.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      {a.attach?.length ? <div className="attach">{a.attach.map((x) => <span key={x}>{x}</span>)}</div> : null}
    </div>
  )
  if (a.type === 'text') return (
    <div className="art sms">
      <div className="art-kind"><span>Text to {a.to}</span><span>simulated</span></div>
      <p className="bubble">{a.body}</p>
    </div>
  )
  if (a.type === 'calendar') return (
    <div className="art cal">
      <div className="art-kind"><span>Diary entry</span><span>simulated</span></div>
      <span className="day">{a.when.split(',')[0]}</span>
      <div><p className="subject">{a.title}</p><p className="muted">{a.when} · {a.who}</p>{a.note ? <p className="muted">{a.note}</p> : null}</div>
    </div>
  )
  if (a.type === 'quote') return (
    <div className="art quote">
      <div className="art-kind"><span>{a.title}</span><span>from the firm&rsquo;s own rates</span></div>
      <table><tbody>
        {a.lines.map(([k, v]) => <tr key={k}><td>{k}</td><td className="n">{v}</td></tr>)}
        <tr className="total"><td>{a.total[0]}</td><td className="n">{a.total[1]}</td></tr>
      </tbody></table>
      {a.note ? <p className="muted">{a.note}</p> : null}
    </div>
  )
  return (
    <div className="art doc">
      <div className="art-kind"><span>{a.title}</span><span>built by code</span></div>
      {a.images?.length ? <div className="imgs">{a.images.map((im) => <figure key={im.label}><img src={im.src} alt={im.label} /><figcaption>{im.label}</figcaption></figure>)}</div> : null}
      <dl>{a.rows.map(([k, v]) => <FragmentRow key={k} k={k} v={v} />)}</dl>
      {a.note ? <p className="muted">{a.note}</p> : null}
    </div>
  )
}
const FragmentRow = ({ k, v }: { k: string; v: string }) => <><dt>{k}</dt><dd>{v}</dd></>

export function Counts({ steps }: { steps: Step[] }) {
  const c = counts(steps)
  return (
    <p className="small muted">
      <strong style={{ color: 'var(--ink)' }}>{c.total} steps.</strong> {c.code} run as code, {c.person} {c.person === 1 ? 'needs' : 'need'} a person, {c.ai} could add AI.
    </p>
  )
}

export function LeverSummary({ steps }: { steps: Step[] }) {
  const by = (l: Lever) => steps.filter((s) => s.lever === l).length
  const max = Math.max(1, ...(['cost', 'customers', 'ticket'] as Lever[]).map(by))
  return (
    <div className="j-sum">
      <p className="kicker">What this journey is for</p>
      {(['cost', 'customers', 'ticket'] as Lever[]).map((l) => (
        <div className="lv" key={l}>
          <strong>{LEVER[l].name}</strong>
          <div className="bullet"><div className="fill" style={{ width: `${(by(l) / max) * 100}%` }} /></div>
          <span className="muted num">{by(l)} steps</span>
        </div>
      ))}
    </div>
  )
}

export default function Journal({ steps, upto = Infinity, artefacts = {}, filter = 'all', live = false, done = false }: {
  steps: Step[]; upto?: number; artefacts?: Record<string, Artefact | Artefact[] | undefined>; filter?: Filter; live?: boolean; done?: boolean
}) {
  const shown = steps.filter((s) => s.stage <= upto)
  const lastStage = shown.length ? shown[shown.length - 1].stage : 0
  if (!shown.length) return <p className="j-empty">Nothing has run yet. Use the customer&rsquo;s screen and each step appears here as it fires.</p>
  let delay = 0
  return (
    <>
      <ol className="jr">
        {shown.map((s, i) => {
          const fresh = live && s.stage === lastStage
          const d = fresh ? delay++ * 280 : 0
          const match = filter === 'all' || (filter === 'ai' ? !!s.ai : s.kind === filter)
          const arts = artefacts[s.id]
          return (
            <li key={s.id} className={`jstep${s.kind === 'person' ? ' person' : ''}${live && i === shown.length - 1 ? ' latest' : ''}${match ? '' : ' dim'}`}
              style={live ? { animationDelay: `${d}ms` } : { animation: 'none' }}>
              <span className="jwhen">{s.when}</span>
              <span className="jmark" aria-hidden />
              <div className="jbody">
                <p className="jtitle"><span>{s.title}</span></p>
                <div className="jtags">
                  <span className={`jk ${s.kind}`}>{s.kind === 'code' ? 'Code' : 'Person'}</span>
                  {s.ai ? <span className="jk ai">AI option</span> : null}
                  <span className="jk">{LEVER[s.lever].name}</span>
                </div>
                <p>{s.detail}</p>
                {s.ai ? <p className="jai"><b>AI option.</b> {s.ai} {live ? 'Runs as code here.' : 'Built as code unless you ask for it.'}</p> : null}
                {arts ? (Array.isArray(arts) ? arts : [arts]).map((a, k) => <Art key={k} a={a} />) : null}
              </div>
            </li>
          )
        })}
      </ol>
      {done ? <LeverSummary steps={steps} /> : null}
    </>
  )
}
