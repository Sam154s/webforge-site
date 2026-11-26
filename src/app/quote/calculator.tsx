"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EXAMPLE_RATES } from "@/lib/quote/example-rates";
import { NO_FINISH, QuoteError, g, gbp, price, summary, type Part, type Rates, type Result } from "@/lib/quote/price";

// Everything here runs in the browser. Rates are kept in localStorage on this device only; nothing is sent.
const STORE = "wfo-quote-rates-v1";

type Path = (string | number)[];
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function setIn<T>(obj: T, path: Path, value: unknown): T {
  const next = clone(obj) as Record<string | number, unknown>;
  let at = next;
  path.slice(0, -1).forEach((k) => { at = at[k] as Record<string | number, unknown>; });
  at[path[path.length - 1]] = value;
  return next as T;
}
function getIn(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string | number, unknown>)[k]), obj);
}

const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

// Saved rates are taken figure by figure over the example, so a damaged or older save can never break the page.
function sanitize(raw: unknown): Rates {
  const out = clone(EXAMPLE_RATES);
  if (!raw || typeof raw !== "object") return out;
  const walk = (ex: unknown, path: Path) => {
    if (num(ex)) { const v = getIn(raw, path); if (num(v)) setIn2(path, v); return; }
    if (ex && typeof ex === "object" && !Array.isArray(ex)) Object.keys(ex).forEach((k) => walk((ex as Record<string, unknown>)[k], [...path, k]));
  };
  const setIn2 = (path: Path, v: unknown) => {
    let at = out as unknown as Record<string, unknown>;
    path.slice(0, -1).forEach((k) => { at = at[k] as Record<string, unknown>; });
    at[path[path.length - 1]] = v;
  };
  const r = raw as Record<string, unknown>;
  (["machines_per_hour", "setup_minutes", "cycle_minutes", "inspection", "certs", "pricing", "lead_time_working_days"] as const).forEach((k) => walk(EXAMPLE_RATES[k], [k]));
  (["bench_minutes_per_part", "bought_out_markup"] as const).forEach((k) => { if (num(r[k])) out[k] = r[k] as number; });
  const st = r.stock as Record<string, unknown> | undefined;
  if (st && typeof st === "object") {
    (Object.keys(out.stock) as (keyof Rates["stock"])[]).forEach((k) => {
      const v = st[k];
      if (Array.isArray(out.stock[k])) { if (Array.isArray(v) && v.length && v.every(num)) (out.stock[k] as number[]) = v as number[]; }
      else if (num(v)) (out.stock[k] as number) = v;
    });
  }
  if (Array.isArray(r.tolerance_factor) && r.tolerance_factor.every((b) => b && num(b.band_at_or_below_mm) && num(b.factor))) {
    out.tolerance_factor = r.tolerance_factor.map((b) => ({ band_at_or_below_mm: b.band_at_or_below_mm, factor: b.factor }));
  }
  const table = <T extends object>(v: unknown, keys: (keyof T)[]): Record<string, T> | null => {
    if (!v || typeof v !== "object") return null;
    const rows = Object.entries(v as Record<string, Record<string, unknown>>).filter(([, x]) => x && typeof x.name === "string" && keys.every((k) => k === "name" || num(x[k as string])));
    return rows.length ? Object.fromEntries(rows.map(([id, x]) => [id, Object.fromEntries(keys.map((k) => [k, x[k as string]])) as T])) : null;
  };
  out.materials = table<Rates["materials"][string]>(r.materials, ["name", "density_g_cc", "per_kg", "factor"]) ?? out.materials;
  const fin = table<Rates["finishes"][string]>(r.finishes, ["name", "per_part", "lot_min"]);
  if (fin) out.finishes = { [NO_FINISH]: EXAMPLE_RATES.finishes[NO_FINISH], ...fin };
  return out;
}

// ---------------------------------------------------------------- the part

type Form = Record<string, string> & { part_type: "turned" | "milled" };
const FIELDS_TURNED: [string, string][] = [["turned_diameters", "Turned diameters"], ["bores", "Bores"], ["ext_threads", "External threads"], ["int_threads", "Internal threads"], ["grooves", "Grooves"], ["cross_holes", "Cross holes"]];
const FIELDS_MILLED: [string, string][] = [["through_holes", "Through holes"], ["tapped_holes", "Tapped holes"], ["reamed_holes", "Reamed holes"], ["pockets", "Pockets"]];

