import Link from "next/link";
import { BuilderScene } from "./builder-scene";
import { Reveal } from "./reveal";
import { Cta, TrackLink } from "@/components/track-link";
import { EMAIL } from "@/lib/site";

const STEPS = [
  ["Before we talk", "We read what is public: Companies House, your website and your email settings. Nothing is entered into your site."],
  ["The call", "30 minutes. We ask 12 to 16 plain questions about how work gets done, and what a week looks like."],
  ["The report", "A person checks it, then it appears in your dashboard: each job, what it costs a year as a range, how hard it is to fix, and how sure we are."],
];
const SCOPE = [
  ["Back-office jobs done by hand", "Chasing invoices, chasing quotes, copying between systems, weekly reports."],
  ["Tools for your customers", "Calculators, quote and enquiry forms, booking."],
  ["Website builds", "A new site, or fixing the one that does not bring in work."],
  ["Marketing tools", "Review requests, follow-ups, simple tracking you can read."],
  ["Better use of the AI you already pay for", "Where it helps, where it does not, and how staff should use it."],
];
const PRICES = [
  ["Diagnostic", "Free", "30 minute call and your ranked report. You can stop there and keep it."],
  ["Fix this", "£750 to £1,000", "One audited fix. Signed order, fixed price. £750 for a smaller job, £1,000 for a bigger one. No fee if it fails its tests."],
  ["Builder, then two workflows", "£5,000", "Four weeks. For teams that want to build the rest themselves. Offered after a fix has passed."],
  ["Extra workflows", "£1,000", "Each, built by us. Scoped and agreed before we start."],
  ["Support and AI consulting", "From £1,000 a month", "Re-testing, new tools, advice on where AI fits next. Rolling monthly."],
  ["Websites and customer tools", "Quoted per project", "Priced after the diagnostic, in writing, before any work starts."],
  ["Running costs", "At cost", "Hosting and AI usage on your own accounts, agreed up front."],
];

