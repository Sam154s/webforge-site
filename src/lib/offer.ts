// The published offer. Every page that shows a price reads it from here, so the figures cannot drift apart.
export const PRICE = { sprint: 3500, build: 12000, embedded: 4500 } as const;

export type Rung = { key: string; name: string; price: string; unit: string; gets: string; terms: string };

export const LADDER: Rung[] = [
  {
    key: "call", name: "Intro call", price: "Free", unit: "30 minutes",
    gets: "A straight answer on whether we can help. If we can't, we say so.",
    terms: "No report and no pitch deck. It is a filter, for both of us.",
  },
  {
    key: "sprint", name: "Sprint", price: "£3,500", unit: "fixed",
    gets: "A ranked list of problems with a pound range and payback on each. One thing working on your real data. A fixed quote for the first build.",
    terms: "Paid on booking. Credited in full against a build signed within 30 days.",
  },
  {
    key: "build", name: "First build", price: "From £12,000", unit: "fixed in writing",
    gets: "One system, on your accounts, with a written pass test agreed before we start. We keep working until it passes.",
    terms: "Half on signature. Half when it passes the written test.",
  },
  {
    key: "embedded", name: "Embedded engineer", price: "From £4,500", unit: "a month",
    gets: "A named engineer on your ranked list: new builds, fixes, monitoring, a monthly one-page report and training for your people.",
    terms: "Monthly in advance. Three month minimum, then 30 days' notice.",
  },
];

export const RUNNING = "Hosting and any AI usage, on your own accounts, agreed up front.";
export const FOUNDING =
  "We are taking three. For them the sprint fee is credited in full and the build is priced at the low end, in return for a published case study with measured figures and two introductions.";

// The comparison used wherever hiring is mentioned. The salary figure is quoted with its source every time.
export const SALARY = {
  median: "£87,500",
  outsideLondon: "£75,000",
  loaded: "£105,000",
  source: "IT Jobs Watch, six months to 16 November 2026, 507 salaries",
};

// DSIT AI Adoption Survey 2026. Each figure is shown with this source beside it.
export const DSIT = {
  name: "DSIT AI Adoption Survey 2026",
  date: "published 29 October 2026",
  sample: "3,503 firms",
  note: "Medium means 50 to 249 staff.",
};
