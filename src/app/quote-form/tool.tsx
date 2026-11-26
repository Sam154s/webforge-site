"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildHtml, fileName, renderRoot } from "./html";
import {
  DEFAULT_SETUP, isEmail, LIMITS, newBlock, readSetup, setupFile, SETUP_KIND, slug, TYPES, typeName,
  type Block, type BlockType, type Setup, type Shop,
} from "./setup";

// Everything on this page runs in the browser. The setup lives in this browser's localStorage and in files the shop
// saves themselves. Nothing is sent to our server and nothing typed here is tracked.

const STORE_KEY = "quote-form.setup";
const store = {
  get(): unknown { try { const v = window.localStorage.getItem(STORE_KEY); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(v: Setup) { try { window.localStorage.setItem(STORE_KEY, JSON.stringify(v)); return true; } catch { return false; } },
};

function Num({ n }: { n: number | string }) { return <span className="qb-num" aria-hidden>{n}</span>; }

function save(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---------------------------------------------------------------- 1. your shop

function ShopCard({ shop, set, emailRef }: { shop: Shop; set: (s: Shop) => void; emailRef: React.RefObject<HTMLInputElement> }) {
  const logoIn = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const emailBad = touched && !!shop.email.trim() && !isEmail(shop.email.trim());

  function logo(f: File | undefined) {
    if (logoIn.current) logoIn.current.value = "";
    if (!f) return;
    if (!/^image\/(png|jpeg|gif|webp)$/.test(f.type)) { setNote("Use a PNG, JPG or WebP for the logo."); return; }
    if (f.size > LIMITS.logoBytes) { setNote("That logo is over 400 KB. Try a smaller copy."); return; }
    const r = new FileReader();
    r.onload = () => { set({ ...shop, logo: String(r.result) }); setNote(""); };
    r.onerror = () => setNote("We couldn’t read that file.");
    r.readAsDataURL(f);
  }

  return (
    <section className="qb-card qb-shop" aria-labelledby="qb-shop-h">
      <h3 id="qb-shop-h" className="qb-card-h"><Num n={1} />Your shop</h3>
      <p className="qb-card-p">This goes at the top of the form. Requests come to your email.</p>
      <div className="qb-grid2">
        <label className="qb-field"><span>Shop name</span><input value={shop.name} maxLength={LIMITS.name} onChange={(e) => set({ ...shop, name: e.target.value })} autoComplete="organization" /></label>
        <label className="qb-field">
          <span>Email requests go to</span>
          <input ref={emailRef} type="email" value={shop.email} maxLength={254} onChange={(e) => set({ ...shop, email: e.target.value })} onBlur={() => setTouched(true)} autoComplete="email" aria-invalid={emailBad || undefined} aria-describedby="qb-email-e" placeholder="quotes@yourshop.co.uk" />
          <em id="qb-email-e" className="qb-bad" aria-live="polite">{emailBad ? "That email address doesn’t look right." : ""}</em>
        </label>
        <label className="qb-field"><span>Form heading</span><input value={shop.title} maxLength={LIMITS.title} onChange={(e) => set({ ...shop, title: e.target.value })} /></label>
        <label className="qb-field"><span>Line under the heading <em>Optional</em></span><input value={shop.intro} maxLength={LIMITS.intro} onChange={(e) => set({ ...shop, intro: e.target.value })} /></label>
      </div>
      <div className="qb-grid2 qb-brand">
        <div className="qb-field">
          <span id="qb-logo-l">Logo <em>Optional. PNG, JPG or WebP up to 400 KB</em></span>
          <div className="qb-logo">
            <div className="qb-logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {shop.logo ? <img src={shop.logo} alt="Your logo" /> : <span>No logo</span>}
            </div>
            <button type="button" className="qb-btn alt sm" onClick={() => logoIn.current?.click()} aria-describedby="qb-logo-l">{shop.logo ? "Change" : "Add logo"}</button>
            {shop.logo && <button type="button" className="qb-btn alt sm" onClick={() => set({ ...shop, logo: "" })}>Remove</button>}
            <input ref={logoIn} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={(e) => logo(e.target.files?.[0])} />
          </div>
        </div>
        <div className="qb-field">
          <span id="qb-accent-l">Button colour <em>Optional</em></span>
          <div className="qb-logo">
            <input type="color" className="qb-swatch" value={shop.accent || "#111111"} onChange={(e) => set({ ...shop, accent: e.target.value })} aria-labelledby="qb-accent-l" />
            <span className="qb-hex">{shop.accent || "#111111"}</span>
            {shop.accent && <button type="button" className="qb-btn alt sm" onClick={() => set({ ...shop, accent: "" })}>Reset</button>}
          </div>
        </div>
      </div>
      <label className="qb-check"><input type="checkbox" checked={shop.credit} onChange={(e) => set({ ...shop, credit: e.target.checked })} /><span>Show a small &ldquo;Free form from Webflow Outreach&rdquo; line under the form</span></label>
      {note && <p className="qb-error" role="alert">{note}</p>}
    </section>
  );
}

// ---------------------------------------------------------------- 2. your form

function Lines({ label, hint, value, onChange }: { label: string; hint: string; value: string[]; onChange: (v: string[]) => void }) {
  // Edited as plain text, one item per line, and turned back into a list as you type.
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className="qb-field">
      <span>{label} <em>{hint}</em></span>
      <textarea
        rows={Math.min(8, Math.max(3, value.length + 1))}
        value={draft ?? value.join("\n")}
        onChange={(e) => { setDraft(e.target.value); onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 60)); }}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
}

function Editor({ b, set, onlySubject }: { b: Block; set: (b: Block) => void; onlySubject: (id: string) => void }) {
  return (
    <div className="qb-edit">
      <div className="qb-grid2">
        <label className="qb-field"><span>Question</span><input id={`qb-label-${b.id}`} value={b.label} maxLength={LIMITS.label} onChange={(e) => set({ ...b, label: e.target.value })} /></label>
        <label className="qb-field"><span>Help text <em>Optional</em></span><input value={b.help} maxLength={LIMITS.help} onChange={(e) => set({ ...b, help: e.target.value })} /></label>
      </div>
      {b.type === "text" && (
        <div className="qb-row">
          <label className="qb-field qb-inline"><span>Answer is</span>
            <select value={b.format ?? "text"} onChange={(e) => set({ ...b, format: e.target.value as Block["format"] })}>
              <option value="text">Any text</option>
              <option value="email">An email address</option>
              <option value="tel">A phone number</option>
            </select>
          </label>
          <label className="qb-check"><input type="checkbox" checked={!!b.subject} onChange={(e) => (e.target.checked ? onlySubject(b.id) : set({ ...b, subject: false }))} /><span>Put this answer in the email subject as the part</span></label>
        </div>
      )}
      {b.type === "choice" && (
        <>
          <Lines label="Options" hint="One per line" value={b.options ?? []} onChange={(options) => set({ ...b, options })} />
          <fieldset className="qb-seg">
            <legend>Your customer can pick</legend>
            {[[false, "One"], [true, "Any number"]].map(([v, l]) => (
              <label key={String(v)} className={!!b.multiple === v ? "on" : undefined}>
                <input type="radio" name={`qb-multi-${b.id}`} checked={!!b.multiple === v} onChange={() => set({ ...b, multiple: v as boolean })} />{l}
              </label>
            ))}
          </fieldset>
        </>
      )}
      {b.type === "dims" && (
        <>
          <Lines label="Sizes to ask for" hint="One per line, like Length or Bore diameter" value={b.fields ?? []} onChange={(fields) => set({ ...b, fields: fields.slice(0, LIMITS.fields) })} />
          <fieldset className="qb-seg">
            <legend>Units</legend>
            {(["mm", "in"] as const).map((u) => (
              <label key={u} className={(b.unit ?? "mm") === u ? "on" : undefined}>
                <input type="radio" name={`qb-unit-${b.id}`} checked={(b.unit ?? "mm") === u} onChange={() => set({ ...b, unit: u })} />{u === "mm" ? "Millimetres" : "Inches"}
              </label>
            ))}
          </fieldset>
        </>
      )}
      {b.type === "drawing" && <p className="qb-help">Reminds your customer to attach their drawing. If it&rsquo;s required they have to tick it.</p>}
      <label className="qb-check"><input type="checkbox" checked={b.required} onChange={(e) => set({ ...b, required: e.target.checked })} /><span>Required</span></label>
    </div>
  );
}

function Blocks({ blocks, setBlocks }: { blocks: Block[]; setBlocks: (b: Block[]) => void }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [said, setSaid] = useState("");
  const [undo, setUndo] = useState<{ block: Block; at: number } | null>(null);
  const focusNext = useRef<string | null>(null);

  useEffect(() => {
    if (!focusNext.current) return;
    const el = document.getElementById(focusNext.current);
    focusNext.current = null;
    el?.focus();
  });

  const name = (b: Block) => b.label.trim() || typeName(b.type);
  function update(b: Block) { setBlocks(blocks.map((x) => (x.id === b.id ? b : x))); }
  function onlySubject(id: string) { setBlocks(blocks.map((x) => (x.type === "text" ? { ...x, subject: x.id === id } : x))); }
  function move(i: number, by: -1 | 1) {
    const j = i + by;
    if (j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
    const id = next[j].id;
    const edge = (by === -1 && j === 0) || (by === 1 && j === blocks.length - 1);
    focusNext.current = `qb-${edge ? (by === -1 ? "down" : "up") : by === -1 ? "up" : "down"}-${id}`;
    setSaid(`${name(next[j])} moved to ${j + 1} of ${next.length}.`);
  }
  function remove(i: number) {
    const b = blocks[i];
    setBlocks(blocks.filter((_, k) => k !== i));
    setUndo({ block: b, at: i });
    setSaid(`${name(b)} removed.`);
    focusNext.current = "qb-undo";
  }
  function restore() {
    if (!undo) return;
    const next = blocks.slice();
    next.splice(Math.min(undo.at, next.length), 0, undo.block);
    setBlocks(next);
    setSaid(`${name(undo.block)} put back.`);
    focusNext.current = `qb-sum-${undo.block.id}`;
    setUndo(null);
  }
  function add(type: BlockType) {
    const b = newBlock(type, new Set(blocks.map((x) => x.id)));
    setBlocks([...blocks, b]);
    setOpen(new Set(open).add(b.id));
    setSaid(`${typeName(type)} added at the end.`);
    focusNext.current = `qb-label-${b.id}`;
  }
  function toggle(id: string, isOpen: boolean) {
    const n = new Set(open);
    if (isOpen) n.add(id); else n.delete(id);
    setOpen(n);
  }

  return (
    <section className="qb-card qb-blocks" aria-labelledby="qb-blocks-h">
      <h3 id="qb-blocks-h" className="qb-card-h"><Num n={2} />Your form</h3>
      <p className="qb-card-p">Each block is one question. Open one to change it.</p>
      <ol className="qb-list">
        {blocks.map((b, i) => (
          <li key={b.id} className="qb-item">
            <details open={open.has(b.id)} onToggle={(e) => toggle(b.id, (e.target as HTMLDetailsElement).open)}>
              <summary id={`qb-sum-${b.id}`}>
                <Num n={i + 1} />
                <span className="qb-sum-t"><b>{name(b)}</b><span>{typeName(b.type)}{b.required ? ", required" : ""}{b.type === "choice" ? `, ${(b.options ?? []).length} options` : ""}</span></span>
              </summary>
              <Editor b={b} set={update} onlySubject={onlySubject} />
            </details>
            <div className="qb-moves">
              <button type="button" id={`qb-up-${b.id}`} className="qb-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${name(b)} up`} title="Move up">
                <svg viewBox="0 0 16 16" aria-hidden><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
              </button>
              <button type="button" id={`qb-down-${b.id}`} className="qb-icon" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label={`Move ${name(b)} down`} title="Move down">
                <svg viewBox="0 0 16 16" aria-hidden><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" /></svg>
              </button>
              <button type="button" className="qb-icon" onClick={() => remove(i)} aria-label={`Remove ${name(b)}`} title="Remove">
                <svg viewBox="0 0 16 16" aria-hidden><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
          </li>
        ))}
      </ol>
      {!blocks.length && <p className="qb-help">No blocks yet. Add one below.</p>}
      <div className="qb-said">
        <p aria-live="polite">{said}</p>
        {undo && <button type="button" id="qb-undo" className="qb-link" onClick={restore}>Undo</button>}
      </div>
      <div className="qb-add" role="group" aria-labelledby="qb-add-h">
        <p id="qb-add-h" className="qb-add-h">Add a block</p>
        <div className="qb-add-row">
          {TYPES.map((x) => (
            <button key={x.type} type="button" className="qb-chip" onClick={() => add(x.type)} disabled={blocks.length >= LIMITS.blocks}>
              <span aria-hidden>+</span>{x.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 3. download

function Download({ setup, load, reset, emailRef }: { setup: Setup; load: (s: Setup) => void; reset: () => void; emailRef: React.RefObject<HTMLInputElement> }) {
  const fileIn = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [bad, setBad] = useState(false);

  function download() {
    const email = setup.shop.email.trim();
    if (!isEmail(email)) {
      setBad(true);
      setNote(email ? "Check the email address in Your shop first." : "Add the email address requests go to first.");
      emailRef.current?.focus();
      return;
    }
    if (!setup.blocks.length) { setBad(true); setNote("Add at least one block first."); return; }
    setBad(false);
    save(fileName(setup), buildHtml(setup), "text/html");
    setNote(`Downloaded ${fileName(setup)}.`);
  }
  async function open(f: File | undefined) {
    if (fileIn.current) fileIn.current.value = "";
    if (!f) return;
    try {
      const raw = JSON.parse(await f.text());
      const s = raw && raw.kind === SETUP_KIND ? readSetup(raw) : null;
      if (!s) throw new Error("shape");
      load(s); setBad(false); setNote(`Loaded ${f.name}.`);
    } catch { setBad(true); setNote("That file isn’t a setup saved from this page."); }
  }

  return (
    <section className="qb-card qb-dl" aria-labelledby="qb-dl-h">
      <h3 id="qb-dl-h" className="qb-card-h"><Num n={3} />Download</h3>
      <p className="qb-card-p">One HTML file. It&rsquo;s yours.</p>
      <div className="qb-act">
        <button type="button" className="qb-btn" onClick={download}>Download your form</button>
        <p className={bad ? "qb-saved qb-bad" : "qb-saved"} role={bad ? "alert" : "status"}>{note}</p>
      </div>
      <ol className="qb-steps">
        <li><Num n="A" /><span>Upload it to your website as a page.</span></li>
        <li><Num n="B" /><span>No website? Drag it onto <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer">Netlify Drop</a> for a free link.</span></li>
        <li><Num n="C" /><span>Link to it from your site or your email signature.</span></li>
      </ol>
      <div className="qb-act qb-files">
        <button type="button" className="qb-btn alt sm" onClick={() => save(`quote-form-setup${setup.shop.name.trim() ? `-${slug(setup.shop.name)}` : ""}.json`, setupFile(setup), "application/json")}>Save setup</button>
        <button type="button" className="qb-btn alt sm" onClick={() => fileIn.current?.click()}>Load setup</button>
        <input ref={fileIn} type="file" accept="application/json,.json" hidden onChange={(e) => open(e.target.files?.[0])} />
        <button type="button" className="qb-link" onClick={() => { if (window.confirm("Put the blocks back to our machine shop form? Your shop details stay.")) { reset(); setBad(false); setNote("Back to our machine shop form."); } }}>Start again</button>
      </div>
      <p className="qb-help">Saved in this browser as you go. Save setup keeps a copy you can load later.</p>
    </section>
  );
}

// ---------------------------------------------------------------- preview

function Preview({ setup, ready }: { setup: Setup; ready: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  const [phone, setPhone] = useState(false);
  // The frame loads once; after that new markup is posted in so it keeps its scroll position as you type.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doc = useMemo(() => buildHtml(setup, { preview: true }), [ready]);
  useEffect(() => {
    if (!loaded.current) return;
    const id = window.setTimeout(() => frame.current?.contentWindow?.postMessage({ qfRoot: renderRoot(setup) }, "*"), 120);
    return () => window.clearTimeout(id);
  }, [setup]);

  return (
    <section className="qb-card qb-prev" aria-labelledby="qb-prev-h">
      <div className="qb-prev-bar">
        <h3 id="qb-prev-h" className="qb-card-h qb-prev-h">Preview</h3>
        <fieldset className="qb-seg qb-seg-sm">
          <legend className="sr-only">Preview width</legend>
          {[[false, "Desktop"], [true, "Phone"]].map(([v, l]) => (
            <label key={String(v)} className={phone === v ? "on" : undefined}>
              <input type="radio" name="qb-width" checked={phone === v} onChange={() => setPhone(v as boolean)} />{l}
            </label>
          ))}
        </fieldset>
      </div>
      <div className={`qb-stage${phone ? " phone" : ""}`}>
        <iframe
          ref={frame}
          title="Preview of your quote request form"
          srcDoc={doc}
          sandbox="allow-scripts allow-popups allow-top-navigation-to-custom-protocols"
          allow="clipboard-write"
          onLoad={() => { loaded.current = true; frame.current?.contentWindow?.postMessage({ qfRoot: renderRoot(setup) }, "*"); }}
        />
      </div>
      <p className="qb-help">This is the file you download. Try it: Send opens your email app.</p>
    </section>
  );
}

// ---------------------------------------------------------------- the tool

export function Tool() {
  const [setup, setSetup] = useState<Setup>(DEFAULT_SETUP);
  const [ready, setReady] = useState(false);
  const [gen, setGen] = useState(0); // remounts the editors after a load or reset
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = readSetup(store.get());
    if (s) setSetup(s);
    setReady(true);
  }, []);
  useEffect(() => { if (ready) store.set(setup); }, [setup, ready]);

  return (
    <div className="qb-tool" data-ready={ready || undefined}>
      <div className="qb-a"><ShopCard key={`s${gen}${ready}`} shop={setup.shop} set={(shop) => setSetup({ ...setup, shop })} emailRef={emailRef} /></div>
      <div className="qb-b"><Blocks key={`b${gen}${ready}`} blocks={setup.blocks} setBlocks={(blocks) => setSetup({ ...setup, blocks })} /></div>
      <div className="qb-p"><Preview setup={setup} ready={ready} /></div>
      <div className="qb-d">
        <Download
          setup={setup}
          emailRef={emailRef}
          load={(s) => { setSetup(s); setGen(gen + 1); }}
          reset={() => { setSetup({ ...setup, blocks: DEFAULT_SETUP.blocks }); setGen(gen + 1); }}
        />
      </div>
    </div>
  );
}
