import { FadeUp, Stagger, StaggerItem } from "@/components/ui/FadeUp";

const steps = [
  {
    number: "01",
    title: "We ask. You talk.",
    body: "Not a contact form. Not a brief template you've filled in before. We ask questions that actually get somewhere - your instincts, your taste, what you've always hated about other sites in your industry. It takes about 20 minutes and it shapes everything.",
  },
  {
    number: "02",
    title: "We design. You approve.",
    body: "You see the direction before we write a single line of code. Colours, fonts, layout logic. If something's off, we change it. Nothing gets built until you're happy with where it's going.",
  },
  {
    number: "03",
    title: "We build. Properly.",
    body: "No page builders. No themes. Written from scratch, which means it loads fast, looks right on every screen, and doesn't fall apart six months later when something updates.",
  },
  {
    number: "04",
    title: "You get something you're proud of.",
    body: "It goes live on your domain. You own it outright. And when someone asks for your website, you send it without thinking twice.",
  },
];

export function Process() {
  return (
    <section className="px-8 py-32 border-t border-border bg-surface">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-8 md:gap-16 items-start mb-20">
          <FadeUp>
            <span className="font-display font-light text-5xl text-text-muted select-none">
              02
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
              How it works.
            </h2>
          </FadeUp>
        </div>

        <Stagger className="divide-y divide-border" delay={0.1}>
          {steps.map((step) => (
            <StaggerItem key={step.number}>
              <div className="grid grid-cols-1 md:grid-cols-[80px_200px_1fr] gap-4 md:gap-16 py-10 items-start">
                <span className="font-display font-light text-2xl text-text-muted select-none">
                  {step.number}
                </span>
                <h3 className="font-display font-medium text-lg text-text">
                  {step.title}
                </h3>
                <p className="font-sans text-text-sec text-base leading-relaxed max-w-lg">
                  {step.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

      </div>
    </section>
  );
}
