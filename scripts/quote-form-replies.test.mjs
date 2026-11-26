// Tests for automatic replies: placeholders, the three setup guides (escaped, every value there to copy), the
// Power Automate expressions, and the Gmail script, which must be valid JavaScript whatever the shop types and is run
// here against a small mock of GmailApp, PropertiesService and ScriptApp.
// Run: npm run test:quote-form
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { gasSettings, gmailEngine, gmailScript } from "../src/app/quote-form/gmail.ts";
import { END_LINE, guide, guideFileName, guideHtml, guideRoot, inline, PA, PA_PART, paStr, paText, START_URL } from "../src/app/quote-form/guides.ts";
import { buildHtml, esc } from "../src/app/quote-form/html.ts";
import { fill, labels, problems, sample, values } from "../src/app/quote-form/replies.ts";
import { DEFAULT_REPLIES, DEFAULT_SETUP, readReplies, readSetup, setupFile } from "../src/app/quote-form/setup.ts";

const shop = { ...DEFAULT_SETUP.shop, name: "Acme Precision", email: "quotes@acme.co.uk" };
const SETUP = { ...DEFAULT_SETUP, shop };
const NASTY = "It's \"ok\" `${alert(1)}` \\ </script><script>alert(3)</script> <!-- */   x\ny";
const oneLine = (s) => s.replace(/\s+/g, " ");
const nastySetup = (platform) => ({
  ...SETUP,
  shop: { ...shop, name: oneLine(NASTY) },
  replies: {
    ...DEFAULT_REPLIES, platform,
    thanksSubject: "Thanks {name}, " + oneLine(NASTY),
    thanksBody: "Hi {name},\n" + NASTY + "\n{part} x {quantity}, back in {reply_days}. {shop}",
    chaseSubject: "Chase " + oneLine(NASTY),
    chaseBody: "Hi {name}, " + NASTY + " {part}",
  },
});

// ---------------------------------------------------------------- placeholders and the setup

test("Placeholders fill in; unknown ones are left alone", () => {
  assert.equal(fill("Hi {name}, {part} x {quantity} {other} {name}", { name: "Jo", part: "P1", quantity: "5" }), "Hi Jo, P1 x 5 {other} Jo");
  assert.deepEqual(values(SETUP, { name: "Jo", part: "P1", quantity: "5" }, "gmail"), { name: "Jo", part: "P1", quantity: "5", shop: "Acme Precision", reply_days: "3 working days" });
  assert.equal(values(SETUP, { name: "Jo", part: "P1" }, "outlook").name, "there", "Outlook can't read the name");
  assert.equal(values(SETUP, { name: "Jo", part: "P1" }, "outlook").part, "P1");
  assert.equal(values(SETUP, { name: "Jo", part: "P1" }, "other").part, "your part", "an autoresponder sends the same words to all");
  assert.equal(values({ ...SETUP, replies: { ...DEFAULT_REPLIES, replyDays: 1 } }).reply_days, "1 working day");
  assert.equal(values({ ...SETUP, shop: { ...shop, name: " " } }).shop, "The team");
  assert.equal(sample(SETUP, "thanks", "gmail").subject, "Thanks, we've got your request for BRK-204 rev C");
  assert.ok(sample(SETUP, "chase", "other").body.startsWith("Hi there,"));
  assert.deepEqual(labels(SETUP), { name: "Your name", part: "Part name or number", quantity: "Quantity" });
});

test("Wording checks: subjects can't carry the form's subject line", () => {
  assert.deepEqual(problems(DEFAULT_REPLIES), {});
  const p = problems({ ...DEFAULT_REPLIES, thanksSubject: "RE: Quote Request {part}", chaseSubject: "", chaseBody: " " });
  assert.deepEqual(Object.keys(p).sort(), ["chaseBody", "chaseSubject", "thanksSubject"]);
  assert.deepEqual(problems({ ...DEFAULT_REPLIES, follow: false, chaseSubject: "" }), {}, "no chase, no chase checks");
});

