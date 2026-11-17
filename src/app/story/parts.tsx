"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Small shared pieces: a labelled slider and a photo strip with a full-size viewer.

export function Slider({ label, value, min, max, step = 1, onChange, show }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="sl">
      <span><span>{label}</span><output>{show}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export type Shot = { src: string; w: number; h: number; title: string };

export function Shots({ items, captions = true }: { items: Shot[]; captions?: boolean }) {
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
              {captions && <span className="shot-cap"><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</span>}
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
