"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const x = useSpring(cursorX, { stiffness: 500, damping: 45 });
  const y = useSpring(cursorY, { stiffness: 500, damping: 45 });

  useEffect(() => {
    setMounted(true);
    const move = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    const over = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("a, button, [role='button']")) setHovered(true);
    };
    const out = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.("a, button, [role='button']")) setHovered(false);
    };
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[10000] pointer-events-none hidden md:flex items-center justify-center mix-blend-difference"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        className="rounded-full bg-white"
        animate={{ width: hovered ? 44 : 10, height: hovered ? 44 : 10 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    </motion.div>
  );
}
