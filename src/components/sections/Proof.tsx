import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";

export function Proof() {
  return (
    <section className="relative px-8 py-32 border-t border-border bg-surface overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-12 md:gap-16 items-start">
        <div>
          <TextReveal delay={0.1}>
            <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight mb-8">
              You see what it&apos;s worth.
            </h2>
          </TextReveal>
          <FadeUp delay={0.2}>
            <p className="font-sans text-text-sec text-base leading-relaxed mb-6">
              Every client gets a page like this. What we found, what&apos;s live, and what it&apos;s
              adding, shown as a range and after running costs. The systems log their own results,
              so the numbers aren&apos;t our opinion.
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="font-sans text-text-sec text-base leading-relaxed">
              Built by the team behind Vernus, AI admin software for NHS general practice.
            </p>
          </FadeUp>
        </div>

        
        <FadeUp delay={0.2}>
          <figure>
            <img
              src="/dashboard-example.png"
              alt="Example client dashboard for a fictional plumbing business, showing value added by missed-call text-back and a quote chaser"
              className="w-full border border-border"
              loading="lazy"
            />
            <figcaption className="font-sans text-xs text-text-muted mt-3">
              Example page for a fictional business. Figures are illustrative.
            </figcaption>
          </figure>
        </FadeUp>
      </div>
    </section>
  );
}
