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
        scrolled ? "bg-bg border-b border-border" : "bg-transparent"
      }`}
    >
      <a href="/" className="font-display text-sm font-medium tracking-[0.2em] text-text uppercase transition-[letter-spacing] duration-500 hover:tracking-[0.35em]">
        WebForge
      </a>
      <nav className="flex items-center gap-8">
        <a href="#how" className="hidden md:inline font-sans text-sm text-text-sec hover:text-text transition-colors">How it works</a>
        <a href="#pricing" className="hidden md:inline font-sans text-sm text-text-sec hover:text-text transition-colors">Pricing</a>
        <a href="#contact" className="font-display text-sm font-medium tracking-wide text-accent hover:text-accent-hover transition-colors duration-200">
          Book a call
        </a>
      </nav>
    </header>
  );
}
