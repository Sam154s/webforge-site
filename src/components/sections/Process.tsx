"use client";

import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "We look at your numbers.",
    body: "A 30-minute call. Where enquiries come from, how many turn into work, where the hours go. If nothing is measured yet, measuring it is step one.",
  },
  {
    number: "02",
    title: "We pick one bottleneck.",
    body: "The one costing you most. Before anything is built, we agree in writing how we'll know it's fixed.",
  },
  {
    number: "03",
    title: "We build the lightest thing that works.",
    body: "Sometimes a simple automation. Sometimes a custom tool nobody in your industry has. Never bigger than the problem needs.",
  },
  {
    number: "04",
    title: "We test it before you rely on it.",
    body: "Every system runs ten times against real examples and has to score 8 out of 10 before it goes anywhere near your customers.",
  },
  {
    number: "05",
    title: "It runs on your accounts. You own it.",
    body: "Your hosting, your logins, your data. Each month we report what it's worth and move on to the next bottleneck.",
  },
];

export function Process() {
  return (
    <section id="how" className="relative px-8 py-32 border-t border-border bg-surface overflow-hidden">
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.03 }}
        aria-hidden="true"
      >
        02
      </span>

      <div className="max-w-5xl mx-auto">
        <TextReveal delay={0.1} className="mb-20">
          <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
            How it works.
          </h2>
        </TextReveal>

        <div className="relative">
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
              className="relative grid grid-cols-1 md:grid-cols-[80px_260px_1fr] gap-4 md:gap-12 py-12 border-b border-border items-start"
            >
              <motion.div
                className="absolute hidden md:block w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-surface"
                style={{ left: "35px", top: "52px" }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.4 + i * 0.12, ease: "backOut" }}
              />
              <span className="font-display font-light text-2xl text-text-muted select-none">{step.number}</span>
              <h3 className="font-display font-medium text-lg text-text leading-snug">{step.title}</h3>
              <FadeUp delay={0.1 + i * 0.05}>
                <p className="font-sans text-text-sec text-base leading-relaxed max-w-lg">{step.body}</p>
              </FadeUp>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
