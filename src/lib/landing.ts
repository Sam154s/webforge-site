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
  {
    slug: "quotes-take-too-long",
    title: "Quotes that take too long",
    description: "Free 30 minute diagnostic: find out how long your quotes really take, where they wait, and what the delay costs you.",
    h1: ["Quotes take too long.", "Customers go elsewhere while you write them."],
    lead: "A free 30 minute diagnostic for UK limited companies with 5 to 50 staff. We find where quotes get stuck, and rank the fixes by what they are worth.",
    finds: [
      ["How long a quote really takes", "From your last few real quotes: the time from enquiry to quote sent, and how much of it is waiting rather than writing."],
      ["Who each quote waits on", "Often one person with a full diary. We show where quotes queue up and what that holds back."],
      ["What to fix first", "A ranked list with a pound range on each. Sometimes a price book or a template is enough, not software."],
    ],
    excerptLabel: "Fictional excerpt from a sample report",
    excerpt: [
      { job: "Free the estimator with drafted quotes from site notes and a price book", grade: "C", range: "£16,128 to £32,256 a year", hours: "36 h", lane: "Test first" },
      { job: "Follow up every quote within 48 hours", grade: "C", range: "£7,944 to £16,128 a year", hours: "10 h", lane: "Test first" },
    ],
  },
  {
    slug: "copying-between-systems",
    title: "Copying between systems",
    description: "Free 30 minute diagnostic: find out how often the same details are typed twice, and what the retyping costs each week.",
    h1: ["The same details typed twice.", "Into three different systems."],
    lead: "A free 30 minute diagnostic for UK limited companies with 5 to 50 staff. We find where work is copied by hand, and rank the fixes by what they are worth.",
    finds: [
      ["Where the same detail is retyped", "We follow one real job from enquiry to invoice and note every point where someone types it in again."],
      ["What the retyping costs", "Hours each week, and the slips that follow. Shown separately from the cash."],
      ["What to fix first", "A ranked list with a pound range on each. Some systems connect with a setting. Some need a small tool. We say which."],
    ],
    excerptLabel: "Fictional excerpt from a sample report",
    excerpt: [
      { job: "Raise invoices from the job sheet and capture extras", grade: "B", range: "£8,449 to £12,070 a year", hours: "28 h", lane: "Do first" },
      { job: "Supplier bill entry and price check", grade: "C", range: "£1,338 to £3,276 a year", hours: "23 h", lane: "Test first" },
    ],
  },
  {
    slug: "website-doesnt-convert",
    title: "A website that brings in no work",
    description: "Free 30 minute diagnostic: find out why a website that looks fine does not bring in enquiries, and what to change first.",
    h1: ["The website looks fine.", "It just does not bring in work."],
    lead: "A free 30 minute diagnostic for UK limited companies with 5 to 50 staff. We look at what a visitor sees and what stops them asking, and rank the fixes by what they are worth.",
    finds: [
      ["What a visitor sees first", "From your public pages only: what is said, how easy it is to ask for a quote, and how it works on a phone. We never fill in your forms."],
      ["What stops an enquiry", "A form that asks too much, a phone number that cannot be tapped, a page that loads slowly. We note the ones that apply to you."],
      ["What to fix first", "A ranked list with a pound range on each. Often a small change beats a new site, and the report says so."],
    ],
    excerptLabel: "Fictional excerpt from a sample report",
    excerpt: [
      { job: "Shorten the enquiry form and add a tap-to-call number", grade: "D", range: "£2,400 to £7,200 a year", hours: "6 h", lane: "Verify first" },
      { job: "Reply to every web enquiry the same day", grade: "C", range: "£3,600 to £9,000 a year", hours: "9 h", lane: "Test first" },
    ],
  },
];

export const bySlug = (s: string) => LANDINGS.find((l) => l.slug === s);
