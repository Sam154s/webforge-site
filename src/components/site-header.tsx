import Link from "next/link";
import { EMAIL, NAV } from "@/lib/site";
import { TrackLink } from "./track-link";

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-stone/85 backdrop-blur-md">
      <div className="max-w-page mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display font-bold text-lg tracking-[-0.02em] shrink-0">webflow outreach</Link>
        <nav className="flex items-center gap-6 text-sm" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hidden lg:inline text-dim hover:text-ink transition-colors">{n.label}</Link>
          ))}
          <a href={`mailto:${EMAIL}`} className="hidden md:inline text-signal hover:underline underline-offset-4">{EMAIL}</a>
          <TrackLink where="header" href="/diagnostic" className="group flex items-center gap-2 bg-ink text-stone rounded-full pl-4 pr-1.5 py-1.5 whitespace-nowrap">
            <span className="hidden sm:inline">Book a free diagnostic</span><span className="sm:hidden">Free diagnostic</span>
            <span aria-hidden className="grid place-items-center w-6 h-6 rounded-full bg-lime text-ink transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </TrackLink>
        </nav>
      </div>
    </header>
  );
}
