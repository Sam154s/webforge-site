"use client";

import { useEffect, useRef, useState } from "react";
import { EXAMPLES } from "./examples";
import { chatPrompt, jsonPrompt } from "./prompt";
import { buildRequest, PROVIDERS, readReply, sniff, type FileIn, type Provider } from "./providers";
import { isInvalid, SCHEMA, validate, type Check } from "./schema";
import { copyText, Sheet } from "./sheet";
import { EXAMPLE_SHOP, readShop, shopFile, type Shop } from "./shop";

// Everything on this page runs in the browser. The key and the shop setup live in localStorage; the drawing goes from this
// browser straight to the shop's own AI provider. Nothing is sent to our server and nothing here is tracked.

const AI_KEY = "drawing-check.ai";
const SHOP_KEY = "drawing-check.shop";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024; // keeps the base64 under the 5 MB per image the providers accept
const MAX_EDGE = 2400;

type Ai = { provider: Provider; key: string; model: string };
const store = {
  get<T>(k: string): T | null { try { const v = window.localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } },
  set(k: string, v: unknown) { try { window.localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  drop(k: string) { try { window.localStorage.removeItem(k); } catch { /* storage blocked */ } },
};

function Num({ n }: { n: number }) { return <span className="dc-num" aria-hidden>{n}</span>; }

// ---------------------------------------------------------------- 1. your AI account

function AiPanel({ ai, setAi }: { ai: Ai | null; setAi: (a: Ai | null) => void }) {
  const [provider, setProvider] = useState<Provider>(ai?.provider ?? "anthropic");
  const [key, setKey] = useState(ai?.key ?? "");
  const [model, setModel] = useState(ai?.model ?? PROVIDERS.anthropic.model);
  const [show, setShow] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => { if (ai) { setProvider(ai.provider); setKey(ai.key); setModel(ai.model); } }, [ai]);

  function pick(p: Provider) {
    setProvider(p);
    if (!model.trim() || model === PROVIDERS[provider].model) setModel(PROVIDERS[p].model);
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = { provider, key: key.trim(), model: model.trim() || PROVIDERS[provider].model };
    if (!next.key) { setNote("Paste your key first."); return; }
    setAi(next);
    setNote(store.set(AI_KEY, next) ? "Saved in this browser." : "Saved for this visit only. This browser won't let us keep it.");
  }
  function remove() {
    store.drop(AI_KEY); setAi(null); setKey(""); setNote("Key removed from this browser.");
  }

  return (
    <form className="dc-card" onSubmit={save} aria-labelledby="dc-ai-h">
      <h3 id="dc-ai-h" className="dc-card-h"><Num n={1} />Your AI account</h3>
      <p className="dc-card-p">Use your own Anthropic or OpenAI API key. You pay your provider for each check, usually pennies.</p>
      <fieldset className="dc-seg">
        <legend className="sr-only">Provider</legend>
        {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
          <label key={p} className={provider === p ? "on" : undefined}>
            <input type="radio" name="provider" value={p} checked={provider === p} onChange={() => pick(p)} />
            {PROVIDERS[p].label}
          </label>
        ))}
      </fieldset>
      <label className="dc-field">
        <span>API key <a href={PROVIDERS[provider].keysUrl} target="_blank" rel="noopener">Get a key</a></span>
        <span className="dc-keyrow">
          <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder={PROVIDERS[provider].keyHint} autoComplete="off" spellCheck={false} />
          <button type="button" className="dc-btn alt sm" onClick={() => setShow(!show)} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
        </span>
      </label>
      <p className="dc-help">Your key stays in this browser and goes only to your AI provider. Anyone using this browser can read it, so use a key with a spending limit.</p>
      <label className="dc-field">
        <span>Model</span>
        <input value={model} onChange={(e) => setModel(e.target.value)} spellCheck={false} />
      </label>
      <div className="dc-card-act">
        <button type="submit" className="dc-btn">Save</button>
        {ai && <button type="button" className="dc-btn alt" onClick={remove}>Remove key</button>}
        <p className="dc-saved" aria-live="polite">{note}</p>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- 2. your shop

const LIST_FIELDS: [keyof Shop, string, string][] = [
  ["materials", "Materials you stock", "One per line"],
  ["finishesInHouse", "Finishes you do in house", "One per line"],
  ["finishesSentOut", "Finishes you send out", "One per line"],
  ["processesDo", "Processes you do", "One per line"],
  ["processesDont", "Processes you don't do", "One per line"],
  ["certs", "Certificates and reports you provide", "For example 3.1 certs, CoC, FAI"],
  ["questions", "Questions you always ask", "One per line"],
];
const MM_FIELDS: [keyof Shop, string][][] = [
  [["tightestTurnedMm", "Turned"], ["tightestMilledMm", "Milled"]],
  [["turnMaxLengthMm", "Length"], ["turnMaxDiaMm", "Diameter"]],
  [["millMaxXMm", "X"], ["millMaxYMm", "Y"], ["millMaxZMm", "Z"]],
];
const MM_LABELS = ["Tightest tolerance band you hold (mm)", "Largest turned part (mm)", "Largest milled part (mm)"];

function ShopPanel({ shop, example, setShop }: { shop: Shop; example: boolean; setShop: (s: Shop, example: boolean) => void }) {
  const fileIn = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  // Lists are edited as plain text, one item per line, and turned back into lists as you type.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const listText = (k: keyof Shop) => drafts[k] ?? (shop[k] as string[]).join("\n");

  function change(k: keyof Shop, v: string) {
    if (Array.isArray(shop[k])) {
      setDrafts({ ...drafts, [k]: v });
      setShop({ ...shop, [k]: v.split("\n").map((x) => x.trim()).filter(Boolean) }, false);
    } else setShop({ ...shop, [k]: v }, false);
  }
  function download() {
    const url = URL.createObjectURL(new Blob([shopFile(shop)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "drawing-check-shop.json"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function load(f: File | undefined) {
    if (!f) return;
    try {
      const s = readShop(JSON.parse(await f.text()));
      if (!s) throw new Error("shape");
      setDrafts({}); setShop(s, false); setNote(`Loaded ${f.name}.`);
    } catch { setNote("That file isn't a shop setup from this page."); }
    if (fileIn.current) fileIn.current.value = "";
  }

  return (
    <details className="dc-card dc-shopcard">
      <summary>
        <h3 id="dc-shop-h" className="dc-card-h"><Num n={2} />Your shop<span className="dc-edit" aria-hidden>Edit</span></h3>
        <p className="dc-card-p">The check judges each drawing against this. Saved in this browser as you type.</p>
        <p className="dc-shopsum">{summary(shop)}</p>
        {example && <p className="dc-example">These are example values. Change them to your shop&rsquo;s.</p>}
      </summary>
      <div className="dc-shop">
        <label className="dc-field wide"><span>Shop name</span><input value={shop.name} onChange={(e) => change("name", e.target.value)} /></label>
        {MM_FIELDS.map((group, gi) => (
          <fieldset key={gi} className="dc-field wide dc-mm">
            <legend>{MM_LABELS[gi]}</legend>
            <div>{group.map(([k, l]) => (
              <label key={k}><span>{l}</span><input inputMode="decimal" value={shop[k] as string} onChange={(e) => change(k, e.target.value)} /></label>
            ))}</div>
          </fieldset>
        ))}
        {LIST_FIELDS.map(([k, l, hint]) => (
          <label key={k} className="dc-field"><span>{l} <em>{hint}</em></span><textarea rows={4} value={listText(k)} onChange={(e) => change(k, e.target.value)} /></label>
        ))}
        <label className="dc-field"><span>Email sign-off</span><textarea rows={4} value={shop.signOff} onChange={(e) => change("signOff", e.target.value)} /></label>
      </div>
      <div className="dc-card-act">
        <button type="button" className="dc-btn alt" onClick={download}>Export for your team</button>
        <button type="button" className="dc-btn alt" onClick={() => fileIn.current?.click()}>Import</button>
        <input ref={fileIn} type="file" accept="application/json,.json" hidden onChange={(e) => load(e.target.files?.[0])} />
        <button type="button" className="dc-btn alt" onClick={() => { setDrafts({}); setShop(EXAMPLE_SHOP, true); setNote("Back to the example values."); }}>Use the example</button>
        <p className="dc-saved" aria-live="polite">{note}</p>
      </div>
    </details>
  );
}

function summary(s: Shop) {
  const bits = [
    s.name.trim(),
    s.materials.length ? `${s.materials.length} material${s.materials.length === 1 ? "" : "s"} stocked` : "",
    s.tightestTurnedMm.trim() || s.tightestMilledMm.trim() ? `Holds ${[s.tightestTurnedMm.trim() && `${s.tightestTurnedMm.trim()} turned`, s.tightestMilledMm.trim() && `${s.tightestMilledMm.trim()} milled`].filter(Boolean).join(", ")}` : "",
    s.finishesSentOut.length ? `${s.finishesSentOut.length} finish${s.finishesSentOut.length === 1 ? "" : "es"} sent out` : "",
  ].filter(Boolean);
  return bits.length ? `${bits.join(". ")}.` : "Nothing set up yet.";
}

// ---------------------------------------------------------------- 3. check a drawing

async function toBase64(blob: Blob): Promise<string> {
  const url: string = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(blob); });
  return url.slice(url.indexOf(",") + 1);
}

// Big photos and scans are shrunk in the browser to a size the providers accept. Drawings stay legible at 2400 px.
async function shrink(file: File, mime: "image/png" | "image/jpeg"): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  if (scale === 1 && file.size <= MAX_IMAGE_BYTES) { img.close(); return file; }
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  img.close();
  const enc = (type: string, q?: number) => new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), type, q));
  let out = await enc(mime, 0.9);
  if (out.size > MAX_IMAGE_BYTES) out = await enc("image/jpeg", 0.85);
  return out;
}

