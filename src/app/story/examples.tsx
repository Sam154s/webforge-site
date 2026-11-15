"use client";

import { useState, type ReactNode } from "react";
import { ARCHITECT_STEPS, BUILDER_STEPS, FIRMS, PLUMBER_STEPS, gbp, range, type Firm, type Step } from "@/lib/showcase/journey";
import { LIMITS, SPECS, START, price, type Design, type Spec } from "@/lib/showcase/architect";
import { BOOK, FINISHES, LIMIT, RULE, kitchen, type Finish } from "@/lib/showcase/kitchen";
import { COMPONENT, MAKES, codesFor, diagnose, firstCode, make as findMake, type Component } from "@/lib/showcase/plumber";
import { Journey, Scrub, Seg, Shots, Slider, type Shot } from "./parts";

// Three small working pieces of the tools in the sales sandbox. Each one is plain arithmetic and lookups:
// nothing here calls AI, and the figures match the full tools because they share the same maths files.

const n = (v: number) => v.toLocaleString("en-GB");

function Case({ no, firm, drawing, controls, code, outs, steps, shots, note }: {
  no: string; firm: Firm; drawing: ReactNode; controls: ReactNode; code: ReactNode; outs: ReactNode; steps: Step[]; shots: Shot[]; note: string;
}) {
  return (
    <article className="case reveal">
      <header className="case-head">
        <span className="case-no">{no}</span>
        <div>
          <h3>{firm.name}</h3>
          <p>{firm.line}</p>
        </div>
        <span className="stamp">Example firm, not a client</span>
      </header>
      <div className="case-body">
        <div className="plate">
          <div className="plate-draw">{drawing}</div>
          <div className="plate-ctl">{controls}</div>
        </div>
        <div className="case-side">
          <div className="codep">{code}</div>
          <div className="outs">{outs}</div>
        </div>
      </div>
      <Journey steps={steps} stages={firm.stages} />
      <div className="case-foot">
        <p className="case-note">{note}</p>
        <Shots items={shots} />
      </div>
    </article>
  );
}

const Ln = ({ v, children, out }: { v: string; children: ReactNode; out: ReactNode }) => (
  <div className="ln"><span className="v">{v}</span><span className="ex">= {children}</span><span className="out">{out}</span></div>
);

