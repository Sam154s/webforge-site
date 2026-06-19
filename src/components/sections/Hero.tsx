"use client";

import { motion } from "framer-motion";

const CHARS = "WEBFORGE".split("");

export function Hero() {
  return (
    <section
      className="relative min-h-svh flex flex-col justify-between px-8 pt-32 pb-16 overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    >
      {/* Descriptor — top right */}
      <div className="overflow-hidden ml-auto">
        <motion.p
          className="font-sans text-sm text-text-sec tracking-wide max-w-xs text-right leading-relaxed"
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          Bespoke websites built for businesses
          <br />
          that mean it. No templates. No clutter.
          <br />
          Just a site that does its job.
        </motion.p>
      </div>

      <div className="flex-1" />

      {/* Drawing rule */}
      <motion.div
        className="h-px bg-border mb-8"
        style={{ transformOrigin: "left" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Brand name + scroll indicator */}
      <div className="relative">
        <h1
          className="font-display font-light leading-none text-text select-none"
          style={{ fontSize: "clamp(4rem, 14vw, 12rem)" }}
        >
          {CHARS.map((char, i) => (
            <span
              key={i}
              style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
            >
              <motion.span
                style={{ display: "inline-block" }}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 0.75,
                  delay: 0.25 + i * 0.045,
                  ease: [0.76, 0, 0.24, 1],
                }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Scroll indicator */}
        <motion.div
          className="absolute right-0 bottom-0 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <span className="font-sans text-[10px] tracking-[0.18em] text-text-muted uppercase rotate-90 origin-center mb-6">
            Scroll
          </span>
          <motion.div
            className="w-px bg-accent"
            initial={{ height: 0 }}
            animate={{ height: 48 }}
            transition={{ duration: 1, delay: 1.7, ease: [0.76, 0, 0.24, 1] }}
          />
        </motion.div>
      </div>
    </section>
  );
}
