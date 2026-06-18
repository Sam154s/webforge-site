import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";

export function Problem() {
  return (
    <section className="relative px-8 py-32 border-t border-border overflow-hidden">

      {/* Ghost section number */}
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.035 }}
        aria-hidden="true"
      >
        01
      </span>

      <div className="max-w-5xl mx-auto">

        {/* Section label */}
        <FadeUp>
          <span className="inline-block font-sans text-xs text-text-muted tracking-[0.18em] uppercase border border-border px-3 py-1 mb-12">
            Section 01
          </span>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-12 md:gap-24 items-start">

          <div>
            <TextReveal delay={0.1}>
              <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight mb-8">
                Bespoke website design. Accessible.
              </h2>
            </TextReveal>

            <FadeUp delay={0.3}>
              <p className="font-display font-light text-xl md:text-2xl text-text leading-snug">
                &ldquo;When did you last feel good about sending someone your website link?&rdquo;
              </p>
            </FadeUp>
          </div>

          <div className="space-y-6">
            <FadeUp delay={0.2}>
              <p className="font-sans text-text-sec text-base leading-relaxed">
                If you had to think about that — that&apos;s the answer.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="font-sans text-text-sec text-base leading-relaxed">
                WebForge builds custom websites for businesses that are good at what they do,
                but don&apos;t have the time or the technical know-how to show it properly.
                We handle the whole thing. Questions, design, build, launch.
                You approve it at every step, and you end up with something you&apos;re
                genuinely happy to put in front of people.
              </p>
            </FadeUp>

            <FadeUp delay={0.4}>
              <p className="font-sans text-text-sec text-base leading-relaxed">
                No templates. No Squarespace. No handing you a login and calling it done.
              </p>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
}
