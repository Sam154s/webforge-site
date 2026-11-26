// The fixed answer shape the model must return when the page calls the shop's own key, the code that checks it, and the
// plain text and email built from it. No imports, so the test scripts can load it directly with Node.

export type Where = { where: string };
export type Part = {
  customer: string | null; part_name: string | null; drawing_number: string | null; revision: string | null;
  material: string | null; finish: string | null; quantity: string | null; size_envelope: string | null; units: string | null;
};
export type Tolerance = { feature: string; callout: string; band_mm: number | null } & Where;
export type Missing = { item: string; why: string; question: string } & Where;
export const AGAINST_KINDS = ["tolerance", "finish_sent_out", "material", "size", "process", "certificate", "other"] as const;
export type Against = { kind: (typeof AGAINST_KINDS)[number]; item: string; drawing_says: string; shop_has: string; impact: string; question: string | null };
export type Check = {
  part: Part;
  kind: "turned" | "milled" | "other";
  special_processes: ({ process: string; spec: string | null } & Where)[];
  general_tolerance: string | null;
  tightest_tolerances: Tolerance[];
  gdt: { count: number; types: string[] };
  surface_finish: ({ callout: string } & Where)[];
  threads: ({ spec: string; count: number } & Where)[];
  inspection: ({ requirement: string } & Where)[];
  certificates: ({ requirement: string } & Where)[];
  flow_down_notes: ({ note: string } & Where)[];
  against_shop: Against[];
  missing: Missing[];
};
export type Reading = Check & { is_drawing: boolean; not_drawing_reason: string | null };

const S = { type: "string" } as const;
const NS = { type: ["string", "null"] } as const;
const obj = (properties: Record<string, unknown>) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const list = (properties: Record<string, unknown>) => ({ type: "array", items: obj(properties) });

// Every object closed and every key required (null where empty), which both Anthropic and OpenAI strict mode accept.
export const SCHEMA = obj({
  is_drawing: { type: "boolean" },
  not_drawing_reason: NS,
  part: obj({ customer: NS, part_name: NS, drawing_number: NS, revision: NS, material: NS, finish: NS, quantity: NS, size_envelope: NS, units: NS }),
  kind: { type: "string", enum: ["turned", "milled", "other"] },
  special_processes: list({ process: S, spec: NS, where: S }),
  general_tolerance: NS,
  tightest_tolerances: list({ feature: S, callout: S, band_mm: { type: ["number", "null"] }, where: S }),
  gdt: obj({ count: { type: "integer" }, types: { type: "array", items: S } }),
  surface_finish: list({ callout: S, where: S }),
  threads: list({ spec: S, count: { type: "integer" }, where: S }),
  inspection: list({ requirement: S, where: S }),
  certificates: list({ requirement: S, where: S }),
  flow_down_notes: list({ note: S, where: S }),
  against_shop: list({ kind: { type: "string", enum: [...AGAINST_KINDS] }, item: S, drawing_says: S, shop_has: S, impact: S, question: NS }),
  missing: list({ item: S, where: S, why: S, question: S }),
});

// ---------------------------------------------------------------- checking what came back

class Invalid extends Error {}
const fail = (path: string): never => { throw new Invalid(path); };

// No em or en dashes in anything we show: an en dash in a range becomes a hyphen, an em dash a comma.
const clean = (s: string, max = 300) => s.replace(/\s*\u2014\s*/g, ", ").replace(/\u2013/g, "-").replace(/\s+/g, " ").trim().slice(0, max);
const str = (v: unknown, path: string, max?: number): string => (typeof v === "string" ? clean(v, max) : fail(path));
const nstr = (v: unknown, path: string, max?: number): string | null => (v === null || v === undefined ? null : str(v, path, max) || null);
const int = (v: unknown, path: string): number => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 999 ? (v as number) : fail(path));
function arr<T>(v: unknown, path: string, max: number, each: (x: Record<string, unknown>, p: string) => T): T[] {
  if (!Array.isArray(v)) return fail(path);
  return v.slice(0, max).map((x, i) => (x && typeof x === "object" ? each(x as Record<string, unknown>, `${path}[${i}]`) : fail(`${path}[${i}]`)));
}

