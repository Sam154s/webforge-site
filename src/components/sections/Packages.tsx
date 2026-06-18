import { FadeUp, Stagger, StaggerItem } from "@/components/ui/FadeUp";

const packages = [
  {
    name: "Landing",
    price: "£300 – £600",
    deposit: "50% deposit",
    description: "A single, focused page that tells people who you are and what to do next.",
    features: [
      "1–2 pages",
      "Full intake process",
      "Custom design - no templates",
      "Deployed to your domain",
    ],
    accent: false,
  },
  {
    name: "Standard",
    price: "£800 – £1,500",
    deposit: "40% deposit",
    description: "A complete site with the space to say everything that needs to be said.",
    features: [
      "3–5 pages",
      "Full intake process",
      "Custom design - no templates",
      "Contact form included",
      "Deployed to your domain",
    ],
    accent: true,
  },
  {
    name: "Premium",
    price: "£2,000 – £4,000",
    deposit: "30% deposit",
    description: "The full build. For businesses that want a site that does serious work.",
    features: [
      "6+ pages",
      "Full intake process",
      "Custom design - no templates",
      "All features included",
      "Priority delivery",
      "Deployed to your domain",
    ],
    accent: false,
  },
];

export function Packages() {
  return (
    <section className="px-8 py-32 border-t border-border">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-8 md:gap-16 items-start mb-16">
          <FadeUp>
            <span className="font-display font-light text-5xl text-text-muted select-none">
              04
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
              What it costs.
            </h2>
          </FadeUp>
        </div>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4" delay={0.1}>
          {packages.map((pkg) => (
            <StaggerItem key={pkg.name}>
              <div
                className={`bg-surface-el p-8 flex flex-col h-full border ${
                  pkg.accent ? "border-accent" : "border-border"
                }`}
              >
                <div className="mb-6">
                  <p className="font-display text-xs font-medium tracking-[0.18em] text-text-sec uppercase mb-3">
                    {pkg.name}
                  </p>
                  <p className="font-display font-light text-2xl text-text mb-1">
                    {pkg.price}
                  </p>
                  <p className="font-sans text-xs text-text-muted">
                    {pkg.deposit}
                  </p>
                </div>

                <p className="font-sans text-sm text-text-sec leading-relaxed mb-8">
                  {pkg.description}
                </p>

                <ul className="mt-auto space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="text-accent mt-0.5 text-xs">-</span>
                      <span className="font-sans text-sm text-text-sec">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

      </div>
    </section>
  );
}
