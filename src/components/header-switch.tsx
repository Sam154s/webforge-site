"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// The homepage gets the storyboard rail as its header. Every other page keeps the normal one.
export function HeaderSwitch({ home, other }: { home: ReactNode; other: ReactNode }) {
  return usePathname() === "/" ? home : other;
}