test("Setup: old saved setups without replies still load, with the default replies", () => {
  const old = { kind: "webflow-outreach-quote-form", version: 1, shop, blocks: DEFAULT_SETUP.blocks };
  const s = readSetup(JSON.parse(JSON.stringify(old)));
  assert.deepEqual(s.replies, DEFAULT_REPLIES);
  assert.deepEqual(s.blocks, DEFAULT_SETUP.blocks);
  assert.deepEqual(readSetup(JSON.parse(setupFile(SETUP))), SETUP, "a new setup round-trips");
  const r = { ...DEFAULT_REPLIES, platform: "gmail", replyDays: 2, follow: false, followMode: "remind", thanksBody: "A  \r\n\r\n\r\n\r\nB\u0007" };
  const back = readSetup(JSON.parse(setupFile({ ...SETUP, replies: r })));
  assert.equal(back.replies.thanksBody, "A\n\nB");
  assert.equal(back.replies.platform, "gmail");
  assert.equal(back.replies.follow, false);
  assert.equal(back.replies.followMode, "remind");
  const junk = readReplies({ platform: "aol", replyDays: 999, followDays: -3, follow: "yes", thanksSubject: 7, chaseBody: "x".repeat(5000) });
  assert.equal(junk.platform, "outlook");
  assert.equal(junk.replyDays, 20);
  assert.equal(junk.followDays, 1);
  assert.equal(junk.follow, false);
  assert.equal(junk.thanksSubject, DEFAULT_REPLIES.thanksSubject);
  assert.equal(junk.chaseBody.length, 2000);
  assert.equal(JSON.parse(setupFile(SETUP)).version, 2);
});

test("The form's confirmation says how soon the shop replies", () => {
  assert.ok(buildHtml(SETUP).includes(`<p class="qf-reply" id="qf-reply">We usually reply within 3 working days.</p>`));
  assert.ok(buildHtml({ ...SETUP, replies: { ...DEFAULT_REPLIES, replyDays: 1 } }).includes("within 1 working day."));
  assert.ok(!buildHtml({ shop, blocks: SETUP.blocks }).includes(`id="qf-reply"`), "a setup with no replies says nothing");
});

// ---------------------------------------------------------------- Outlook

// A tiny evaluator for the Power Automate functions the guide uses, to check the expressions do what they say.
// substring throws when out of range, as Power Automate does.
function pa(expr, subject) {
  const fns = {
    concat: (...a) => a.join(""), trim: (s) => s.trim(), last: (a) => a[a.length - 1], first: (a) => a[0], split: (s, d) => s.split(d),
    lastIndexOf: (s, x) => s.toLowerCase().lastIndexOf(x.toLowerCase()), greater: (a, b) => a > b,
    substring: (s, i, n) => {
      if (i < 0 || i > s.length || (n !== undefined && (n < 0 || i + n > s.length))) throw new Error("substring out of range");
      return n === undefined ? s.slice(i) : s.slice(i, i + n);
    },
    max: Math.max, min: Math.min, add: (a, b) => a + b, length: (s) => s.length, if: (c, a, b) => (c ? a : b),
    triggerOutputs: () => ({ body: { subject } }),
  };
  const js = expr
    .replace(/'((?:[^']|'')*)'/g, (_m, s) => JSON.stringify(s.replace(/''/g, "'")))
    .replace(/\?\["body\/(\w+)"\]/g, "?.body?.$1")
    .replace(/\b(if|concat|trim|last|first|split|lastIndexOf|greater|substring|max|min|add|length|triggerOutputs)\(/g, "fns.$1(");
  return new Function("fns", `return (${js});`)(fns);
}

