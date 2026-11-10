import Link from "next/link";
import { COMPANY, EMAIL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-stone">
      <div className="max-w-page mx-auto px-5 md:px-10 py-10 border-t border-white/15 grid md:grid-cols-12 gap-8 text-sm text-stone/60">
        <div className="md:col-span-5 space-y-1">
          <p className="font-display font-bold text-lg tracking-[-0.02em] text-stone">webflow outreach</p>
          <p>{COMPANY.name}, trading as {COMPANY.tradingAs}</p>
          <p>Company number {COMPANY.number}, registered in {COMPANY.place}</p>
          <p>Registered office: {COMPANY.office}</p>
          <p>VAT: {COMPANY.vat} · ICO: {COMPANY.ico}</p>
        </div>
        <div className="md:col-span-3 space-y-1">
          <p className="text-stone">Contact</p>
          <a href={`mailto:${EMAIL}`} className="block hover:text-stone">{EMAIL}</a>
          <Link href="/diagnostic" className="block hover:text-stone">Book a free diagnostic</Link>
        </div>
        <nav className="md:col-span-4 space-y-1" aria-label="Footer">
          <p className="text-stone">Read</p>
          <Link href="/sample-report" className="block hover:text-stone">Sample report</Link>
          <Link href="/method" className="block hover:text-stone">Method and ten-run test</Link>
          <Link href="/estimate" className="block hover:text-stone">What would it cost?</Link>
          <Link href="/privacy" className="block hover:text-stone">Privacy</Link>
          <Link href="/terms" className="block hover:text-stone">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
