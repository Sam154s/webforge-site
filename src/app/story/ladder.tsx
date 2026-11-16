import { LADDER } from "@/lib/offer";

// The four steps, with the price, what you get and the terms on each. Always shown on the dark sheet.
export function Ladder() {
  return (
    <ol className="path">
      {LADDER.map((r, i) => (
        <li key={r.key} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
          <span className="path-no">Step {i + 1} of {LADDER.length}</span>
          <b className={r.price === "Free" ? "free" : ""}>{r.price}<small>{r.unit}</small></b>
          <h3>{r.name}</h3>
          <p>{r.gets}</p>
          <p className="terms">{r.terms}</p>
        </li>
      ))}
    </ol>
  );
}
