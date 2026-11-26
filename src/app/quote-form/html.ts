// Builds the shop's quote request page: one self-contained HTML file with its CSS and script inline, the logo inlined
// as a data URL, no external requests (a Content Security Policy in the file enforces that), no tracking and no backend.
// Everything the shop typed is escaped here. The same output drives the live preview in the builder.
import { makeSender, type FormConfig, type Sender } from "./send";
import { cleanAccent, cleanLogo, isEmail, type Block, type Setup } from "./setup";

export const CREDIT_URL = "https://webflowoutreach.com/quote-form";
export const NOTE = "Your email app will open with your request written out. Attach your drawing, then send.";

export function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const tidy = (s: string) => String(s ?? "").replace(/\s+/g, " ").trim();
const t = (s: string) => esc(tidy(s));

// JSON that is safe inside a <script> element: nothing in it can close the element or start a comment.
export function jsonForScript(v: unknown): string {
  return JSON.stringify(v).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// Black or white text, whichever reads better on the accent.
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? "#111111" : "#ffffff";
}

export function formConfig(s: Setup): FormConfig {
  return {
    email: tidy(s.shop.email),
    shop: tidy(s.shop.name),
    blocks: s.blocks.map((b) => ({
      id: b.id, type: b.type, label: tidy(b.label) || "Question", required: !!b.required,
      ...(b.type === "text" && { format: b.format ?? "text", subject: !!b.subject }),
      ...(b.type === "choice" && { options: (b.options ?? []).map(tidy).filter(Boolean), multiple: !!b.multiple }),
      ...(b.type === "dims" && { fields: (b.fields ?? []).map(tidy).filter(Boolean), unit: b.unit === "in" ? "in" : "mm" }),
    })),
  };
}

// ---------------------------------------------------------------- markup

function autocomplete(b: Block): string {
  if (b.format === "email") return "email";
  if (b.format === "tel") return "tel";
  const l = b.label.toLowerCase();
  if (/\bpart\b|drawing|job/.test(l)) return "off";
  if (/company|business|organisation|organization/.test(l)) return "organization";
  if (/name/.test(l)) return "name";
  return "off";
}

function head(b: Block, n: number, forId: string | null): string {
  const tag = forId ? `label class="qf-label" for="${forId}"` : `legend class="qf-label"`;
  const close = forId ? "label" : "legend";
  return `<${tag}><span class="qf-n" aria-hidden="true">${n}</span><span class="qf-lt">${t(b.label) || "Question"}${b.required ? "" : ` <em>Optional</em>`}</span></${close}>`;
}

