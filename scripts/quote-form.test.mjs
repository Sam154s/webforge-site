// Tests for the quote form builder: the downloaded file is self-contained and escapes everything the shop typed, the
// email it writes is built and encoded correctly, and required answers are checked.
// Run: npm run test:quote-form
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { buildHtml, CREDIT_URL, esc, fileName, formConfig, jsonForScript, NOTE, renderRoot, script, textOn } from "../src/app/quote-form/html.ts";
import { makeSender } from "../src/app/quote-form/send.ts";
import { DEFAULT_SETUP, readSetup, setupFile } from "../src/app/quote-form/setup.ts";

const api = makeSender();
const EVIL = `<script>alert("x")</script>"'><img src=x onerror=alert(1)>`;
const shop = { ...DEFAULT_SETUP.shop, name: "Acme Precision", email: "quotes@acme.co.uk" };
const SETUP = { ...DEFAULT_SETUP, shop };

const evilSetup = {
  shop: { name: EVIL, email: "quotes@acme.co.uk", title: EVIL, intro: EVIL, logo: "", accent: "", credit: true },
  blocks: [
    { id: "a", type: "text", label: EVIL, help: EVIL, required: true, format: "text", subject: true },
    { id: "b", type: "choice", label: EVIL, help: "", required: false, options: [EVIL, `" onclick="alert(1)`, "</script><script>alert(2)</script>"], multiple: true },
    { id: "c", type: "dims", label: EVIL, help: "", required: false, fields: [EVIL, "Length"], unit: "mm" },
    { id: "d", type: "yesno", label: EVIL, help: "", required: false },
    { id: "e", type: "drawing", label: EVIL, help: EVIL, required: false },
    { id: "f", type: "longtext", label: EVIL, help: "", required: false },
  ],
};

// Every src, href, action, srcset, poster or CSS url() that points off the page.
function external(html) {
  const out = [];
  for (const m of html.matchAll(/\b(src|href|action|srcset|poster|data|formaction)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const v = (m[3] ?? m[4] ?? m[5] ?? "").trim();
    if (/^(https?:)?\/\//i.test(v) || /^[a-z][a-z0-9+.-]*:/i.test(v) && !/^(mailto:|data:image\/)/i.test(v)) out.push(v);
  }
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)/gi)) if (!/^data:/i.test(m[1])) out.push(m[1]);
  for (const m of html.matchAll(/@import/gi)) out.push(m[0]);
  for (const m of html.matchAll(/<(link|iframe|object|embed|base)\b/gi)) out.push(m[0]);
  return out;
}

test("The file is self-contained: no outside requests, only the optional credit link", () => {
  const html = buildHtml(SETUP);
  assert.deepEqual(external(html), [CREDIT_URL]);
  assert.ok(html.includes(`<a href="${CREDIT_URL}">Free form from Webflow Outreach</a>`));
  assert.ok(html.includes("default-src 'none'"), "a CSP that blocks any outside request");
  assert.ok(html.includes("form-action 'none'"));
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.sendBeacon/.test(html), "no network calls in the script");
  assert.ok(!/analytics|gtag|vercel/i.test(html), "no tracking");
});