// Band = upper limit minus lower limit, worked out from the callout where it can be, so a slip in the model's arithmetic
// does not reach the sheet. "±0.01" is 0.02, "+0.05/-0.01" is 0.06, "+0/-0.02" is 0.02, limits "7.99/8.01" are 0.02.
export function bandFrom(callout: string): number | null {
  const c = callout.replace(/\s+/g, "").replace(/,/g, ".").replace(/−/g, "-");
  const r = (n: number) => Math.round(n * 1e4) / 1e4;
  let m = c.match(/±(\d*\.?\d+)/);
  if (m) return r(2 * parseFloat(m[1]));
  m = c.match(/([+-]\d*\.?\d+)\/([+-]?\d*\.?\d+)/) || c.match(/([+-]\d*\.?\d+)([+-]\d*\.?\d+)$/);
  if (m) return r(Math.abs(parseFloat(m[1]) - parseFloat(m[2])));
  m = c.match(/^(?:Ø|⌀)?(\d+\.\d+)\/(\d+\.\d+)$/);
  if (m) return r(Math.abs(parseFloat(m[1]) - parseFloat(m[2])));
  return null;
}

const MUST_ASK: [RegExp, keyof Part, Missing][] = [
  [/drawing (no|number)/i, "drawing_number", { item: "Drawing number", where: "Title block", why: "We need it to tie the quote, the order and the certificates to the right part.", question: "What is the drawing number for this part?" }],
  [/material/i, "material", { item: "Material", where: "Title block", why: "Material drives the stock price and the machining time.", question: "What material is the part made from, with the grade or spec?" }],
  [/\brev/i, "revision", { item: "Revision", where: "Title block", why: "Without a revision we can't be sure we're quoting the current design.", question: "Which revision should we quote to?" }],
];

