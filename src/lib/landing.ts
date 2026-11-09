// One entry per cold-email landing page. Add an entry and the page exists, with the same template and form.
export type Landing = {
  slug: string;
  title: string;          // browser title and OG
  description: string;
  h1: [string, string];   // the problem in the recipient's words
  lead: string;
  finds: [string, string][];
  excerptLabel: string;
  excerpt: { job: string; grade: string; range: string; hours: string; lane: string }[];
};

export const LANDINGS: Landing[] = [
  {
    slug: "late-paying-customers",
    title: "Late-paying customers",
    description: "Free 30 minute diagnostic: find out how much cash is stuck in late invoices and what chasing it costs you each week.",
    h1: ["Customers pay late.", "You spend Fridays chasing."],
    lead: "A free 30 minute diagnostic for UK limited companies with 5 to 50 staff. We find where cash is getting stuck, and rank the fixes by what they are worth.",
    finds: [
      ["How much is stuck, and for how long", "From one export of your unpaid invoices: what is overdue, which customers are slowest, and what the delay costs you."],
      ["What chasing costs in hours", "Who chases, how often, and how much of the week it takes. Shown separately from the cash."],
      ["What to fix first", "A ranked list with a pound range on each. Sometimes the answer is a rule or a reminder, not software."],
    ],
    excerptLabel: "Fictional excerpt from a sample report",
    excerpt: [
      { job: "Chase overdue invoices automatically", grade: "B", range: "£4,193 to £5,990 a year", hours: "14 h", lane: "Do first" },
      { job: "Raise invoices from the job sheet and capture extras", grade: "B", range: "£8,449 to £12,070 a year", hours: "28 h", lane: "Do first" },
    ],
  },
  {
    slug: "missed-enquiries",
    title: "Missed enquiries",
    description: "Free 30 minute diagnostic: find out how many enquiries and quotes go cold before anyone replies, and what each is worth.",
    h1: ["Enquiries come in.", "Some go cold before anyone replies."],
    lead: "A free 30 minute diagnostic for UK limited companies with 5 to 50 staff. We find where enquiries and quotes slip, and rank the fixes by what they are worth.",
    finds: [
      ["How fast you reply", "From the last real enquiry: how long until a reply, and until a quote. Most firms have never measured it."],
      ["Where enquiries get lost", "Web form, phone, inbox, a person away. We trace each route and see where it stops."],
      ["What to fix first", "A ranked list with a pound range on each. We also say what is not worth fixing."],
    ],
    excerptLabel: "Fictional excerpt from a sample report",
    excerpt: [
      { job: "Follow up every quote within 48 hours", grade: "C", range: "£7,944 to £16,128 a year", hours: "10 h", lane: "Test first" },
      { job: "Missed-call text-back", grade: "D", range: "£785 to £2,977 a year", hours: "7 h", lane: "Verify first" },
    ],
  },
];

export const bySlug = (s: string) => LANDINGS.find((l) => l.slug === s);
