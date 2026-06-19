"use client";

// ponytail: Lenis removed — it sets overflow:hidden on <html> and freezes scroll if RAF misfires.
// CSS scroll-behavior: smooth in globals.css covers the use case.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
