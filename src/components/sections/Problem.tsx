import { FadeUp } from "@/components/ui/FadeUp";

export function Problem() {
  return (
    <section className="px-8 py-32 border-t border-border">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[80px_1fr] gap-8 md:gap-16 items-start">

        <FadeUp>
          <span className="font-display font-light text-5xl text-text-muted select-none">
            01
          </span>
        </FadeUp>

        <div className="space-y-8">
          <FadeUp delay={0.1}>
            <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
              Bespoke website design. Accessible.
            </h2>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="font-sans text-text-sec text-base leading-relaxed max-w-xl">
              When did you last feel good about sending someone your website link?
              If you had to think about that - that&apos;s the answer.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="font-sans text-text-sec text-base leading-relaxed max-w-xl">
              WebForge builds custom websites for businesses that are good at what they do,
              but don&apos;t have the time or the technical know-how to show it properly.
              We handle the whole thing. Questions, design, build, launch.
              You approve it at every step, and you end up with something you&apos;re
              genuinely happy to put in front of people.
            </p>
          </FadeUp>

          <FadeUp delay={0.4}>
            <p className="font-sans text-text-sec text-base leading-relaxed max-w-xl">
              No templates. No Squarespace. No handing you a login and calling it done.
            </p>
          </FadeUp>
        </div>

      </div>
    </section>
  );
}