function block(b: Block, n: number): string {
  const id = b.id;
  const help = tidy(b.help) ? `<p class="qf-help" id="h-${id}">${t(b.help)}</p>` : "";
  const desc = `${help ? `h-${id} ` : ""}e-${id}`;
  const err = `<p class="qf-error" id="e-${id}" hidden></p>`;
  const req = b.required ? " required" : "";
  const field = (inner: string) => `<li class="qf-q" id="q-${id}" data-type="${b.type}"><div class="qf-field">${inner}</div></li>`;
  const group = (inner: string, extra = "") => `<li class="qf-q" id="q-${id}" data-type="${b.type}"><fieldset class="qf-field${extra}" aria-describedby="${desc}">${head(b, n, null)}${help}${inner}${err}</fieldset></li>`;

  switch (b.type) {
    case "text": {
      const type = b.format === "email" ? "email" : b.format === "tel" ? "tel" : "text";
      return field(`${head(b, n, `f-${id}`)}${help}<input class="qf-input" id="f-${id}" name="${id}" type="${type}" autocomplete="${autocomplete(b)}" maxlength="300" aria-describedby="${desc}"${req}>${err}`);
    }
    case "longtext":
      return field(`${head(b, n, `f-${id}`)}${help}<textarea class="qf-input" id="f-${id}" name="${id}" rows="5" maxlength="4000" aria-describedby="${desc}"${req}></textarea>${err}`);
    case "quantity":
      return field(`${head(b, n, `f-${id}`)}${help}<input class="qf-input qf-short" id="f-${id}" name="${id}" type="text" inputmode="numeric" autocomplete="off" maxlength="9" aria-describedby="${desc}"${req}>${err}`);
    case "date":
      return field(`${head(b, n, `f-${id}`)}${help}<input class="qf-input qf-short" id="f-${id}" name="${id}" type="date" aria-describedby="${desc}"${req}>${err}`);
    case "yesno":
      return group(`<div class="qf-seg">${["Yes", "No"].map((v) => `<label class="qf-opt"><input type="radio" name="${id}" value="${v}"><span>${v}</span></label>`).join("")}</div>`);
    case "choice": {
      const opts = (b.options ?? []).map(tidy).filter(Boolean);
      const kind = b.multiple ? "checkbox" : "radio";
      return group(`<div class="qf-opts">${opts.map((o, i) => `<label class="qf-opt"><input type="${kind}" name="${id}" value="${i}"><span>${esc(o)}</span></label>`).join("")}</div>`);
    }
    case "dims": {
      const unit = b.unit === "in" ? "in" : "mm";
      const fields = (b.fields ?? []).map(tidy).filter(Boolean);
      return group(`<div class="qf-dims">${fields.map((f, i) => `<label class="qf-dim"><span>${esc(f)}</span><span class="qf-unit"><input class="qf-input" name="${id}.${i}" type="text" inputmode="decimal" autocomplete="off" maxlength="12"><i aria-hidden="true">${unit}</i></span></label>`).join("")}</div>`, " qf-dimset");
    }
    case "drawing":
      return group(`<label class="qf-attach"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M16.5 6.5 8.4 14.6a2.1 2.1 0 0 0 3 3l8.3-8.3a4.2 4.2 0 0 0-6-6L5.4 11.6a6.3 6.3 0 0 0 8.9 8.9l6.2-6.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><input type="checkbox" name="${id}" value="yes"><span>I&rsquo;ll attach my drawing to the email</span></label>`, " qf-drawing");
  }
}

export function renderRoot(s: Setup): string {
  const accent = cleanAccent(s.shop.accent) || "#111111";
  const logo = cleanLogo(s.shop.logo);
  const name = tidy(s.shop.name);
  const email = tidy(s.shop.email);
  const to = isEmail(email) ? esc(email) : "the shop";
  const title = tidy(s.shop.title) || "Request a quote";
  const intro = tidy(s.shop.intro);
  const config = formConfig(s);

  return `<div class="qf" style="--accent:${accent};--on-accent:${textOn(accent)}">
<div class="qf-sheet">
<header class="qf-tb">
<div class="qf-tb-shop">${logo ? `<img class="qf-logo" src="${logo}" alt="${name ? "" : "Logo"}">` : ""}${name ? `<span class="qf-shop">${esc(name)}</span>` : ""}</div>
<dl class="qf-tb-cells"><div><dt>Document</dt><dd>Request for quote</dd></div><div><dt>Send to</dt><dd>${to}</dd></div></dl>
</header>
<main class="qf-main">
<h1 class="qf-h1">${esc(title)}</h1>
${intro ? `<p class="qf-intro">${esc(intro)}</p>` : ""}
<form id="qf-form" novalidate>
<ol class="qf-list">
${s.blocks.map((b, i) => block(b, i + 1)).join("\n")}
</ol>
<div class="qf-send">
<p class="qf-sum" id="qf-sum" role="alert" hidden></p>
<button class="qf-btn" type="submit">Send request</button>
<p class="qf-fine">Nothing is sent until you press send in your own email app.</p>
</div>
</form>
<section class="qf-done" id="qf-done" tabindex="-1" aria-labelledby="qf-done-h" hidden>
<h2 class="qf-h2" id="qf-done-h"><span class="qf-n" aria-hidden="true">&#10003;</span>Nearly done</h2>
<p class="qf-note" id="qf-note">${esc(NOTE)}</p>
<p class="qf-long" id="qf-long" hidden>Your request is too long to go in an email link. Press Copy request, then paste it into the email.</p>
<div class="qf-act"><a class="qf-btn" id="qf-open" href="#">Open my email app</a><button class="qf-btn alt" id="qf-copy" type="button">Copy request</button></div>
<p class="qf-to">Email app not opening? Copy the request and email it to <b>${to}</b>.</p>
<p class="qf-copied" id="qf-copied" aria-live="polite"></p>
<details class="qf-see"><summary>See your request</summary><pre class="qf-text" id="qf-text" tabindex="0"></pre></details>
</section>
</main>
</div>
${s.shop.credit ? `<footer class="qf-credit"><a href="${CREDIT_URL}">Free form from Webflow Outreach</a></footer>` : ""}
<script type="application/json" id="qf-config">${jsonForScript(config)}</script>
</div>`;
}

