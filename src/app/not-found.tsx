import type { Metadata } from "next";
import Link from "next/link";
import { Cta } from "@/components/track-link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="pt-16">
      <section className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-24 md:pb-36">
        <h1 className="font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[5.6vw] max-w-[16ch]">
          We cannot find that page.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-dim leading-relaxed">The link may be old or mistyped. Start from the home page, or book the free diagnostic.</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Cta where="not-found">Book a free diagnostic</Cta>
          <Link href="/" className="text-signal underline underline-offset-4 py-3">Back to the home page</Link>
        </div>
      </section>
    </main>
  );
}