async function prepare(file: File): Promise<FileIn | string> {
  if (file.size > MAX_BYTES) return "That file is over 10 MB. Send a smaller PDF or image of the drawing.";
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const mime = sniff(head);
  if (!mime) return "That isn't a PDF, PNG or JPG. Use the drawing in one of those.";
  if (mime === "application/pdf") return { name: file.name, mime, base64: await toBase64(file) };
  try {
    const blob = await shrink(file, mime);
    if (blob.size > MAX_IMAGE_BYTES) return "That image is too large to send. Try a PDF, or a smaller image.";
    return { name: file.name, mime: blob.type === "image/png" ? "image/png" : "image/jpeg", base64: await toBase64(blob) };
  } catch {
    return "We couldn't open that image. Try saving it again as a PNG or JPG.";
  }
}

function CopyFallback({ shop }: { shop: Shop }) {
  const box = useRef<HTMLPreElement>(null);
  const [state, setState] = useState("");
  const text = chatPrompt(shop);
  async function copy() {
    if (await copyText(text)) setState("Copied. Now paste it into Claude or ChatGPT with the drawing.");
    else {
      const sel = window.getSelection();
      if (box.current && sel) { const r = document.createRange(); r.selectNodeContents(box.current); sel.removeAllRanges(); sel.addRange(r); }
      setState("Selected. Press Ctrl+C or Cmd+C to copy.");
    }
  }
  return (
    <div className="dc-fallback">
      <ol className="dc-steps">
        <li><Num n={1} /><span><b>Open Claude or ChatGPT.</b> Your own account, at <a href="https://claude.ai" target="_blank" rel="noopener">claude.ai</a> or <a href="https://chatgpt.com" target="_blank" rel="noopener">chatgpt.com</a>.</span></li>
        <li><Num n={2} /><span><b>Attach the drawing.</b> The PDF the customer sent, or a photo of it.</span></li>
        <li><Num n={3} /><span><b>Paste the check and send.</b> It already has your shop setup in it.</span></li>
      </ol>
      <div className="dc-prompt">
        <div className="dc-prompt-bar">
          <button type="button" className="dc-btn" onClick={copy}>Copy the drawing check</button>
          <p className="dc-saved" aria-live="polite">{state}</p>
        </div>
        <pre ref={box} className="dc-prompt-text" tabIndex={0} aria-label="The drawing check instruction">{text}</pre>
      </div>
    </div>
  );
}