test("With the credit switched off there is no link back at all", () => {
  const html = buildHtml({ ...SETUP, shop: { ...shop, credit: false } });
  assert.deepEqual(external(html), []);
  assert.ok(!/https?:\/\//.test(html.replace("http://www.w3.org", "")), "no web address anywhere");
  assert.ok(!html.includes("Webflow Outreach"));
});

test("A logo is inlined as a data URL; anything else is dropped", () => {
  const png = "data:image/png;base64,iVBORw0KGgo=";
  assert.ok(buildHtml({ ...SETUP, shop: { ...shop, logo: png } }).includes(`src="${png}"`));
  for (const bad of ["https://evil.example/logo.png", "javascript:alert(1)", "data:text/html;base64,PHNjcmlwdD4=", 'data:image/png;base64,AAA" onerror="alert(1)', "data:image/svg+xml;base64,PHN2Zz4="]) {
    const html = buildHtml({ ...SETUP, shop: { ...shop, logo: bad } });
    assert.ok(!html.includes(`class="qf-logo"`), bad);
    assert.deepEqual(external(html), [CREDIT_URL], bad);
  }
});

test("Accent colour: only #rrggbb gets into the CSS", () => {
  assert.ok(renderRoot({ ...SETUP, shop: { ...shop, accent: "#D9F24A" } }).includes("--accent:#d9f24a;--on-accent:#111111"));
  assert.ok(renderRoot({ ...SETUP, shop: { ...shop, accent: "#123456" } }).includes("--on-accent:#ffffff"));
  const html = renderRoot({ ...SETUP, shop: { ...shop, accent: "red;}</style><script>alert(1)</script>" } });
  assert.ok(html.includes("--accent:#111111"));
  assert.ok(!html.includes("alert(1)"));
  assert.equal(textOn("#ffffff"), "#111111");
  assert.equal(textOn("#111111"), "#ffffff");
});

test("Everything the shop typed is escaped: labels, help, options, shop name, heading, intro", () => {
  const html = buildHtml(evilSetup);
  const scripts = [...html.matchAll(/<script\b/gi)].length;
  assert.equal(scripts, 2, "only the config and the form's own script");
  assert.ok(!html.includes("<script>alert"));
  assert.ok(!html.includes("<img src=x"));
  const tags = html.replace(/<script>[\s\S]*?<\/script>/g, "").match(/<[a-z][^>]*>/gi);
  assert.ok(tags.every((tag) => !/\son[a-z]+\s*=/i.test(tag)), "no event handler attributes");
  assert.ok(!html.includes('" onclick="'));
  assert.ok(html.includes("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&quot;&#39;&gt;&lt;img src=x onerror=alert(1)&gt;"));
  // The embedded config cannot close its <script> element, and reads back to the same text.
  const json = html.match(/<script type="application\/json" id="qf-config">([\s\S]*?)<\/script>/)[1];
  assert.ok(!/<\/?script/i.test(json));
  const config = JSON.parse(json);
  assert.equal(config.blocks[0].label, EVIL.replace(/\s+/g, " "));
  assert.equal(config.blocks[1].options[2], "</script><script>alert(2)</script>");
  assert.deepEqual(config, formConfig(evilSetup));
  assert.deepEqual(external(html), [CREDIT_URL]);
});

test("esc and jsonForScript", () => {
  assert.equal(esc(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  const s = jsonForScript({ a: "</script><!--   & >" });
  assert.ok(!s.includes("<") && !s.includes(">") && !s.includes("&") && !s.includes(" "));
  assert.deepEqual(JSON.parse(s), { a: "</script><!--   & >" });
});

test("The form's script is valid JavaScript and runs without a page", () => {
  for (const p of [false, true]) {
    assert.doesNotThrow(() => new vm.Script(script(p)));
    const html = buildHtml(SETUP, { preview: p });
    const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    assert.equal(code, script(p));
  }
  // The pure part, copied in as source text, behaves the same as the module.
  const copied = vm.runInNewContext(`(${makeSender.toString()})()`);
  const a = { name: "Jo", email: "jo@x.co", part: "P-1", qty: "5" };
  assert.equal(copied.mail(formConfig(SETUP), a).url, api.mail(formConfig(SETUP), a).url);
});

// ---------------------------------------------------------------- the email

const C = formConfig(SETUP);
const full = {
  name: "Jo Bloggs", company: "Bloggs & Sons Ltd", email: "jo@bloggs.co.uk", phone: "+44 1234 567890",
  part: "BRK-204 rev C", qty: "250", material: [2], processes: [0, 1], finish: [1],
  sizes: ["120", "25.4", ""], date: "2027-01-15", notes: "Tolerance ±0.02 on Ø25 bore.\nNeed 3.1 certs?\n\n\n50% now, rest later #2", drawing: true,
};

test("Subject: Quote request: <part> x <qty>", () => {
  assert.equal(api.subject(C, full), "Quote request: BRK-204 rev C x 250");
  assert.equal(api.subject(C, { ...full, qty: "" }), "Quote request: BRK-204 rev C");
  assert.equal(api.subject(C, { ...full, part: "  " }), "Quote request: quantity 250");
  assert.equal(api.subject(C, { name: "Jo" }), "Quote request from Jo");
  assert.equal(api.subject(C, {}), "Quote request");
  assert.equal(api.subject(C, { ...full, part: "A\nB" }), "Quote request: A B x 250", "no line breaks in a subject");
});

test("Body: every answer, in order, blanks left out", () => {
  assert.equal(api.body(C, full), [
    "Your name: Jo Bloggs",
    "Company: Bloggs & Sons Ltd",
    "Email: jo@bloggs.co.uk",
    "Phone: +44 1234 567890",
    "Part name or number: BRK-204 rev C",
    "Quantity: 250",
    "Material: Stainless steel 303",
    "Processes: CNC turning, CNC milling",
    "Finish: Anodise clear",
    "Main sizes (mm): Length 120, Diameter or width 25.4",
    "Date needed by: 15 Jan 2027",
    "",
    "Anything else:",
    "Tolerance ±0.02 on Ø25 bore.",
    "Need 3.1 certs?",
    "",
    "50% now, rest later #2",
    "",
    "Drawing: attached to this email",
  ].join("\n"));
  assert.equal(api.body(C, { name: "Jo", processes: [], sizes: ["", "", ""], drawing: false }), "Your name: Jo");
  assert.equal(api.body(C, { material: [99, -1, "0"] }), "", "option numbers out of range are ignored");
});

test("Mailto: address, subject and body encoded, CRLF line breaks", () => {
  const m = api.mail(C, full);
  assert.equal(m.tooLong, false);
  assert.ok(m.url.startsWith("mailto:quotes@acme.co.uk?subject="));
  const u = new URL(m.url);
  assert.equal(u.protocol, "mailto:");
  assert.equal(u.pathname, "quotes@acme.co.uk");
  const q = m.url.slice(m.url.indexOf("?") + 1).split("&").map((kv) => kv.split("="));
  assert.deepEqual(q.map(([k]) => k), ["subject", "body"], "& # ? in answers never split the link");
  assert.equal(decodeURIComponent(q[0][1]), "Quote request: BRK-204 rev C x 250");
  assert.equal(decodeURIComponent(q[1][1]), m.body.replace(/\n/g, "\r\n"));
  assert.ok(m.url.includes("%0D%0A"));
  assert.ok(!/[\s<>"#]/.test(m.url), "nothing unencoded");
  assert.ok(m.url.includes("Bloggs%20%26%20Sons") && m.url.includes("%2B44") && m.url.includes("%C3%98") && m.url.includes("%23"));
  assert.ok(m.url.length <= api.MAX_URL);
});

test("Mailto: a request too long for an email link says so and keeps the link short", () => {
  const long = { ...full, notes: "Long notes about the job. ".repeat(120) };
  const m = api.mail(C, long);
  assert.equal(m.tooLong, true);
  assert.ok(m.url.length < 400);
  assert.ok(decodeURIComponent(m.url).includes("Paste the request you copied here"));
  assert.ok(m.body.includes("Long notes about the job."), "the full text is still there to copy");
  assert.equal(decodeURIComponent(m.url.split("subject=")[1].split("&")[0]), m.subject);
});

test("Mailto: a shop address with a plus is encoded", () => {
  const m = api.mail({ ...C, email: "sales+quotes@acme.co.uk" }, full);
  assert.ok(m.url.startsWith("mailto:sales%2Bquotes@acme.co.uk?"));
});

// ---------------------------------------------------------------- required answers

test("Validation: required answers and formats", () => {
  const bad = api.validate(C, {});
  assert.deepEqual(Object.keys(bad).sort(), ["email", "name", "part", "qty"]);
  assert.deepEqual(api.validate(C, full), {});
  assert.match(api.validate(C, { ...full, email: "jo@" }).email, /doesn.t look right/);
  assert.match(api.validate(C, { ...full, qty: "ten" }).qty, /whole number/);
  assert.match(api.validate(C, { ...full, qty: "0" }).qty, /whole number/);
  assert.match(api.validate(C, { ...full, phone: "call me" }).phone, /phone/);
  assert.match(api.validate(C, { ...full, sizes: ["12mm", "", ""] }).sizes, /numbers only/);
  assert.equal(api.validate(C, { ...full, sizes: ["12,5", "", ""] }).sizes, undefined, "a decimal comma is fine");
  assert.equal(api.validate(C, { ...full, name: "   " }).name, "Fill this in.");
});

test("Validation: required pick lists, yes or no, sizes and the drawing tick", () => {
  const c = {
    email: "a@b.co", shop: "",
    blocks: [
      { id: "one", type: "choice", label: "M", required: true, options: ["A", "B"], multiple: false },
      { id: "any", type: "choice", label: "P", required: true, options: ["A", "B"], multiple: true },
      { id: "yn", type: "yesno", label: "Y", required: true },
      { id: "dm", type: "dims", label: "D", required: true, fields: ["L", "W"], unit: "in" },
      { id: "dw", type: "drawing", label: "Dr", required: true },
      { id: "dt", type: "date", label: "Date", required: true },
      { id: "lt", type: "longtext", label: "N", required: true },
    ],
  };
  assert.deepEqual(api.validate(c, {}), {
    one: "Pick one.", any: "Pick at least one.", yn: "Pick yes or no.", dm: "Fill in every size.",
    dw: "Tick this to say you’ll attach the drawing.", dt: "Fill this in.", lt: "Fill this in.",
  });
  const ok = { one: [1], any: [0, 1], yn: "No", dm: ["1", "2.5"], dw: true, dt: "2027-03-01", lt: "x" };
  assert.deepEqual(api.validate(c, ok), {});
  assert.equal(api.validate(c, { ...ok, dm: ["1", ""] }).dm, "Fill in every size.");
  assert.equal(api.body(c, ok), "M: B\nP: A, B\nY: No\nD (in): L 1, W 2.5\nDr: attached to this email\nDate: 1 Mar 2027\n\nN:\nx");
});

// ---------------------------------------------------------------- the setup file

test("Setup: saves and loads back; bad input is cleaned", () => {
  const back = readSetup(JSON.parse(setupFile(SETUP)));
  assert.deepEqual(back, SETUP);
  assert.equal(readSetup(null), null);
  assert.equal(readSetup({ blocks: "nope" }), null);
  const s = readSetup({
    shop: { name: 5, email: "x@y.z", accent: "red", logo: "javascript:1", credit: false },
    blocks: [{ type: "nope" }, { id: "a", type: "text", label: "A", subject: true }, { id: "a", type: "text", label: "B", subject: true }, { id: "X Y", type: "choice", options: [] }],
  });
  assert.equal(s.blocks.length, 3);
  assert.equal(new Set(s.blocks.map((b) => b.id)).size, 3, "ids are unique");
  assert.ok(s.blocks.every((b) => /^[a-z][a-z0-9]*$/.test(b.id)));
  assert.equal(s.blocks.filter((b) => b.subject).length, 1, "only one part in the subject");
  assert.deepEqual(s.blocks[2].options, ["First option"]);
  assert.equal(s.shop.name, "");
  assert.equal(s.shop.accent, "");
  assert.equal(s.shop.logo, "");
  assert.equal(s.shop.credit, false);
});

test("File name and the note before opening", () => {
  assert.equal(fileName(SETUP), "quote-request-acme-precision.html");
  assert.equal(fileName(DEFAULT_SETUP), "quote-request.html");
  assert.ok(buildHtml(SETUP).includes(NOTE));
  assert.equal(NOTE, "Your email app will open with your request written out. Attach your drawing, then send.");
});

test("No em or en dashes in anything the form shows", () => {
  const html = buildHtml(SETUP);
  assert.ok(!/[–—]/.test(html));
});
