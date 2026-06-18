import { FadeUp } from "@/components/ui/FadeUp";

export function CTA() {
  return (
    <section id="contact" className="px-8 py-32 border-t border-border bg-surface">
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <h2 className="font-display font-light text-4xl md:text-5xl text-text leading-tight mb-6 max-w-2xl">
            Ready to have a website you&apos;re not embarrassed by?
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <p className="font-sans text-text-sec text-base leading-relaxed max-w-md mb-12">
            Tell us about your business and we&apos;ll take it from there.
            No calls required to get&nbsp;started.
          </p>
        </FadeUp>

        <FadeUp delay={0.2}>
          <a
            href="/packages"
            className="inline-block font-display text-sm font-medium tracking-wide uppercase px-8 py-4 bg-accent text-bg hover:bg-accent-hover transition-colors duration-200"
            style={{ borderRadius: 0 }}
          >
            Begin your build
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
