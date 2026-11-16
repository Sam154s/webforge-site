import { EMAIL } from "@/lib/site";
import { TrackLink } from "./track-link";

// Shared pieces for the inner pages, in the same drawing-sheet look as the homepage.
export function Hero({ kicker, title, sub, lede, children }: { kicker: string; title: string; sub?: string; lede?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="sub-hero">
      <div className="wrap">
        <p className="slate"><span>{kicker}</span></p>
        <h1 className="h1">{title}{sub && <span>{sub}</span>}</h1>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </div>
    </section>
  );
}

// Contact at the bottom of every page.
export function Finale({ where, title = "Thirty minutes.", mark = "A straight answer.", children }: { where: string; title?: string; mark?: string; children?: React.ReactNode }) {
  return (
    <section className="frame dark finale">
      <span aria-hidden className="ghost ghost-b">B</span>
      <div className="wrap">
        <h2 className="end-h reveal">{title} <mark>{mark}</mark></h2>
        <p className="end-p reveal">{children ?? "Tell us what is slow. We will say whether it is something we fix, what the next step is, and what it costs. If it is not a fit, we will say so."}</p>
        <div className="end-cta reveal">
          <TrackLink where={where} href="/start" className="group big-cta">
            Book an intro call
            <span aria-hidden className="chip">→</span>
          </TrackLink>
          <p>Or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        </div>
      </div>
    </section>
  );
}
