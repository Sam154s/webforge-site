import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "../../reveal";
import { Cta, TrackLink } from "@/components/track-link";
import { AttrCapture } from "@/components/attr-capture";
import { Flow } from "@/components/flow";
import { EMAIL, social } from "@/lib/site";
import { SITUATIONS, situation } from "@/lib/situations";
import { landingFor, validToken, type Evidence } from "@/lib/outreach";

export const dynamicParams = false;
export const dynamic = "force-dynamic"; // reads ?c= on every request
export const generateStaticParams = () => SITUATIONS.map((s) => ({ slug: s.key }));

// A code typed by hand may arrive with capitals or spaces, so tidy it first.
const tidy = (c: unknown) => (typeof c === "string" ? c.trim().toLowerCase() : "");

// The title follows the content: if the code belongs to a different situation than the address, both use the code's.
// landingFor is cached per request, so this and the page share one lookup.
export async function generateMetadata({ params, searchParams }: { params: { slug: string }; searchParams: { c?: string } }): Promise<Metadata> {
  const asked = situation(params.slug);
  if (!asked) return {};
  const known = await landingFor(tidy(searchParams.c));
  const s = situation(known?.situation ?? "") ?? asked;
  return {
    title: s.title,
    description: s.description,
    // Email destinations, not search pages.
    robots: { index: false, follow: false },
    alternates: { canonical: `/for/${s.key}` },
    ...social(`${s.title} | Webflow Outreach`, `/for/${s.key}`, s.description),
  };
}

const KIND: Record<Evidence["kind"], string> = { job_advert: "From a job advert you published", website: "From your website", filing: "From a filing at Companies House" };
const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };

const LEAVE = [
  ["A ranked list", "Every problem we find, with a pound range and a payback on each."],
  ["One thing working", "On your real data. Small, but it runs."],
  ["A fixed quote", "For the first build, with the written pass test attached."],
];

// The token and the company name stay out of the title, the description and analytics. They only appear in the page body.
export default async function Landing({ params, searchParams }: { params: { slug: string }; searchParams: { c?: string } }) {
  const asked = situation(params.slug);
  if (!asked) notFound();
  // One lookup per page load, shared with generateMetadata.
  const c = tidy(searchParams.c);
  const known = await landingFor(c);
  // The engine knows which situation fits the company. If it differs from the address, show the engine's.
  const s = situation(known?.situation ?? "") ?? asked;
  const href = `/start?src=for-${s.key}&situation=${s.key}${validToken(c) ? `&c=${c}` : ""}`;
  const evidence = known?.evidence ?? [];
  return (
    <>
      <Reveal />
      <AttrCapture slug={s.key} />
      <main className="sb sub">
        <section className="sub-hero">
          <div className="wrap">
            <p className="slate"><span>{known ? `For ${known.company}` : "A private page"}</span></p>
            <h1 className="h1" style={{ maxWidth: "19ch" }}>{s.h1[0]}<span>{s.h1[1]}</span></h1>
            <p className="lede">{s.lead}</p>
            <div className="btn-row fade" style={{ animationDelay: ".3s" }}>
              {known?.artefactUrl && (
                <TrackLink where={`landing-${s.key}-artefact`} href={known.artefactUrl} target="_blank" rel="noopener" className="open-tool">Open the working version <i aria-hidden>→</i></TrackLink>
              )}
              <Cta where={`landing-${s.key}-top`} href={href} prefetch={false} className={known?.artefactUrl ? "!bg-transparent !text-ink border-[1.5px] border-ink" : ""} />
            </div>
            {known?.artefactUrl && <p className="fine">We built a small working version from what your company has published. It uses none of your private data.</p>}
          </div>
        </section>

        {evidence.length > 0 && (
          <section className="frame">
            <div className="wrap cols">
              <div>
                <h2 className="h2 reveal">What we saw. <span>In your own published words.</span></h2>
                <p className="fine reveal">Only things your company has published. Nothing private, and nothing about any one person.</p>
              </div>
              <ul className="saw">
                {evidence.map((e, i) => (
                  <li key={i} className="reveal">
                    <blockquote>&ldquo;{e.quote}&rdquo;</blockquote>
                    <p>
                      <span>{KIND[e.kind]}</span>
                      {e.seenOn && <span>Seen on {day(e.seenOn)}</span>}
                      {e.url && <a href={e.url} target="_blank" rel="nofollow noopener noreferrer">Source: {host(e.url)}</a>}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">From A to B. <span>What we would build.</span></h2>
            <div style={{ marginTop: 36 }}><Flow s={s} /></div>
            <p className="fine reveal">A sketch, not a design. We draw yours after watching the real work. Code runs most of it. AI is used only where judgement is needed, and a named person checks the exceptions.</p>
          </div>
        </section>

        <section className="frame dark slab">
          <div className="wrap cols">
            <div>
              <p className="slate reveal"><span>The Diagnosis</span></p>
              <h2 className="h2 reveal">£3,500 fixed. <span>We come in and measure it.</span></h2>
              <p className="end-p reveal">We sit in with your team, measure the work, and leave you with three things. The fee is credited in full against a build signed within 30 days.</p>
              <p className="fine reveal"><Link href="/pricing">Every price</Link>.</p>
            </div>
            <div className="also" style={{ marginTop: 0 }}>
              {LEAVE.map(([t, d], i) => <div key={t} className="reveal"><span>{i + 1} of 3</span><b>{t}</b><p>{d}</p></div>)}
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">It starts with a call. <span>Free, 30 minutes.</span></h2>
            <div>
              <p className="lede reveal" style={{ marginTop: 0, color: "var(--ink)" }}>Tell us what is slow. We will say whether it is something we fix. If it is not a fit, we will say so.</p>
              <div className="btn-row reveal">
                <Cta where={`landing-${s.key}-bottom`} href={href} prefetch={false} />
                <p style={{ fontSize: 14 }}>Or email <a href={`mailto:${EMAIL}`} className="text-signal underline underline-offset-4">{EMAIL}</a></p>
              </div>
              <p className="fine reveal">
                Got here from an email from us? We contact UK limited companies about this offer. Reply &ldquo;stop&rdquo; or email us, and we will not contact you again. How we hold your company&rsquo;s details, and how to object: <Link href="/privacy#contacted">privacy notice</Link>.{!known && <> Have a code from a letter? <Link href="/for">Type it here</Link>.</>}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
