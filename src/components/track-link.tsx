"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import type { ComponentProps } from "react";

// A normal link that also records a cookieless "cta_click" event with where it was clicked.
export function TrackLink({ where, ...props }: ComponentProps<typeof Link> & { where: string }) {
  return <Link {...props} onClick={(e) => { track("cta_click", { where }); props.onClick?.(e); }} />;
}

export function Cta({ where, href = "/diagnostic", children = "Book a free diagnostic", className = "" }: { where: string; href?: string; children?: React.ReactNode; className?: string }) {
  return (
    <TrackLink where={where} href={href} className={`group inline-flex items-center gap-3 rounded-full bg-ink text-stone font-semibold pl-6 pr-2 py-2 min-h-[44px] ${className}`}>
      {children}
      <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-lime text-ink transition-transform duration-300 ease-apple group-hover:translate-x-0.5">→</span>
    </TrackLink>
  );
}
