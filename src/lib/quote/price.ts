// Prices one machined part from a shop's rate sheet. A straight port of the gym engine
// (wf-factory/fde/gym/case-02-drawing-to-quote/quote/price.py): same steps, same order, same rounding.
// Plain code only. It runs in the browser and nothing leaves it.
// Kept free of imports so `node scripts/check-quote-parity.mjs` can load it directly.

export type Material = { name: string; density_g_cc: number; per_kg: number; factor: number };
export type Finish = { name: string; per_part: number; lot_min: number };
export type Band = { band_at_or_below_mm: number; factor: number };

export type Rates = {
  machines_per_hour: { lathe: number; vmc: number; bench: number; cmm: number };
  setup_minutes: { lathe: number; vmc_per_setup: number; milled_setups: number; vmc_secondary_for_cross_holes: number };
  materials: Record<string, Material>;
  stock: {
    bar_diameters_mm: number[]; bar_diameter_allowance_mm: number; bar_length_allowance_mm: number;
    plate_thickness_mm: number[]; plate_side_allowance_mm: number; plate_thickness_allowance_mm: number;
    scrap_allowance: number;
  };
  cycle_minutes: {
    turned: { load_unload: number; per_face: number; faces: number; per_diameter: number; per_bore: number; per_ext_thread: number; per_int_thread: number; per_groove: number; part_off: number };
    cross_holes: { load_unload: number; per_hole: number };
    milled: { load_unload_per_setup: number; profile_per_mm_perimeter: number; facing_per_1000_mm2_per_side: number; per_pocket: number; per_through_hole: number; per_tapped_hole: number; per_reamed_hole: number };
  };
  tolerance_factor: Band[];
  bench_minutes_per_part: number;
  inspection: { first_article_minutes: number; per_part_minutes: number; sample_share: number; full_inspection_band_at_or_below_mm: number };
  finishes: Record<string, Finish>;
  bought_out_markup: number;
  certs: { coc: number; material_3_1: number };
  pricing: { target_margin_of_price: number; min_order_value: number };
  lead_time_working_days: { base: number; with_finish: number; with_material_certs: number };
};

export type Part = {
  part_type: "turned" | "milled";
  quantity: number;
  tightest_band_mm: number;
  material_certs: boolean;
  coc: boolean;
  // turned
  overall_length: number; max_diameter: number; turned_diameters: number; bores: number;
  ext_threads: number; int_threads: number; grooves: number; cross_holes: number;
  // milled
  length: number; width: number; height: number;
  through_holes: number; tapped_holes: number; reamed_holes: number; pockets: number;
};

export type Line = { group: string; label: string; working: string; amount: number };
export type Result = {
  lines: Line[]; cost: number; margin: number; gross: number; minOrderApplied: boolean; minOrder: number;
  batch: number; unit: number; total: number; qty: number; leadDays: number;
};

// "No finish" is the one fixed key: it adds no line and no lead time.
export const NO_FINISH = "none";

const EPS = 1e-9;
// Python's round(x, n) for the values met here: the exact decimal value, rounded to n places.
const round = (v: number, n: number) => Number(v.toFixed(n));
// Python's "{:g}": up to six significant figures, no trailing zeros.
export const g = (v: number) => String(Number(v.toPrecision(6)));
export const gbp = (v: number) => v.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rate = (v: number) => `${gbp(v)}/h`;
const fix = (v: number, n: number) => v.toLocaleString("en-GB", { minimumFractionDigits: n, maximumFractionDigits: n });
const pct = (v: number) => `${g(v * 100)}%`;
const many = (count: number, one: string, many = `${one}s`) => `${g(count)} ${count === 1 ? one : many}`;

function nextSize(sizes: number[], atLeast: number) {
  return [...sizes].sort((a, b) => a - b).find((s) => s >= atLeast - EPS);
}

export function tolFactor(rs: Rates, tight: number) {
  const band = [...rs.tolerance_factor].sort((a, b) => a.band_at_or_below_mm - b.band_at_or_below_mm).find((b) => tight <= b.band_at_or_below_mm + EPS);
  return band ? band.factor : 1;
}

export class QuoteError extends Error {}