// ---------------------------------------------------------------- the script in the file

// Runs in the downloaded page. Like makeSender it is copied in as source text, so it is self-contained.
export function runtime(api: Sender, preview: boolean) {
  const d = document;
  function el(id: string) { return d.getElementById(id); }
  function config(): FormConfig | null {
    try { return JSON.parse((el("qf-config") as HTMLElement).textContent || ""); } catch { return null; }
  }
  function today() {
    const n = new Date();
    return n.getFullYear() + "-" + ("0" + (n.getMonth() + 1)).slice(-2) + "-" + ("0" + n.getDate()).slice(-2);
  }
  function init() {
    const dates = d.querySelectorAll("input[type=date]");
    for (let i = 0; i < dates.length; i++) (dates[i] as HTMLInputElement).min = today();
  }
  function inputs(id: string): HTMLInputElement[] {
    const form = el("qf-form") as HTMLFormElement;
    return Array.prototype.slice.call(form.querySelectorAll('[name="' + id + '"], [name^="' + id + '."]'));
  }
  function read(c: FormConfig) {
    const a: Record<string, string | number[] | string[] | boolean> = {};
    c.blocks.forEach(function (b) {
      const els = inputs(b.id);
      if (b.type === "choice") a[b.id] = els.filter(function (x) { return x.checked; }).map(function (x) { return parseInt(x.value, 10); });
      else if (b.type === "yesno") { const on = els.filter(function (x) { return x.checked; })[0]; a[b.id] = on ? on.value : ""; }
      else if (b.type === "drawing") a[b.id] = !!(els[0] && els[0].checked);
      else if (b.type === "dims") a[b.id] = (b.fields || []).map(function (_f, i) { const x = els.filter(function (y) { return y.name === b.id + "." + i; })[0]; return x ? x.value : ""; });
      else a[b.id] = els[0] ? els[0].value : "";
    });
    return a;
  }
  function mark(id: string, msg: string) {
    const q = el("q-" + id);
    const e = el("e-" + id);
    if (!q || !e) return;
    e.textContent = msg;
    e.hidden = !msg;
    q.classList.toggle("bad", !!msg);
    inputs(id).forEach(function (x) { if (msg) x.setAttribute("aria-invalid", "true"); else x.removeAttribute("aria-invalid"); });
  }
  let request = "";
  let to = "";

  d.addEventListener("submit", function (ev) {
    const form = ev.target as HTMLFormElement;
    if (!form || form.id !== "qf-form") return;
    ev.preventDefault();
    const c = config();
    if (!c) return;
    const a = read(c);
    const bad = api.validate(c, a);
    const ids = Object.keys(bad);
    c.blocks.forEach(function (b) { mark(b.id, bad[b.id] || ""); });
    const sum = el("qf-sum") as HTMLElement;
    const done = el("qf-done") as HTMLElement;
    if (ids.length) {
      sum.textContent = ids.length === 1 ? "Check the answer marked below." : "Check the " + ids.length + " answers marked below.";
      sum.hidden = false;
      done.hidden = true;
      const firstBad = inputs(ids[0])[0];
      if (firstBad) firstBad.focus();
      return;
    }
    sum.hidden = true;
    const m = api.mail(c, a);
    to = c.email;
    request = "To: " + c.email + "\nSubject: " + m.subject + "\n\n" + m.body;
    (el("qf-open") as HTMLAnchorElement).href = m.url;
    (el("qf-text") as HTMLElement).textContent = request;
    (el("qf-long") as HTMLElement).hidden = !m.tooLong;
    (el("qf-copied") as HTMLElement).textContent = "";
    done.hidden = false;
    done.focus();
    if (done.scrollIntoView) done.scrollIntoView({ block: "center" });
  });

  d.addEventListener("click", function (ev) {
    const target = ev.target as HTMLElement;
    if (!target || !target.closest || !target.closest("#qf-copy")) return;
    const out = el("qf-copied") as HTMLElement;
    function selectIt() {
      const pre = el("qf-text") as HTMLElement;
      const det = pre.parentNode as HTMLDetailsElement;
      det.open = true;
      const sel = window.getSelection();
      if (sel) { const r = d.createRange(); r.selectNodeContents(pre); sel.removeAllRanges(); sel.addRange(r); }
      let ok = false;
      try { ok = d.execCommand("copy"); } catch { ok = false; }
      out.textContent = ok ? "Copied. Paste it into an email to " + to + "." : "Selected below. Press Ctrl+C or Cmd+C to copy it.";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(request).then(function () { out.textContent = "Copied. Paste it into an email to " + to + "."; }, selectIt);
    } else selectIt();
  });

  function clear(ev: Event) {
    const x = ev.target as HTMLElement;
    const q = x && x.closest ? x.closest(".qf-q") : null;
    if (q && q.classList.contains("bad")) mark(q.id.slice(2), "");
  }
  d.addEventListener("input", clear);
  d.addEventListener("change", clear);

  // The builder's live preview swaps in new markup as the shop types. Only in the preview, never in the download.
  if (preview) {
    window.addEventListener("message", function (ev) {
      if (ev.source !== window.parent || !ev.data || typeof ev.data.qfRoot !== "string") return;
      const y = window.scrollY;
      (el("qf-root") as HTMLElement).innerHTML = ev.data.qfRoot;
      init();
      window.scrollTo(0, y);
    });
  }
  init();
}

