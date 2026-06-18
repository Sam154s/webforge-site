import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function CTA() {
  return (
    <section
      id="contact"
      className="relative px-8 py-40 border-t border-border bg-surface overflow-hidden"
    >
      {/* Ghost wordmark behind content */}
      <span
        className="absolute bottom-0 left-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(6rem, 18vw, 16rem)", opacity: 0.025 }}
        aria-hidden="true"
      >
        WEBFORGE
      </span>

      <div className="max-w-5xl mx-auto relative z-10">
        <TextReveal>
          <h2 className="font-display font-light text-4xl md:text-6xl text-text leading-tight mb-6 max-w-2xl">
            Ready to have a website you&apos;re not embarrassed by?
          </h2>
        </TextReveal>

        <FadeUp delay={0.2}>
          <p className="font-sans text-text-sec text-base leading-relaxed max-w-md mb-14">
            Tell us about your business and we&apos;ll take it from there.
            No calls required to get&nbsp;started.
          </p>
        </FadeUp>

        <FadeUp delay={0.35}>
          <MagneticButton strength={0.25} className="inline-block">
            <a
              href="/packages"
              className="inline-block font-display text-sm font-medium tracking-[0.15em] uppercase px-10 py-5 bg-accent text-bg hover:bg-accent-hover transition-colors duration-200"
            >
              Begin your build
            </a>
          </MagneticButton>
        </FadeUp>
      </div>
    </section>
  );
}
