"use client";

import { useState } from "react";
import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";

const field =
  "w-full bg-transparent border-b border-border focus:border-accent outline-none py-3 font-sans text-base text-text placeholder:text-text-muted transition-colors";

export function CTA() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) return setState("sent");
    setError((await res.json().catch(() => ({}))).error ?? "Something went wrong. Email us instead.");
    setState("error");
  }

  return (
    <section id="contact" className="relative px-8 py-40 border-t border-border bg-surface overflow-hidden">
      <span
        className="absolute bottom-0 left-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(6rem, 18vw, 16rem)", opacity: 0.025 }}
        aria-hidden="true"
      >
        WEBFORGE
      </span>

      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <TextReveal>
            <h2 className="font-display font-light text-4xl md:text-6xl text-text leading-tight mb-6">
              Tell us where it hurts.
            </h2>
          </TextReveal>
          <FadeUp delay={0.2}>
            <p className="font-sans text-text-sec text-base leading-relaxed max-w-md">
              A few lines is plenty. We&apos;ll reply within two working days to book a 30-minute call.
              If we can&apos;t help, we&apos;ll say so.
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.3}>
          {state === "sent" ? (
            <p className="font-display text-2xl text-text leading-snug">Thanks. We&apos;ll be in touch within two working days.</p>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <label className="block"><span className="sr-only">Your name</span>
                <input name="name" required maxLength={200} autoComplete="name" placeholder="Your name" className={field} /></label>
              <label className="block"><span className="sr-only">Email</span>
                <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email" className={field} /></label>
              <label className="block"><span className="sr-only">Business</span>
                <input name="business" maxLength={200} autoComplete="organization" placeholder="Business" className={field} /></label>
              <label className="block"><span className="sr-only">What&apos;s slowing you down?</span>
                <textarea name="message" rows={3} maxLength={4000} placeholder="What's slowing you down?" className={`${field} resize-none`} /></label>
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="flex items-center gap-6 pt-2">
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="font-display text-sm font-medium tracking-wide px-8 py-4 bg-accent text-bg hover:bg-accent-hover transition-colors duration-200 disabled:opacity-60"
                >
                  {state === "sending" ? "Sending" : "Send"}
                </button>
                {state === "error" && <p className="font-sans text-sm text-text-sec" role="alert">{error}</p>}
              </div>
            </form>
          )}
        </FadeUp>
      </div>
    </section>
  );
}
