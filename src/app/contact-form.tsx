"use client";

import { useState } from "react";

const field = "w-full bg-transparent border-b border-rule focus:border-ink outline-none py-3 text-base placeholder:text-graphite/70 transition-colors";

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
    return <p className="font-serif text-2xl leading-snug md:pt-16">Thanks. We&apos;ll be in touch within two working days.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-6 md:pt-16">
      <label className="block"><span className="sr-only">Your name</span>
        <input name="name" required maxLength={200} autoComplete="name" placeholder="Your name" className={field} /></label>
      <label className="block"><span className="sr-only">Email</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email" className={field} /></label>
      <label className="block"><span className="sr-only">Business</span>
        <input name="business" maxLength={200} autoComplete="organization" placeholder="Business" className={field} /></label>
      <label className="block"><span className="sr-only">What would you like a tool to do?</span>
        <textarea name="message" rows={3} maxLength={4000} placeholder="What would you like a tool to do?" className={`${field} resize-none`} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex items-center gap-6 pt-2">
        <button type="submit" disabled={state === "sending"} className="bg-ink text-sheet px-8 py-3.5 hover:bg-oxide transition-colors disabled:opacity-60">
          {state === "sending" ? "Sending" : "Send"}
        </button>
        {state === "error" && <p className="text-sm text-oxide-deep" role="alert">{error}</p>}
      </div>
    </form>
  );
}
