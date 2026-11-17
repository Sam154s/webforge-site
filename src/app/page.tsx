import { Reveal } from "./reveal";
import { Ladder } from "./story/ladder";
import { Diagram } from "./story/diagram";
import { Cta, TrackLink } from "@/components/track-link";

const FIT = [
  ["Consultants", "Look at the problem, and leave you a report."],
  ["Software companies", "Build, but never see how your work gets done."],
  ["Forward deployed engineers", "Do both, inside your company."],
];

const STEPS = [
  ["Go in.", "We work inside your company, with your team and on your systems."],
  ["Find the symptoms.", "We watch the work and question the people doing it. What\u2019s slow, what gets done twice, what waits on one person."],
  ["Diagnose.", "We work out the real cause and what it costs you, in your own numbers."],
  ["Engineer the solution.", "We build the fix on your systems and stay until it works."],
];

const EXAMPLE = [
  ["Symptom", "The weekly board report takes a team most of a day.", "Every Monday, people copy figures out of four spreadsheets into one, then check the totals by eye. Nobody trusts it until someone has gone through it twice."],
  ["Diagnosis", "Four teams keep the same figures in four separate sheets.", "The report isn\u2019t the slow part. Sales, stock, finance and operations each hold their own copy of the same numbers, so most of the day goes on finding where they disagree."],
  ["Solution", "One source for the figures, and a report that builds itself.", "Code reads the four sheets, matches them, and writes the report. Where two figures disagree, it stops and shows a person, who decides."],
];

export default function Home() {
  return (
    <>
      <Reveal />
      <main className="sb home">
        <section id="top" className="frame hero hero2">
          <div className="wrap">
            <h1 className="h1 big fade">We&rsquo;re forward deployed engineers.</h1>
            <p className="lede fade" style={{ animationDelay: ".2s" }}>We go into your company, find what&rsquo;s holding it back, and engineer the solution.</p>
            <div className="hero-cta fade" style={{ animationDelay: ".4s" }}>
              <Cta where="hero" />
              <TrackLink where="hero-how" href="#how" className="ghost-link">See how it works</TrackLink>
            </div>
          </div>
        </section>

        <section id="fit" className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">Where we fit.</h2>
            <ul className="fit reveal">
              {FIT.map(([name, line], i) => (
                <li key={name} className={i === 2 ? "us" : undefined}>
                  <b>{name}</b>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how" className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">What a forward deployed engineer does.</h2>
            <div className="fde-sheet"><Diagram /></div>
            <ol className="fde-steps">
              {STEPS.map(([name, line], i) => (
                <li key={name} className="reveal">
                  <span className="fde-n" aria-hidden>{i + 1}</span>
                  <h3>{name}</h3>
                  <p>{line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="example" className="frame">
          <div className="wrap">
            <div className="ex reveal">
              <h2 className="ex-tag">An example. Made up, to show the pattern.</h2>
              <ol className="ex-parts">
                {EXAMPLE.map(([label, text, detail]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <p>{text}</p>
                    <p className="ex-d">{detail}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="ex-foot">
              <p className="ex-end reveal">They asked for a faster report. The real problem was four copies of the same numbers.</p>
              <div className="reveal">
                <p className="ex-more">Yours will be different. That&rsquo;s why we look first.</p>
                <p><TrackLink where="home-example" href="/sample-report" className="ghost-link">See the full example.</TrackLink></p>
              </div>
            </div>
          </div>
        </section>

        <section id="ai" className="frame">
          <div className="wrap take">
            <h2 className="h2 reveal">How we use AI.</h2>
            <div className="ai-col reveal">
              <p className="ai-body">We use AI throughout, to study the work and to write the code. What we leave behind is mostly plain code, for two reasons.</p>
              <ul className="ai-pair">
                <li><b><mark>Almost free to run.</mark></b><p>No AI bill every time it does the job.</p></li>
                <li><b><mark>Consistent.</mark></b><p>The same input gives the same answer, every time.</p></li>
              </ul>
              <p className="ai-close">Where a step needs judgement, we use AI there, with a person near the loop to check it.</p>
            </div>
          </div>
        </section>

        <section id="steps" className="frame dark slab">
          <div className="wrap">
            <h2 className="h2">How you hire us.</h2>
            <div className="sp">
              <Ladder compact />
            </div>
            <p className="fine links2">
              <TrackLink where="home-pricing" href="/pricing" className="ghost-link">Full pricing</TrackLink>
              <TrackLink where="home-sample" href="/sample-report" className="ghost-link">See an example diagnosis.</TrackLink>
            </p>
          </div>
        </section>

        <section id="who" className="frame dark finale">
          <div className="wrap">
            <p className="who2 long reveal">Our team has experience across clinical automation systems, large council and government organisations, and AI automation workflows in professional firms.</p>
            <div className="end-cta reveal">
              <TrackLink where="bottom" href="/start" className="group big-cta">
                Book a call
                <span aria-hidden className="chip">→</span>
              </TrackLink>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
