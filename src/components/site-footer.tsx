import Link from "next/link";
import { EMAIL } from "@/lib/site";
import { COMPANY } from "@/lib/company";

const READ = [["/pricing", "Pricing"], ["/about", "About"], ["/examples", "Examples"], ["/quote", "Quoting calculator"]];

// Company facts appear only when they are set (see lib/company.ts). Nothing is invented here.
export function SiteFooter() {
  return (
    <footer className="bg-ink text-stone">
      <div className="max-w-page mx-auto px-5 md:px-10 py-10 border-t border-white/15 grid md:grid-cols-12 gap-8 text-sm text-stone/65">
        <div className="md:col-span-5 space-y-1">
          <p className="font-display font-bold text-lg tracking-[-0.02em] text-stone">webflow outreach</p>
          {COMPANY.name && <p className="pt-2">{COMPANY.name}, trading as {COMPANY.tradingAs}</p>}
          {(COMPANY.number || COMPANY.registeredIn) && (
            <p>
              {COMPANY.number && `Company number ${COMPANY.number}`}
              {COMPANY.number && COMPANY.registeredIn && ", "}
              {COMPANY.registeredIn && `${COMPANY.number ? "registered" : "Registered"} in ${COMPANY.registeredIn}`}
            </p>
          )}
          {COMPANY.address && <p>Registered office: {COMPANY.address}</p>}
          {(COMPANY.vat || COMPANY.ico) && (
            <p>
              {COMPANY.vat && `VAT: ${COMPANY.vat}`}
              {COMPANY.vat && COMPANY.ico && " · "}
              {COMPANY.ico && `ICO: ${COMPANY.ico}`}
            </p>
          )}
        </div>
        <div className="md:col-span-3 space-y-0">
          <p className="text-stone">Contact</p>
          <a href={`mailto:${EMAIL}`} className="flex items-center min-h-[44px] hover:text-stone">{EMAIL}</a>
          <Link href="/start" className="flex items-center min-h-[44px] hover:text-stone">Book a call</Link>
          <p className="pt-4 text-stone">Legal</p>
          <Link href="/privacy" className="flex items-center min-h-[44px] hover:text-stone">Privacy</Link>
          <Link href="/terms" className="flex items-center min-h-[44px] hover:text-stone">Terms</Link>
        </div>
        <nav className="md:col-span-4 space-y-1" aria-label="Footer">
          <p className="text-stone">Read</p>
          {READ.map(([href, label]) => <Link key={href} href={href} className="flex items-center min-h-[44px] hover:text-stone">{label}</Link>)}
        </nav>
        <p className="md:col-span-12 text-xs text-stone/50">This site counts visits without cookies. <Link href="/privacy" className="underline underline-offset-2">How, and how to object</Link>.</p>
      </div>
    </footer>
  );
}
