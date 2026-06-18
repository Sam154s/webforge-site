export const PACKAGES = {
  landing: {
    name: "Landing",
    description: "1-2 pages. A focused site that tells people who you are and what to do next.",
    price: 500,
    deposit: 250,
    features: [
      "1-2 pages",
      "Full intake conversation",
      "Custom design - no templates",
      "Deployed to your domain",
    ],
  },
  standard: {
    name: "Standard",
    description: "3-5 pages. A complete site with room for everything that needs saying.",
    price: 1200,
    deposit: 600,
    features: [
      "3-5 pages",
      "Full intake conversation",
      "Custom design - no templates",
      "Contact form included",
      "Deployed to your domain",
    ],
  },
  premium: {
    name: "Premium",
    description: "6+ pages. The full build for businesses that want a site doing serious work.",
    price: 2500,
    deposit: 1250,
    features: [
      "6+ pages",
      "Full intake conversation",
      "Custom design - no templates",
      "All features included",
      "Priority delivery",
      "Deployed to your domain",
    ],
  },
} as const;

export type PackageKey = keyof typeof PACKAGES;