// ------------------------------------------------------------------------------------------ architect
const S = 14, CX = 0.866, PW = 18, PD = 16, OX = 226, OY = 186;
type Pt = readonly [number, number];
const P = (x: number, y: number, z = 0): Pt => [OX + (x - y) * CX * S, OY + (x + y) * 0.5 * S - z * S];
const poly = (a: Pt[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const seg = (a: Pt, b: Pt) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;

function Massing({ d }: { d: Design }) {
  const w = d.width, dp = d.depth, h = d.storeys * 2.8, rz = h + dp * 0.3;
  const x0 = (PW - w) / 2, x1 = x0 + w, y0 = (PD - dp) / 2, y1 = y0 + dp, ym = (y0 + y1) / 2;
  const bays = Math.max(1, Math.floor(w / 2.6)), bay = w / bays, door = Math.floor(bays / 2);
  const sides = Math.max(1, Math.floor(dp / 3)), sb = dp / sides;
  const front: Pt[][] = [], side: Pt[][] = [];
  for (let s = 0; s < d.storeys; s++) {
    const z = s * 2.8;
    for (let i = 0; i < bays; i++) {
      const c = x0 + (i + 0.5) * bay, isDoor = s === 0 && i === door;
      const [a, b, lo, hi] = isDoor ? [c - 0.5, c + 0.5, 0, 2.1] : [c - 0.6, c + 0.6, z + 0.9, z + 2.3];
      front.push([P(a, y1, lo), P(b, y1, lo), P(b, y1, hi), P(a, y1, hi)]);
    }
    for (let j = 0; j < sides; j++) {
      const c = y0 + (j + 0.5) * sb;
      side.push([P(x1, c - 0.6, z + 0.9), P(x1, c + 0.6, z + 0.9), P(x1, c + 0.6, z + 2.3), P(x1, c - 0.6, z + 2.3)]);
    }
  }
  const wm = P((x0 + x1) / 2, y1 + 1.8), dm = P(x1 + 1.8, (y0 + y1) / 2), hb = P(x0, y1), ht = P(x0, y1, h);
  return (
    <svg viewBox="0 0 500 446" className="draw-svg" role="img" aria-label={`A ${d.storeys} storey house, ${w} metres wide and ${dp} metres deep, drawn on its plot.`}>
      <polygon points={poly([P(0, 0), P(PW, 0), P(PW, PD), P(0, PD)])} className="plot" />
      <text x={P(PW, PD)[0]} y={P(PW, PD)[1] + 16} textAnchor="middle" className="t-dim">Plot {PW} × {PD} m</text>
      <polygon points={poly([P(x0, ym, rz), P(x1, ym, rz), P(x1, y0, h), P(x0, y0, h)])} className="f-roof2" />
      <polygon points={poly([P(x1, y0), P(x1, y1), P(x1, y1, h), P(x1, ym, rz), P(x1, y0, h)])} className="f-side" />
      <polygon points={poly([P(x0, y1), P(x1, y1), P(x1, y1, h), P(x0, y1, h)])} className="f-front" />
      {Array.from({ length: d.storeys - 1 }).map((_, k) => (
        <path key={k} d={seg(P(x0, y1, (k + 1) * 2.8), P(x1, y1, (k + 1) * 2.8)) + seg(P(x1, y1, (k + 1) * 2.8), P(x1, y0, (k + 1) * 2.8))} className="thin" />
      ))}
      {front.map((q, i) => <polygon key={`f${i}`} points={poly(q)} className="win" />)}
      {side.map((q, i) => <polygon key={`s${i}`} points={poly(q)} className="win" />)}
      <polygon points={poly([P(x0, y1, h), P(x1, y1, h), P(x1, ym, rz), P(x0, ym, rz)])} className="f-roof" />
      {/* dimension lines */}
      <path className="dim" d={seg(P(x0, y1 + 1.8), P(x1, y1 + 1.8)) + seg(P(x0, y1 + 1.3), P(x0, y1 + 2.3)) + seg(P(x1, y1 + 1.3), P(x1, y1 + 2.3))} />
      <text x={wm[0] - 8} y={wm[1] + 18} textAnchor="end" className="t-dim hot">{w} m</text>
      <path className="dim" d={seg(P(x1 + 1.8, y0), P(x1 + 1.8, y1)) + seg(P(x1 + 1.3, y0), P(x1 + 2.3, y0)) + seg(P(x1 + 1.3, y1), P(x1 + 2.3, y1))} />
      <text x={dm[0] + 8} y={dm[1] + 18} className="t-dim hot">{dp} m</text>
      <path className="dim" d={`M${hb[0] - 16} ${hb[1]}V${ht[1]}M${hb[0] - 21} ${hb[1]}h10M${hb[0] - 21} ${ht[1]}h10`} />
      <text x={hb[0] - 24} y={(hb[1] + ht[1]) / 2 + 4} textAnchor="end" className="t-dim hot">{d.storeys} {d.storeys === 1 ? "storey" : "storeys"}</text>
    </svg>
  );
}

function Architect() {
  const [d, setD] = useState<Design>(START);
  const set = (patch: Partial<Design>) => setD((p) => ({ ...p, ...patch }));
  const L = LIMITS.new, p = price(d);
  const spec = SPECS.find((s) => s[0] === d.spec)![1];
  return (
    <Case
      no="EX-01" firm={FIRMS.architect} steps={ARCHITECT_STEPS}
      note="This is one slice. The full tool is a 3D designer with drag and drop blocks, a planning guide, a sun study and a seven sheet drawing set."
      shots={[
        { src: "/showcase/arch-model.webp", w: 1238, h: 871, title: "The 3D designer" },
        { src: "/showcase/arch-exploded.webp", w: 1238, h: 871, title: "Exploded view" },
        { src: "/showcase/arch-sheet.webp", w: 1238, h: 838, title: "Sheet SK00, the cover" },
        { src: "/showcase/arch-cost.webp", w: 1238, h: 484, title: "Cost plan" },
      ]}
      drawing={<Massing d={d} />}
      controls={<>
        <Slider label="Width" value={d.width} min={L.width[0]} max={L.width[1]} onChange={(v) => set({ width: v })} show={`${d.width} m`} />
        <Slider label="Depth" value={d.depth} min={L.depth[0]} max={L.depth[1]} onChange={(v) => set({ depth: v })} show={`${d.depth} m`} />
        <Slider label="Storeys" value={d.storeys} min={L.storeys[0]} max={L.storeys[1]} onChange={(v) => set({ storeys: v })} show={String(d.storeys)} />
        <Seg label="Specification" value={d.spec} options={SPECS as readonly (readonly [Spec, string])[]} onChange={(v) => set({ spec: v })} />
      </>}
      code={<>
        <p className="code-top"><span>fee.ts</span><span>runs on every change</span><b>no AI inside</b></p>
        <Ln v="area" out={<>{p.area} m²</>}>
          <Scrub label="Width in metres" value={d.width} min={L.width[0]} max={L.width[1]} onChange={(v) => set({ width: v })} /> × <Scrub label="Depth in metres" value={d.depth} min={L.depth[0]} max={L.depth[1]} onChange={(v) => set({ depth: v })} /> × <Scrub label="Storeys" value={d.storeys} min={L.storeys[0]} max={L.storeys[1]} onChange={(v) => set({ storeys: v })} />
        </Ln>
        <Ln v="rate" out={<>{gbp(p.perM2)} per m²</>}>rate_card[<i>{spec}</i>]</Ln>
        <Ln v="build" out={range(p.buildLow, p.buildHigh)}>area × rate ± 12%</Ln>
        <Ln v="fee" out={gbp(p.fee)}>max(6,500, build × {(p.feePct * 100).toFixed(1).replace(".0", "")}%)</Ln>
        <p className="code-hint">Drag the green numbers.</p>
      </>}
      outs={<>
        <div><span>Floor area</span><b>{p.area} m²</b></div>
        <div><span>Build budget</span><b>{range(p.buildLow, p.buildHigh)}</b></div>
        {p.lines.map(([name, fee]) => <div key={name} className="sub"><span>{name}</span><b>{gbp(fee)}</b></div>)}
        <div className="big"><span>Fee proposal, ready to send</span><b>{gbp(p.fee)}</b></div>
      </>}
    />
  );
}

// ------------------------------------------------------------------------------------------ builder
const K = 0.082;

function Plan({ length, width }: { length: number; width: number }) {
  const k = kitchen(length, width), lw = length * K, ww = width * K, m = RULE.module * K;
  const ox = (560 - lw) / 2, oy = (430 - ww) / 2 + 8, T = 11;
  const by = oy + ww - m, hinge = oy + ww / 2 - 33, ax = ox + Math.min(lw - 26, k.perRun * m - m / 2);
  const a0 = oy + m, a1 = k.runs === 2 ? by : oy + ww;
  const unit = (x: number, y: number, key: string) => <rect key={key} x={x} y={y} width={m} height={m} className="unit" />;
  return (
    <svg viewBox="0 0 560 430" className="draw-svg" role="img" aria-label={`A kitchen plan ${n(length)} by ${n(width)} millimetres with ${k.units} units in ${k.runs === 2 ? "two runs" : "one run"}.`}>
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6" className="hatch" /></pattern>
      </defs>
      <rect x={ox - T} y={oy - T} width={lw + 2 * T} height={ww + 2 * T} fill="url(#hatch)" className="wall" />
      <rect x={ox} y={oy} width={lw} height={ww} className="floor" />
      <rect x={ox - T - 1} y={hinge} width={T + 2} height={66} className="gap" />
      <path d={`M${ox} ${hinge}h66a66 66 0 0 1 -66 66`} className="thin" />
      {Array.from({ length: k.perRun }).map((_, i) => unit(ox + i * m, oy, `t${i}`))}
      {k.runs === 2 && Array.from({ length: k.perRun }).map((_, i) => unit(ox + i * m, by, `b${i}`))}
      {/* larder, hob and sink */}
      <path d={`M${ox} ${oy}l${m} ${m}M${ox + m} ${oy}l${-m} ${m}`} className="thin" />
      {k.perRun > 2 && [[0.3, 0.32], [0.7, 0.32], [0.3, 0.7], [0.7, 0.7]].map(([a, b], i) => <circle key={i} cx={ox + 2 * m + a * m} cy={oy + b * m} r={m * 0.13} className="thin" />)}
      {k.runs === 2 && k.perRun > 1 && <><rect x={ox + m * 1.18} y={by + m * 0.2} width={m * 0.64} height={m * 0.6} rx="5" className="thin" /><circle cx={ox + m * 1.5} cy={by + m * 0.5} r="2.5" className="ink" /></>}
      {/* dimensions */}
      <path className="dim" d={`M${ox} ${oy - 30}h${lw}M${ox} ${oy - 36}v12M${ox + lw} ${oy - 36}v12`} />
      <text x={ox + lw / 2} y={oy - 38} textAnchor="middle" className="t-dim hot">{n(length)}</text>
      <path className="dim" d={`M${ox + lw + 30} ${oy}v${ww}M${ox + lw + 24} ${oy}h12M${ox + lw + 24} ${oy + ww}h12`} />
      <text x={ox + lw + 40} y={oy + ww / 2 + 4} className="t-dim hot">{n(width)}</text>
      <path className="dim live" d={`M${ax} ${a0 + 3}V${a1 - 3}M${ax - 4} ${a0 + 9}l4 -6l4 6M${ax - 4} ${a1 - 9}l4 6l4 -6`} />
      <text x={ax - 8} y={(a0 + a1) / 2 + 4} textAnchor="end" className="t-dim live">{k.runs === 2 ? "aisle" : "clear floor"} {n(k.aisle)}</text>
    </svg>
  );
}

function Builder() {
  const [length, setLength] = useState(3600), [width, setWidth] = useState(2700), [finish, setFinish] = useState<Finish>("better");
  const k = kitchen(length, width);
  return (
    <Case
      no="EX-02" firm={FIRMS.builder} steps={BUILDER_STEPS}
      note="This is one slice. The full tool is a drag and drop room planner for kitchens, bathrooms and extensions, with a nine sheet job pack."
      shots={[
        { src: "/showcase/build-planner.webp", w: 1238, h: 1059, title: "The room planner" },
        { src: "/showcase/build-plan.webp", w: 1230, h: 1110, title: "Sheet A-101, floor plan" },
        { src: "/showcase/build-model.webp", w: 1230, h: 1079, title: "Sheet A-301, ink model" },
        { src: "/showcase/build-options.webp", w: 1230, h: 1305, title: "Sheet Q-502, three priced options" },
      ]}
      drawing={<Plan length={length} width={width} />}
      controls={<>
        <Slider label="Room length" value={length} min={LIMIT.length[0]} max={LIMIT.length[1]} step={100} onChange={setLength} show={`${n(length)} mm`} />
        <Slider label="Room width" value={width} min={LIMIT.width[0]} max={LIMIT.width[1]} step={100} onChange={setWidth} show={`${n(width)} mm`} />
        <p className={`rule ${k.runs === 2 ? "ok" : ""}`}>
          {k.runs === 2 ? `Design rule passed: ${n(k.aisle)} mm of clear floor between the runs.` : `Design rule: two runs need ${n(RULE.aisle)} mm between them, so this room gets one run.`}
        </p>
      </>}
      code={<>
        <p className="code-top"><span>takeoff.ts</span><span>measured off the plan</span><b>no AI inside</b></p>
        <Ln v="runs" out={<>{k.runs}</>}>
          <Scrub label="Room width in millimetres" value={width} min={LIMIT.width[0]} max={LIMIT.width[1]} step={100} onChange={setWidth} /> − 1,200 ≥ {n(RULE.aisle)} ? 2 : 1
        </Ln>
        <Ln v="units" out={<>{k.units}</>}>
          floor(<Scrub label="Room length in millimetres" value={length} min={LIMIT.length[0]} max={LIMIT.length[1]} step={100} onChange={setLength} /> / 600) × runs
        </Ln>
        <Ln v="worktop" out={<>{k.worktop.toFixed(1)} m</>}>units × 0.6</Ln>
        <Ln v="floor" out={<>{k.floor.toFixed(1)} m²</>}>length × width</Ln>
        <Ln v="quote" out={gbp(k.price(finish))}>price_book[<i>{BOOK[finish].name}</i>]</Ln>
        <p className="code-hint">Drag the green numbers.</p>
      </>}
      outs={<>
        <div><span>Taken off the plan</span><b>{k.units} units, {k.worktop.toFixed(1)} m of worktop</b></div>
        <div className="sub"><span>Floor to lay, with 10% waste</span><b>{(k.floor * 1.1).toFixed(1)} m²</b></div>
        <div className="sub"><span>Splashback to tile</span><b>{k.splash.toFixed(1)} m²</b></div>
        <div className="sub"><span>Three options, priced from the price book</span><b>inc. VAT</b></div>
        <div className="opts" role="group" aria-label="Three priced options">
          {FINISHES.map((f) => (
            <button key={f} type="button" aria-pressed={f === finish} onClick={() => setFinish(f)}>
              <span>{BOOK[f].name}</span><b>{gbp(k.price(f))}</b>
            </button>
          ))}
        </div>
      </>}
    />
  );
}

// ------------------------------------------------------------------------------------------ plumber
const ORDER: Component[] = ["fan", "hex", "electrode", "vessel", "gasvalve", "ntc", "sensor", "condensate", "pump", "diverter", "prv"];
const AT: Record<Component, [number, number, number, number]> = {
  fan: [180, 82, 326, 82], hex: [236, 128, 326, 120], electrode: [240, 160, 326, 156], vessel: [94, 160, 34, 160], gasvalve: [180, 232, 34, 226],
  ntc: [136, 258, 34, 258], sensor: [277, 214, 326, 206], condensate: [216, 246, 326, 234], pump: [260, 266, 326, 266], diverter: [136, 296, 34, 300], prv: [278, 340, 326, 332],
};
const SYMBOL: Record<Component, ReactNode> = {
  fan: <><circle cx="180" cy="82" r="15" /><path d="M180 82l0 -12M180 82l10 7M180 82l-10 7" /></>,
  hex: <><rect x="124" y="110" width="112" height="64" rx="3" /><path d="M134 124h86a8 8 0 0 1 0 16h-80a8 8 0 0 0 0 16h86" /></>,
  electrode: <path d="M234 156l12 6l-3 6l-12 -6z" />,
  vessel: <><rect x="80" y="120" width="28" height="80" rx="14" /><path d="M80 160h28M94 132v12M88 138h12" /></>,
  gasvalve: <path d="M168 224l24 16v-16l-24 16zM180 224v-7h-7h14" />,
  ntc: <circle cx="136" cy="258" r="7" />,
  sensor: <circle cx="277" cy="214" r="7" />,
  condensate: <path d="M204 238v8a6 6 0 0 0 12 0v-8" />,
  pump: <><circle cx="260" cy="266" r="13" /><path d="M260 258l7 13h-14z" /></>,
  diverter: <path d="M126 288l20 16v-16l-20 16z" />,
  prv: <path d="M270 346l8 -12l8 12zM278 334v-8l5 -3" />,
};

function Boiler({ hot, display }: { hot: Component; display: string }) {
  return (
    <svg viewBox="0 0 360 420" className="draw-svg boiler" role="img" aria-label={`A boiler schematic with ${ORDER.length} numbered parts. Part ${ORDER.indexOf(hot) + 1}, the ${COMPONENT[hot].toLowerCase()}, is marked as the likely fault.`}>
      <rect x="70" y="44" width="220" height="328" rx="5" className="case-line" />
      <path d="M164 44V26h32v18M180 44v23M180 97v13" className="thin" />
      <path d="M180 396V240M180 217v-43" className="gas" />
      <path d="M136 174v114M136 304v32h-36v60M146 296h12" className="flow" />
      <path d="M260 396V279M260 253v-57h-36v-22M214 318h46" className="ret" />
      <path d="M220 396v-56h-20v-14M172 326v24h-32v46" className="water" />
      <path d="M94 200v8h42M260 214h10M260 340h10M284 346v36M222 248h18v134" className="thin" />
      <rect x="158" y="282" width="56" height="44" className="thin fillp" />{[291, 300, 309, 318].map((y) => <path key={y} d={`M158 ${y}h56`} className="thin" />)}
      <rect x="82" y="54" width="52" height="22" rx="2" className="lcd" /><text x="108" y="70" textAnchor="middle" className="lcd-t">{display || "··"}</text>
      {([[100, "Flow"], [140, "Hot"], [180, "Gas"], [220, "Cold"], [260, "Return"]] as const).map(([x, t]) => <text key={t} x={x} y="412" textAnchor="middle" className="t-dim">{t}</text>)}
      {ORDER.map((k, i) => {
        const [x, y, bx, by] = AT[k], left = bx < 180;
        return (
          <g key={k} className={k === hot ? "part hot" : "part"}>
            <g className="sym">{SYMBOL[k]}</g>
            <path d={`M${x} ${y}L${bx + (left ? 10 : -10)} ${by}`} className="lead" />
            <circle cx={bx} cy={by} r="10" className="bal" /><text x={bx} y={by + 3.6} textAnchor="middle" className="bal-t">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Plumber() {
  const [a, setA] = useState({ make: "vaillant", model: "plus832", code: "F28" });
  const [rate, setRate] = useState(84);
  const m = findMake(a.make), codes = codesFor(m, a.model);
  const d = diagnose({ ...a, pressure: 1.2, vulnerable: false }, rate);
  const pickMake = (key: string) => { const mk = findMake(key); setA({ make: key, model: mk.models[0].key, code: firstCode(mk, mk.models[0].key) }); };
  const pickModel = (key: string) => setA((p) => ({ ...p, model: key, code: codesFor(m, key).some((c) => c.code === p.code) ? p.code : firstCode(m, key) }));
  const shown = d.hasCode ? d.code.code : "";
  return (
    <Case
      no="EX-03" firm={FIRMS.plumber} steps={PLUMBER_STEPS}
      note="This is one slice. The full build has two tools: this fault finder with a boiler passport, and a heating planner that works out heat loss room by room."
      shots={[
        { src: "/showcase/plumb-diagnosis.webp", w: 1238, h: 945, title: "The fault finder" },
        { src: "/showcase/plumb-schematic.webp", w: 620, h: 945, title: "Fig. 1, the service schematic" },
        { src: "/showcase/plumb-heatplan.webp", w: 1238, h: 836, title: "The heating planner" },
        { src: "/showcase/plumb-heatloss.webp", w: 1294, h: 1747, title: "Thermal plan and heat loss" },
      ]}
      drawing={<Boiler hot={d.code.component} display={shown} />}
      controls={<>
        <Seg label="Boiler make" value={a.make} options={MAKES.map((x) => [x.key, x.name] as const)} onChange={pickMake} />
        <Seg label="Model" value={a.model} options={m.models.map((x) => [x.key, x.name] as const)} onChange={pickModel} />
        <div className="codes" role="group" aria-label="Fault code or symptom">
          {codes.map((c) => (
            <button key={c.code} type="button" aria-pressed={c.code === d.code.code} onClick={() => setA((p) => ({ ...p, code: c.code }))}>
              {c.code.startsWith("none") ? c.shows : c.code}
            </button>
          ))}
        </div>
      </>}
      code={<>
        <p className="code-top"><span>diagnose.ts</span><span>a lookup, not a guess</span><b>no AI inside</b></p>
        <Ln v="fault" out={COMPONENT[d.code.component].toLowerCase()}>catalogue[<i>{m.name}</i>][<i>{shown || "no code"}</i>]</Ln>
        <Ln v="part" out={<>{d.part.ref}, {gbp(d.part.price)}</>}>parts[fault]</Ln>
        <Ln v="stock" out={d.stockName.toLowerCase()}>van ?? counter ?? supplier</Ln>
        <Ln v="price" out={gbp(d.total)}>
          (part + {d.code.minutes} min × £<Scrub label="Engineer rate in pounds per hour" value={rate} min={60} max={130} onChange={setRate} />/h) × 1.2
        </Ln>
        <Ln v="slot" out={d.slots[0].toLowerCase()}>diary.after(part.arrives)</Ln>
        <p className="code-hint">Drag the green number. It is the firm&rsquo;s hourly rate.</p>
      </>}
      outs={<>
        <div><span>{m.name} {d.model.name}{shown ? `, code ${shown}` : ""}</span><b>{d.code.shows}.</b></div>
        <div className="sub"><span>Most likely cause</span><b>{d.code.cause}</b></div>
        <div><span>Part {ORDER.indexOf(d.code.component) + 1} on the drawing</span><b>{d.part.name}, {d.part.ref}</b></div>
        <div className="sub"><span>Stock</span><b>{d.stockLine}{d.order ? ` Order ${d.order}.` : ""}</b></div>
        <div className="sub"><span>Labour</span><b>{d.code.minutes} minutes at {gbp(rate)} an hour</b></div>
        <div className="big"><span>Fixed price{d.provisional ? ", part confirmed on the visit" : ""}. First slot: {d.slots[0].toLowerCase()}</span><b>{gbp(d.total)}</b></div>
        <p className="outs-fine">An example catalogue for a fictional firm, not advice about your boiler. If you smell gas, call 0800 111 999.</p>
      </>}
    />
  );
}

export function Examples() {
  return (
    <div className="cases">
      <Architect />
      <Builder />
      <Plumber />
    </div>
  );
}
