import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";

const rows = [
  ["Calls and enquiries that go unanswered", "Instant replies and text-backs, so a missed call stops being a lost job."],
  ["Quotes that go quiet", "Follow-ups that chase at the right moment, with a test group so you can see they work."],
  ["Hours lost to admin", "Inbox sorting, data entry and paperwork handled, with a person checking where it matters."],
  ["A tool your industry doesn't have yet", "Custom software. A design visualiser for an architecture practice. A photo-tour builder for an estate agent."],
  ["No clear view of what's working", "A live page of the numbers that matter, updated by the systems themselves."],
];

export function Build() {
  return (
    <section id="build" className="relative px-8 py-32 border-t border-border overflow-hidden">
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.035 }}
        aria-hidden="true"
      >
        03
      </span>

      <div className="max-w-5xl mx-auto">
        <TextReveal delay={0.1} className="mb-4">
          <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">What we build.</h2>
        </TextReveal>
        <FadeUp delay={0.15}>
          <p className="font-sans text-text-sec text-base mb-14 max-w-lg">
            Examples. What we build depends on what we find.
          </p>
        </FadeUp>

        <div className="border-t border-border">
          {rows.map(([problem, fix], i) => (
            <FadeUp key={problem} delay={0.05 * i}>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-2 md:gap-12 py-7 border-b border-border">
                <p className="font-display text-lg text-text leading-snug">{problem}</p>
                <p className="font-sans text-text-sec text-base leading-relaxed">{fix}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