test("Outlook: the expressions pull the part and quantity from the subject and keep the shop's text intact", () => {
  assert.equal(paStr("It's"), "'It''s'");
  assert.equal(pa(PA_PART, "Quote request: BRK-204 rev C x 250"), "BRK-204 rev C");
  assert.equal(pa(PA_PART, "Quote request: Shaft x 2 x 10"), "Shaft x 2", "the last x is the quantity");
  assert.equal(pa(PA_PART, "Quote request: Bracket"), "Bracket");
  assert.equal(pa(PA_PART, "RE: Quote request: Bracket x 5"), "Bracket");
  const s = nastySetup("outlook");
  const subj = paText(s.replies.thanksSubject, s, false);
  assert.equal(subj.expression, false, "nothing from the email needed, so plain text");
  assert.equal(subj.value, "Thanks there, " + oneLine(NASTY));
  const body = paText(s.replies.thanksBody, s, true);
  assert.equal(body.expression, true);
  const out = pa(body.value, "Quote request: P1 x 40");
  const h = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  assert.equal(out, h("Hi there,\n" + NASTY + "\n") + "P1 x 40" + h(", back in 3 working days. " + oneLine(NASTY)));
  assert.equal(pa(paText("{quantity}", s, false).value, "Quote request: Bracket"), "the quantity you asked for");
  assert.equal(pa(paText("{part}", s, false).value, "Quote request: Bracket x 7"), "Bracket");
  assert.equal(PA.thanksCondition, "@startsWith(triggerOutputs()?['body/subject'], 'Quote request')");
  assert.ok(PA.quoteCondition.includes("startsWith(toLower(triggerOutputs()?['body/subject']), 're:')"));
});

// ---------------------------------------------------------------- the guides

const unesc = (x) => x.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

test("Guides: all three platforms, nasty input escaped, every value there to copy", () => {
  for (const platform of ["outlook", "gmail", "other"]) {
    const s = nastySetup(platform);
    const g = guide(s);
    assert.equal(g.platform, platform);
    assert.ok(g.parts.length >= 1 && g.parts.every((p) => p.steps.length));
    const html = guideHtml(s);
    assert.equal([...html.matchAll(/<script\b/gi)].length, 1, platform + ": only the copy script");
    assert.ok(!html.includes("<script>alert"), platform);
    const tags = html.replace(/<script>[\s\S]*?<\/script>/g, "").match(/<[a-z][^>]*>/gi);
    assert.ok(tags.every((tag) => !/\son[a-z]+\s*=/i.test(tag)), "no event handler attributes");
    assert.ok(html.includes("default-src 'none'"));
    assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|analytics|gtag/.test(html), "no network calls or tracking");
    assert.ok(!/[–—]/.test(html), platform + ": no em or en dashes");
    assert.equal(html.split(esc(END_LINE)).length, 2, "the line about us appears once");
    assert.ok(html.includes(`href="${START_URL}"`));
    // Each copy button points at a value, and each value reads back to exactly what the guide holds.
    const vals = g.parts.flatMap((p) => p.steps.flatMap((st) => st.vals ?? []));
    const ids = [...html.matchAll(/data-copy="(v\d+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, vals.length);
    ids.forEach((id, i) => {
      const m = html.match(new RegExp(`<pre class="g-v[^"]*" id="${id}" tabindex="0">([\\s\\S]*?)</pre>`));
      assert.ok(m, id);
      assert.equal(unesc(m[1]), vals[i].value);
    });
    assert.doesNotThrow(() => new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]));
  }
  assert.equal(guideFileName(SETUP), "quote-replies-setup-acme-precision.html");
  assert.equal(guideFileName(DEFAULT_SETUP), "quote-replies-setup.html");
  assert.equal(inline("Go *here* [now](https://x.example/a) <b>"), 'Go <b>here</b> <a href="https://x.example/a" target="_blank" rel="noopener noreferrer">now</a> &lt;b&gt;');
  assert.equal(inline("[bad](javascript:alert(1))"), "[bad](javascript:alert(1))", "only https links");
});

