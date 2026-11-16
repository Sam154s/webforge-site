"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { counts, type Step } from "@/lib/sandbox/journey";

// Small shared pieces for the three examples: a number you can drag inside a line of code,
// a photo strip with a full-size viewer, and the "behind the scenes" step dots.

export function Scrub({ value, min, max, step = 1, onChange, label, format = (v: number) => v.toLocaleString("en-GB") }: {
  value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label: string; format?: (v: number) => string;
}) {
  const from = useRef<{ x: number; v: number } | null>(null);
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v / step) * step)));
  return (
    <span
      className="scrub" role="slider" tabIndex={0} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={format(value)}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); from.current = { x: e.clientX, v: value }; }}
      onPointerMove={(e) => { if (from.current) set(from.current.v + Math.round((e.clientX - from.current.x) / 9) * step); }}
      onPointerUp={() => { from.current = null; }}
      onPointerCancel={() => { from.current = null; }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); set(value + step); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); set(value - step); }
      }}
    >{format(value)}</span>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, show }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="sl">
      <span><span>{label}</span><output>{show}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([k, name]) => (
        <button key={k} type="button" aria-pressed={k === value} onClick={() => onChange(k)}>{name}</button>
      ))}
    </div>
  );
}

export type Shot = { src: string; w: number; h: number; title: string };

export function Shots({ items }: { items: Shot[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);
  const step = (n: number) => setOpen((i) => (i === null ? i : (i + n + items.length) % items.length));
  const cur = open === null ? null : items[open];
  return (
    <>
      <ul className="shots">
        {items.map((s, i) => (
          <li key={s.src}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`Enlarge: ${s.title}`}>
              <span className="shot-img"><Image src={s.src} alt="" fill sizes="(max-width: 760px) 60vw, 300px" /></span>
              <span className="shot-cap"><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog} className="viewer" onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
      >
        {cur && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} width={cur.w} height={cur.h} alt={cur.title} />
            <figcaption>
              <span>{cur.title}. A screenshot of the full tool.</span>
              <span className="viewer-nav">
                <button type="button" onClick={() => step(-1)} aria-label="Previous">←</button>
                <button type="button" onClick={() => step(1)} aria-label="Next">→</button>
                <button type="button" onClick={() => setOpen(null)}>Close</button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}

// One dot per step in the journey. Ink dot: runs as code. Ring: needs a person. Lime halo: AI could be added.
export function Journey({ steps, stages }: { steps: Step[]; stages: string[] }) {
  const person = steps.findIndex((s) => s.kind === "person");
  const [sel, setSel] = useState(Math.max(0, person));
  const c = counts(steps), s = steps[sel];
  return (
    <div className="jr">
      <p className="jr-sum">
        <b>{c.total} steps behind the scenes.</b> {c.code} run as code, {c.person} needs a person, {c.ai} could add AI.
      </p>
      <div className="jr-stages">
        {stages.map((name, i) => {
          const mine = steps.map((st, k) => [st, k] as const).filter(([st]) => st.stage === i + 1);
          return (
            <div key={name} className="jr-stage" style={{ flexGrow: mine.length }}>
              <div className="jr-dots">
                {mine.map(([st, k]) => (
                  <button key={st.id} type="button" className={`jr-dot ${st.kind} ${st.ai ? "ai" : ""}`} aria-pressed={k === sel} aria-label={`Step ${k + 1}: ${st.title}`} onClick={() => setSel(k)} />
                ))}
              </div>
              <span className="jr-name">{name}</span>
            </div>
          );
        })}
      </div>
      <div className="jr-step" aria-live="polite">
        <span className={`jr-kind ${s.kind}`}>{s.kind === "code" ? "Code" : "Person"}</span>
        <span className="jr-when">{s.when}</span>
        <b>{s.title}.</b> <span>{s.detail}</span>
        {s.ai && <span className="jr-ai">AI option: {s.ai}</span>}
      </div>
    </div>
  );
}
