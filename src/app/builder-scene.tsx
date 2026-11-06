"use client";

import { useEffect, useRef, useState } from "react";

// Pinned scroll story. Scroll progress (0..1) is split into five stages; each stage's local progress
// is written to a CSS variable (--s0..--s4) and the visuals are pure CSS transforms of those variables.
// No animation library, no per-frame React renders: only the caption index and counters touch state.

const REQUEST = "Every Monday, turn the job sheets into invoices and chase the late ones.";
const TOOLS = ["Read job sheets", "Match each job to a client", "Calculate the total", "Make the invoice PDF", "Check what's overdue", "Send the email"];
// Where each tool starts before the builder picks it (offsets in % of the panel), and its tilt.
const SCATTER: [number, number, number][] = [[38, -16, -9], [-4, 30, 7], [44, 22, -5], [-10, -34, 11], [40, -40, 6], [6, 44, -12]];
const NEXT = [["Quote follow-up", "4 steps"], ["Weekly owner report", "6 steps"], ["New starter setup", "5 steps"]];
const CAPTIONS = [
  ["Describe the problem.", "In plain English, the way you'd explain it to a new starter."],
  ["The builder picks ordinary tools.", "Spreadsheets, PDFs, email, your own systems. Nothing clever, nothing that guesses."],
  ["It writes a workflow, not a prompt.", "Real code, checked against your examples. AI is used here, once, to build it."],
  ["Then it runs on its own.", "No AI inside, so no drift. Same input, same output, every single time."],
  ["And it builds the next one.", "Your team describes the next problem. The builder makes the next workflow."],
];
const CODE = [
  ["monday_invoices.py", "c"],
  ["jobs = read_sheet(\"job-sheets.xlsx\")", ""],
  ["for job in jobs:", ""],
  ["    client = match_client(job)", ""],
  ["    total = job.hours * client.rate", ""],
  ["    pdf = make_invoice(client, total)", ""],
  ["    if overdue(client):", ""],
  ["        send_email(client, pdf)", ""],
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function BuilderScene() {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState(0);
  const [runs, setRuns] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = reduce ? 1 : clamp(-r.top / span);
      const s = [0, 1, 2, 3, 4].map((i) => clamp(p * 5 - i));
      s.forEach((v, i) => el.style.setProperty(`--s${i}`, v.toFixed(4)));
      setStage(Math.min(4, Math.floor(p * 5 + 0.0001)));
      setTyped(Math.round(REQUEST.length * clamp(s[0] * 1.35)));
      setRuns(Math.round(10000 * ease(s[3])));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={root} id="builder" className="relative h-[520vh]" aria-label="How the builder works, in five steps">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="max-w-page mx-auto h-full px-5 md:px-10 grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 md:gap-14 items-center content-center py-6">
          {/* Captions: one at a time, cross-fading */}
          <div className="relative h-[9.5rem] md:h-auto md:min-h-[22rem]">
            <p className="font-mono text-xs mb-4 md:mb-8 flex gap-2" aria-hidden>
              {CAPTIONS.map((_, i) => (
                <span key={i} className={`h-1 w-8 transition-colors duration-500 ${i <= stage ? "bg-ink" : "bg-line"}`} />
              ))}
            </p>
            {CAPTIONS.map(([title, body], i) => (
              <div key={i} className={`absolute inset-x-0 top-8 md:top-14 transition-all duration-700 ease-out ${i === stage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`} aria-hidden={i !== stage}>
                <p className="font-mono text-xs text-dim mb-3">0{i + 1}</p>
                <h3 className="font-display font-bold tracking-[-0.03em] leading-[0.95] text-[2rem] md:text-[3.6rem]">{title}</h3>
                <p className="mt-3 md:mt-6 text-base md:text-xl text-dim max-w-md leading-snug">{body}</p>
              </div>
            ))}
          </div>

          {/* The machine. Everything inside sizes in em from one base, so phones get a readable layout, not a shrunk one. */}
          <div className="relative w-full max-w-[44rem] mx-auto aspect-[3/4] md:aspect-[5/4] max-h-[64svh] md:max-h-[78svh] bg-ink text-stone rounded-[22px] overflow-hidden [container-type:inline-size] shadow-[0_40px_80px_-30px_rgba(0,0,0,.45)]">
            {/* cqw resolves against the nearest ancestor container, so the base size lives one layer in. */}
            <div className="absolute inset-0 text-[length:3.4cqw] md:text-[length:2.15cqw]">
            {/* Request bar */}
            <div className="absolute left-[5%] right-[5%] top-[4%] rounded-[.7em] bg-stone text-ink px-[1.3em] py-[.9em] leading-snug"
              style={{ opacity: "calc(1 - var(--s4, 0) * 0.75)" }}>
              <span className="font-mono text-[.72em] text-dim block mb-[.35em]">New workflow request</span>
              <span className="text-[1.1em]">{REQUEST.slice(0, typed)}</span>
              <span className={`inline-block w-[.2em] h-[1.1em] align-[-.2em] ml-[.1em] bg-ink ${stage === 0 ? "animate-pulse" : "opacity-0"}`} />
            </div>

            {/* Pipeline column */}
            <div className="absolute left-[5%] right-[5%] md:right-auto md:w-[44%] top-[25%] bottom-[35%] md:top-[27%] md:bottom-[16%]" style={{ opacity: "calc(1 - var(--s4, 0) * 0.92)" }}>
              <div className="absolute left-[1.75em] top-[1em] bottom-[1em] w-[.16em] bg-lime origin-top" style={{ transform: "scaleY(var(--s2, 0))" }} />
              {TOOLS.map((t, i) => {
                const [dx, dy, rot] = SCATTER[i];
                const local = `clamp(0, calc(var(--s1, 0) * 1.6 - ${i * 0.12}), 1)`;
                return (
                  <div key={t} className="absolute left-0 right-0 flex items-center gap-[.75em] rounded-[.55em] bg-[#1F1F1F] border border-white/10 px-[.8em] h-[14%] whitespace-nowrap"
                    style={{
                      top: `${i * 16.8}%`,
                      opacity: local,
                      transform: `translate(calc((1 - ${local}) * ${dx}cqw), calc((1 - ${local}) * ${dy}cqw)) rotate(calc((1 - ${local}) * ${rot}deg))`,
                    }}>
                    <span className="relative z-10 grid place-items-center w-[1.4em] h-[1.4em] rounded-full bg-ink border border-lime/70 font-mono text-[.7em] text-lime">{i + 1}</span>
                    <span>{t}</span>
                    <span className="ml-auto font-mono text-[.75em] text-lime" style={{ opacity: "var(--s3, 0)" }}>ok</span>
                  </div>
                );
              })}
              {/* Live packets, only once it's running */}
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className="absolute left-[1.5em] w-[.7em] h-[.7em] rounded-full bg-signal shadow-[0_0_0_.25em_rgba(43,89,255,.25)]"
                  style={{ opacity: "var(--s3, 0)", animation: `packet 2.4s linear ${k * 0.6}s infinite` }} />
              ))}
            </div>

            {/* Code: what the builder actually produced */}
            <div className="absolute left-[5%] right-[5%] bottom-[14%] md:bottom-auto md:left-auto md:w-[43%] md:top-[27%] rounded-[.65em] border border-white/10 bg-[#171717] p-[1em] font-mono text-[.78em] leading-[1.7]"
              style={{ opacity: "calc(var(--s2, 0) * (1 - var(--s4, 0) * 0.92))", transform: "translateY(calc((1 - var(--s2, 0)) * 2em))" }}>
              {CODE.map(([line, kind], i) => (
                <div key={i} className={`${kind === "c" ? "text-lime mb-[.4em]" : "text-stone/85 whitespace-pre"} ${i > 2 ? "hidden md:block" : ""}`}>{line}</div>
              ))}
              <div className="mt-[.7em] inline-block rounded-full bg-lime text-ink px-[.8em] py-[.2em]">no AI inside</div>
            </div>

            {/* Run counters */}
            <div className="absolute left-[5%] right-[5%] bottom-[3.5%] grid grid-cols-4 gap-[.8em] font-mono text-[.7em] text-stone/60"
              style={{ opacity: "calc(var(--s3, 0) * (1 - var(--s4, 0) * 0.92))" }}>
              {[["runs", runs.toLocaleString("en-GB")], ["AI calls", "0"], ["cost / run", "£0.00"], ["identical", "100%"]].map(([k, v]) => (
                <div key={k}><div className="text-stone text-[1.7em] font-sans font-semibold num">{v}</div>{k}</div>
              ))}
            </div>

            {/* The next workflows */}
            <div className="absolute inset-x-[6%] top-[26%] bottom-[8%] flex flex-col justify-center gap-[1em]">
              {NEXT.map(([name, steps], i) => {
                const local = `clamp(0, calc(var(--s4, 0) * 2.2 - ${i * 0.35}), 1)`;
                return (
                  <div key={name} className="flex items-center gap-[.8em] rounded-[.65em] bg-stone text-ink px-[1.1em] py-[.9em]"
                    style={{ opacity: local, transform: `translateX(calc((1 - ${local}) * 60cqw))` }}>
                    <span className="font-display font-bold text-[1.4em] tracking-[-0.02em] leading-tight">{name}</span>
                    <span className="ml-auto hidden md:flex gap-[.35em]" aria-hidden>
                      {Array.from({ length: Number(steps[0]) }).map((_, j) => <span key={j} className="w-[.6em] h-[.6em] rounded-full bg-ink" />)}
                    </span>
                    <span className="ml-auto md:ml-0 font-mono text-[.75em] text-dim whitespace-nowrap">{steps} · no AI</span>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes packet { from { top: 3%; } to { top: 90%; } }`}</style>
    </section>
  );
}
