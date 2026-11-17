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
export function Finale({ where, title = "Let\u2019s talk.", mark, children }: { where: string; title?: string; mark?: string; children?: React.ReactNode }) {
  return (
    <section className="frame dark finale">
      <div className="wrap">
        <h2 className="end-h reveal">{title}{mark && <> <mark>{mark}</mark></>}</h2>
        {children && <p className="end-p reveal">{children}</p>}
        <div className="end-cta reveal">
          <TrackLink where={where} href="/start" className="group big-cta">
            Book a call
            <span aria-hidden className="chip">→</span>
          </TrackLink>
          <p>Or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        </div>
      </div>
    </section>
  );
}
