"use client";

import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "We ask. You talk.",
    body: "Not a contact form. Not a brief template you've filled in before. We ask questions that actually get somewhere - your instincts, your taste, what you've always hated about other sites in your industry. It takes about 20 minutes and it shapes everything.",
  },
  {
    number: "02",
    title: "We design. You approve.",
    body: "You see the direction before we write a single line of code. Colours, fonts, layout logic. If something's off, we change it. Nothing gets built until you're happy with where it's going.",
  },
  {
    number: "03",
    title: "We build. Properly.",
    body: "No page builders. No themes. Written from scratch, which means it loads fast, looks right on every screen, and doesn't fall apart six months later when something updates.",
  },
  {
    number: "04",
    title: "You get something you're proud of.",
    body: "It goes live on your domain. You own it outright. And when someone asks for your website, you send it without thinking twice.",
  },
];

export function Process() {
  return (
    <section className="relative px-8 py-32 border-t border-border bg-surface overflow-hidden">

      {/* Ghost number */}
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.03 }}
        aria-hidden="true"
      >
        02
      </span>

      <div className="max-w-5xl mx-auto">

        <FadeUp>
          <span className="inline-block font-sans text-xs text-text-muted tracking-[0.18em] uppercase border border-border px-3 py-1 mb-6">
            Section 02
          </span>
        </FadeUp>

        <TextReveal delay={0.1} className="mb-20">
          <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
            How it works.
          </h2>
        </TextReveal>

        {/* Timeline */}
        <div className="relative">

          {/* Animated vertical line */}
          <motion.div
            className="absolute hidden md:block w-px bg-accent top-0 bottom-0"
            style={{ left: "40px", transformOrigin: "top" }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative grid grid-cols-1 md:grid-cols-[80px_220px_1fr] gap-4 md:gap-12 py-12 border-b border-border items-start"
            >
              {/* Dot on timeline */}
              <motion.div
                className="absolute hidden md:block w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-surface"
                style={{ left: "35px", top: "52px" }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.4 + i * 0.12, ease: "backOut" }}
              />

              <span className="font-display font-light text-2xl text-text-muted select-none">
                {step.number}
              </span>

              <h3 className="font-display font-medium text-lg text-text leading-snug">
                {step.title}
              </h3>

              <FadeUp delay={0.1 + i * 0.05}>
                <p className="font-sans text-text-sec text-base leading-relaxed max-w-lg">
                  {step.body}
                </p>
              </FadeUp>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
