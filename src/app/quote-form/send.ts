// What the downloaded form does on Send: check the answers, then write the email. These functions run in two places,
// in the tests here and inside the downloaded HTML file, where makeSender is copied in as source text with
// makeSender.toString(). So everything lives inside the one function, with no imports, no outside names and only
// plain syntax a minifier leaves alone.

export type FormBlock = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  format?: string;
  subject?: boolean;
  options?: string[];
  multiple?: boolean;
  fields?: string[];
  unit?: string;
};
export type FormConfig = { email: string; shop: string; blocks: FormBlock[] };
// text, longtext, quantity, date, yesno: a string. choice: the chosen option numbers. dims: one string per field.
// drawing: true when ticked.
export type Answer = string | number[] | string[] | boolean;
export type Answers = Record<string, Answer>;
export type Mail = { url: string; subject: string; body: string; tooLong: boolean };
export type Sender = {
  validate: (c: FormConfig, a: Answers) => Record<string, string>;
  subject: (c: FormConfig, a: Answers) => string;
  body: (c: FormConfig, a: Answers) => string;
  mail: (c: FormConfig, a: Answers) => Mail;
  formatDate: (iso: string) => string;
  MAX_URL: number;
};

export function makeSender(): Sender {
  // Some email apps (Outlook on Windows among them) cut off or refuse links much longer than about 2,000 characters.
  const MAX_URL = 1900;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const EMAIL = /^[^\s@<>()[\]\\,;:"']+@[^\s@<>()[\]\\,;:"']+\.[^\s@<>()[\]\\,;:"']+$/;
  const NUM = /^\d+(\.\d+)?$/;

  function one(s: unknown): string {
    return typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "";
  }
  function many(s: unknown): string {
    return typeof s === "string" ? s.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() : "";
  }
  function list(v: unknown): unknown[] {
    return Array.isArray(v) ? v : [];
  }
  function picked(b: FormBlock, v: unknown): string[] {
    const opts = b.options || [];
    return list(v).filter(function (i) { return typeof i === "number" && i >= 0 && i < opts.length; }).map(function (i) { return opts[i as number]; });
  }
  function num(s: string): string {
    return s.replace(",", ".");
  }

  function formatDate(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return iso;
    const mo = parseInt(m[2], 10);
    if (mo < 1 || mo > 12) return iso;
    return parseInt(m[3], 10) + " " + MONTHS[mo - 1] + " " + m[1];
  }

  function validate(c: FormConfig, a: Answers): Record<string, string> {
    const bad: Record<string, string> = {};
    c.blocks.forEach(function (b) {
      const v = a[b.id];
      if (b.type === "choice") {
        if (b.required && !picked(b, v).length) bad[b.id] = b.multiple ? "Pick at least one." : "Pick one.";
      } else if (b.type === "dims") {
        const f = b.fields || [];
        const vals = list(v).map(one);
        let missing = false;
        let wrong = false;
        f.forEach(function (_x, i) {
          const s = vals[i] || "";
          if (!s) missing = true;
          else if (!NUM.test(num(s))) wrong = true;
        });
        if (wrong) bad[b.id] = "Use numbers only, like 25 or 12.5.";
        else if (b.required && missing) bad[b.id] = f.length > 1 ? "Fill in every size." : "Fill this in.";
      } else if (b.type === "drawing") {
        if (b.required && v !== true) bad[b.id] = "Tick this to say you’ll attach the drawing.";
      } else if (b.type === "yesno") {
        if (b.required && v !== "Yes" && v !== "No") bad[b.id] = "Pick yes or no.";
      } else {
        const s = b.type === "longtext" ? many(v) : one(v);
        if (!s) {
          if (b.required) bad[b.id] = "Fill this in.";
        } else if (b.type === "quantity") {
          if (!/^\d+$/.test(s) || parseInt(s, 10) < 1) bad[b.id] = "Use a whole number, like 50.";
        } else if (b.type === "date") {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) bad[b.id] = "Pick a date.";
        } else if (b.format === "email") {
          if (s.length > 254 || !EMAIL.test(s)) bad[b.id] = "That email address doesn’t look right.";
        } else if (b.format === "tel") {
          if (!/^[0-9+()\s.-]{6,24}$/.test(s)) bad[b.id] = "That phone number doesn’t look right.";
        }
      }
    });
    return bad;
  }

  function first(c: FormConfig, a: Answers, test: (b: FormBlock) => boolean): string {
    for (let i = 0; i < c.blocks.length; i++) {
      const b = c.blocks[i];
      if (test(b)) { const s = one(a[b.id]); if (s) return s; }
    }
    return "";
  }

  function subject(c: FormConfig, a: Answers): string {
    const part = first(c, a, function (b) { return b.type === "text" && !!b.subject; });
    const qty = first(c, a, function (b) { return b.type === "quantity"; });
    if (part && qty) return "Quote request: " + part + " x " + qty;
    if (part) return "Quote request: " + part;
    if (qty) return "Quote request: quantity " + qty;
    const who = first(c, a, function (b) { return b.type === "text" && b.format !== "email" && b.format !== "tel"; });
    return who ? "Quote request from " + who : "Quote request";
  }

  // One line per answer, in the order of the form. Questions left blank are left out to keep the email short.
  function body(c: FormConfig, a: Answers): string {
    const lines: string[] = [];
    c.blocks.forEach(function (b) {
      const v = a[b.id];
      const label = one(b.label);
      if (b.type === "longtext") {
        const t = many(v);
        if (t) lines.push("", label + ":", t, "");
      } else if (b.type === "choice") {
        const p = picked(b, v);
        if (p.length) lines.push(label + ": " + p.join(", "));
      } else if (b.type === "dims") {
        const vals = list(v).map(one);
        const parts: string[] = [];
        (b.fields || []).forEach(function (f, i) { if (vals[i]) parts.push(one(f) + " " + num(vals[i])); });
        if (parts.length) lines.push(label + " (" + (b.unit === "in" ? "in" : "mm") + "): " + parts.join(", "));
      } else if (b.type === "drawing") {
        if (v === true) lines.push(label + ": attached to this email");
      } else {
        const s = one(v);
        if (s) lines.push(label + ": " + (b.type === "date" ? formatDate(s) : s));
      }
    });
    const out: string[] = [];
    lines.forEach(function (l) { if (!(l === "" && (out.length === 0 || out[out.length - 1] === ""))) out.push(l); });
    while (out.length && out[out.length - 1] === "") out.pop();
    return out.join("\n");
  }

  function enc(s: string): string {
    return encodeURIComponent(s.replace(/\r?\n/g, "\r\n"));
  }

  function mail(c: FormConfig, a: Answers): Mail {
    const sub = subject(c, a);
    const text = body(c, a);
    const to = encodeURIComponent(c.email).replace(/%40/g, "@");
    let url = "mailto:" + to + "?subject=" + enc(sub) + "&body=" + enc(text);
    const tooLong = url.length > MAX_URL;
    if (tooLong) url = "mailto:" + to + "?subject=" + enc(sub) + "&body=" + enc("Paste the request you copied here, then attach your drawing.");
    return { url: url, subject: sub, body: text, tooLong: tooLong };
  }

  return { validate: validate, subject: subject, body: body, mail: mail, formatDate: formatDate, MAX_URL: MAX_URL };
}
