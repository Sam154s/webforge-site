"use client";

import { motion } from "framer-motion";

interface TextRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function TextReveal({ children, delay = 0, className }: TextRevealProps) {
  return (
    <motion.div
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay, ease: [0.76, 0, 0.24, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
