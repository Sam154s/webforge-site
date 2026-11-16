import { LADDER } from "@/lib/offer";

// The one line each step keeps on the homepage. The full description and terms are on the pricing page.
const SHORT: Record<string, string> = {
  call: "A straight answer on whether we can help.",
  sprint: "A ranked list, one thing working, a fixed quote.",
  build: "Half on signature, half when it passes the written test.",
  embedded: "A named engineer on your ranked list.",
};

// The four steps, always on the dark sheet. Compact: name, price and one line. Full: what you get, and the terms.
export function Ladder({ compact }: { compact?: boolean }) {
  return (
    <ol className={`path ${compact ? "compact" : ""}`}>
      {LADDER.map((r, i) => (
        <li key={r.key} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
          <span className="path-no">{compact ? i + 1 : `Step ${i + 1} of ${LADDER.length}`}</span>
          <b className={r.price === "Free" ? "free" : ""}>{r.price}<small>{r.unit}</small></b>
          <h3>{r.name}</h3>
          <p>{compact ? SHORT[r.key] : r.gets}</p>
          {!compact && <p className="terms">{r.terms}</p>}
        </li>
      ))}
    </ol>
  );
}