// Throws when the shape is wrong (use isInvalid). Sorts tolerances tightest first, keeps five, and adds back the gaps a
// drawing always needs a question for if the model left them out of "missing".
export function validate(raw: unknown): Reading {
  if (!raw || typeof raw !== "object") fail("root");
  const o = raw as Record<string, unknown>;
  if (typeof o.is_drawing !== "boolean") fail("is_drawing");
  const isDrawing = o.is_drawing as boolean;
  const notDrawing = nstr(o.not_drawing_reason, "not_drawing_reason", 300);
  const p = (o.part && typeof o.part === "object" ? o.part : isDrawing ? fail("part") : {}) as Record<string, unknown>;
  const part: Part = {
    customer: nstr(p.customer, "part.customer", 120), part_name: nstr(p.part_name, "part.part_name", 120),
    drawing_number: nstr(p.drawing_number, "part.drawing_number", 60), revision: nstr(p.revision, "part.revision", 30),
    material: nstr(p.material, "part.material", 160), finish: nstr(p.finish, "part.finish", 160),
    quantity: nstr(p.quantity, "part.quantity", 60), size_envelope: nstr(p.size_envelope, "part.size_envelope", 80),
    units: nstr(p.units, "part.units", 20),
  };
  const empty = (k: string) => (isDrawing ? fail(k) : []);
  const g = (o.gdt && typeof o.gdt === "object" ? o.gdt : { count: 0, types: [] }) as Record<string, unknown>;

  const tol = (Array.isArray(o.tightest_tolerances) ? arr(o.tightest_tolerances, "tightest_tolerances", 40, (x, q) => {
    const callout = str(x.callout, `${q}.callout`, 80);
    const given = x.band_mm === null ? null : typeof x.band_mm === "number" && x.band_mm > 0 && x.band_mm < 50 ? x.band_mm : fail(`${q}.band_mm`);
    return { feature: str(x.feature, `${q}.feature`, 120), callout, band_mm: bandFrom(callout) ?? given, where: str(x.where, `${q}.where`, 80) };
  }) : empty("tightest_tolerances")).sort((a, b) => (a.band_mm ?? Infinity) - (b.band_mm ?? Infinity)).slice(0, 5);

  const L = <T,>(key: string, max: number, each: (x: Record<string, unknown>, q: string) => T): T[] =>
    (Array.isArray(o[key]) ? arr(o[key], key, max, each) : empty(key) as T[]);

  const missing = L("missing", 12, (x, q) => ({ item: str(x.item, `${q}.item`, 120), where: str(x.where, `${q}.where`, 80), why: str(x.why, `${q}.why`, 300), question: str(x.question, `${q}.question`, 300) }));
  if (isDrawing) {
    const said = missing.map((m) => `${m.item} ${m.why}`).join(" ");
    for (const [re, key, add] of MUST_ASK) if (!part[key] && !re.test(said)) missing.unshift(add);
  }

  const kind = o.kind === "turned" || o.kind === "milled" ? o.kind : "other";
  return {
    is_drawing: isDrawing,
    not_drawing_reason: notDrawing,
    part,
    kind,
    special_processes: L("special_processes", 12, (x, q) => ({ process: str(x.process, `${q}.process`, 120), spec: nstr(x.spec, `${q}.spec`, 160), where: str(x.where, `${q}.where`, 80) })),
    general_tolerance: nstr(o.general_tolerance, "general_tolerance", 200),
    tightest_tolerances: tol,
    gdt: { count: int(g.count ?? 0, "gdt.count"), types: (Array.isArray(g.types) ? g.types : fail("gdt.types")).slice(0, 14).map((t, i) => str(t, `gdt.types[${i}]`, 40)) },
    surface_finish: L("surface_finish", 10, (x, q) => ({ callout: str(x.callout, `${q}.callout`, 80), where: str(x.where, `${q}.where`, 80) })),
    threads: L("threads", 14, (x, q) => ({ spec: str(x.spec, `${q}.spec`, 80), count: int(x.count, `${q}.count`), where: str(x.where, `${q}.where`, 80) })),
    inspection: L("inspection", 10, (x, q) => ({ requirement: str(x.requirement, `${q}.requirement`, 200), where: str(x.where, `${q}.where`, 80) })),
    certificates: L("certificates", 10, (x, q) => ({ requirement: str(x.requirement, `${q}.requirement`, 200), where: str(x.where, `${q}.where`, 80) })),
    flow_down_notes: L("flow_down_notes", 14, (x, q) => ({ note: str(x.note, `${q}.note`, 300), where: str(x.where, `${q}.where`, 80) })),
    against_shop: L("against_shop", 12, (x, q) => ({
      kind: (AGAINST_KINDS as readonly string[]).includes(x.kind as string) ? (x.kind as Against["kind"]) : "other",
      item: str(x.item, `${q}.item`, 120), drawing_says: str(x.drawing_says, `${q}.drawing_says`, 200), shop_has: str(x.shop_has, `${q}.shop_has`, 200),
      impact: str(x.impact, `${q}.impact`, 300), question: nstr(x.question, `${q}.question`, 300),
    })),
    missing: missing.slice(0, 12),
  };
}
export const isInvalid = (e: unknown) => e instanceof Invalid;

// ---------------------------------------------------------------- the sheet as plain text, and the email

export const PART_ROWS: [keyof Part, string][] = [
  ["customer", "Customer"], ["part_name", "Part"], ["drawing_number", "Drawing number"], ["revision", "Revision"],
  ["material", "Material"], ["finish", "Finish"], ["quantity", "Quantity"], ["size_envelope", "Size envelope"],
];
export const NOT_SHOWN = "Not shown";
export const FOOT = "Read by AI. Check it against the drawing before you rely on it.";

export const fmtBand = (b: number | null) => (b === null ? "" : `${b.toLocaleString("en-GB", { maximumFractionDigits: 4 })} mm`);

