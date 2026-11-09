"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CONSENT_TEXT, HONEYPOT, MARKETING_TEXT, SYSTEMS } from "@/lib/site";

const input = "w-full bg-transparent border-b border-ink/30 focus:border-ink outline-none py-3 text-base placeholder:text-dim/60 transition-colors rounded-none";
const label = "block text-sm text-dim mb-1";

function Field({ name, children, optional, hint }: { name: string; children: React.ReactNode; optional?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className={label}>{name}{optional && <span className="text-dim/70"> (optional)</span>}</span>
      {children}
      {hint && <span className="block text-xs text-dim mt-1.5">{hint}</span>}
    </label>
  );
}

export function DiagnosticForm() {
  const router = useRouter();
  const started = useRef(false);
  const t0 = useRef(0);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{ source: string; utm: Record<string, string> }>({ source: "diagnostic", utm: {} });

  // Remember where the visitor came from (landing page and utm_ tags) for the whole visit, without cookies.
  useEffect(() => {
    t0.current = Date.now();
    const q = new URLSearchParams(window.location.search);
    let saved: typeof meta | null = null;
    try { saved = JSON.parse(sessionStorage.getItem("wo_attr") || "null"); } catch {}
    const utm: Record<string, string> = { ...(saved?.utm ?? {}) };
    q.forEach((v, k) => { if (k.startsWith("utm_") || k === "c") utm[k] = v.slice(0, 120); });
    const next = { source: q.get("src") || saved?.source || "diagnostic", utm };
    try { sessionStorage.setItem("wo_attr", JSON.stringify(next)); } catch {}
    setMeta(next);
  }, []);

  function onStart() {
    if (!started.current) { started.current = true; track("form_start"); }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const other = String(fd.get("systems_other") || "").trim();
    const body = {
      name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"),
      company_name: fd.get("company_name"), website: fd.get("website"), company_number: fd.get("company_number"),
      message: fd.get("message"),
      systems: [...(fd.getAll("systems") as string[]), ...(other ? [`Other: ${other}`] : [])],
      consent_text: CONSENT_TEXT, marketing_opt_in: fd.get("marketing") === "on",
      source: meta.source, utm: meta.utm, _t: Date.now() - t0.current,
      [HONEYPOT]: fd.get(HONEYPOT),
    };
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        track("form_submit", { source: meta.source });
        router.push("/diagnostic/booked");
        return;
      }
      setError((await res.json().catch(() => ({}))).error ?? "Something went wrong. Email us instead.");
    } catch {
      setError("Something went wrong. Email us instead.");
    }
    track("form_error");
    setState("error");
  }

  return (
    <form onSubmit={submit} onFocus={onStart} className="space-y-7" noValidate={false}>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
        <Field name="Your name"><input name="name" required maxLength={200} autoComplete="name" className={input} /></Field>
        <Field name="Work email"><input name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" className={input} /></Field>
        <Field name="Company name"><input name="company_name" required maxLength={200} autoComplete="organization" className={input} /></Field>
        <Field name="Company website"><input name="website" required maxLength={300} autoComplete="url" inputMode="url" placeholder="yourcompany.co.uk" className={input} /></Field>
        <Field name="Phone" optional hint="Only for the call itself."><input name="phone" type="tel" maxLength={40} autoComplete="tel" inputMode="tel" className={input} /></Field>
        <Field name="Company number" optional hint="We can find it from the name."><input name="company_number" maxLength={12} autoComplete="off" className={input} /></Field>
      </div>

      <fieldset>
        <legend className={label}>Systems you use <span className="text-dim/70">(tick any)</span></legend>
        <div className="grid sm:grid-cols-2 gap-x-8">
          {SYSTEMS.map((s) => (
            <label key={s} className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input type="checkbox" name="systems" value={s} className="peer sr-only" />
              <span aria-hidden className="grid place-items-center w-5 h-5 border border-ink rounded-[4px] text-transparent peer-checked:bg-lime peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal text-xs">✓</span>
              {s}
            </label>
          ))}
        </div>
        <label className="block mt-2"><span className="sr-only">Other system</span>
          <input name="systems_other" maxLength={120} placeholder="Other (type it here)" className={input} /></label>
      </fieldset>

      <Field name="What takes up the most time each week?" optional>
        <textarea name="message" rows={2} maxLength={4000} className={`${input} resize-none`} />
      </Field>

      {/* Honeypot: people never see it, bots fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty<input name={HONEYPOT} tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
        <input type="checkbox" name="marketing" className="peer sr-only" />
        <span aria-hidden className="mt-0.5 shrink-0 grid place-items-center w-5 h-5 border border-ink rounded-[4px] text-transparent peer-checked:bg-lime peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal text-xs">✓</span>
        <span className="text-sm text-dim">{MARKETING_TEXT} <span className="text-dim/70">(optional, separate from your booking)</span></span>
      </label>

      <div>
        <button type="submit" disabled={state === "sending"} className="group inline-flex items-center gap-3 rounded-full bg-ink text-stone font-semibold pl-6 pr-2 py-2 min-h-[44px] disabled:opacity-60">
          {state === "sending" ? "Sending" : "Book my diagnostic"}
          <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-lime text-ink transition-transform duration-300 ease-apple group-hover:translate-x-0.5">→</span>
        </button>
        {state === "error" && <p className="mt-3 text-sm text-ink bg-lime inline-block px-2 py-1 rounded" role="alert">Problem: {error}</p>}
        <p className="mt-5 text-xs text-dim max-w-xl leading-relaxed">
          {CONSENT_TEXT.replace(" Privacy notice: /privacy", "")}{" "}
          <a href="/privacy" className="text-signal underline underline-offset-2">Privacy notice</a>.
        </p>
      </div>
    </form>
  );
}