export function price(rs: Rates, f: Part, materialKey: string, finishKey: string): Result {
  const lines: Line[] = [];
  const add = (group: string, label: string, working: string, amount: number) => lines.push({ group, label, working, amount: round(amount, 4) });

  const qty = Math.trunc(f.quantity);
  if (!(qty >= 1)) throw new QuoteError("Put in a quantity of 1 or more.");
  const mat = rs.materials[materialKey];
  if (!mat) throw new QuoteError("Pick a material.");
  const fin = rs.finishes[finishKey] ?? rs.finishes[NO_FINISH];
  const st = rs.stock;
  const mh = rs.machines_per_hour;
  const su = rs.setup_minutes;
  const tight = f.tightest_band_mm;
  const tf = tolFactor(rs, tight);
  const mf = mat.factor;
  const turned = f.part_type === "turned";

  // Material: the next standard bar or plate above the part plus allowances.
  let cc: number;
  let blank: string;
  if (turned) {
    const need = f.max_diameter + st.bar_diameter_allowance_mm;
    const bar = nextSize(st.bar_diameters_mm, need);
    if (bar === undefined) throw new QuoteError(`No standard bar at or above Ø${g(need)} on your rates. Add a bigger bar size.`);
    const blen = f.overall_length + st.bar_length_allowance_mm;
    cc = (Math.PI / 4) * bar ** 2 * blen / 1000;
    blank = `bar Ø${g(bar)} x ${g(blen)} long (Ø${g(f.max_diameter)} + ${g(st.bar_diameter_allowance_mm)}, next standard bar; length ${g(f.overall_length)} + ${g(st.bar_length_allowance_mm)})`;
  } else {
    const pl = f.length + st.plate_side_allowance_mm;
    const pw = f.width + st.plate_side_allowance_mm;
    const need = f.height + st.plate_thickness_allowance_mm;
    const pt = nextSize(st.plate_thickness_mm, need);
    if (pt === undefined) throw new QuoteError(`No standard plate at or above ${g(need)} thick on your rates. Add a thicker plate.`);
    cc = pl * pw * pt / 1000;
    blank = `plate ${g(pl)} x ${g(pw)} x ${g(pt)} (${g(f.length)} x ${g(f.width)} + ${g(st.plate_side_allowance_mm)} each way; ${g(f.height)} + ${g(st.plate_thickness_allowance_mm)}, next standard thickness)`;
  }
  const kg = cc * mat.density_g_cc / 1000;
  const scrap = 1 + st.scrap_allowance;
  add("Material", `${mat.name}, ${blank}`,
    `${fix(cc, 2)} cc x ${g(mat.density_g_cc)} g/cc = ${fix(kg, 4)} kg each, x ${gbp(mat.per_kg)}/kg x ${qty} x ${fix(scrap, 2)} for scrap`,
    kg * mat.per_kg * qty * scrap);

  // Setup.
  if (turned) {
    add("Setup", "Lathe setup", `${g(su.lathe)} min x ${rate(mh.lathe)}`, su.lathe / 60 * mh.lathe);
    if (f.cross_holes) {
      const m = su.vmc_secondary_for_cross_holes;
      add("Setup", "Mill setup for cross holes", `${g(m)} min x ${rate(mh.vmc)}`, m / 60 * mh.vmc);
    }
  } else {
    const n = su.milled_setups;
    add("Setup", `Mill setups (${g(n)})`, `${g(n)} x ${g(su.vmc_per_setup)} min x ${rate(mh.vmc)}`, n * su.vmc_per_setup / 60 * mh.vmc);
  }

  // Cycle time from the features, times the material and tolerance factors.
  const factorNote = `x ${g(mf)} material factor x ${g(tf)} tolerance factor (band ${g(tight)})`;
  if (turned) {
    const c = rs.cycle_minutes.turned;
    const parts: [string, number][] = [
      ["load", c.load_unload], [many(c.faces, "face"), c.faces * c.per_face],
      [many(f.turned_diameters, "diameter"), f.turned_diameters * c.per_diameter], [many(f.bores, "bore"), f.bores * c.per_bore],
      [many(f.ext_threads, "ext thread"), f.ext_threads * c.per_ext_thread], [many(f.int_threads, "int thread"), f.int_threads * c.per_int_thread],
      [many(f.grooves, "groove"), f.grooves * c.per_groove], ["part off", c.part_off],
    ];
    const base = parts.reduce((s, [, v]) => s + v, 0);
    const mins = base * mf * tf;
    add("Machining", "Lathe cycle",
      `${parts.map(([k, v]) => `${k} ${g(v)}`).join(" + ")} = ${fix(base, 2)} min, ${factorNote} = ${fix(mins, 3)} min each x ${qty} x ${rate(mh.lathe)}`,
      mins * qty / 60 * mh.lathe);
    if (f.cross_holes) {
      const x = rs.cycle_minutes.cross_holes;
      const b2 = x.load_unload + f.cross_holes * x.per_hole;
      const m2 = b2 * mf * tf;
      add("Machining", "Cross holes on the mill",
        `load ${g(x.load_unload)} + ${many(f.cross_holes, "hole")} x ${g(x.per_hole)} = ${fix(b2, 2)} min, ${factorNote} = ${fix(m2, 3)} min each x ${qty} x ${rate(mh.vmc)}`,
        m2 * qty / 60 * mh.vmc);
    }
  } else {
    const c = rs.cycle_minutes.milled;
    const n = su.milled_setups;
    const perim = 2 * (f.length + f.width);
    const area = f.length * f.width;
    const parts: [string, number][] = [
      ["load", n * c.load_unload_per_setup], ["profile", perim * c.profile_per_mm_perimeter],
      ["facing", area / 1000 * c.facing_per_1000_mm2_per_side * 2], [many(f.pockets, "pocket"), f.pockets * c.per_pocket],
      [many(f.through_holes, "through hole"), f.through_holes * c.per_through_hole], [`${f.tapped_holes} tapped`, f.tapped_holes * c.per_tapped_hole],
      [`${f.reamed_holes} reamed`, f.reamed_holes * c.per_reamed_hole],
    ];
    const base = parts.reduce((s, [, v]) => s + v, 0);
    const mins = base * mf * tf;
    add("Machining", "Mill cycle",
      `${parts.map(([k, v]) => `${k} ${g(round(v, 2))}`).join(" + ")} = ${fix(base, 2)} min, ${factorNote} = ${fix(mins, 3)} min each x ${qty} x ${rate(mh.vmc)}`,
      mins * qty / 60 * mh.vmc);
  }

  const b = rs.bench_minutes_per_part;
  add("Machining", "Deburr", `${g(b)} min x ${qty} x ${rate(mh.bench)}`, b * qty / 60 * mh.bench);

  // Inspection: every part at or under the full inspection band, otherwise a sample.
  const ins = rs.inspection;
  let nIns: number;
  let why: string;
  if (tight <= ins.full_inspection_band_at_or_below_mm + EPS) {
    nIns = qty; why = `every part, band ${g(tight)}`;
  } else {
    nIns = Math.ceil(qty * ins.sample_share - EPS); why = `${pct(ins.sample_share)} sample, rounded up`;
  }
  const im = ins.first_article_minutes + nIns * ins.per_part_minutes;
  add("Inspection", "First article and inspection",
    `${g(ins.first_article_minutes)} min + ${many(nIns, "part")} (${why}) x ${g(ins.per_part_minutes)} min = ${g(im)} min x ${rate(mh.cmm)}`,
    im / 60 * mh.cmm);

  // Finishing, with the finisher's lot minimum and handling on bought-out work.
  const hasFinish = finishKey !== NO_FINISH && !!rs.finishes[finishKey];
  if (hasFinish) {
    const raw = fin.per_part * qty;
    const used = Math.max(raw, fin.lot_min);
    const mk = rs.bought_out_markup;
    add("Finishing", fin.name,
      `the larger of ${qty} x ${gbp(fin.per_part)} = ${gbp(raw)} and the lot minimum ${gbp(fin.lot_min)}, so ${gbp(used)}, x ${fix(1 + mk, 2)} for handling`,
      used * (1 + mk));
  }
  if (f.coc) add("Certificates", "Certificate of conformity", "per batch", rs.certs.coc);
  if (f.material_certs) add("Certificates", "Material certificates 3.1", "per batch", rs.certs.material_3_1);

  const cost = lines.reduce((s, l) => s + l.amount, 0);
  const p = rs.pricing;
  const gross = cost / (1 - p.target_margin_of_price);
  const minOrderApplied = gross < p.min_order_value;
  const batch = Math.max(gross, p.min_order_value);
  const unit = Math.ceil(batch / qty * 100 - 1e-6) / 100;
  const total = round(unit * qty, 2);
  const lt = rs.lead_time_working_days;
  const leadDays = lt.base + (hasFinish ? lt.with_finish : 0) + (f.material_certs ? lt.with_material_certs : 0);
  return { lines, cost: round(cost, 2), margin: p.target_margin_of_price, gross: round(gross, 2), minOrderApplied, minOrder: p.min_order_value, batch, unit, total, qty, leadDays };
}

// The sum that turns cost into a price, in words.
export function summary(r: Result) {
  return `${gbp(r.cost)} cost / (1 - ${pct(r.margin)} margin) = ${gbp(r.gross)}`
    + (r.minOrderApplied ? `, raised to the ${gbp(r.minOrder)} minimum order` : "")
    + `. ${gbp(r.batch)} / ${r.qty} = £${fix(r.batch / r.qty, 4)} each, rounded up to the penny: ${gbp(r.unit)}. x ${r.qty} = ${gbp(r.total)}`;
}