export function partLabel(p: Part) {
  const no = p.drawing_number ? `drawing ${p.drawing_number}${p.revision ? ` rev ${p.revision}` : ""}` : "your drawing";
  return p.part_name ? `${no} (${p.part_name})` : no;
}

// Questions come from three places: what is missing, shop mismatches that need the customer's answer, and the questions
// the shop always asks. With none of those there is no email.
export function buildEmail(c: Check, standing: string[], signOff: string): { subject: string; body: string } | null {
  const qs = [...c.missing.map((m) => m.question), ...c.against_shop.flatMap((a) => (a.question ? [a.question] : [])), ...standing.map((s) => s.trim()).filter(Boolean)];
  const seen = new Set<string>();
  const uniq = qs.filter((q) => { const k = q.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  if (!uniq.length) return null;
  const subject = c.part.drawing_number ? `Drawing ${c.part.drawing_number}${c.part.revision ? ` rev ${c.part.revision}` : ""}: questions before we quote` : "Your drawing: questions before we quote";
  const body = `Hello,\n\nThanks for sending ${partLabel(c.part)}. Before we quote, could you help with ${uniq.length === 1 ? "one thing" : "a few things"}?\n\n${uniq.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n${signOff.trim() || "Thanks,"}`;
  return { subject, body };
}

export function toText(c: Check, email: { subject: string; body: string } | null): string {
  const out: string[] = [`DRAWING CHECK: ${partLabel(c.part)}`, ""];
  out.push("1. THE PART");
  for (const [k, label] of PART_ROWS) out.push(`${label}: ${c.part[k] ?? NOT_SHOWN}`);
  out.push("", "2. WHAT IT ASKS FOR");
  const sec = (title: string, rows: string[]) => { out.push(`${title}:`); out.push(...(rows.length ? rows.map((r) => `  - ${r}`) : ["  None found"])); };
  sec("Special processes", c.special_processes.map((s) => `${s.process}${s.spec ? `, ${s.spec}` : ", no spec given"} (${s.where})`));
  out.push(`General tolerance: ${c.general_tolerance ?? NOT_SHOWN}`);
  sec("Tightest tolerances", c.tightest_tolerances.map((t) => `${t.feature}: ${t.callout}${t.band_mm !== null ? `, band ${fmtBand(t.band_mm)}` : ""} (${t.where})`));
  out.push(`GD&T: ${c.gdt.count} feature control frame${c.gdt.count === 1 ? "" : "s"}${c.gdt.types.length ? ` (${c.gdt.types.join(", ")})` : ""}`);
  sec("Surface finish", c.surface_finish.map((s) => `${s.callout} (${s.where})`));
  sec("Threads", c.threads.map((t) => `${t.count > 1 ? `${t.count}x ` : ""}${t.spec} (${t.where})`));
  sec("Inspection", c.inspection.map((s) => `${s.requirement} (${s.where})`));
  sec("Certificates", c.certificates.map((s) => `${s.requirement} (${s.where})`));
  sec("Notes that flow down", c.flow_down_notes.map((s) => `${s.note} (${s.where})`));
  out.push("", "3. AGAINST YOUR SHOP");
  if (!c.against_shop.length) out.push("Nothing outside what your shop does.");
  for (const a of c.against_shop) out.push(`  - ${a.item}: the drawing says ${a.drawing_says}; your shop: ${a.shop_has}. ${a.impact}`);
  out.push("", "4. MISSING OR UNCLEAR");
  if (!c.missing.length) out.push("Nothing missing.");
  for (const m of c.missing) out.push(`  - ${m.item} (${m.where}): ${m.why}`);
  out.push("", "5. EMAIL TO THE CUSTOMER");
  out.push(email ? `Subject: ${email.subject}\n\n${email.body}` : "Nothing to ask, so no email needed.");
  out.push("", FOOT);
  return out.join("\n");
}
