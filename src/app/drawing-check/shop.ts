// The shop setup: what the check judges a drawing against. Kept in the browser (localStorage) and shared across a team
// as a JSON file. Nothing here is sent to our server. No imports, so the test scripts can load it directly with Node.

export type Shop = {
  name: string;
  materials: string[];
  finishesInHouse: string[];
  finishesSentOut: string[];
  tightestTurnedMm: string;
  tightestMilledMm: string;
  turnMaxLengthMm: string;
  turnMaxDiaMm: string;
  millMaxXMm: string;
  millMaxYMm: string;
  millMaxZMm: string;
  processesDo: string[];
  processesDont: string[];
  certs: string[];
  questions: string[];
  signOff: string;
};

// Example values, clearly marked as such on the page until the shop saves its own.
export const EXAMPLE_SHOP: Shop = {
  name: "Example Precision Ltd",
  materials: ["Aluminium 6082-T6", "Stainless 303", "Stainless 316L", "Mild steel 230M07 (EN1A)", "EN8", "Brass CZ121"],
  finishesInHouse: ["Deburr", "Bead blast"],
  finishesSentOut: ["Anodise, clear and black", "Hard anodise", "Passivate", "Zinc nickel plate"],
  tightestTurnedMm: "0.02",
  tightestMilledMm: "0.03",
  turnMaxLengthMm: "300",
  turnMaxDiaMm: "65",
  millMaxXMm: "500",
  millMaxYMm: "400",
  millMaxZMm: "300",
  processesDo: ["CNC turning", "3-axis milling", "Sawing", "Tapping", "Reaming"],
  processesDont: ["5-axis milling", "Wire EDM", "Grinding", "Welding", "Heat treatment", "NDT"],
  certs: ["Certificate of conformity", "EN 10204 3.1 material certificates (from the mill)"],
  questions: ["When do you need the parts delivered?"],
  signOff: "Thanks,\nThe estimating team\nExample Precision Ltd",
};

export const BLANK_SHOP: Shop = {
  name: "", materials: [], finishesInHouse: [], finishesSentOut: [], tightestTurnedMm: "", tightestMilledMm: "",
  turnMaxLengthMm: "", turnMaxDiaMm: "", millMaxXMm: "", millMaxYMm: "", millMaxZMm: "",
  processesDo: [], processesDont: [], certs: [], questions: [], signOff: "Thanks,",
};

const LISTS = ["materials", "finishesInHouse", "finishesSentOut", "processesDo", "processesDont", "certs", "questions"] as const;
const TEXTS = ["name", "tightestTurnedMm", "tightestMilledMm", "turnMaxLengthMm", "turnMaxDiaMm", "millMaxXMm", "millMaxYMm", "millMaxZMm", "signOff"] as const;

// Reads a saved or imported setup. Unknown keys are dropped and wrong types fall back to blank, so a bad file can't break the page.
export function readShop(raw: unknown): Shop | null {
  if (!raw || typeof raw !== "object") return null;
  const o = (("shop" in raw) ? (raw as { shop: unknown }).shop : raw) as Record<string, unknown>;
  if (!o || typeof o !== "object") return null;
  const shop: Shop = { ...BLANK_SHOP };
  let found = 0;
  for (const k of LISTS) {
    const v = o[k];
    if (Array.isArray(v)) { shop[k] = v.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, 200)).filter(Boolean).slice(0, 60); found++; }
  }
  for (const k of TEXTS) {
    const v = o[k];
    if (typeof v === "string") { shop[k] = v.slice(0, k === "signOff" ? 400 : 120); found++; }
  }
  return found ? shop : null;
}

export const SHOP_FILE_KIND = "drawing-check-shop";
export function shopFile(shop: Shop) {
  return JSON.stringify({ kind: SHOP_FILE_KIND, version: 1, shop }, null, 2);
}

// The setup as plain lines for the instruction. Blank answers are left out, so the check never judges against a guess.
export function shopText(s: Shop): string {
  const list = (v: string[]) => v.join("; ");
  const mm = (v: string) => (v.trim() ? `${v.trim()} mm` : "");
  const rows: [string, string][] = [
    ["Shop name", s.name.trim()],
    ["Materials we stock", list(s.materials)],
    ["Finishes we do in house", list(s.finishesInHouse)],
    ["Finishes we send out to a subcontractor", list(s.finishesSentOut)],
    ["Tightest tolerance band we hold on turned parts", mm(s.tightestTurnedMm)],
    ["Tightest tolerance band we hold on milled parts", mm(s.tightestMilledMm)],
    ["Largest turned part", [s.turnMaxLengthMm.trim() && `length ${mm(s.turnMaxLengthMm)}`, s.turnMaxDiaMm.trim() && `diameter ${mm(s.turnMaxDiaMm)}`].filter(Boolean).join(", ")],
    ["Largest milled part (X x Y x Z)", [s.millMaxXMm, s.millMaxYMm, s.millMaxZMm].every((v) => v.trim()) ? `${s.millMaxXMm.trim()} x ${s.millMaxYMm.trim()} x ${s.millMaxZMm.trim()} mm` : ""],
    ["Processes we do", list(s.processesDo)],
    ["Processes we do not do", list(s.processesDont)],
    ["Certificates and reports we can provide", list(s.certs)],
    ["Questions we always ask the customer", list(s.questions)],
  ];
  return rows.filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`).join("\n");
}