function Run({ ai, shop, onResult }: { ai: Ai | null; shop: Shop; onResult: (c: Check | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [secs, setSecs] = useState(0);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const [paste, setPaste] = useState(false);
  const pickRef = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!busy) return;
    const t0 = Date.now();
    const id = window.setInterval(() => setSecs(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [busy]);

  function choose(f: File | undefined) {
    if (!f) return;
    setError(""); onResult(null);
    if (f.size > MAX_BYTES) { setFile(null); setError("That file is over 10 MB. Send a smaller PDF or image of the drawing."); return; }
    setFile(f);
  }

  async function check() {
    if (!ai || !file) return;
    setError(""); onResult(null); setBusy(true); setSecs(0);
    try {
      const prepared = await prepare(file);
      if (typeof prepared === "string") { setError(prepared); return; }
      const req = buildRequest(ai.provider, ai.key, ai.model, prepared, jsonPrompt(shop), SCHEMA);
      abort.current = new AbortController();
      const timer = window.setTimeout(() => abort.current?.abort(), 180_000);
      let res: Response;
      try { res = await fetch(req.url, { ...req.init, signal: abort.current.signal }); } finally { window.clearTimeout(timer); }
      const body = await res.json().catch(() => null);
      const out = readReply(ai.provider, res.status, body);
      if (!out.ok) { setError(out.message); return; }
      const c = validate(out.raw);
      if (!c.is_drawing) { setError(`That doesn't look like an engineering drawing.${c.not_drawing_reason ? ` ${c.not_drawing_reason}` : ""}`); return; }
      onResult(c);
    } catch (e) {
      if (isInvalid(e)) setError("The answer didn't come back in the right shape. Try again.");
      else if ((e as Error)?.name === "AbortError") setError("Your AI provider took too long. Try again.");
      else setError("We couldn't reach your AI provider. Check your connection, or whether a browser extension is blocking it.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dc-card dc-run" role="group" aria-labelledby="dc-run-h">
      <h3 id="dc-run-h" className="dc-card-h"><Num n={3} />Check a drawing</h3>
      {!ai || paste ? (
        <>
          <p className="dc-card-p">{ai ? "Run it in your own chat instead." : "No key? Run it in your own Claude or ChatGPT instead. Add a key above to run it here."}</p>
          <CopyFallback shop={shop} />
          {ai && <button type="button" className="dc-link" onClick={() => setPaste(false)}>Back to checking here</button>}
        </>
      ) : (
        <>
          <label
            className={`dc-drop${over ? " over" : ""}${file ? " has" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); choose(e.dataTransfer.files?.[0]); }}
          >
            <input ref={pickRef} type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" className="sr-only" onChange={(e) => choose(e.target.files?.[0])} />
            <span className="dc-drop-h">{file ? file.name : "Drop the drawing here"}</span>
            <span className="dc-drop-p">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB. Drop another to swap it.` : "or choose a file. PDF, PNG or JPG, one drawing, up to 10 MB."}</span>
          </label>
          <div className="dc-card-act">
            <button type="button" className="dc-btn" onClick={check} disabled={!file || busy}>{busy ? `Checking, ${secs}s` : "Check the drawing"}</button>
            <button type="button" className="dc-link" onClick={() => setPaste(true)}>Or copy it into your own chat</button>
          </div>
          {busy && <p className="dc-busy" role="status">Sent to {PROVIDERS[ai.provider].label}. This usually takes about a minute.<span className="dc-bar" aria-hidden /></p>}
          {error && <p className="dc-error" role="alert">{error}</p>}
        </>
      )}
      <p className="dc-help">Don&rsquo;t use it on export-controlled drawings unless your company allows that AI account for them.</p>
    </div>
  );
}

// ---------------------------------------------------------------- the tool, and the examples

export function Tool() {
  const [ai, setAi] = useState<Ai | null>(null);
  const [shop, setShopState] = useState<Shop>(EXAMPLE_SHOP);
  const [example, setExample] = useState(true);
  const [result, setResult] = useState<Check | null>(null);
  const [ready, setReady] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = store.get<Ai>(AI_KEY);
    if (a && a.key && (a.provider === "anthropic" || a.provider === "openai")) setAi({ provider: a.provider, key: a.key, model: a.model || PROVIDERS[a.provider].model });
    const s = store.get<{ shop: unknown; example: boolean }>(SHOP_KEY);
    const read = s ? readShop(s.shop) : null;
    if (read) { setShopState(read); setExample(!!s?.example); }
    setReady(true);
  }, []);

  function setShop(s: Shop, ex: boolean) {
    setShopState(s); setExample(ex);
    store.set(SHOP_KEY, { shop: s, example: ex });
  }
  function show(c: Check | null) {
    setResult(c);
    if (c) window.setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 50);
  }

  return (
    <div className={`dc-tool${result ? " has-result" : ""}`} data-ready={ready || undefined}>
      <div className="dc-setup dc-noprint">
        <AiPanel ai={ai} setAi={setAi} />
        <ShopPanel key={ready ? "r" : "i"} shop={shop} example={example} setShop={setShop} />
      </div>
      <div className="dc-noprint"><Run ai={ai} shop={shop} onResult={show} /></div>
      {result && (
        <div ref={sheetRef} className="dc-result">
          <Sheet check={result} shop={shop} actions onAgain={() => { setResult(null); document.getElementById("dc-run-h")?.scrollIntoView(); }} />
        </div>
      )}
    </div>
  );
}

export function Examples() {
  const [id, setId] = useState(EXAMPLES[0].id);
  const ex = EXAMPLES.find((e) => e.id === id) ?? EXAMPLES[0];
  return (
    <div className="dc-ex dc-noprint">
      <div className="dc-tabs" role="tablist" aria-label="Example drawings">
        {EXAMPLES.map((e) => (
          <button key={e.id} type="button" role="tab" aria-selected={e.id === id} aria-controls="dc-ex-panel" onClick={() => setId(e.id)}>
            <b>{e.name}</b>
            <span>{e.note}</span>
          </button>
        ))}
      </div>
      <div className="dc-ex-grid" id="dc-ex-panel" role="tabpanel">
        <figure className="dc-panel dc-draw">
          <figcaption className="dc-ph">
            <span>The drawing</span>
            <a href={`/drawings-to-quote/${ex.id}.webp`} target="_blank" rel="noopener">Open full size</a>
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/drawings-to-quote/${ex.id}.webp`} width={1800} height={1274} alt={`Customer drawing ${ex.name}`} />
        </figure>
        <Sheet check={ex.check} shop={EXAMPLE_SHOP} />
      </div>
    </div>
  );
}