test("Guides: Outlook names the real actions and needs no premium connector; remind mode sends no chase", () => {
  const html = guideRoot(SETUP);
  for (const name of ["When a new email arrives (V3)", "Reply to email (V3)", "Get emails (V3)", "Filter array", "Delay", "Condition", "Sent Items", "Trigger conditions", "Fetch Only Unread Messages", "Quote request:", "make.powerautomate.com"]) {
    assert.ok(html.includes(esc(name)), name);
  }
  assert.ok(!/\bHTTP\b/.test(html.replace(/https?:\/\//g, "")), "no premium HTTP action");
  const remind = guide({ ...SETUP, replies: { ...DEFAULT_REPLIES, followMode: "remind" } });
  const steps = remind.parts[1].steps.map((s) => s.text).join(" ");
  assert.ok(steps.includes("Send an email (V2)") && !steps.includes("In *True*, add *Reply to email (V3)*"));
  assert.ok(remind.parts[1].steps.some((s) => (s.vals ?? []).some((v) => v.value === "quotes@acme.co.uk")), "the reminder goes to the shop");
  assert.equal(guide({ ...SETUP, replies: { ...DEFAULT_REPLIES, follow: false } }).parts.length, 2, "no follow-up flow when it's off");
  const other = guideRoot({ ...SETUP, shop: { ...shop, email: "sales@Machining.co.uk" }, replies: { ...DEFAULT_REPLIES, platform: "other" } });
  assert.ok(other.includes("quotes@machining.co.uk") && other.includes("needs Outlook or Gmail"));
  const gm = guide({ ...SETUP, replies: { ...DEFAULT_REPLIES, platform: "gmail" } });
  assert.equal(gm.parts[0].steps[2].vals[0].value, gmailScript({ ...SETUP, replies: { ...DEFAULT_REPLIES, platform: "gmail" } }));
});

// ---------------------------------------------------------------- the Gmail script, against a mock Gmail

function mockGoogle(meAddress = "quotes@acme.co.uk") {
  let clock = Date.parse("2026-11-02T09:00:00Z");
  let nextId = 1;
  const store = {};
  const triggers = [];
  const sent = [];
  const drafts = [];
  const threads = [];
  const labelsMade = {};
  const logs = [];
  const msg = (thread, from, subject, body) => {
    const m = {
      id: "m" + nextId++, from, subject, body, date: new Date(clock), draft: false, starred: false, thread,
      getId: () => m.id, getFrom: () => m.from, getSubject: () => m.subject, getPlainBody: () => m.body, getDate: () => m.date,
      isDraft: () => m.draft, star: () => { m.starred = true; },
      createDraftReply: (text, opts) => {
        const d = msg(thread, meAddress, opts?.subject ?? "Re: " + m.subject, text);
        d.draft = true; d.to = m.from; thread.messages.push(d); drafts.push(d);
        return { send: () => { d.draft = false; drafts.splice(drafts.indexOf(d), 1); sent.push(d); return d; } };
      },
    };
    return m;
  };
  const thread = (from, subject, body) => {
    const t = { id: "t" + nextId++, messages: [], labels: [], inbox: false };
    Object.assign(t, { getId: () => t.id, getMessages: () => t.messages.slice(), addLabel: (l) => t.labels.push(l.name), moveToInbox: () => { t.inbox = true; } });
    t.messages.push(msg(t, from, subject, body));
    threads.push(t);
    return t;
  };
  const props = {
    getProperty: (k) => (k in store ? store[k] : null), setProperty: (k, v) => { store[k] = String(v); },
    deleteProperty: (k) => { delete store[k]; }, getProperties: () => ({ ...store }),
  };
  const google = {
    GmailApp: {
      search: (q, start, max) => { assert.match(q, /subject:"quote request"/); return threads.filter((t) => /quote request/i.test(t.messages[0].subject)).slice(start, start + max); },
      getThreadById: (id) => threads.find((t) => t.id === id) ?? null,
      getUserLabelByName: (n) => labelsMade[n] ?? null,
      createLabel: (n) => (labelsMade[n] = { name: n }),
      getAliases: () => ["sales@acme.co.uk"],
    },
    ScriptApp: {
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: (t) => triggers.splice(triggers.indexOf(t), 1),
      newTrigger: (fn) => ({ timeBased: () => ({ everyMinutes: (n) => ({ create: () => { const t = { fn, n, getHandlerFunction: () => fn }; triggers.push(t); return t; } }) }) }),
    },
    PropertiesService: { getUserProperties: () => props },
    Session: { getEffectiveUser: () => ({ getEmail: () => meAddress }) },
    LockService: { getUserLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    Logger: { log: (x) => logs.push(x) },
    Date: class extends Date { constructor(...a) { super(...(a.length ? a : [clock])); } static now() { return clock; } },
  };
  return { google, store, triggers, sent, drafts, threads, labelsMade, logs, thread, msg, tick: (ms) => { clock += ms; } };
}

const DAY = 86400000;
const requestBody = "Your name: Jo Bloggs\nCompany: Bloggs & Sons\nEmail: jo@bloggs.co.uk\nPart name or number: BRK-204 rev C\nQuantity: 250";

function loadScript(setup, g) {
  const ctx = vm.createContext({ ...g.google });
  vm.runInContext(gmailScript(setup), ctx);
  return ctx;
}

test("Gmail script: valid JavaScript whatever the shop types, and their wording reads back exactly", () => {
  for (const s of [SETUP, nastySetup("gmail")]) {
    const code = gmailScript(s);
    assert.doesNotThrow(() => new vm.Script(code));
    assert.ok(!/<\/script/i.test(code) && !code.includes("<!--") && !code.includes(" "));
    const f = join(mkdtempSync(join(tmpdir(), "qf-gas-")), "Code.js");
    writeFileSync(f, code);
    assert.doesNotThrow(() => execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }), "node --check");
    const ctx = vm.createContext({});
    vm.runInContext(code.replace(/var app =[\s\S]*$/, ""), ctx);
    assert.deepEqual(JSON.parse(JSON.stringify(ctx.SETTINGS)), gasSettings(s));
  }
  assert.ok(!/[–—]/.test(gmailScript(SETUP)));
});

test("Gmail script: setup makes one trigger and leaves older requests alone", () => {
  const g = mockGoogle();
  g.thread("Old Customer <old@x.co>", "Quote request: OLD x 1", "Your name: Old");
  g.tick(1000);
  const ctx = loadScript(SETUP, g);
  ctx.setup();
  ctx.setup();
  assert.equal(g.triggers.length, 1, "running setup twice still leaves one trigger");
  assert.equal(g.triggers[0].fn, "run");
  assert.equal(g.triggers[0].n, 15);
  assert.equal(g.sent.length, 0, "a request from before setup gets nothing");
  assert.ok(g.labelsMade["Quote requests"]);
  assert.match(g.logs.at(-1), /Set up\. Checking every 15 minutes\./);
  ctx.stop();
  assert.equal(g.triggers.length, 0);
});

test("Gmail script: the thank-you goes once per request, with the name and part filled in", () => {
  const g = mockGoogle();
  const ctx = loadScript(SETUP, g);
  ctx.setup();
  g.tick(60000);
  const t = g.thread("Jo Bloggs <Jo@Bloggs.co.uk>", "Quote request: BRK-204 rev C x 250", requestBody);
  g.thread("Sales <sales@acme.co.uk>", "Quote request: my own test", "Your name: Me"); // from the shop itself
  g.thread("Spam <s@x.co>", "Cheap quotes", "nope");
  ctx.run(); ctx.run(); ctx.run();
  assert.equal(g.sent.length, 1);
  const ack = g.sent[0];
  assert.equal(ack.to, "Jo Bloggs <Jo@Bloggs.co.uk>");
  assert.equal(ack.subject, "Thanks, we've got your request for BRK-204 rev C");
  assert.ok(ack.body.startsWith("Hi Jo Bloggs,\n\nThanks for your quote request for BRK-204 rev C."));
  assert.ok(ack.body.includes("within 3 working days") && ack.body.endsWith("Acme Precision"));
  assert.deepEqual(t.labels, ["Quote requests"]);
  t.messages.push(g.msg(t, "jo@bloggs.co.uk", "Re: Quote request: BRK-204 rev C x 250", "Here's the drawing"));
  ctx.run();
  assert.equal(g.sent.length, 1, "a customer's reply on the thread isn't thanked again");
});

test("Gmail script: the chase goes only after N days and only if the customer hasn't replied", () => {
  const g = mockGoogle();
  const ctx = loadScript(SETUP, g);
  ctx.setup();
  g.tick(60000);
  const quiet = g.thread("jo@bloggs.co.uk", "Quote request: BRK-204 rev C x 250", requestBody);
  const replied = g.thread("al@other.co", "Quote request: SHAFT x 10", "Your name: Al\nPart name or number: SHAFT\nQuantity: 10");
  const unquoted = g.thread("bo@third.co", "Quote request: PIN x 3", "Your name: Bo");
  ctx.run();
  assert.equal(g.sent.length, 3, "three thank-yous");
  g.tick(DAY);
  quiet.messages.push(g.msg(quiet, "Acme Sales <sales@acme.co.uk>", "Re: Quote request: BRK-204 rev C x 250", "£4.20 each"));
  replied.messages.push(g.msg(replied, "quotes@acme.co.uk", "Re: Quote request: SHAFT x 10", "£9 each"));
  g.tick(DAY);
  replied.messages.push(g.msg(replied, "Al <al@other.co>", "Re: Quote request: SHAFT x 10", "Thanks, will let you know"));
  g.tick(3 * DAY); // 4 days after the quote
  ctx.run();
  assert.equal(g.sent.length, 3, "not yet at 4 days");
  g.tick(DAY + 60000); // just over 5 days
  ctx.run(); ctx.run();
  assert.equal(g.sent.length, 4, "one chase, once");
  const chase = g.sent[3];
  assert.equal(chase.thread, quiet);
  assert.equal(chase.to, "jo@bloggs.co.uk");
  assert.equal(chase.subject, "Just checking you got our quote for BRK-204 rev C");
  assert.ok(chase.body.startsWith("Hi Jo Bloggs,\n\nJust checking you got our quote for BRK-204 rev C."));
  g.tick(30 * DAY);
  ctx.run();
  assert.equal(g.sent.length, 4, "never twice, never to the one who replied or the one not yet quoted");
  assert.equal(unquoted.messages.length, 2);
});

test("Gmail script: remind mode never sends a chase; it leaves a draft and stars the quote", () => {
  const g = mockGoogle();
  const ctx = loadScript({ ...SETUP, replies: { ...DEFAULT_REPLIES, followMode: "remind", followDays: 2 } }, g);
  ctx.setup();
  g.tick(60000);
  const t = g.thread("jo@bloggs.co.uk", "Quote request: BRK-204 rev C x 250", requestBody);
  ctx.run();
  g.tick(DAY);
  const quote = g.msg(t, "quotes@acme.co.uk", "Re: Quote request", "£4.20 each");
  t.messages.push(quote);
  g.tick(2 * DAY + 1);
  ctx.run(); ctx.run();
  assert.equal(g.sent.length, 1, "only the thank-you was sent");
  assert.equal(g.drafts.length, 1, "one draft chase");
  assert.ok(g.drafts[0].body.includes("Just checking you got our quote for BRK-204 rev C"));
  assert.equal(quote.starred, true);
  assert.equal(t.inbox, true);
});

test("Gmail script: follow-up off sends only thank-yous; nasty wording is sent exactly as typed", () => {
  const g = mockGoogle();
  const s = nastySetup("gmail");
  const ctx = loadScript({ ...s, replies: { ...s.replies, follow: false } }, g);
  ctx.setup();
  g.tick(60000);
  const t = g.thread("jo@bloggs.co.uk", "Quote request: BRK-204 rev C x 250", requestBody);
  ctx.run();
  t.messages.push(g.msg(t, "quotes@acme.co.uk", "Re: Quote request", "£4.20 each"));
  g.tick(40 * DAY);
  ctx.run();
  assert.equal(g.sent.length, 1);
  assert.equal(g.sent[0].body, fill(s.replies.thanksBody, { name: "Jo Bloggs", part: "BRK-204 rev C", quantity: "250", shop: oneLine(NASTY), reply_days: "3 working days" }));
  // With no part line in the email, the part and quantity come from the subject.
  const app = gmailEngine(gasSettings(SETUP), { props: { getUserProperties: () => ({}) } });
  assert.deepEqual({ ...app._values({ getPlainBody: () => "", getSubject: () => "Quote request: Shaft x 2 x 10" }) }, { name: "there", part: "Shaft x 2", quantity: "10", shop: "Acme Precision", reply_days: "3 working days" });
});
