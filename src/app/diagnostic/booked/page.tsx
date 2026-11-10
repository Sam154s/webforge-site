import type { Metadata } from "next";
import Link from "next/link";
import { BOOKING_URL, EMAIL } from "@/lib/site";
import { TrackLink } from "@/components/track-link";

export const metadata: Metadata = {
  title: "Request received",
  description: "What happens next, what to bring, and how to export your invoice list.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/diagnostic/booked" },
};

const NEXT = [
  ["Pick a time", BOOKING_URL ? "Use the button above. It takes a minute." : "We will email you times, normally within one working day."],
  ["Send one export", "Before the call, send us one list from your accounts or job system. No export, no report, because we will not guess your numbers. How to get it is below."],
  ["The call", "30 minutes. We ask 12 to 16 plain questions about how work gets done. Not a sales call."],
  ["Your report", "After a person has checked it, it appears in your dashboard: a ranked list with a pound range and confidence grade on each."],
];
const BRING = [
  "Your most recent aged debtors report, or an unpaid invoices list",
  "Your invoice list for the last 6 to 12 months",
  "Your quote list, if you send quotes",
  "Someone who knows how jobs get invoiced, if that is not you",
];
const EXPORTS: [string, string[]][] = [
  ["Xero", ["Aged debtors: Reports > Aged Receivables Detail > Export > CSV.", "Invoices: Business > Invoices > All > Export.", "Quotes: Business > Quotes > Export."]],
  ["QuickBooks", ["Aged debtors: Reports > search “A/R Ageing Detail” > Export > Excel.", "Invoices: Sales > All sales > filter Invoices > export icon.", "Quotes: Sales > All sales > filter Quotes > export icon."]],
  ["Sage", ["Aged debtors: Reports > Aged Debtors > Export > CSV.", "Invoices: Sales > Sales Invoices > export icon.", "Quotes: Sales > Quotes & Estimates > export icon."]],
  ["FreeAgent", ["Aged debtors: Reports > Aged Debtors > Export CSV.", "Invoices: Invoices > export (CSV).", "Quotes: Estimates > export (CSV)."]],
];

export default function Booked() {
  return (
    <main className="pt-16">
      <section className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-12">
        <p className="font-mono text-xs text-dim">request received</p>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[6vw] max-w-[16ch]">
          Thanks. Here is what happens next.
        </h1>
        <div className="mt-8">
          {BOOKING_URL ? (
            <TrackLink where="booked-book" href={BOOKING_URL} className="group inline-flex items-center gap-3 rounded-full bg-ink text-stone font-semibold pl-6 pr-2 py-2 min-h-[44px]">
              Pick a time for your call
              <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-lime text-ink transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </TrackLink>
          ) : (
            <p className="text-lg bg-lime inline-block px-2 py-1 rounded">We will email you times, normally within one working day.</p>
          )}
        </div>
      </section>

      <section className="max-w-page mx-auto px-5 md:px-10 pb-16 grid md:grid-cols-12 gap-10">
        <ol className="md:col-span-7 border-t border-ink">
          {NEXT.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-x-2 py-6 border-b border-line">
              <span className="font-mono text-xs text-dim pt-1.5">0{i + 1}</span>
              <div><h2 className="font-display font-bold text-2xl tracking-[-0.02em]">{t}</h2><p className="text-dim mt-1 leading-relaxed">{d}</p></div>
            </li>
          ))}
        </ol>
        <div className="md:col-span-4 md:col-start-9">
          <h2 className="font-display font-bold text-2xl tracking-[-0.02em]">What to bring</h2>
          <ul className="mt-4 space-y-3">
            {BRING.map((b) => <li key={b} className="border-t border-line pt-3">{b}</li>)}
          </ul>
          <p className="mt-6 text-dim">Want to see the end result first? <Link href="/sample-report" className="text-signal underline underline-offset-4">Open the sample report</Link>.</p>
        </div>
      </section>

      <section className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-36">
        <h2 className="font-display font-extrabold tracking-[-0.04em] leading-[0.95] text-4xl md:text-6xl">How to export your lists.</h2>
        <p className="mt-4 text-dim max-w-2xl">Menu names change a little between versions. If yours differ, send the closest list you can find and we will say before the call whether it will do. Read-only exports only. Never send a password or bank login.</p>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPORTS.map(([sys, steps]) => (
            <div key={sys} className="rounded-[20px] border border-ink p-6">
              <h3 className="font-display font-bold text-2xl tracking-[-0.02em]">{sys}</h3>
              <ul className="mt-4 space-y-3 text-[15px] text-dim leading-snug">{steps.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-dim">Send exports by reply to our email, or to <a href={`mailto:${EMAIL}`} className="text-signal underline underline-offset-4">{EMAIL}</a>. Something else you use? Tell us and we will say what to send.</p>
      </section>
    </main>
  );
}
