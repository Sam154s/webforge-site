"use client";

import { useEffect, useRef, useState } from "react";

// Pinned scroll story: how we work, in four steps. Scroll progress (0..1) is split into five beats (step three has two);
// each beat's local progress is written to a CSS variable (--s0..--s4) and the visuals are pure CSS transforms of those variables.
// No animation library, no per-frame React renders: only the caption index and the counters touch state.
// With reduced motion the scene is not pinned: the steps are a plain list and the drawing is shown finished.

const NOTE = "Every Monday, six people rebuild the board report by hand.";
type Kind = "code" | "AI" | "person";
const STEPS: [string, Kind][] = [
  ["Collect the sheets", "code"],
  ["Check the totals", "code"],
  ["Read the notes", "AI"],
  ["Build the pack", "code"],
  ["Flag odd figures", "person"],
  ["Send, Monday 8am", "code"],
];
// Where each step starts before it is drawn into place (offsets in % of the panel), and its tilt.
const SCATTER: [number, number, number][] = [[38, -16, -9], [-4, 30, 7], [44, 22, -5], [-10, -34, 11], [40, -40, 6], [6, 44, -12]];
const NEXT = [["Orders typed twice", "2"], ["Supplier chasing", "3"], ["Quotes that wait", "4"]];
const CAPTIONS: [string, string, string][] = [
  ["Step 1 of 4", "Watch.", "We sit with the people who do the work."],
  ["Step 2 of 4", "Draw.", "We sketch the system and agree the pass test in writing."],
  ["Step 3 of 4", "Build.", "AI writes the code once. Plain code ships."],
  ["Step 3 of 4", "And test.", "Ten runs, ten identical results. Or it does not ship."],
  ["Step 4 of 4", "Hand over and stay.", "It runs on your accounts. We stay for the next thing."],
];
const CODE: [string, string][] = [
  ["monday_report.py", "c"],
  ["sheets = collect(\"team-sheets/\")", ""],
  ["for s in sheets:", ""],
  ["    check_totals(s)", ""],
  ["notes = read_notes(sheets)  # AI", ""],
  ["pack = build_pack(sheets, notes)", ""],
  ["hold(pack.flags)  # a person checks", ""],
  ["send(pack, \"Mon 08:00\")", ""],
];
const TAG: Record<Kind, string> = {
  code: "border border-white/25 text-stone/70",
  AI: "bg-lime text-ink",
  person: "bg-stone text-ink",
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function HowScene() {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState(0);
  const [runs, setRuns] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const update = () => {
      raf = 0;
      if (mq.matches) {
        // Finished drawing, tested, before the hand-over list covers it.
        [1, 1, 1, 1, 0].forEach((v, i) => el.style.setProperty(`--s${i}`, String(v)));
        setStill(true); setStage(3); setTyped(NOTE.length); setRuns(10);
        return;
      }
      setStill(false);
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = clamp(-r.top / span);
      const s = [0, 1, 2, 3, 4].map((i) => clamp(p * 5 - i));
      s.forEach((v, i) => el.style.setProperty(`--s${i}`, v.toFixed(4)));
      setStage(Math.min(4, Math.floor(p * 5 + 0.0001)));
      setTyped(Math.round(NOTE.length * clamp(s[0] * 1.35)));
      setRuns(Math.round(10 * clamp(s[3] * 1.4)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); mq.removeEventListener("change", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={root} className={`relative ${still ? "" : "h-[400vh]"}`} aria-label="How we work, in four steps">
      <div className={still ? "py-10" : "sticky top-0 h-[100svh] overflow-hidden"}>
        <div className="max-w-page mx-auto h-full px-5 md:px-10 grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 md:gap-14 items-center content-center pt-[76px] pb-4 md:py-6">
          {still ? (
            <ol className="grid gap-5">
              {CAPTIONS.map(([, title, body]) => (
                <li key={title}>
                  <h3 className="font-display font-bold tracking-[-0.03em] leading-none text-[1.6rem]">{title}</h3>
                  <p className="mt-1 text-dim max-w-md leading-snug">{body}</p>
                </li>
              ))}
            </ol>
          ) : (
            /* Captions: one at a time, cross-fading */
            <div className="grid">
              <p className="col-start-1 row-start-1 flex gap-2 h-1" aria-hidden>
                {CAPTIONS.map((_, i) => (
                  <span key={i} className={`h-1 w-8 transition-colors duration-500 ${i <= stage ? "bg-ink" : "bg-line"}`} />
                ))}
              </p>
              {CAPTIONS.map(([, title, body], i) => (
                <div key={i} className={`col-start-1 row-start-1 pt-6 md:pt-12 transition-all duration-700 ease-out ${i === stage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`} aria-hidden={i !== stage}>
                  <h3 className="font-display font-bold tracking-[-0.03em] leading-[0.95] text-[2rem] md:text-[3.6rem]">{title}</h3>
                  <p className="mt-2 md:mt-6 text-base md:text-xl text-dim max-w-md leading-snug min-h-[2.8em] md:min-h-0">{body}</p>
                </div>
              ))}
            </div>
          )}

          {/* The drawing. Everything inside sizes in em from one base, so phones get a readable layout, not a shrunk one. */}
          <div className="relative w-full max-w-[44rem] mx-auto aspect-[3/4] md:aspect-[5/4] max-h-[56svh] md:max-h-[78svh] bg-ink text-stone rounded-[22px] overflow-hidden [container-type:inline-size]" aria-hidden>
            {/* cqw resolves against the nearest ancestor container, so the base size lives one layer in. */}
            <div className="absolute inset-0 text-[length:3.4cqw] md:text-[length:2.15cqw]">
              {/* What we saw */}
              <div className="absolute left-[5%] right-[5%] top-[4%] rounded-[.7em] bg-stone text-ink px-[1.3em] py-[.9em] leading-snug"
                style={{ opacity: "calc(1 - var(--s4, 0) * 0.75)" }}>
                <span className="text-[.74em] font-semibold text-dim block mb-[.35em]">What we saw</span>
                <span className="text-[1.08em]">{NOTE.slice(0, typed)}</span>
                <span className={`inline-block w-[.2em] h-[1.1em] align-[-.2em] ml-[.1em] bg-ink ${stage === 0 && !still ? "animate-pulse" : "opacity-0"}`} />
              </div>

              {/* The system, drawn step by step */}
              <div className="absolute left-[5%] right-[5%] md:right-auto md:w-[46%] top-[27%] bottom-[33%] md:top-[29%] md:bottom-[16%]" style={{ opacity: "calc(1 - var(--s4, 0) * 0.92)" }}>
                <div className="absolute left-[1.5em] top-[1em] bottom-[1em] w-[.16em] bg-lime origin-top" style={{ transform: "scaleY(var(--s2, 0))" }} />
                {/* Six empty slots appear while we watch, so the sheet is never blank. The drawn steps land on them. */}
                {STEPS.map(([t], i) => (
                  <div key={`slot-${t}`} className="absolute left-0 right-0 rounded-[.55em] border border-dashed border-white/35 h-[14%]"
                    style={{ top: `${i * 16.8}%`, opacity: `clamp(0, calc(var(--s0, 0) * 2.4 - ${i * 0.22}), 1)`, transform: `translateY(calc((1 - clamp(0, calc(var(--s0, 0) * 2.4 - ${i * 0.22}), 1)) * 1em))` }} />
                ))}
                {STEPS.map(([t, kind], i) => {
                  const [dx, dy, rot] = SCATTER[i];
                  const local = `clamp(0, calc(var(--s1, 0) * 1.6 - ${i * 0.12}), 1)`;
                  return (
                    <div key={t} className="absolute left-0 right-0 flex items-center gap-[.6em] rounded-[.55em] bg-[#1F1F1F] border border-white/10 px-[.6em] h-[14%] whitespace-nowrap"
                      style={{
                        top: `${i * 16.8}%`,
                        opacity: local,
                        transform: `translate(calc((1 - ${local}) * ${dx}cqw), calc((1 - ${local}) * ${dy}cqw)) rotate(calc((1 - ${local}) * ${rot}deg))`,
                      }}>
                      <span className="relative z-10 grid place-items-center w-[1.9em] h-[1.9em] shrink-0 rounded-full bg-ink border border-lime/70 text-[.7em] font-semibold text-lime">{i + 1}</span>
                      <span className="text-[.93em]">{t}</span>
                      <span className={`ml-auto rounded-full px-[.6em] py-[.1em] text-[.66em] font-semibold ${TAG[kind]}`}>{kind}</span>
                    </div>
                  );
                })}
              </div>

              {/* The code that came out of it */}
              <div className="absolute left-[5%] right-[5%] bottom-[14%] md:bottom-auto md:left-auto md:w-[41%] md:top-[29%] rounded-[.65em] border border-white/10 bg-[#171717] p-[1em] font-mono text-[.72em] leading-[1.7] overflow-hidden"
                style={{ opacity: "calc(var(--s2, 0) * (1 - var(--s4, 0) * 0.92))", transform: "translateY(calc((1 - var(--s2, 0)) * 2em))" }}>
                {CODE.map(([line, kind], i) => (
                  <div key={i} className={`${kind === "c" ? "text-lime mb-[.4em]" : "text-stone/85 whitespace-pre"} ${i > 2 ? "hidden md:block" : ""}`}>{line}</div>
                ))}
                <div className="mt-[.7em] inline-block rounded-full bg-lime text-ink px-[.8em] py-[.2em] font-sans font-semibold">AI in 1 step of 6</div>
              </div>

              {/* The ten-run test */}
              <div className="absolute left-[5%] right-[5%] bottom-[3.5%] grid grid-cols-4 gap-[.8em] text-[.7em] text-stone/65"
                style={{ opacity: "calc(var(--s3, 0) * (1 - var(--s4, 0) * 0.92))" }}>
                {[["test runs", String(runs)], ["identical", `${runs} of 10`], ["empty input", "stops"], ["hostile input", "stops"]].map(([k, v]) => (
                  <div key={k}><div className="text-stone text-[1.6em] font-semibold num whitespace-nowrap">{v}</div>{k}</div>
                ))}
              </div>

              {/* Next on the list */}
              <div className="absolute inset-x-[6%] top-[26%] bottom-[8%] flex flex-col justify-center gap-[1em]">
                {NEXT.map(([name, rank], i) => {
                  const local = `clamp(0, calc(var(--s4, 0) * 2.2 - ${i * 0.35}), 1)`;
                  return (
                    <div key={name} className="flex items-center gap-[.8em] rounded-[.65em] bg-stone text-ink px-[1.1em] py-[.9em]"
                      style={{ opacity: local, transform: `translateX(calc((1 - ${local}) * 60cqw))` }}>
                      <span className="grid place-items-center w-[1.7em] h-[1.7em] shrink-0 rounded-full border-[.1em] border-ink text-[.85em] font-bold">{rank}</span>
                      <span className="font-display font-bold text-[1.25em] tracking-[-0.02em] leading-tight">{name}</span>
                      <span className="ml-auto text-[.75em] font-semibold text-dim whitespace-nowrap hidden md:inline">next on your list</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