// The example part: the adjuster shaft from our gym, 500 off in EN1A with a thread, a groove and zinc nickel.
const EXAMPLE_PART: Form = {
  part_type: "turned", name: "BMS-0417 rev C, adjuster shaft", material: "230M07", finish: "zinc-nickel",
  overall_length: "85", max_diameter: "16", length: "120", width: "80", height: "10",
  turned_diameters: "3", bores: "0", ext_threads: "1", int_threads: "0", grooves: "1", cross_holes: "0",
  through_holes: "4", tapped_holes: "0", reamed_holes: "2", pockets: "1",
  tightest_band_mm: "0.04", quantity: "500", material_certs: "", coc: "",
};

const parse = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "").trim()));

function toPart(f: Form): Part | string {
  const n = (k: string) => parse(f[k] ?? "");
  const count = (k: string) => (f[k]?.trim() ? n(k) : 0);
  const turned = f.part_type === "turned";
  const sizes = turned ? ["overall_length", "max_diameter"] : ["length", "width", "height"];
  if (sizes.some((k) => !(n(k) > 0))) return "Put in the part sizes.";
  const counts = (turned ? FIELDS_TURNED : FIELDS_MILLED).map(([k]) => k);
  if (counts.some((k) => !(count(k) >= 0) || !Number.isInteger(count(k)))) return "Feature counts are whole numbers, 0 or more.";
  if (!(n("tightest_band_mm") > 0)) return "Put in the tightest tolerance band, in mm.";
  if (!(n("quantity") >= 1) || !Number.isInteger(n("quantity"))) return "Put in a quantity of 1 or more.";
  const z = (k: string) => (turned ? count(k) : 0);
  const m = (k: string) => (turned ? 0 : count(k));
  return {
    part_type: f.part_type, quantity: n("quantity"), tightest_band_mm: n("tightest_band_mm"),
    material_certs: f.material_certs === "1", coc: f.coc === "1",
    overall_length: turned ? n("overall_length") : 0, max_diameter: turned ? n("max_diameter") : 0,
    length: turned ? 0 : n("length"), width: turned ? 0 : n("width"), height: turned ? 0 : n("height"),
    turned_diameters: z("turned_diameters"), bores: z("bores"), ext_threads: z("ext_threads"), int_threads: z("int_threads"), grooves: z("grooves"), cross_holes: z("cross_holes"),
    through_holes: m("through_holes"), tapped_holes: m("tapped_holes"), reamed_holes: m("reamed_holes"), pockets: m("pockets"),
  };
}

// ---------------------------------------------------------------- inputs

