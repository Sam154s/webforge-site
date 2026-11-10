import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { DiagnosticForm } from "./diagnostic-form";
import { landingFor } from "@/lib/outreach";

const base: Metadata = {
  title: "Book a free diagnostic",
  description: "30 minutes on a call. You leave with a ranked list of fixes and what each is worth. Free, for UK limited companies with 5 to 50 staff.",
  alternates: { canonical: "/diagnostic" },
  openGraph: { title: "Book a free diagnostic | Webflow Outreach", url: "/diagnostic" },
};

// A visit with a token (c) is a personal link from an email: keep it out of search results.
export function generateMetadata({ searchParams }: { searchParams: { c?: string } }): Metadata {
  return searchParams.c ? { ...base, robots: { index: false, follow: false } } : base;
}

const GET = [
  "A 30 minute call with Sam",
  "A report in your own dashboard after a person has checked it",
  "A ranked list of fixes, each with a pound range and a confidence grade",
  "One item marked “do this first”",
  "An honest “do not automate” list",
  "The steps to do the first job yourself, if you want to",
];
const FAQ = [
  ["What does it cost?", "Nothing. You can stop after the report and keep it."],
  ["What if I do not want to fix anything?", "Keep the report. There is no obligation and no sales sequence."],
  ["Who sees my data?", "Only us and the services we use to run this. The privacy notice lists them."],
  ["What happens at “Fix this”?", "You pick one item. We agree scope and a fixed price of £750 to £1,000 in writing. It is tested ten times against your examples, and there is no fee if it fails."],
  ["Is AI used?", "For words only. Code works out every number and the ranking, and a person reads the report before you do."],
];

export default async function DiagnosticPage({ searchParams }: { searchParams: { c?: string } }) {
  const known = await landingFor(searchParams.c);
  return (
    <>
      <Reveal />
      <main className="pt-16">
        <section className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-16 grid md:grid-cols-12 gap-10 md:gap-14">
          <div className="md:col-span-5">
            <h1 className="font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[5.6vw]">
              Book your free diagnostic.
            </h1>
            <p className="mt-6 text-lg text-dim leading-relaxed max-w-md">
              30 minutes on a call. You leave with a ranked list of fixes and what each is worth. It is free, and you can stop there.
            </p>
            <p className="mt-6 text-sm bg-lime inline-block px-2 py-1 rounded">For UK limited companies with 5 to 50 staff. Sole traders: not the right fit yet.</p>

            <dl className="mt-10 space-y-6 text-[15px]">
              <div><dt className="font-semibold">What we need from you</dt><dd className="text-dim mt-1">30 minutes, and one export from your accounts or job system. We will show you how. No export, no report, because we will not guess your numbers.</dd></div>
              <div><dt className="font-semibold">What we do beforehand</dt><dd className="text-dim mt-1">Read public information only: Companies House, your website and your email setup. We never fill in your forms or log in to anything.</dd></div>
              <div><dt className="font-semibold">What it is not</dt><dd className="text-dim mt-1">Not a sales call, not legal or financial advice, and not a promise of savings.</dd></div>
            </dl>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <div className="rounded-[24px] border border-ink p-6 md:p-10">
              <DiagnosticForm defaults={known ? { company: known.company, website: known.website } : undefined} />
            </div>
          </div>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-36 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <h2 className="reveal font-display font-bold tracking-[-0.035em] leading-[0.95] text-4xl md:text-6xl">What you get.</h2>
            <ul className="reveal mt-8 space-y-3 text-lg">
              {GET.map((g) => <li key={g} className="border-t border-line pt-3">{g}</li>)}
            </ul>
            <p className="reveal mt-8 text-dim">Not sure yet? <Link href="/sample-report" className="text-signal underline underline-offset-4">See a fictional sample report</Link>.</p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <h2 className="reveal font-display font-bold tracking-[-0.035em] leading-[0.95] text-4xl md:text-6xl">Questions.</h2>
            <dl className="mt-8">
              {FAQ.map(([q, a]) => (
                <div key={q} className="reveal border-t border-line py-5">
                  <dt className="font-semibold text-lg">{q}</dt>
                  <dd className="text-dim mt-1 leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </>
  );
}
