// The published offer. Every page that shows a step or a price reads it from here, so the figures cannot drift apart.
export const PRICE = { diagnosis: 3500, solution: 12000, upkeep: 750 } as const;

// One system, four steps. Each step shows what happens, what the client gets, and where they can stop.
export type Rung = {
  key: string; name: string; price: string; unit: string;
  line: string; what: string; get: string; stop: string;
  note?: string; link?: { href: string; label: string };
};

export const LADDER: Rung[] = [
  {
    key: "call", name: "Call", price: "Free", unit: "",
    line: "You tell us the symptoms. We give you a straight yes or no.",
    what: "You describe it. We say honestly whether we can help.",
    get: "A straight yes or no.",
    stop: "Nothing owed.",
  },
  {
    key: "diagnosis", name: "Diagnosis", price: "£3,500", unit: "",
    line: "We go in and look. You get the problems ranked, what each one costs you, and a fixed quote.",
    what: "We watch the work first hand and time it in your own numbers.",
    get: "A ranked list of problems with what each one costs you, one thing working, and a fixed quote.",
    stop: "The list is yours to keep. Go ahead within 30 days and the fee comes off.",
    link: { href: "/sample-report", label: "See an example diagnosis." },
  },
  {
    key: "solution", name: "Solution", price: "From £12,000", unit: "",
    line: "We build it to a written test. Half when you sign, half when it passes.",
    what: "We agree a written test first, then build to it on your accounts.",
    get: "A working system on your accounts. The code is yours.",
    stop: "Half when you sign, half when it passes. We keep working until it does.",
  },
  {
    key: "upkeep", name: "Upkeep", price: "From £750", unit: "a month per system",
    line: "We keep it running and make small changes.",
    what: "We watch it, fix it and make small changes.",
    get: "A one-page report each month.",
    stop: "Thirty days' notice. The code stays yours.",
    note: "Running costs are at cost, on your own accounts.",
  },
];

export const FOUNDING = "Three founding places, at our lowest build price, in return for a published case study and two introductions.";
