"use client";

import { useState } from "react";

const field = "w-full bg-transparent border-b border-white/20 focus:border-lime outline-none py-3 text-base text-stone placeholder:text-stone/40 transition-colors";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    if (res.ok) return setState("sent");
    setError((await res.json().catch(() => ({}))).error ?? "Something went wrong. Email us instead.");
    setState("error");
  }

  if (state === "sent") {
    return <p className="font-display font-bold text-3xl tracking-[-0.02em]">Thanks. We&apos;ll be in touch within two working days.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block"><span className="sr-only">Your name</span>
        <input name="name" required maxLength={200} autoComplete="name" placeholder="Your name" className={field} /></label>
      <label className="block"><span className="sr-only">Email</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email" className={field} /></label>
      <label className="block"><span className="sr-only">Business</span>
        <input name="business" maxLength={200} autoComplete="organization" placeholder="Business" className={field} /></label>
      <label className="block"><span className="sr-only">What job do you repeat every week?</span>
        <textarea name="message" rows={3} maxLength={4000} placeholder="What job do you repeat every week?" className={`${field} resize-none`} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex items-center gap-6 pt-3">
        <button type="submit" disabled={state === "sending"} className="group inline-flex items-center gap-3 rounded-full bg-lime text-ink font-semibold pl-6 pr-2 py-2 disabled:opacity-60">
          {state === "sending" ? "Sending" : "Send"}
          <span className="grid place-items-center w-8 h-8 rounded-full bg-ink text-lime transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </button>
        {state === "error" && <p className="text-sm text-lime" role="alert">{error}</p>}
      </div>
    </form>
  );
}
