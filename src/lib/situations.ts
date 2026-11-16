// The five situations. The outreach engine tags each account with one key, and each key has one private page at /for/<key>.
// A step in the "after" lane is plain code, an AI step (judgement only) or a person.
export type Kind = "code" | "ai" | "person";
export type Situation = {
  key: string;
  short: string;            // used on the intro call form
  title: string;            // browser title
  description: string;
  h1: [string, string];
  lead: string;
  before: string[];         // today, by hand
  after: [Kind, string][];  // what we would build
  test: string;             // an example line from a written pass test
};

export const SITUATIONS: Situation[] = [
  {
    key: "reports-by-hand",
    short: "Reports rebuilt by hand",
    title: "Reports rebuilt by hand",
    description: "Reports and board packs rebuilt by hand every week or month. What we would build, and what the sprint costs.",
    h1: ["The report gets rebuilt by hand.", "Every week, or every month."],
    lead: "Exports, copy and paste, a master spreadsheet, and one person who knows where the formulas break. We build the system that produces it, checked, on the day it is due.",
    before: ["Export from each system", "Copy into the master sheet", "Fix what broke", "Check by eye, then send"],
    after: [["code", "Pull the figures on a schedule"], ["code", "Check they add up"], ["ai", "Draft the commentary"], ["person", "A person reads the exceptions"], ["code", "Send the pack"]],
    test: "For any of the last twelve reports, the pack matches the hand-built one to the pound, ten runs out of ten.",
  },
  {
    key: "retyping-between-systems",
    short: "The same details typed into two or three systems",
    title: "The same details typed twice",
    description: "The same details typed into two or three systems. What we would build, and what the sprint costs.",
    h1: ["The same details,", "typed into two or three systems."],
    lead: "An order, a new starter, a job. Typed into one system, then typed again into the next. We build the link between them, with a check on every record.",
    before: ["Details arrive by email or form", "Typed into the first system", "Typed again into the second", "Mistakes found later"],
    after: [["code", "Read each record once"], ["code", "Check it against your rules"], ["code", "Write it to each system"], ["person", "Mismatches go to a person"]],
    test: "Fifty real records go in. All fifty match in both systems, ten runs out of ten. A bad record stops and says why.",
  },
  {
    key: "quotes-take-too-long",
    short: "Quotes, tenders or proposals wait on one person",
    title: "Quotes that wait on one person",
    description: "Quotes, tenders and proposals that wait on one person. What we would build, and what the sprint costs.",
    h1: ["Quotes wait on one person.", "Customers wait on the quote."],
    lead: "Quotes, tenders and proposals queue behind the one person who knows the prices. We build the system that drafts them from your price book and your rules, so that person checks instead of types.",
    before: ["A request comes in", "It waits for the estimator", "Priced from memory and old quotes", "Typed up and sent"],
    after: [["ai", "Read the request"], ["code", "Price it from your price book"], ["code", "Build the document"], ["person", "Your estimator checks and sends"]],
    test: "Twenty past requests go in. Each draft matches the price your estimator gave, ten runs out of ten.",
  },
  {
    key: "chasing-by-hand",
    short: "Chasing customers, suppliers or staff by email and phone",
    title: "Chasing by email and phone",
    description: "Chasing customers, suppliers or staff by email and phone. What we would build, and what the sprint costs.",
    h1: ["Someone spends the week chasing.", "By email and by phone."],
    lead: "Customers for payment, suppliers for dates, staff for timesheets. We build the system that knows what is outstanding and chases on a schedule, and hands the awkward ones to a person.",
    before: ["Work out who is late", "Write the email", "Remember to chase again", "Update the list"],
    after: [["code", "List what is outstanding each morning"], ["code", "Send the right reminder"], ["ai", "Read the replies"], ["person", "Disputes go to a person"]],
    test: "From last month's list, every late item gets the right reminder and nothing marked paid or disputed is chased, ten runs out of ten.",
  },
  {
    key: "one-persons-head",
    short: "A process only one person knows how to run",
    title: "A process only one person can run",
    description: "A process only one person knows how to run. What we would build, and what the sprint costs.",
    h1: ["One person knows how to run it.", "Nobody else does."],
    lead: "Month end, the weekly schedule, the payroll changes. It works because one person has done it for years. We sit with them, write it down and build it, so it still runs when they are away.",
    before: ["It starts when they remember", "The steps live in their head", "Nobody else can check it", "It stops when they are off"],
    after: [["code", "Every step written down, then run as code"], ["code", "The same result each time"], ["person", "They review the exceptions"], ["code", "A runbook anyone can follow"]],
    test: "Someone who has never run it follows the runbook and gets the same result as the person who always has.",
  },
];

export const situation = (key: string) => SITUATIONS.find((s) => s.key === key);