export default function Home() {
  return (
    <>
      <Reveal />
      <main>
        {/* HERO */}
        <section className="relative min-h-[100svh] overflow-hidden pt-16">
          <span aria-hidden className="drift absolute left-[-2vw] bottom-[-4vw] font-display font-black narrow leading-none tracking-[-0.06em] text-[38vw] md:text-[30vw] text-ink/[0.06] select-none pointer-events-none">
            flow
          </span>
          <div className="relative max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-14 grid md:grid-cols-12 gap-8">
            <p className="fade md:col-start-9 md:col-span-4 text-sm leading-relaxed text-dim md:text-right" style={{ animationDelay: ".9s" }}>
              A free 30 minute diagnostic for UK limited companies with 5 to 50 staff. You get a ranked list of what to fix, with a pound range on each, in your own dashboard.
            </p>
            <h1 className="md:col-start-3 md:col-span-10 font-display font-extrabold tracking-[-0.045em] leading-[0.9] text-[13.5vw] md:text-[7.4vw] md:text-right">
              <span className="mask"><span style={{ animationDelay: ".05s" }}>Find the jobs</span></span>
              <span className="mask"><span style={{ animationDelay: ".17s" }}>costing you money.</span></span>
              <span className="mask"><span style={{ animationDelay: ".29s" }} className="font-medium">Then fix</span></span>
              <span className="mask"><span style={{ animationDelay: ".41s" }} className="font-medium">the first one.</span></span>
            </h1>
          </div>

          <div className="relative max-w-page mx-auto px-5 md:px-10 mt-10 md:-mt-[15vw] pb-14 grid md:grid-cols-12 gap-6 items-end">
            <div className="pop md:col-span-5 lg:col-span-4 bg-lime rounded-[20px] p-6 flex flex-col gap-5 min-h-[19rem]" style={{ animationDelay: ".6s" }}>
              <p className="font-mono text-xs">the path</p>
              <ol className="space-y-3">
                {[["1", "Free diagnostic", "We find and rank the fixes."], ["2", "Fix this", "£750 to £1,000, one audited fix."], ["3", "Builder", "£5,000, only if you want more."]].map(([n, t, d]) => (
                  <li key={n} className="grid grid-cols-[1.6rem_1fr] gap-x-2 leading-snug">
                    <span className="font-mono text-sm pt-0.5">{n}</span>
                    <span><span className="font-semibold">{t}.</span> {d}</span>
                  </li>
                ))}
              </ol>
              <Cta where="hero" className="mt-auto self-start" />
            </div>
            <div className="fade md:col-start-9 md:col-span-4 flex flex-col md:items-end gap-4 text-sm" style={{ animationDelay: "1.1s" }}>
              <TrackLink where="hero-sample" href="/sample-report" className="flex items-center gap-3 group">
                <span aria-hidden className="grid place-items-center w-11 h-11 rounded-full border border-ink transition-transform duration-500 ease-out group-hover:translate-x-1">→</span>
                See a sample report
              </TrackLink>
              <p className="text-dim md:text-right">No card. No obligation. The sample is fictional, so you can see what you would get.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="max-w-page mx-auto px-5 md:px-10 py-24 md:py-36 scroll-mt-16">
          <h2 className="reveal font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[6vw] max-w-[14ch]">
            Three steps. <span className="font-medium text-dim">The first is free.</span>
          </h2>
          <ol className="mt-16 md:mt-20 grid md:grid-cols-3 border-t border-ink">
            {STEPS.map(([t, d], i) => (
              <li key={t} className={`reveal py-8 md:pr-10 border-b md:border-b-0 border-line ${i ? "md:pl-10 md:border-l" : ""}`} style={{ transitionDelay: `${i * 0.12}s` }}>
                <p className="font-mono text-xs text-dim">0{i + 1}</p>
                <h3 className="font-display font-bold text-2xl md:text-3xl tracking-[-0.02em] mt-4 mb-3">{t}</h3>
                <p className="text-dim leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* WHAT WE FIND AND BUILD */}
        <section className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-36 grid md:grid-cols-12 gap-10">
          <h2 className="reveal md:col-span-5 font-display font-bold tracking-[-0.035em] leading-[0.95] text-5xl md:text-7xl">
            What we find and build.
          </h2>
          <div className="md:col-span-6 md:col-start-7">
            <dl>
              {SCOPE.map(([t, d]) => (
                <div key={t} className="reveal border-t border-line py-5">
                  <dt className="font-semibold text-lg">{t}</dt>
                  <dd className="text-dim mt-1">{d}</dd>
                </div>
              ))}
            </dl>
            <p className="reveal border-t border-ink pt-5 text-lg">
              If something should not be automated, the report says so. We would rather lose a job than sell you one you do not need.
            </p>
          </div>
        </section>

        {/* HOW A FIX GETS BUILT: the scroll story */}
        <div className="max-w-page mx-auto px-5 md:px-10">
          <p className="reveal font-mono text-xs text-dim">how a fix gets built</p>
        </div>
        <BuilderScene />

        {/* FIX THIS + WHY PLAIN CODE */}
        <section className="max-w-page mx-auto px-5 md:px-10 py-24 md:py-40 grid md:grid-cols-12 gap-10">
          <h2 className="reveal md:col-span-5 font-display font-bold tracking-[-0.035em] leading-[0.95] text-5xl md:text-7xl">
            Pick one. We fix it.
          </h2>
          <div className="md:col-span-6 md:col-start-7 space-y-8 text-lg md:text-xl leading-relaxed">
            <p className="reveal">
              Choose one item from your report. We scope it, you sign, and we build it for a fixed £750 to £1,000.
            </p>
            <p className="reveal">
              Before it goes live it runs ten times against your own examples.{" "}
              <span className="bg-lime px-1">Same result each time, or you do not pay.</span>
            </p>
            <p className="reveal text-dim">
              What runs every day is ordinary code, not AI guessing. That keeps it predictable, cheap and yours. Code does the sums and the ranking. AI only helps with the words, and a person reads every report before you do.
            </p>
            <p className="reveal text-base">
              <Link href="/method" className="text-signal underline underline-offset-4">Read the method and see a real ten-run test</Link>
            </p>
          </div>
        </section>

        {/* PROOF */}
        <section className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-40">
          <div className="reveal rounded-[24px] border border-ink p-7 md:p-12 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <p className="font-mono text-xs text-dim">fictional example</p>
              <h2 className="font-display font-bold text-4xl md:text-6xl tracking-[-0.03em] leading-[0.95] mt-3">See what a report looks like.</h2>
              <p className="mt-5 text-dim text-lg max-w-xl">A made-up 12 person firm, ten jobs ranked, a pound range on each, and one marked &ldquo;do this first&rdquo;. Every number is illustrative.</p>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <Cta where="proof-sample" href="/sample-report">Open the sample report</Cta>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="bg-ink text-stone rounded-t-[36px] md:rounded-t-[56px] scroll-mt-0">
          <div className="max-w-page mx-auto px-5 md:px-10 py-24 md:py-36">
            <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
              <h2 className="reveal md:col-span-7 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[6vw]">
                What it costs.
              </h2>
              <div className="reveal md:col-span-4 md:col-start-9 text-stone/65 leading-relaxed space-y-3">
                <p>In the order you would meet them. Fixed prices, agreed in writing before any work starts. No day rates.</p>
                <p className="text-sm">Want a rough number first? <Link href="/estimate" className="text-stone underline underline-offset-4">Try the price estimator</Link>.</p>
              </div>
            </div>
            <div className="border-t border-white/15">
              {PRICES.map(([what, price, note], i) => (
                <div key={what} className="reveal grid grid-cols-[1fr_auto] md:grid-cols-12 gap-x-6 gap-y-1 py-6 border-b border-white/15 items-baseline" style={{ transitionDelay: `${i * 0.06}s` }}>
                  <p className="md:col-span-4 text-lg">{what}</p>
                  <p className={`md:col-span-3 font-display font-bold tracking-[-0.02em] num ${price.length > 9 ? "text-xl md:text-2xl leading-tight text-right md:text-left" : "text-3xl md:text-4xl"} ${price === "Free" ? "text-lime" : ""}`}>{price}</p>
                  <p className="col-span-2 md:col-span-5 text-stone/60 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM CTA + CONTACT */}
          <div className="max-w-page mx-auto px-5 md:px-10 pb-20 md:pb-32 grid md:grid-cols-12 gap-10 items-end">
            <h2 className="reveal md:col-span-8 font-display font-extrabold tracking-[-0.045em] leading-[0.9] text-[13vw] md:text-[6.4vw]">
              Find out what is worth fixing. <span className="text-lime">It is free.</span>
            </h2>
            <div className="reveal md:col-span-4 space-y-5">
              <TrackLink where="bottom" href="/diagnostic" className="group inline-flex items-center gap-3 rounded-full bg-lime text-ink font-semibold pl-6 pr-2 py-2 min-h-[44px]">
                Book a free diagnostic
                <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-ink text-lime transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </TrackLink>
              <p className="text-stone/60 text-sm">Or email <a href={`mailto:${EMAIL}`} className="text-stone underline underline-offset-4">{EMAIL}</a></p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
