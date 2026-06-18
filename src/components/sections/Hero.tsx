"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-svh flex flex-col justify-between px-8 pt-32 pb-16 overflow-hidden">
      {/* Descriptor — top right */}
      <motion.p
        className="font-sans text-sm text-text-sec tracking-wide max-w-xs ml-auto text-right leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        Bespoke websites built for businesses
        <br />
        that mean it. No templates. No clutter.
        <br />
        Just a site that does its job.
      </motion.p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Brand name — bottom anchored */}
      <div className="relative">
        <motion.h1
          className="font-display font-light leading-none text-text select-none"
          style={{ fontSize: "clamp(4rem, 14vw, 12rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          WEBFORGE
        </motion.h1>

        {/* Scroll indicator */}
        <motion.div
          className="absolute right-0 bottom-0 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <span className="font-sans text-[10px] tracking-[0.18em] text-text-muted uppercase rotate-90 origin-center mb-6">
            Scroll
          </span>
          <div className="w-px h-12 bg-border" />
        </motion.div>
      </div>
    </section>
  );
}
