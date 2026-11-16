import type { Situation } from "@/lib/situations";

const KIND = { code: "Code", ai: "AI", person: "Person" } as const;

// A to B for one situation: today's steps by hand, then what we would build, with each step marked code, AI or person.
export function Flow({ s }: { s: Situation }) {
  return (
    <div className="flow reveal">
      <div className="lane a">
        <h3><b className="pin">A</b>Today, by hand</h3>
        <ol>{s.before.map((t) => <li key={t}>{t}</li>)}</ol>
      </div>
      <div className="lane b">
        <h3><b className="pin lime">B</b>What we would build</h3>
        <ol>{s.after.map(([k, t]) => <li key={t}><span>{t}</span><span className={`tag ${k}`}>{KIND[k]}</span></li>)}</ol>
      </div>
      <p className="flow-test"><b>An example line from the written pass test</b>{s.test}</p>
    </div>
  );
}
