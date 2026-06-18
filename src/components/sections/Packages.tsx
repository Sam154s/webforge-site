import { FadeUp, Stagger, StaggerItem } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

const packages = [
  {
    name: "Landing",
    price: "£500",
    deposit: "50% deposit — £250 today",
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
    price: "£1,200",
    deposit: "50% deposit — £600 today",
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
    price: "£2,500",
    deposit: "50% deposit — £1,250 today",
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
    <section className="relative px-8 py-32 border-t border-border overflow-hidden">

      {/* Ghost number */}
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.035 }}
        aria-hidden="true"
      >
        04
      </span>

      <div className="max-w-5xl mx-auto">

        <FadeUp>
          <span className="inline-block font-sans text-xs text-text-muted tracking-[0.18em] uppercase border border-border px-3 py-1 mb-6">
            Section 04
          </span>
        </FadeUp>

        <TextReveal delay={0.1} className="mb-16">
          <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
            What it costs.
          </h2>
        </TextReveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4" delay={0.1}>
          {packages.map((pkg) => (
            <StaggerItem key={pkg.name}>
              <div
                className="p-8 flex flex-col h-full"
                style={pkg.accent ? {
                  background: "linear-gradient(var(--surface-el), var(--surface-el)) padding-box, linear-gradient(135deg, var(--accent) 0%, transparent 65%) border-box",
                  border: "1px solid transparent",
                } : {
                  background: "var(--surface-el)",
                  border: "1px solid var(--border)",
                }}
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

                <ul className="mt-auto space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="text-accent mt-0.5 text-xs">—</span>
                      <span className="font-sans text-sm text-text-sec">{f}</span>
                    </li>
                  ))}
                </ul>

                <MagneticButton strength={0.3}>
                  <a
                    href="/packages"
                    className={`inline-block w-full text-center font-display text-xs font-medium tracking-[0.15em] uppercase py-3 transition-colors duration-200 ${
                      pkg.accent
                        ? "bg-accent text-bg hover:bg-accent-hover"
                        : "border border-border text-text-sec hover:border-accent hover:text-accent"
                    }`}
                  >
                    Begin your build
                  </a>
                </MagneticButton>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

      </div>
    </section>
  );
}
