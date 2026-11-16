"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FRAMES } from "@/lib/story";
import { TrackLink } from "./track-link";

// The homepage header: a route from A to B with one stop per storyboard frame. A marker travels along it as you scroll.
// Scroll position is written to one CSS variable (--p); React state only changes when the current frame changes.
export function StoryRail() {
  const route = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const els = FRAMES.map((f) => document.getElementById(f.id)).filter(Boolean) as HTMLElement[];
    if (els.length !== FRAMES.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const ref = window.scrollY + 96;
      let i = 0;
      els.forEach((el, k) => { if (el.offsetTop <= ref) i = k; });
      const frac = Math.min(1, Math.max(0, (ref - els[i].offsetTop) / els[i].offsetHeight));
      const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const p = end ? 1 : Math.min(1, (i + frac) / (els.length - 1));
      route.current?.style.setProperty("--p", p.toFixed(4));
      setAt(end ? els.length - 1 : i);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <header className="rail">
      <div className="rail-in">
        <Link href="/" className="rail-brand">webflow outreach</Link>
        <nav className="route" aria-label="Sections" ref={route}>
          <span className="end" aria-hidden>A</span>
          <div className="track">
            <i className="fill" />
            <ol className="stops">
              {FRAMES.map((f, i) => (
                <li key={f.id} className={i === at ? "on" : i < at ? "past" : ""}>
                  <a href={`#${f.id}`} aria-current={i === at ? "step" : undefined}>
                    <i className="tick" />
                    <span className="lab">{f.label}</span>
                  </a>
                </li>
              ))}
            </ol>
            <i className="mark" />
          </div>
          <span className={`end b ${at === FRAMES.length - 1 ? "there" : ""}`} aria-hidden>B</span>
        </nav>
        <TrackLink where="rail" href="/start" className="rail-cta group">
          <span className="hidden sm:inline">Book an intro call</span><span className="sm:hidden">Book a call</span>
          <span aria-hidden className="chip">→</span>
        </TrackLink>
      </div>
    </header>
  );
}