// ---------------------------------------------------------------- the file

const CSS = `
*,*::before,*::after{box-sizing:border-box}
html{color-scheme:light;-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;background:#F4F2EC;background-image:linear-gradient(rgba(17,17,17,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(17,17,17,.05) 1px,transparent 1px);background-size:24px 24px;color:#111;font:16px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.qf{--ink:#111111;--dim:#5E5B55;--line:#CFCBC3;--sheet:#FBFAF6;--paper:#F4F2EC;--bad:#B3261E;padding:clamp(12px,4vw,56px) clamp(10px,3vw,32px) 32px}
.qf-sheet{position:relative;max-width:780px;margin:0 auto;border:1.5px solid var(--ink);border-radius:16px;background:var(--sheet);box-shadow:0 1px 0 var(--ink),0 2px 6px rgba(17,17,17,.06),0 28px 56px -28px rgba(17,17,17,.35)}
.qf-tb{display:grid;grid-template-columns:minmax(0,1fr);border-bottom:1.5px solid var(--ink);background:var(--paper);border-radius:14.5px 14.5px 0 0}
.qf-tb-shop{display:flex;align-items:center;gap:14px;min-height:64px;padding:12px clamp(16px,3vw,28px);border-bottom:1px solid var(--line)}
.qf-tb-shop:empty{display:none}
.qf-logo{display:block;max-height:44px;max-width:180px;width:auto;height:auto;object-fit:contain}
.qf-shop{font-size:1.15rem;font-weight:750;letter-spacing:-.01em;line-height:1.2;overflow-wrap:anywhere}
.qf-tb-cells{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);margin:0}
.qf-tb-cells>div{min-width:0;padding:8px clamp(16px,3vw,28px) 10px}
.qf-tb-cells>div+div{border-left:1px solid var(--line)}
.qf-tb dt{font-size:11.5px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.qf-tb dd{margin:2px 0 0;font-size:14.5px;font-weight:650;overflow-wrap:anywhere}
@media (min-width:640px){.qf-tb{grid-template-columns:minmax(0,1fr) minmax(0,1.3fr)}.qf-tb-shop{border-bottom:0;border-right:1px solid var(--line)}.qf-tb-shop:empty+.qf-tb-cells{grid-column:1/-1}}
.qf-main{padding:clamp(22px,4vw,40px) clamp(16px,3vw,28px) clamp(24px,4vw,36px)}
.qf-h1{margin:0;font-size:clamp(1.9rem,5vw,2.6rem);font-weight:800;letter-spacing:-.03em;line-height:1.05;overflow-wrap:anywhere}
.qf-intro{margin:10px 0 0;max-width:60ch;font-size:1.05rem;color:var(--dim);overflow-wrap:anywhere}
.qf-list{list-style:none;margin:24px 0 0;padding:0;border-top:1.5px solid var(--ink)}
.qf-q{padding:20px 0 22px;border-bottom:1px solid var(--line)}
.qf-field{display:grid;gap:8px;min-width:0;margin:0;padding:0;border:0}
.qf-label{display:flex;align-items:center;gap:12px;padding:0;font-size:1rem;font-weight:700;line-height:1.3}
.qf-lt{min-width:0;overflow-wrap:anywhere}
.qf-label em{margin-left:4px;font-style:normal;font-weight:500;font-size:.875rem;color:var(--dim)}
.qf-n{flex:none;display:inline-grid;place-items:center;width:26px;height:26px;border:1.5px solid var(--ink);border-radius:50%;background:#fff;font-size:12.5px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.qf-help{margin:-2px 0 0 38px;font-size:.9rem;color:var(--dim);overflow-wrap:anywhere}
.qf-field>.qf-input,.qf-opts,.qf-seg,.qf-dims,.qf-attach,.qf-error{margin-left:38px}
.qf-input{width:100%;max-width:100%;min-height:46px;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:#fff;font:inherit;color:var(--ink);font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 2px rgba(17,17,17,.06)}
textarea.qf-input{resize:vertical;min-height:120px}
.qf-field>.qf-input{width:calc(100% - 38px)}
.qf-short{max-width:16rem}
.qf-input:hover{border-color:#a9a49a}
.qf-input:focus{outline:none;border-color:var(--ink);box-shadow:0 0 0 1px var(--ink)}
.qf :focus-visible{outline:2px solid #234BE0;outline-offset:2px}
.qf-input:focus-visible{outline:2px solid #234BE0;outline-offset:2px}
.qf-opts{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}
@media (min-width:560px){.qf-opts{grid-template-columns:repeat(2,minmax(0,1fr))}}
.qf-seg{display:flex;gap:8px}
.qf-opt{position:relative;display:flex;align-items:center;gap:10px;min-height:46px;padding:10px 14px;border:1.5px solid var(--line);border-radius:10px;background:#fff;cursor:pointer;line-height:1.3;overflow-wrap:anywhere}
.qf-seg .qf-opt{min-width:6rem}
.qf-opt:hover{border-color:#a9a49a}
.qf-opt input{flex:none;width:18px;height:18px;margin:0;accent-color:var(--ink)}
.qf-opt:has(input:checked){border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink),0 2px 0 var(--ink)}
.qf-opt:has(input:focus-visible){outline:2px solid #234BE0;outline-offset:2px}
.qf-opt input:focus-visible{outline:none}
.qf-dims{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr))}
.qf-dim{display:grid;gap:4px;font-size:.875rem;color:var(--dim)}
.qf-unit{position:relative;display:block}
.qf-unit .qf-input{padding-right:42px}
.qf-unit i{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-style:normal;font-size:.875rem;color:var(--dim);pointer-events:none}
.qf-attach{display:flex;align-items:center;gap:12px;min-height:54px;padding:12px 16px;border:1.5px dashed var(--ink);border-radius:12px;background:#fff;cursor:pointer;font-weight:600}
.qf-attach svg{flex:none}
.qf-attach input{flex:none;width:20px;height:20px;margin:0;accent-color:var(--ink)}
.qf-attach:has(input:checked){border-style:solid;box-shadow:0 2px 0 var(--ink)}
.qf-attach:has(input:focus-visible){outline:2px solid #234BE0;outline-offset:2px}
.qf-error{margin-top:2px;margin-bottom:0;padding:6px 10px;border-left:4px solid var(--bad);background:#fbeceb;border-radius:0 6px 6px 0;color:var(--bad);font-size:.9rem;font-weight:600}
.qf-error[hidden],.qf-sum[hidden],.qf-done[hidden],.qf-long[hidden]{display:none}
.qf-q.bad .qf-input,.qf-q.bad .qf-opt,.qf-q.bad .qf-attach{border-color:var(--bad)}
.qf-send{display:grid;justify-items:start;gap:10px;margin-top:26px}
.qf-sum{margin:0;padding:10px 14px;border:1.5px solid var(--bad);border-left-width:5px;border-radius:10px;background:#fff;color:var(--bad);font-weight:650}
.qf-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 26px;border:1.5px solid var(--ink);border-radius:999px;background:var(--accent);color:var(--on-accent);font:inherit;font-weight:700;text-decoration:none;cursor:pointer;box-shadow:0 2px 0 var(--ink);transition:transform .15s,box-shadow .15s}
.qf-btn:hover{transform:translateY(-1px);box-shadow:0 3px 0 var(--ink)}
.qf-btn:active{transform:translateY(1px);box-shadow:0 1px 0 var(--ink)}
.qf-btn.alt{background:#fff;color:var(--ink)}
.qf-fine{margin:0;font-size:.875rem;color:var(--dim)}
.qf-done{margin-top:28px;padding:clamp(18px,3vw,26px);border:1.5px solid var(--ink);border-radius:14px;background:#fff;box-shadow:0 2px 0 var(--ink),0 18px 36px -24px rgba(17,17,17,.4);outline:none}
.qf-done:focus-visible{outline:2px solid #234BE0;outline-offset:3px}
.qf-h2{display:flex;align-items:center;gap:12px;margin:0;font-size:1.35rem;font-weight:800;letter-spacing:-.02em}
.qf-h2 .qf-n{background:var(--accent);color:var(--on-accent)}
.qf-note{margin:12px 0 0;font-size:1.05rem;font-weight:600}
.qf-long{margin:10px 0 0;padding:10px 12px;border-left:4px solid var(--ink);background:var(--paper);border-radius:0 6px 6px 0;font-weight:600}
.qf-act{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.qf-to{margin:14px 0 0;font-size:.95rem;color:var(--dim);overflow-wrap:anywhere}
.qf-to b{color:var(--ink)}
.qf-copied{margin:6px 0 0;min-height:1.5em;font-size:.95rem;font-weight:600}
.qf-see{margin-top:6px;border-top:1px solid var(--line);padding-top:10px}
.qf-see summary{cursor:pointer;font-weight:600;min-height:32px}
.qf-text{margin:10px 0 0;padding:14px;max-height:22rem;overflow:auto;border:1px solid var(--line);border-radius:10px;background:var(--sheet);font:14px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
.qf-credit{max-width:780px;margin:16px auto 0;text-align:center;font-size:.8rem}
.qf-credit a{color:var(--dim);text-decoration:underline;text-underline-offset:3px}
@media (max-width:479px){.qf-field>.qf-input{width:100%}.qf-help,.qf-field>.qf-input,.qf-opts,.qf-seg,.qf-dims,.qf-attach,.qf-error{margin-left:0}.qf-seg .qf-opt{flex:1}}
@media (prefers-reduced-motion:reduce){.qf-btn{transition:none}}
@media print{body{background:#fff}.qf-sheet{box-shadow:none}.qf-send,.qf-done,.qf-credit{display:none}}
`.trim();

const CSP = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'none'; base-uri 'none'";

export function script(preview = false): string {
  return `(${runtime.toString()})((${makeSender.toString()})(), ${preview ? "true" : "false"});`;
}

export function buildHtml(s: Setup, opts: { preview?: boolean } = {}): string {
  const name = tidy(s.shop.name);
  const title = tidy(s.shop.title) || "Request a quote";
  const made = s.shop.credit ? " Made free at webflowoutreach.com/quote-form." : "";
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="no-referrer">
<title>${esc(name ? `${title} | ${name}` : title)}</title>
<!--
  Your quote request form. It is yours to keep, change and use.${made}
  To put it online, upload this file to your website as a page, or drag it onto app.netlify.com/drop for a free link.
  It sends nothing anywhere by itself. On Send it opens your customer's own email app with the request written out to you.
-->
<style>${CSS}</style>
</head>
<body>
<div id="qf-root">${renderRoot(s)}</div>
<script>${script(!!opts.preview)}</script>
</body>
</html>
`;
}

export function fileName(s: Setup): string {
  const n = tidy(s.shop.name).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return n ? `quote-request-${n}.html` : "quote-request.html";
}
