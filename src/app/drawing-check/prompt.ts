// The drawing check instruction. Two forms from one set of rules:
// - chatPrompt: pasted into the shop's own Claude or ChatGPT with the drawing (no key needed). Fixed markdown headings.
// - jsonPrompt: the system prompt when the page calls the shop's own API key. Answers in JSON against SCHEMA (schema.ts).
// Rules come from the gym drawing reader (case-02 extract.py and INPUT-CONTRACT.md): report only what is written, leave
// anything unreadable blank with a reason, never guess, tolerance band = upper limit minus lower limit.
// Type-only import, so Node can load this file directly for the example and test scripts.
import type { Shop } from "./shop";
import { shopText } from "./shop";

export const FOOTER = "Read by AI. Check it against the drawing before you rely on it.";

const RULES = `Rules:
- Report only what is written on the drawing. Never estimate, infer or fill a gap from what is typical.
- If you cannot read something with certainty (smudged, cut off, too faint, contradictory or simply not there), leave it blank and list it under missing or unclear with the reason. An honest blank is always better than a guess.
- Tolerance band = upper limit minus lower limit. ±0.01 is 0.02. +0/-0.02 is 0.02. +0.05/-0.01 is 0.06. Limits of 7.99/8.01 are 0.02. A general note of ±0.1 is 0.2. A fit such as H7 or g6 has no band here: give the fit.
- Count carefully. "4x" in a callout means four features.
- Say where on the drawing each thing is: title block, note number, view name, or the feature.
- Plain British English. Short sentences. No dashes as punctuation. No pricing, no advice, no summary.
- If the attachment is not an engineering drawing, say so and stop. If it has more than one sheet or part, check the first part and say so.`;

const ASKS = `What it asks for:
- Special processes: heat treatment, hardening, plating, anodising, passivation, painting, NDT, welding, impregnation, marking and similar, with any spec or standard. A finish of "none" is not a process.
- General tolerance: as written, with its band.
- Tightest tolerances: up to five dimensions that have their own tolerance written on them, tightest first, each with the feature, the callout, the band in mm and where. Never include the general tolerance here.
- GD&T: the number of feature control frames, and the types used.
- Surface finish: each roughness callout, including a general one in the notes.
- Threads: each thread spec and how many times it appears.
- Inspection: first article (FAI or AS9102), CMM or inspection reports, PPAP, sampling.
- Certificates: material certificates (for example EN 10204 3.1), certificate of conformity, process certificates.
- Notes that flow down: the drawing's notes the shop must follow or pass on that affect cost or acceptance, such as edge breaks, marking, packaging, approved suppliers, no rework. Holes, grooves and pockets are features, not notes, so leave them out.`;

const AGAINST = `Compare the drawing with my shop below and list every mismatch, each with what the drawing says, what my shop has, and what it means for the quote:
- a tolerance band tighter than the tightest I hold for that kind of part (turned or milled);
- a finish or process I send out, so the quote needs subcontract cost and lead time;
- a material I don't stock, so it must be bought in;
- a part bigger than my largest turned or milled part;
- a process I don't do, or one that is not in my list of processes;
- a certificate, inspection or report I can't provide.
Only list real mismatches, and only against what my shop setup says. Where I left something out, don't judge it. Where a mismatch needs the customer's answer (for example whether a tighter tolerance can be opened up), give a question for them.`;

const MISSING = `What I would have to ask the customer before quoting, each with where on the drawing and one plain sentence on why it matters for the quote. Look for: no revision; no material, or no grade or spec; no general tolerance; a finish or process with no spec; anything smudged or unreadable; dimensions that do not add up or contradict each other; a thread with no pitch or class where it matters; an inspection or certificate asked for without the standard. Don't list a quantity when there is no QTY box at all, because it usually comes with the order. Don't ask anything my shop always asks anyway. Don't pad the list.`;

function shopBlock(shop: Shop | null) {
  const t = shop ? shopText(shop) : "";
  return t ? `My shop:\n${t}` : "";
}

export function chatPrompt(shop: Shop | null): string {
  const block = shopBlock(shop);
  const signOff = shop?.signOff.trim() || "Thanks,";
  return `Check the attached customer drawing for me. I run a UK subcontract machine shop and I need the review an estimator does before quoting.

${RULES}
${block ? `\n${block}\n` : ""}
Answer under exactly these headings, in this order, and add nothing else.

## 1. The part
A two column table, Field and On the drawing, with exactly these rows: Customer, Part name, Drawing number, Revision, Material, Finish, Quantity (the QTY box only), Size envelope (overall length x width x height, or diameter x length), Units.

## 2. What it asks for
Exactly these nine lines, each starting with the bold label, in this order. Write "None found" for any that are absent. Put the tightest tolerances in a table with columns Feature, Callout, Band (mm) and Where.
${ASKS.split("\n").slice(1).join("\n")}
${block ? `
## 3. Against my shop
${AGAINST}
A numbered list, each item as: the mismatch in bold, then what the drawing says, what my shop has, and what it means for the quote. If there are none, write "Nothing outside what my shop does."
` : ""}
## ${block ? 4 : 3}. Missing or unclear
${MISSING}
A numbered list, each item as: the item in bold, where on the drawing in brackets, then why it matters. If nothing is missing, write "Nothing missing."

## ${block ? 5 : 4}. Email to the customer
A short plain email I can copy: a Subject line, then "Hello,", one line thanking them for the drawing by number and revision, then one numbered question for each item in Missing or unclear${block ? ", each Against my shop item that needs their answer, and each question my shop always asks" : ""}. End with:
${signOff}
If there is nothing to ask, write "Nothing missing, so no email needed." instead.

End with this line exactly:
${FOOTER}`;
}

export function jsonPrompt(shop: Shop | null): string {
  const block = shopBlock(shop);
  return `You check customer engineering drawings for a UK subcontract machine shop, the review an estimator does before quoting. Fill in the JSON fields from the attached drawing.

${RULES}

Fields:
- is_drawing: false if the attachment is not an engineering drawing of a part; then say why in not_drawing_reason and leave everything else empty or null.
- part: customer, part_name, drawing_number, revision, material, finish as written. quantity: the QTY box only, null if there is none or it can't be read. size_envelope: e.g. "80 x 50 x 40 mm" or "Ø25 x 45 mm". units: "mm" or "inch".
- kind: "turned" for a round part made on a lathe, "milled" for a prismatic part, "other" if neither.
${ASKS.replace("What it asks for:\n", "").replace("- Special processes:", "- special_processes:").replace("- General tolerance:", "- general_tolerance:").replace("- Tightest tolerances:", "- tightest_tolerances:").replace("- GD&T:", "- gdt (count, types):").replace("- Surface finish:", "- surface_finish:").replace("- Threads:", "- threads:").replace("- Inspection:", "- inspection:").replace("- Certificates:", "- certificates:").replace("- Notes that flow down:", "- flow_down_notes:")}
- against_shop: ${block ? AGAINST.replace(/\n/g, " ") + ' kind is one of "tolerance", "finish_sent_out", "material", "size", "process", "certificate", "other". question is null when the customer need not answer.' : "always an empty list: no shop setup was given."}
- missing: ${MISSING} Each with item, where, why, and question: one polite plain sentence to the customer asking for it.
${block ? `\n${block}` : ""}`;
}