function TextIn({ label, value, onChange, hint, unit, wide, inputMode = "decimal", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; unit?: string; wide?: boolean; inputMode?: "decimal" | "numeric" | "text"; placeholder?: string;
}) {
  const id = useId();
  return (
    <div className={`qc-f${wide ? " wide" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="qc-in">
        <input id={id} value={value} inputMode={inputMode} placeholder={placeholder} autoComplete="off" spellCheck={false}
          aria-describedby={hint ? `${id}-h` : undefined} onChange={(e) => onChange(e.target.value)} />
        {unit && <span aria-hidden>{unit}</span>}
      </div>
      {hint && <p id={`${id}-h`} className="qc-hint">{hint}</p>}
    </div>
  );
}

// A number held in the rates. It keeps what is typed until it reads as a number, and follows a reset.
function NumIn({ label, value, onChange, unit, scale = 1 }: { label: string; value: number; onChange: (v: number) => void; unit?: string; scale?: number }) {
  const shown = (v: number) => g(Number((v * scale).toPrecision(10)));
  const [text, setText] = useState(shown(value));
  useEffect(() => {
    const p = parse(text);
    if (!(Number.isFinite(p) && Math.abs(p / scale - value) < 1e-12)) setText(shown(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const id = useId();
  const bad = !Number.isFinite(parse(text)) || parse(text) < 0;
  return (
    <div className="qc-f">
      <label htmlFor={id}>{label}</label>
      <div className="qc-in">
        <input id={id} value={text} inputMode="decimal" autoComplete="off" aria-invalid={bad || undefined}
          onChange={(e) => { setText(e.target.value); const p = parse(e.target.value); if (Number.isFinite(p) && p >= 0) onChange(p / scale); }}
          onBlur={() => setText(shown(value))} />
        {unit && <span aria-hidden>{unit}</span>}
      </div>
    </div>
  );
}

function ListIn({ label, value, onChange, unit }: { label: string; value: number[]; onChange: (v: number[]) => void; unit?: string }) {
  const shown = (v: number[]) => v.map(g).join(", ");
  const [text, setText] = useState(shown(value));
  const read = (s: string) => s.split(/[\s,;]+/).filter(Boolean).map(Number);
  useEffect(() => {
    if (!same(read(text), value)) setText(shown(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const id = useId();
  return (
    <div className="qc-f wide">
      <label htmlFor={id}>{label}</label>
      <div className="qc-in">
        <input id={id} value={text} inputMode="decimal" autoComplete="off" spellCheck={false}
          onChange={(e) => { setText(e.target.value); const v = read(e.target.value); if (v.length && v.every((x) => Number.isFinite(x) && x > 0)) onChange(v); }}
          onBlur={() => setText(shown(value))} />
        {unit && <span aria-hidden>{unit}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the quote as text, for an email

function quoteText(f: Form, rs: Rates, r: Result) {
  const mat = rs.materials[f.material]?.name ?? "";
  const fin = f.finish !== NO_FINISH && rs.finishes[f.finish] ? rs.finishes[f.finish].name.toLowerCase() : "no finish";
  const certs = [f.material_certs === "1" && "3.1 material certificates", f.coc === "1" && "certificate of conformity"].filter(Boolean).join(" and ");
  const out = [
    `Quote${f.name.trim() ? `: ${f.name.trim()}` : ""}`,
    `${f.part_type === "turned" ? "Turned" : "Milled"} part in ${mat}, ${fin}, tightest tolerance band ${g(parse(f.tightest_band_mm))} mm${certs ? `, with ${certs}` : ""}.`,
    "",
    `${gbp(r.unit)} each, ${gbp(r.total)} for ${r.qty}. Prices exclude VAT.`,
    `Lead time about ${r.leadDays} working days.`,
    "",
    "Working",
    ...r.lines.flatMap((l) => [`${l.group}, ${l.label}: ${gbp(l.amount)}`, `  ${l.working}`]),
    "",
    `${summary(r)}.`,
  ];
  return out.join("\n");
}

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back below */ }
  try {
    const t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  } catch { return false; }
}

// ---------------------------------------------------------------- the calculator

export function Calculator() {
  const [rates, setRates] = useState<Rates>(EXAMPLE_RATES);
  const [form, setForm] = useState<Form>(EXAMPLE_PART);
  const [copied, setCopied] = useState<"" | "ok" | "no">("");
  const loaded = useRef(false);
  const partRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) setRates(sanitize(JSON.parse(raw)));
    } catch { /* storage blocked or damaged: keep the example */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      if (same(rates, EXAMPLE_RATES)) window.localStorage.removeItem(STORE);
      else window.localStorage.setItem(STORE, JSON.stringify(rates));
    } catch { /* storage blocked: rates last for this visit */ }
  }, [rates]);

  // On a phone the price sits under the form, so a slim bar carries it while the form is on screen.
  useEffect(() => {
    const el = partRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setEditing(e.isIntersecting), { rootMargin: "0px 0px -35% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mine = !same(rates, EXAMPLE_RATES);
  const materialKeys = Object.keys(rates.materials);
  const finishKeys = Object.keys(rates.finishes);
  const material = rates.materials[form.material] ? form.material : materialKeys[0];
  const finish = rates.finishes[form.finish] ? form.finish : NO_FINISH;
  const f = useMemo<Form>(() => ({ ...form, material, finish }), [form, material, finish]);
  const set = (k: string) => (v: string) => setForm((x) => ({ ...x, [k]: v }));
  const rate = (path: Path) => (v: unknown) => setRates((r) => setIn(r, path, v));

  const result = useMemo<Result | string>(() => {
    const part = toPart(f);
    if (typeof part === "string") return part;
    if (!f.material) return "Add a material to your rates.";
    try { return price(rates, part, f.material, f.finish); } catch (e) { return e instanceof QuoteError ? e.message : "This part can't be priced on these rates."; }
  }, [f, rates]);

  async function onCopy() {
    if (typeof result === "string") return;
    const ok = await copy(quoteText(f, rates, result));
    setCopied(ok ? "ok" : "no");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(""), 2500);
  }

  const turned = f.part_type === "turned";
  const certs = [f.material_certs === "1" && "3.1 certs", f.coc === "1" && "CoC"].filter(Boolean).join(", ");

  return (
    <>
      <div className="qc-grid">
        <form ref={partRef} className="qc-panel qc-part" aria-label="The part" onSubmit={(e) => e.preventDefault()}>
          <h2 className="qc-ph">The part</h2>
          <div className="qc-body">
            <TextIn label="Part or drawing number" value={f.name} onChange={set("name")} inputMode="text" wide placeholder="Optional" />

            <fieldset className="qc-seg">
              <legend>Turned or milled</legend>
              {(["turned", "milled"] as const).map((t) => (
                <label key={t}>
                  <input type="radio" name="part_type" value={t} checked={f.part_type === t} onChange={() => setForm((x) => ({ ...x, part_type: t }))} />
                  <span>{t === "turned" ? "Turned" : "Milled"}</span>
                </label>
              ))}
            </fieldset>

            <div className="qc-row2">
              <Select label="Material" value={f.material} onChange={set("material")} options={materialKeys.map((k) => [k, rates.materials[k].name])} />
              <Select label="Finish" value={f.finish} onChange={set("finish")} options={finishKeys.map((k) => [k, rates.finishes[k].name])} />
            </div>

            <h3 className="qc-sh">Size</h3>
            <p className="qc-hint qc-hint-top">Finished sizes. The stock allowance comes from your rates.</p>
            <div className="qc-fields">
              {turned ? (
                <>
                  <TextIn label="Length" unit="mm" value={f.overall_length} onChange={set("overall_length")} />
                  <TextIn label="Largest diameter" unit="mm" value={f.max_diameter} onChange={set("max_diameter")} />
                </>
              ) : (
                <>
                  <TextIn label="Length" unit="mm" value={f.length} onChange={set("length")} />
                  <TextIn label="Width" unit="mm" value={f.width} onChange={set("width")} />
                  <TextIn label="Height" unit="mm" value={f.height} onChange={set("height")} />
                </>
              )}
            </div>

            <h3 className="qc-sh">Features</h3>
            <div className="qc-fields">
              {(turned ? FIELDS_TURNED : FIELDS_MILLED).map(([k, label]) => (
                <TextIn key={k} label={label} value={f[k]} onChange={set(k)} inputMode="numeric" />
              ))}
            </div>

            <h3 className="qc-sh">Batch</h3>
            <div className="qc-fields qc-batch">
              <TextIn label="Tightest tolerance band" unit="mm" value={f.tightest_band_mm} onChange={set("tightest_band_mm")} hint="Upper limit minus lower. ±0.01 is a 0.02 band." />
              <TextIn label="Quantity" value={f.quantity} onChange={set("quantity")} inputMode="numeric" />
            </div>
            <fieldset className="qc-checks">
              <legend>Certificates</legend>
              <label><input type="checkbox" checked={f.material_certs === "1"} onChange={(e) => set("material_certs")(e.target.checked ? "1" : "")} /> Material certificates 3.1</label>
              <label><input type="checkbox" checked={f.coc === "1"} onChange={(e) => set("coc")(e.target.checked ? "1" : "")} /> Certificate of conformity</label>
            </fieldset>
          </div>
        </form>

        <section className="qc-panel qc-price" id="price" aria-label="The price" aria-live="polite">
          <h2 className="qc-ph"><span>The price</span><span>{mine ? "On your rates" : "On example rates"}</span></h2>
          <div className="qc-print-head">
            <p><b>{f.name.trim() || "Quote"}</b></p>
            <p>{turned ? "Turned" : "Milled"}, {rates.materials[f.material]?.name}, {f.finish === NO_FINISH ? "no finish" : rates.finishes[f.finish]?.name.toLowerCase()}, band {f.tightest_band_mm} mm{certs ? `, ${certs}` : ""}</p>
          </div>
          {typeof result === "string" ? (
            <p className="qc-none">{result}</p>
          ) : (
            <>
              <div className="qc-big">
                <p><b className="n">{gbp(result.unit)}</b> each</p>
                <p><b className="n">{gbp(result.total)}</b> for {result.qty.toLocaleString("en-GB")}</p>
              </div>
              <p className="qc-lead">Lead time about {result.leadDays} working days. Prices exclude VAT.</p>
              <ol className="qc-lines">
                {result.lines.map((l, i) => (
                  <li key={i}>
                    <span className="qc-l-name"><b>{l.group}</b> {l.label}</span>
                    <span className="qc-l-amt n">{gbp(l.amount)}</span>
                    <span className="qc-l-work">{l.working}</span>
                  </li>
                ))}
              </ol>
              <dl className="qc-sum">
                <div><dt>Cost</dt><dd className="n">{gbp(result.cost)}</dd></div>
                <div><dt>With {g(result.margin * 100)}% margin on price</dt><dd className="n">{gbp(result.gross)}</dd></div>
                {result.minOrderApplied && <div><dt>Raised to the minimum order</dt><dd className="n">{gbp(result.minOrder)}</dd></div>}
                <div><dt>Each, rounded up to the penny</dt><dd className="n">{gbp(result.unit)}</dd></div>
                <div className="tot"><dt>Batch of {result.qty.toLocaleString("en-GB")}</dt><dd className="n">{gbp(result.total)}</dd></div>
              </dl>
              <p className="qc-work-sum">{summary(result)}.</p>
              <div className="qc-acts">
                <button type="button" className="qc-btn" onClick={onCopy}>{copied === "ok" ? "Copied" : "Copy quote"}</button>
                <button type="button" className="qc-btn line" onClick={() => window.print()}>Print</button>
                <span className="qc-copied" role="status">{copied === "ok" ? "Copied, with the working. Paste it into your email." : copied === "no" ? "Your browser blocked copying. Select the working and copy it." : ""}</span>
              </div>
            </>
          )}
        </section>
      </div>

      <a href="#price" className="qc-bar" data-on={editing || undefined} aria-hidden={!editing} tabIndex={editing ? 0 : -1}>
        {typeof result === "string" ? <span>{result}</span> : <span><b className="n">{gbp(result.unit)}</b> each, <b className="n">{gbp(result.total)}</b> for {result.qty.toLocaleString("en-GB")}</span>}
        <span className="qc-bar-go">Working</span>
      </a>

      <RatesEditor rates={rates} mine={mine} rate={rate} setRates={setRates} />
    </>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  const id = useId();
  return (
    <div className="qc-f">
      <label htmlFor={id}>{label}</label>
      <div className="qc-in qc-sel">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([k, name]) => <option key={k} value={k}>{name}</option>)}
        </select>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- your rates

type Def = [Path, string, string?, number?];
const GROUPS: { title: string; defs: Def[] }[] = [
  { title: "Machine rates", defs: [[["machines_per_hour", "lathe"], "Lathe", "£/h"], [["machines_per_hour", "vmc"], "Mill", "£/h"], [["machines_per_hour", "bench"], "Bench", "£/h"], [["machines_per_hour", "cmm"], "Inspection", "£/h"]] },
  { title: "Setup", defs: [[["setup_minutes", "lathe"], "Lathe setup", "min"], [["setup_minutes", "vmc_per_setup"], "Mill setup, each", "min"], [["setup_minutes", "milled_setups"], "Setups on a milled part"], [["setup_minutes", "vmc_secondary_for_cross_holes"], "Mill setup for cross holes", "min"]] },
  { title: "Turned cycle", defs: [
    [["cycle_minutes", "turned", "load_unload"], "Load and unload", "min"], [["cycle_minutes", "turned", "faces"], "Faces per part"], [["cycle_minutes", "turned", "per_face"], "Per face", "min"],
    [["cycle_minutes", "turned", "per_diameter"], "Per diameter", "min"], [["cycle_minutes", "turned", "per_bore"], "Per bore", "min"], [["cycle_minutes", "turned", "per_ext_thread"], "Per external thread", "min"],
    [["cycle_minutes", "turned", "per_int_thread"], "Per internal thread", "min"], [["cycle_minutes", "turned", "per_groove"], "Per groove", "min"], [["cycle_minutes", "turned", "part_off"], "Part off", "min"],
    [["cycle_minutes", "cross_holes", "load_unload"], "Cross holes: load on the mill", "min"], [["cycle_minutes", "cross_holes", "per_hole"], "Per cross hole", "min"],
  ] },
  { title: "Milled cycle", defs: [
    [["cycle_minutes", "milled", "load_unload_per_setup"], "Load and unload, per setup", "min"], [["cycle_minutes", "milled", "profile_per_mm_perimeter"], "Profile, per mm of perimeter", "min"],
    [["cycle_minutes", "milled", "facing_per_1000_mm2_per_side"], "Facing, per 1,000 mm² a side", "min"], [["cycle_minutes", "milled", "per_pocket"], "Per pocket", "min"],
    [["cycle_minutes", "milled", "per_through_hole"], "Per through hole", "min"], [["cycle_minutes", "milled", "per_tapped_hole"], "Per tapped hole", "min"], [["cycle_minutes", "milled", "per_reamed_hole"], "Per reamed hole", "min"],
  ] },
  { title: "Deburr and inspection", defs: [
    [["bench_minutes_per_part"], "Deburr per part", "min"], [["inspection", "first_article_minutes"], "First article", "min"], [["inspection", "per_part_minutes"], "Inspection per part", "min"],
    [["inspection", "sample_share"], "Sample inspected", "%", 100], [["inspection", "full_inspection_band_at_or_below_mm"], "Inspect every part at a band of", "mm or less"],
  ] },
  { title: "Stock", defs: [
    [["stock", "bar_diameter_allowance_mm"], "Bar diameter allowance", "mm"], [["stock", "bar_length_allowance_mm"], "Bar length allowance", "mm"],
    [["stock", "plate_side_allowance_mm"], "Plate allowance on length and width", "mm"], [["stock", "plate_thickness_allowance_mm"], "Plate thickness allowance", "mm"],
    [["stock", "scrap_allowance"], "Scrap allowance", "%", 100],
  ] },
  { title: "Certificates, margin and minimum order", defs: [
    [["certs", "material_3_1"], "Material certificates 3.1, per batch", "£"], [["certs", "coc"], "Certificate of conformity, per batch", "£"],
    [["bought_out_markup"], "Handling on finishing", "%", 100], [["pricing", "target_margin_of_price"], "Margin on price", "%", 100], [["pricing", "min_order_value"], "Minimum order", "£"],
  ] },
  { title: "Lead time", defs: [[["lead_time_working_days", "base"], "Base", "days"], [["lead_time_working_days", "with_finish"], "Added for a finish", "days"], [["lead_time_working_days", "with_material_certs"], "Added for 3.1 certs", "days"]] },
];

function RatesEditor({ rates, mine, rate, setRates }: { rates: Rates; mine: boolean; rate: (p: Path) => (v: unknown) => void; setRates: React.Dispatch<React.SetStateAction<Rates>> }) {
  const addRow = (table: "materials" | "finishes") => setRates((r) => {
    const id = `${table === "materials" ? "m" : "f"}-${Date.now().toString(36)}`;
    const row = table === "materials" ? { name: "New material", density_g_cc: 7.85, per_kg: 0, factor: 1 } : { name: "New finish", per_part: 0, lot_min: 0 };
    return setIn(r, [table, id], row);
  });
  const removeRow = (table: "materials" | "finishes", id: string) => setRates((r) => {
    const next = clone(r);
    delete (next[table] as Record<string, unknown>)[id];
    return next;
  });
  const onlyOne = Object.keys(rates.materials).length <= 1;

  return (
    <section className="qc-rates" id="rates" aria-labelledby="rates-h">
      <div className="qc-rates-head">
        <div>
          <h2 id="rates-h" className="qc-h2">Your rates</h2>
          <p className="qc-state">{mine ? "Your own rates, kept in this browser." : "These are example rates."}</p>
        </div>
        <button type="button" className="qc-btn line" onClick={() => setRates(clone(EXAMPLE_RATES))} disabled={!mine}>Reset to example rates</button>
      </div>

      <div className="qc-cards">
        {GROUPS.map((grp) => (
          <fieldset key={grp.title} className="qc-panel qc-card">
            <legend className="qc-ph">{grp.title}</legend>
            <div className="qc-fields">
              {grp.defs.map(([path, label, unit, scale]) => (
                <NumIn key={path.join(".")} label={label} unit={unit} scale={scale} value={getIn(rates, path) as number} onChange={rate(path)} />
              ))}
              {grp.title === "Stock" && (
                <>
                  <ListIn label="Standard bar diameters" unit="mm" value={rates.stock.bar_diameters_mm} onChange={rate(["stock", "bar_diameters_mm"])} />
                  <ListIn label="Standard plate thicknesses" unit="mm" value={rates.stock.plate_thickness_mm} onChange={rate(["stock", "plate_thickness_mm"])} />
                </>
              )}
            </div>
          </fieldset>
        ))}

        <fieldset className="qc-panel qc-card">
          <legend className="qc-ph">Tolerance factor</legend>
          <p className="qc-hint qc-card-note">Cycle time is multiplied by the factor of the tightest band it falls in. Looser than every band is a factor of 1.</p>
          <div className="qc-tol">
            {rates.tolerance_factor.map((b, i) => (
              <div key={i} className="qc-tol-row">
                <NumIn label="Band at or below" unit="mm" value={b.band_at_or_below_mm} onChange={rate(["tolerance_factor", i, "band_at_or_below_mm"])} />
                <NumIn label="Factor" value={b.factor} onChange={rate(["tolerance_factor", i, "factor"])} />
                <button type="button" className="qc-x" aria-label={`Remove the ${g(b.band_at_or_below_mm)} mm band`} onClick={() => setRates((r) => ({ ...clone(r), tolerance_factor: r.tolerance_factor.filter((_, j) => j !== i) }))}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="qc-add" onClick={() => setRates((r) => ({ ...clone(r), tolerance_factor: [...r.tolerance_factor, { band_at_or_below_mm: 0.01, factor: 1.5 }] }))}>Add a band</button>
        </fieldset>
      </div>

      <div className="qc-tables">
        <fieldset className="qc-panel qc-table">
          <legend className="qc-ph">Materials</legend>
          <div className="qc-trows">
            {Object.entries(rates.materials).map(([id, m]) => (
              <div key={id} className="qc-trow">
                <NameIn label="Material" value={m.name} onChange={rate(["materials", id, "name"])} />
                <NumIn label="Price" unit="£/kg" value={m.per_kg} onChange={rate(["materials", id, "per_kg"])} />
                <NumIn label="Density" unit="g/cc" value={m.density_g_cc} onChange={rate(["materials", id, "density_g_cc"])} />
                <NumIn label="Factor" value={m.factor} onChange={rate(["materials", id, "factor"])} />
                <button type="button" className="qc-x" disabled={onlyOne} aria-label={`Remove ${m.name}`} onClick={() => removeRow("materials", id)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="qc-add" onClick={() => addRow("materials")}>Add a material</button>
        </fieldset>

        <fieldset className="qc-panel qc-table">
          <legend className="qc-ph">Finishes</legend>
          <div className="qc-trows">
            {Object.entries(rates.finishes).filter(([id]) => id !== NO_FINISH).map(([id, x]) => (
              <div key={id} className="qc-trow fin">
                <NameIn label="Finish" value={x.name} onChange={rate(["finishes", id, "name"])} />
                <NumIn label="Per part" unit="£" value={x.per_part} onChange={rate(["finishes", id, "per_part"])} />
                <NumIn label="Lot minimum" unit="£" value={x.lot_min} onChange={rate(["finishes", id, "lot_min"])} />
                <button type="button" className="qc-x" aria-label={`Remove ${x.name}`} onClick={() => removeRow("finishes", id)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="qc-add" onClick={() => addRow("finishes")}>Add a finish</button>
        </fieldset>
      </div>
    </section>
  );
}

function NameIn({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="qc-f qc-name">
      <label htmlFor={id}>{label}</label>
      <div className="qc-in"><input id={id} value={value} maxLength={80} autoComplete="off" onChange={(e) => onChange(e.target.value)} /></div>
    </div>
  );
}
