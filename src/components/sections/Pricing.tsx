import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";

const prices = [
  ["First call", "Free", "30 minutes. We look at your numbers and tell you honestly whether we can help."],
  ["First project", "£900 to £3,000", "A fixed price, agreed in writing before we start. Depends on what we find."],
  ["Running and improving it", "£300 to £500 a month", "Monitoring, monthly results, and the next bottleneck. Rolling monthly."],
  ["Software and texts", "At cost", "Paid on your own accounts, so you can see every penny."],
];

const faqs = [
  ["Do I need to be technical?", "No. You tell us how the business runs. We build it, test it and train your team."],
  ["Who owns what you build?", "You do. It runs on your accounts and the code is yours."],
  ["What if it doesn't work?", "We agree how to measure it before we build. If it doesn't pass testing, it doesn't go live."],
  ["What happens to our data?", "It stays in your systems. We only see the totals your results page needs."],
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-8 py-32 border-t border-border overflow-hidden">
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.035 }}
        aria-hidden="true"
      >
        04
      </span>

      <div className="max-w-5xl mx-auto">
        <TextReveal delay={0.1} className="mb-14">
          <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">What it costs.</h2>
        </TextReveal>

        <div className="border-t border-border mb-24">
          {prices.map(([what, price, note], i) => (
            <FadeUp key={what} delay={0.05 * i}>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,6fr)] gap-1 md:gap-12 py-6 border-b border-border items-baseline">
                <p className="font-sans text-text-sec text-sm">{what}</p>
                <p className="font-display text-xl text-text">{price}</p>
                <p className="font-sans text-text-sec text-sm leading-relaxed">{note}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {faqs.map(([q, a], i) => (
            <FadeUp key={q} delay={0.05 * i}>
              <h3 className="font-display text-lg text-text mb-2">{q}</h3>
              <p className="font-sans text-text-sec text-base leading-relaxed">{a}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
