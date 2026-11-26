// The Google Apps Script the Gmail guide hands over. It runs in the shop's own Google account on a timer: it labels
// new quote requests, sends the thank-you once per request and, a set number of days after the shop replies with its
// quote, sends the chase (or leaves it as a draft and stars the thread) if the customer hasn't written back.
// gmailEngine is copied into the script as source text with toString(), like makeSender in send.ts, so it uses no
// imports or outside names. Google's services are passed in, which also lets the tests run it against mocks.
import { days, FALLBACK, labels, shopName } from "./replies";
import type { Setup } from "./setup";

export type GasSettings = {
  label: string;
  every: number; // minutes between checks
  shop: string;
  replyDays: string;
  thanks: { subject: string; body: string };
  follow: { on: boolean; days: number; mode: "auto" | "remind"; subject: string; body: string };
  lines: { name: string; part: string; quantity: string }; // the form's labels for these answers
  fallback: { name: string; part: string; quantity: string };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function gmailEngine(S: GasSettings, d: any) {
  const DAY = 86400000;
  const KEEP = 90 * DAY;
  const props = d.props.getUserProperties();
  function now(): number { return d.now ? d.now() : Date.now(); }
  function addr(s: unknown): string {
    const t = String(s || "");
    const m = /<([^>]+)>/.exec(t);
    return (m ? m[1] : t).trim().toLowerCase();
  }
  function mine(): string[] {
    let list: string[] = [];
    try { list.push(d.session.getEffectiveUser().getEmail()); } catch { /* no address */ }
    try { list = list.concat(d.gmail.getAliases()); } catch { /* no aliases */ }
    return list.map(addr).filter(function (x) { return !!x; });
  }
  function isRequest(subject: unknown): boolean {
    return String(subject || "").trim().toLowerCase().indexOf("quote request") === 0;
  }
  function line(body: string, label: string): string {
    if (!label) return "";
    const want = label.toLowerCase() + ":";
    const rows = String(body || "").split(/\r?\n/);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].trim();
      if (r.toLowerCase().indexOf(want) === 0) return r.slice(want.length).trim();
    }
    return "";
  }
  // The form writes "Quote request: <part> x <quantity>".
  function fromSubject(subject: string) {
    const s = String(subject || "");
    const at = s.indexOf(":");
    const rest = at >= 0 ? s.slice(at + 1).trim() : "";
    const x = rest.lastIndexOf(" x ");
    return x > 0 ? { part: rest.slice(0, x).trim(), quantity: rest.slice(x + 3).trim() } : { part: rest, quantity: "" };
  }
  function values(msg: any) {
    let body = "";
    try { body = msg.getPlainBody(); } catch { body = ""; }
    const sub = fromSubject(msg.getSubject());
    return {
      name: line(body, S.lines.name) || S.fallback.name,
      part: line(body, S.lines.part) || sub.part || S.fallback.part,
      quantity: line(body, S.lines.quantity) || sub.quantity || S.fallback.quantity,
      shop: S.shop,
      reply_days: S.replyDays,
    };
  }
  function fill(t: string, v: Record<string, string>): string {
    return String(t).replace(/\{(name|part|quantity|shop|reply_days)\}/g, function (all, k) { return v[k] !== undefined ? v[k] : all; });
  }
  function get(id: string): any {
    try { return JSON.parse(props.getProperty("q_" + id) || "null"); } catch { return null; }
  }
  function put(id: string, v: unknown) { props.setProperty("q_" + id, JSON.stringify(v)); }
  function label() { return d.gmail.getUserLabelByName(S.label) || d.gmail.createLabel(S.label); }
  function reply(msg: any, subject: string, body: string) {
    return msg.createDraftReply(body, { subject: subject.slice(0, 250) });
  }

  // New requests: thank the customer once, label the thread and remember it.
  function thank(me: string[], since: number) {
    const lbl = label();
    const threads = d.gmail.search('subject:"quote request" newer_than:3d', 0, 50);
    let sent = 0;
    threads.forEach(function (t: any) {
      const id = t.getId();
      if (get(id)) return;
      const first = t.getMessages()[0];
      if (!first || !isRequest(first.getSubject())) return;
      if (me.indexOf(addr(first.getFrom())) >= 0) return;
      if (first.getDate().getTime() < since) return; // here before the script was switched on
      const v = values(first);
      const ack = reply(first, fill(S.thanks.subject, v), fill(S.thanks.body, v)).send();
      t.addLabel(lbl);
      put(id, { at: now(), ack: ack && ack.getId ? ack.getId() : "", done: !S.follow.on });
      sent++;
    });
    return sent;
  }

  // Requests the shop has quoted: after the wait, chase if the customer hasn't replied since the quote.
  function chase(me: string[]) {
    const all = props.getProperties();
    let chased = 0;
    Object.keys(all).forEach(function (k) {
      if (k.indexOf("q_") !== 0) return;
      const id = k.slice(2);
      let rec: any = null;
      try { rec = JSON.parse(all[k]); } catch { rec = null; }
      if (!rec || now() - rec.at > KEEP) { props.deleteProperty(k); return; }
      if (rec.done || !S.follow.on) return;
      const t = d.gmail.getThreadById(id);
      if (!t) { props.deleteProperty(k); return; }
      const msgs = t.getMessages().filter(function (m: any) { return !m.isDraft(); });
      let q = -1;
      for (let i = 1; i < msgs.length; i++) {
        if (msgs[i].getId() !== rec.ack && me.indexOf(addr(msgs[i].getFrom())) >= 0) { q = i; break; }
      }
      if (q < 0) return; // not quoted yet
      for (let j = q + 1; j < msgs.length; j++) {
        if (me.indexOf(addr(msgs[j].getFrom())) < 0) { rec.done = true; rec.why = "replied"; put(id, rec); return; }
      }
      if (now() - msgs[q].getDate().getTime() < S.follow.days * DAY) return;
      const first = msgs[0];
      const v = values(first);
      const draft = reply(first, fill(S.follow.subject, v), fill(S.follow.body, v));
      if (S.follow.mode === "auto") draft.send();
      else { t.moveToInbox(); msgs[q].star(); }
      rec.done = true;
      rec.why = S.follow.mode === "auto" ? "chased" : "reminded";
      put(id, rec);
      chased++;
    });
    return chased;
  }

  function run() {
    const lock = d.lock.getUserLock();
    if (!lock.tryLock(10000)) return "Busy, will try again next time.";
    try {
      const me = mine();
      const since = Number(props.getProperty("since") || now());
      const a = thank(me, since);
      const b = chase(me);
      return "Thanked " + a + ", followed up " + b + ".";
    } finally { lock.releaseLock(); }
  }

  function stop() {
    d.triggers.getProjectTriggers().forEach(function (t: any) { if (t.getHandlerFunction() === "run") d.triggers.deleteTrigger(t); });
    return "Stopped. Nothing more will be sent.";
  }

  function setup() {
    stop();
    d.triggers.newTrigger("run").timeBased().everyMinutes(S.every).create();
    if (!props.getProperty("since")) props.setProperty("since", String(now()));
    label();
    run();
    return "Set up. Checking every " + S.every + " minutes.";
  }

  return { setup: setup, run: run, stop: stop, _fill: fill, _values: values };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function gasSettings(s: Setup): GasSettings {
  const r = s.replies;
  return {
    label: "Quote requests",
    every: 15,
    shop: shopName(s),
    replyDays: days(r.replyDays),
    thanks: { subject: r.thanksSubject, body: r.thanksBody },
    follow: { on: r.follow, days: r.followDays, mode: r.followMode, subject: r.chaseSubject, body: r.chaseBody },
    lines: labels(s),
    fallback: { name: FALLBACK.name, part: FALLBACK.part, quantity: FALLBACK.quantity },
  };
}

// JSON is valid JavaScript. Escaping < > & and the line separators as well means nothing they typed can end a
// comment, a string or a <script> element wherever the script is shown or pasted.
function jsLiteral(v: unknown): string {
  return JSON.stringify(v, null, 2).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function gmailScript(s: Setup): string {
  const name = shopName(s).replace(/[^\w .,'()-]/g, "").slice(0, 60);
  return `// Quote replies for ${name || "your shop"}. Runs in your own Google account; nothing goes to anyone else.
// Made at webflowoutreach.com/quote-form. Choose setup and press Run once. To switch it off, run stop.
// Your wording is below. Change it here if you like, then run setup again.

var SETTINGS = ${jsLiteral(gasSettings(s))};

var app = (${gmailEngine.toString()})(SETTINGS, {
  gmail: GmailApp, props: PropertiesService, triggers: ScriptApp, session: Session, lock: LockService
});

function setup() { Logger.log(app.setup()); }
function run() { Logger.log(app.run()); }
function stop() { Logger.log(app.stop()); }
`;
}
