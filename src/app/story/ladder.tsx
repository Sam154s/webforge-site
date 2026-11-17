import Link from "next/link";
import { LADDER } from "@/lib/offer";

// The four steps: what happens, what you get, where you can stop. Used on the homepage (static line and nodes) and on /pricing (static). Compact (homepage) shows the name, price and one line. Full adds the extra terms and the example link.
export function Ladder({ full, compact, heading: H = "h3" }: { full?: boolean; compact?: boolean; heading?: "h2" | "h3" }) {
  return (
    <ol className="sp-list">
      {LADDER.map((r, i) => (
        <li key={r.key}>
          <div className="sp-head">
            <span className="sp-no">Step {i + 1}</span>
            <H>{r.name}.</H>
            <b className={r.price === "Free" ? "sp-price free" : "sp-price"}>{r.price}{r.unit && <small>{r.unit}</small>}</b>
          </div>
          {compact ? <p className="sp-what">{r.line}</p> : (
            <>
              <p className="sp-what">{r.what}</p>
              <p className="sp-get"><span>You get</span>{r.get}</p>
              <p className="sp-stop"><span>Stop here</span>{r.stop}</p>
            </>
          )}
          {full && (r.note || r.link) && (
            <p className="sp-extra">
              {r.note}
              {r.link && <Link href={r.link.href} className="underline underline-offset-4">{r.link.label}</Link>}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
