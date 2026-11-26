// Proves the quoting calculator's TypeScript port prices the six priced gym cases exactly as the Python engine's answer key.
// Run: node scripts/check-quote-parity.mjs [path to the gym case folder]
// Needs Node 23.6 or later (it loads the .ts files directly, with type stripping).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { price } from "../src/lib/quote/price.ts";
import { EXAMPLE_RATES } from "../src/lib/quote/example-rates.ts";

const gym = process.argv[2] || join(homedir(), "wf-factory/fde/gym/case-02-drawing-to-quote");
const read = (p) => JSON.parse(readFileSync(join(gym, p), "utf8"));
const sheet = read("firm/rate_sheet.json");
const key = read("truth/answer_key.json");
const expected = read("truth/expected.json");

let fail = 0;

// 1. The page's example rates are the gym's rate sheet, figure for figure.
const strip = (v) => Array.isArray(v) ? v.map(strip) : v && typeof v === "object"
  ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== "aliases").map(([k, x]) => [k, strip(x)])) : v;
for (const [k, v] of Object.entries(EXAMPLE_RATES)) {
  const want = k === "pricing" ? { target_margin_of_price: sheet.pricing.target_margin_of_price, min_order_value: sheet.pricing.min_order_value } : strip(sheet[k]);
  if (JSON.stringify(v) !== JSON.stringify(want)) { fail++; console.log(`FAIL example rates differ from the gym sheet at "${k}"`); }
}

// 2. Same totals as truth/expected.json, priced from the gym sheet and from the example rates.
for (const [id, exp] of Object.entries(expected)) {
  if (exp.outcome !== "priced") continue;
  const k = key[id];
  for (const [name, rs] of [["gym sheet", sheet], ["example rates", EXAMPLE_RATES]]) {
    const r = price(rs, k, k.material, k.finish);
    let ok = r.unit === exp.unit && r.total === exp.total;
    // Where the engine's last run is on disk, every line, the cost and the lead time must match it too.
    let lines = "";
    if (existsSync(join(gym, "out", id, "result.json"))) {
      const py = read(`out/${id}/result.json`).price;
      const same = py.lines.length === r.lines.length && py.lines.every((l, i) => Math.abs(l.amount - r.lines[i].amount) < 1e-9)
        && py.cost === r.cost && py.lead_days === r.leadDays;
      ok &&= same;
      lines = same ? `  ${r.lines.length} lines, cost and lead time match` : "  lines differ from out/result.json";
    }
    if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} ${id} ${k.drawing_number.padEnd(11)} ${name.padEnd(13)} unit ${r.unit.toFixed(2)} (want ${exp.unit.toFixed(2)})  total ${r.total.toFixed(2)} (want ${exp.total.toFixed(2)})${lines}`);
  }
}

console.log(fail ? `\n${fail} failed.` : "\nAll six priced cases match truth/expected.json.");
process.exit(fail ? 1 : 0);
