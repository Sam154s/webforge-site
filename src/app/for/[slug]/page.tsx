import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "../../reveal";
import { Cta } from "@/components/track-link";
import { AttrCapture } from "@/components/attr-capture";
import { EMAIL } from "@/lib/site";
import { LANDINGS, bySlug } from "@/lib/landing";

export const dynamicParams = false;
export const generateStaticParams = () => LANDINGS.map((l) => ({ slug: l.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const l = bySlug(params.slug);
  if (!l) return {};
  return {
    title: l.title,
    description: l.description,
    // Email destinations, not search pages.
    robots: { index: false, follow: true },
    alternates: { canonical: `/for/${l.slug}` },
    openGraph: { title: `${l.title} | Webflow Outreach`, description: l.description, url: `/for/${l.slug}` },
  };
}

export default function Landing({ params }: { params: { slug: string } }) {
  const l = bySlug(params.slug);
  if (!l) notFound();
  const href = `/diagnostic?src=for-${l.slug}`;
  return (
    <>
      <Reveal />
      <AttrCapture slug={l.slug} />
      <main className="pt-16">
        <section className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-16">
          <h1 className="font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[7vw] max-w-[18ch]">
            <span className="mask"><span style={{ animationDelay: ".05s" }}>{l.h1[0]}</span></span>
            <span className="mask"><span style={{ animationDelay: ".2s" }} className="font-medium text-dim">{l.h1[1]}</span></span>
          </h1>
          <p className="fade mt-8 text-lg text-dim max-w-xl leading-relaxed" style={{ animationDelay: ".6s" }}>{l.lead}</p>
          <div className="fade mt-8 flex flex-wrap items-center gap-6" style={{ animationDelay: ".8s" }}>
            <Cta where={`landing-${l.slug}-top`} href={href} />
            <Link href="/sample-report" className="text-signal underline underline-offset-4">See a sample report</Link>
          </div>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-16">
          <h2 className="font-display font-bold tracking-[-0.035em] text-3xl md:text-5xl">What the diagnostic finds.</h2>
          <ol className="mt-8 grid md:grid-cols-3 border-t border-ink">
            {l.finds.map(([t, d], i) => (
              <li key={t} className={`reveal py-7 md:pr-8 border-b md:border-b-0 border-line ${i ? "md:pl-8 md:border-l" : ""}`}>
                <p className="font-mono text-xs text-dim">0{i + 1}</p>
                <h3 className="font-display font-bold text-xl tracking-[-0.02em] mt-3 mb-2">{t}</h3>
                <p className="text-dim leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-16">
          <div className="reveal rounded-[24px] bg-ink text-stone p-6 md:p-10">
            <p className="font-mono text-xs text-lime">{l.excerptLabel} · numbers are illustrative</p>
            <div className="mt-6">
              {l.excerpt.map((r) => (
                <div key={r.job} className="grid md:grid-cols-12 gap-x-6 gap-y-1 py-5 border-t border-white/15 items-baseline">
                  <p className="md:col-span-5 font-semibold">{r.job}</p>
                  <p className="md:col-span-3 num">{r.range}</p>
                  <p className="md:col-span-1 font-mono text-sm text-stone/60">Grade {r.grade}</p>
                  <p className="md:col-span-1 font-mono text-sm text-stone/60">{r.hours}</p>
                  <p className="md:col-span-2"><span className="inline-block rounded-full bg-lime text-ink px-3 py-1 text-sm">{r.lane}</span></p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-stone/55">Estimates, not promises. Every figure is a range. <Link href="/sample-report" className="text-stone underline underline-offset-4">The full fictional report</Link>.</p>
          </div>
        </section>

        <section className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-32 grid md:grid-cols-12 gap-8 items-end">
          <h2 className="md:col-span-7 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[5vw]">Free. 30 minutes. You can stop at the report.</h2>
          <div className="md:col-span-5 space-y-4">
            <Cta where={`landing-${l.slug}-bottom`} href={href} />
            <p className="text-sm text-dim">Or email <a href={`mailto:${EMAIL}`} className="text-signal underline underline-offset-4">{EMAIL}</a></p>
            <p className="text-xs text-dim leading-relaxed">
              Got here from an email from us? We contact UK limited companies about this offer. Reply &ldquo;no&rdquo; to stop, and we will not contact you again. How we got your details and what we do with them: <Link href="/privacy" className="text-signal underline underline-offset-2">privacy notice</Link>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
