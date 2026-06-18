import { FadeUp } from "@/components/ui/FadeUp";

export function Testimonial() {
  return (
    <section className="px-8 py-32 border-t border-border bg-surface">
      <div className="max-w-4xl mx-auto">
        <FadeUp>
          <span
            className="block font-display font-light leading-none mb-8 select-none"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", color: "var(--accent)" }}
          >
            &ldquo;
          </span>
        </FadeUp>

        <FadeUp delay={0.1}>
          <blockquote className="font-display font-light text-2xl md:text-3xl text-text leading-relaxed mb-10">
            We&apos;d had the same Wix site for four years. WebForge delivered something we actually
            want to send to clients. The whole process took two weeks and we didn&apos;t have to think
            about a single thing.
          </blockquote>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="font-sans text-sm text-text-sec tracking-wide">
            - Spranki (Medical education), London
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
