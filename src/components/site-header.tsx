"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { EMAIL, NAV } from "@/lib/site";
import { TrackLink } from "./track-link";

// The header on every page except the homepage (which has the A to B rail). Contact is always in it.
export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-stone/90 backdrop-blur-md border-b border-line">
      <div className="max-w-page mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="font-display font-bold text-lg tracking-[-0.02em] shrink-0">webflow outreach</Link>
        <nav className="flex items-center gap-2 sm:gap-5 text-sm" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined} className={`hidden lg:inline hover:text-ink transition-colors ${path === n.href ? "text-ink font-semibold" : "text-dim"}`}>{n.label}</Link>
          ))}
          <button type="button" className="menu-btn lg:hidden" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
          <TrackLink where="header" href="/start" className="group flex items-center gap-2 min-h-[44px] bg-ink text-stone rounded-full pl-3.5 sm:pl-4 pr-1.5 py-1.5 whitespace-nowrap">
            Book a call
            <span aria-hidden className="grid place-items-center w-6 h-6 rounded-full bg-lime text-ink transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </TrackLink>
        </nav>
      </div>
      {open && (
        <div id="site-menu" className="menu-panel lg:hidden">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>)}
          <a className="mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      )}
    </header>
  );
}
