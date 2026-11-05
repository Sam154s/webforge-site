import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";

export function Problem() {
  return (
    <section className="relative px-8 py-32 border-t border-border overflow-hidden">
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.035 }}
        aria-hidden="true"
      >
        01
      </span>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-12 md:gap-24 items-start">
          <div>
            <TextReveal delay={0.1}>
              <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight mb-8">
                You don&apos;t need more AI. You need one problem fixed properly.
              </h2>
            </TextReveal>
            <FadeUp delay={0.3}>
              <p className="font-display font-light text-xl md:text-2xl text-text leading-snug">
                Where does work pile up, or money leak out, every single week?
              </p>
            </FadeUp>
          </div>

          <div className="space-y-6">
            <FadeUp delay={0.2}>
              <p className="font-sans text-text-sec text-base leading-relaxed">
                Plenty of businesses have tried an AI tool or two. Very few have changed how the
                business actually runs. The most common reason owners give is that they can&apos;t
                see where it would help.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="font-sans text-text-sec text-base leading-relaxed">
                So we start with your numbers, not a product. Missed calls. Quotes that go quiet.
                Hours lost to admin. A process only one person understands. We find the one that
                costs you most and fix that first.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <p className="font-sans text-text-sec text-base leading-relaxed">
                Then we measure it, every month, in pounds and hours. When it&apos;s fixed, we move
                to the next one.
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
