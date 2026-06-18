"use client";

import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between transition-colors duration-500 ${
        scrolled ? "bg-bg/90 backdrop-blur-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <span className="font-display text-sm font-medium tracking-[0.2em] text-text uppercase">
        WebForge
      </span>
      <a
        href="/packages"
        className="font-display text-sm font-medium tracking-wide text-accent hover:text-accent-hover transition-colors duration-200 uppercase"
      >
        Begin your build
      </a>
    </header>
  );
}
