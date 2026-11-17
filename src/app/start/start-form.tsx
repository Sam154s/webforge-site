"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CONSENT_TEXT, HONEYPOT, MARKETING_TEXT } from "@/lib/site";
import { SITUATIONS } from "@/lib/situations";

const input = "w-full bg-transparent border-b border-ink/40 focus:border-ink outline-none py-3 text-base placeholder:text-dim/60 transition-colors rounded-none aria-[invalid=true]:border-ink aria-[invalid=true]:border-b-2";
const label = "block text-sm font-semibold mb-1";
const chip = "min-h-[40px] px-3.5 py-2 border-[1.5px] border-ink rounded-full text-sm font-semibold leading-tight text-left transition-colors aria-pressed:bg-ink aria-pressed:text-stone";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "company_name" | "website", string>>;

function Field({ id, name, children, optional, hint, error }: { id: string; name: string; children: React.ReactNode; optional?: boolean; hint?: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{name}{optional && <span className="font-normal text-dim"> (optional)</span>}</label>
      {children}
      {error ? <p id={`${id}-err`} className="mt-2 text-sm font-semibold"><span className="note">{error}</span></p> : hint && <p className="text-xs text-dim mt-1.5">{hint}</p>}
    </div>
  );
}

export function StartForm({ defaults, situation }: { defaults?: { company: string; website: string }; situation?: string }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const started = useRef(false);
  const t0 = useRef(0);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sit, setSit] = useState(situation ?? "");
  const [meta, setMeta] = useState<{ source: string; utm: Record<string, string>; c: string }>({ source: "intro-call", utm: {}, c: "" });

  // Remember where the visitor came from (landing page and utm_ tags) for the whole visit, without cookies.
  useEffect(() => {
    t0.current = Date.now();
    const q = new URLSearchParams(window.location.search);
    let saved: typeof meta | null = null;
    try { saved = JSON.parse(sessionStorage.getItem("wo_attr") || "null"); } catch {}
    const utm: Record<string, string> = { ...(saved?.utm ?? {}) };
    q.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v.slice(0, 120); });
    const next = { source: q.get("src") || saved?.source || "intro-call", utm, c: (q.get("c") || saved?.c || "").slice(0, 64) };
    try { sessionStorage.setItem("wo_attr", JSON.stringify(next)); } catch {}
    setMeta(next);
  }, []);

  function onStart() {
    if (!started.current) { started.current = true; track("form_start"); }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) || "").trim();
    const errs: Errors = {};
    if (!v("name")) errs.name = "Add your name.";
    if (!EMAIL_RE.test(v("email"))) errs.email = "Add a work email we can reply to.";
    if (!v("company_name")) errs.company_name = "Add your company name.";
    if (!/^[^\s]+\.[^\s]{2,}$/.test(v("website"))) errs.website = "Add your website, for example yourcompany.co.uk.";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      setState("idle");
      (form.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setState("sending");
    // The enquiry route takes a fixed set of keys, so these answers travel in the message text.
    const chosen = SITUATIONS.find((s) => s.key === sit);
    const extra = sit ? `Situation: ${chosen ? `${chosen.short} (${chosen.key})` : "Something else"}` : "";
    const body = {
      name: v("name"), email: v("email"), phone: "",
      company_name: v("company_name"), website: v("website"),
      message: [v("message"), extra].filter(Boolean).join("\n\n"),
      systems: [],
      consent_text: CONSENT_TEXT, marketing_opt_in: fd.get("marketing") === "on",
      source: meta.source, utm: meta.utm, c_token: meta.c || undefined, _t: Date.now() - t0.current,
      [HONEYPOT]: fd.get(HONEYPOT),
    };
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        track("form_submit", { source: meta.source });
        router.push("/start/booked");
        return;
      }
      setError((await res.json().catch(() => ({}))).error ?? "Something went wrong. Email us instead.");
    } catch {
      setError("Something went wrong. Email us instead.");
    }
    track("form_error");
    setState("error");
  }

  const bad = (k: keyof Errors) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `f-${k}-err` : undefined });

  return (
    <form ref={form} onSubmit={submit} onFocus={onStart} className="space-y-7" noValidate>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
        <Field id="f-name" name="Your name" error={errors.name}><input id="f-name" name="name" maxLength={200} autoComplete="name" className={input} {...bad("name")} /></Field>
        <Field id="f-email" name="Work email" hint="So we can send you times." error={errors.email}><input id="f-email" name="email" type="email" maxLength={254} autoComplete="email" inputMode="email" className={input} {...bad("email")} /></Field>
        <Field id="f-company_name" name="Company" error={errors.company_name}><input id="f-company_name" name="company_name" maxLength={200} autoComplete="organization" defaultValue={defaults?.company} className={input} {...bad("company_name")} /></Field>
        <Field id="f-website" name="Company website" hint="So we can read up before the call." error={errors.website}><input id="f-website" name="website" maxLength={300} autoComplete="url" inputMode="url" placeholder="yourcompany.co.uk" defaultValue={defaults?.website} className={input} {...bad("website")} /></Field>
      </div>

      <fieldset>
        <legend className={label}>Which sounds most like you? <span className="font-normal text-dim">(optional)</span></legend>
        <div className="flex flex-col items-start gap-2 mt-2">
          {SITUATIONS.map((s) => <button key={s.key} type="button" className={chip} aria-pressed={sit === s.key} onClick={() => setSit(sit === s.key ? "" : s.key)}>{s.short}</button>)}
          <button type="button" className={chip} aria-pressed={sit === "other"} onClick={() => setSit(sit === "other" ? "" : "other")}>Something else</button>
        </div>
      </fieldset>

      <Field id="f-message" name="What is slow or painful?" optional hint="A sentence is plenty.">
        <textarea id="f-message" name="message" rows={3} maxLength={3600} className={`${input} resize-none`} />
      </Field>

      {/* Honeypot: people never see it, bots fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty<input name={HONEYPOT} tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
        <input type="checkbox" name="marketing" className="peer sr-only" />
        <span aria-hidden className="mt-0.5 shrink-0 grid place-items-center w-5 h-5 border border-ink rounded-[4px] text-transparent peer-checked:bg-lime peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal text-xs">✓</span>
        <span className="text-sm text-dim">{MARKETING_TEXT} <span className="text-dim/80">(optional, separate from your call)</span></span>
      </label>

      <div>
        <button type="submit" disabled={state === "sending"} className="group inline-flex items-center gap-3 rounded-full bg-ink text-stone font-semibold pl-6 pr-2 py-2 min-h-[48px] disabled:opacity-60">
          {state === "sending" ? "Sending" : "Book a call"}
          <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-lime text-ink transition-transform duration-300 ease-apple group-hover:translate-x-0.5">→</span>
        </button>
        {state === "error" && <p className="mt-3 text-sm font-semibold" role="alert"><span className="note">Problem: {error}</span></p>}
        {Object.keys(errors).length > 0 && <p className="mt-3 text-sm font-semibold" role="alert"><span className="note">Check the fields marked above.</span></p>}
        <p className="mt-5 text-xs text-dim max-w-xl leading-relaxed">
          {CONSENT_TEXT.replace(" Privacy notice: /privacy", "")}{" "}
          <a href="/privacy" className="text-signal underline underline-offset-2">Privacy notice</a>.
        </p>
      </div>
    </form>
  );
}
