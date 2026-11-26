// The setup guides for automatic replies: one short checklist per email system with the shop's own wording already
// filled in. A guide is plain data, drawn on the builder page and written out as a self-contained HTML file
// (guideHtml). Step text may hold *menu names* in stars and [links](https://...); everything else is shown as typed.
import { esc } from "./html";
import { gmailScript } from "./gmail";
import { days, fill, platformName, PREFIX, PREFIX_COLON, quotesAddress, shopName, values, type Values } from "./replies";
import { slug, type Platform, type Setup } from "./setup";

export type Val = { label: string; value: string; code?: boolean; big?: boolean };
export type Step = { text: string; vals?: Val[]; note?: string };
export type Part = { h: string; p?: string; steps: Step[] };
export type Guide = { platform: Platform; title: string; lede: string; parts: Part[]; facts: string[] };

export const END_LINE = "Want every request in one place with its status, and this fitted to your systems? That’s what we do.";
export const START_URL = "https://webflowoutreach.com/start";

// ---------------------------------------------------------------- Outlook: Power Automate expressions

// A Power Automate string literal: single quotes doubled.
export const paStr = (s: string) => `'${s.replace(/'/g, "''")}'`;
// The flows send HTML: the shop's text is escaped and line breaks become <br>.
const html = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r?\n/g, "<br>");

const SUBJ = "triggerOutputs()?['body/subject']";
// The text after "Quote request:" (the whole subject if it isn't there), then the part and quantity either side of
// the last " x ". Every branch is safe to work out even when there is no " x ", in case both sides are evaluated.
const REST = `trim(last(split(${SUBJ}, ${paStr(PREFIX_COLON)})))`;
const AT = `lastIndexOf(${REST}, ' x ')`;
export const PA_PART = `if(greater(${AT}, 0), substring(${REST}, 0, max(${AT}, 0)), ${REST})`;
export const paQuantity = (fallback: string) => `if(greater(${AT}, 0), substring(${REST}, min(add(${AT}, 3), length(${REST}))), ${paStr(fallback)})`;

// Turns their wording into one Power Automate expression, or plain text if it needs nothing from the email.
export function paText(template: string, s: Setup, asHtml: boolean): { value: string; expression: boolean } {
  const fixed = values(s, {}, "outlook");
  const dyn: Partial<Record<keyof Values, string>> = {
    ...(s.blocks.some((b) => b.type === "text" && b.subject) && { part: PA_PART }),
    ...(s.blocks.some((b) => b.type === "quantity") && { quantity: paQuantity(fixed.quantity) }),
  };
  const bits: string[] = [];
  let lit = "";
  for (const piece of template.split(/(\{(?:name|part|quantity|shop|reply_days)\})/)) {
    const k = /^\{(\w+)\}$/.exec(piece)?.[1] as keyof Values | undefined;
    if (k && dyn[k]) {
      if (lit) bits.push(paStr(asHtml ? html(lit) : lit));
      lit = "";
      bits.push(dyn[k]!);
    } else lit += k ? fixed[k] : piece;
  }
  if (!bits.length) return { value: lit, expression: false }; // pasted as plain text
  if (lit) bits.push(paStr(asHtml ? html(lit) : lit));
  return { value: bits.length === 1 ? bits[0] : `concat(${bits.join(", ")})`, expression: true };
}

export const PA = {
  thanksCondition: `@startsWith(${SUBJ}, ${paStr(PREFIX)})`,
  quoteCondition: `@and(startsWith(toLower(${SUBJ}), 're:'), contains(${SUBJ}, ${paStr(PREFIX_COLON)}))`,
  messageId: "triggerOutputs()?['body/id']",
  customer: "first(split(triggerOutputs()?['body/toRecipients'], ';'))",
  emails: "outputs('Get_emails_(V3)')?['body/value']",
  received: "ticks(item()?['receivedDateTime'])",
  sentAt: "ticks(triggerOutputs()?['body/receivedDateTime'])",
  count: "length(body('Filter_array'))",
  remindSubject: `concat('Chase: ', ${SUBJ})`,
};

function pasteStep(field: string, t: { value: string; expression: boolean }): Step {
  return t.expression
    ? { text: `*${field}*: click in the box, choose *Insert expression* (the fx button), paste this and press *Add*.`, vals: [{ label: field, value: t.value, code: true }] }
    : { text: `*${field}*: paste this.`, vals: [{ label: field, value: t.value }] };
}

function outlook(s: Setup): Guide {
  const r = s.replies;
  const thanksSubject = paText(r.thanksSubject, s, false);
  const thanksBody = paText(r.thanksBody, s, true);
  const chaseSubject = paText(r.chaseSubject, s, false);
  const chaseBody = paText(r.chaseBody, s, true);
  const me = s.shop.email.trim() || quotesAddress(s);
  const remindBody = `concat('No reply yet from ', ${PA.customer}, ' to your quote. Here is a chase you can send:<br><br>', ${chaseBody.expression ? chaseBody.value : paStr(html(chaseBody.value))})`;

  const parts: Part[] = [
    {
      h: "Flow A: the thank-you",
      p: "Replies to each new request within a few minutes.",
      steps: [
        { text: "Go to [make.powerautomate.com](https://make.powerautomate.com) and sign in with the Microsoft 365 account that gets your quote requests." },
        { text: "Choose *Create*, then *Automated cloud flow*. Name it and pick the trigger *When a new email arrives (V3)* from Office 365 Outlook. Press *Create*." },
        { text: "In the trigger set *Folder* to *Inbox* and *Subject Filter* to this.", vals: [{ label: "Subject Filter", value: PREFIX_COLON }] },
        { text: "Open the trigger’s *Settings*, find *Trigger conditions*, press *Add* and paste this. It stops the flow thanking people for their own replies.", vals: [{ label: "Trigger condition", value: PA.thanksCondition, code: true }] },
        { text: "Press + under the trigger, *Add an action*, and choose *Reply to email (V3)* from Office 365 Outlook." },
        { text: "*Message Id*: choose *Message Id* from the trigger in the dynamic content list, or paste this as an expression.", vals: [{ label: "Message Id", value: PA.messageId, code: true }] },
        { text: "Open *Advanced parameters* and tick *Subject* and *Body*." },
        pasteStep("Subject", thanksSubject),
        pasteStep("Body", thanksBody),
        { text: "*Save*. Then send a test request from the form using a different email address, and check it gets the thank-you." },
      ],
    },
  ];

  if (r.follow) {
    const auto = r.followMode === "auto";
    parts.push({
      h: "Flow B: the follow-up",
      p: `Starts when you reply to a request with your quote. After ${days(r.followDays, "day")} it checks for a reply from the customer and, if there isn’t one, ${auto ? "sends your chase" : "emails you a reminder to chase"}.`,
      steps: [
        { text: "Make another *Automated cloud flow* with the trigger *When a new email arrives (V3)*." },
        { text: "Set *Folder* to *Sent Items* and *Subject Filter* to this.", vals: [{ label: "Subject Filter", value: PREFIX_COLON }] },
        { text: "In the trigger’s *Settings*, add this *Trigger condition*. It picks out your replies to a request, so the thank-you and the chase never start it.", vals: [{ label: "Trigger condition", value: PA.quoteCondition, code: true }] },
        { text: `Add the action *Delay* (Schedule). *Count*: ${r.followDays}. *Unit*: *Day*.`, vals: [{ label: "Count", value: String(r.followDays) }] },
        { text: "Add *Get emails (V3)* from Office 365 Outlook. *Folder*: *Inbox*. Open *Advanced parameters*: set *Fetch Only Unread Messages* to *No*, and *From* to this expression.", vals: [{ label: "From", value: PA.customer, code: true }] },
        { text: "Add *Filter array* (Data Operation). *From*: this expression.", vals: [{ label: "From", value: PA.emails, code: true }] },
        { text: "Set the filter to keep emails that came in after your quote: left box this expression, *is greater than*, right box the next one.", vals: [{ label: "Left", value: PA.received, code: true }, { label: "Right", value: PA.sentAt, code: true }] },
        { text: "Add a *Condition*. Left box this expression, *is equal to*, right box 0. True means they haven’t replied.", vals: [{ label: "Left", value: PA.count, code: true }, { label: "Right", value: "0" }] },
        ...(auto
          ? [
              { text: "In *True*, add *Reply to email (V3)*. *Message Id*: this expression. Under *Advanced parameters* tick *To*, *Subject* and *Body*.", vals: [{ label: "Message Id", value: PA.messageId, code: true }] },
              { text: "*To*: this expression, so the chase goes to the customer.", vals: [{ label: "To", value: PA.customer, code: true }] },
              pasteStep("Subject", chaseSubject),
              pasteStep("Body", chaseBody),
            ]
          : [
              { text: "In *True*, add *Send an email (V2)*. *To*: your address.", vals: [{ label: "To", value: me }] },
              { text: "*Subject*: insert this expression.", vals: [{ label: "Subject", value: PA.remindSubject, code: true }] },
              { text: "*Body*: insert this expression. It holds your chase, ready to copy.", vals: [{ label: "Body", value: remindBody, code: true }] },
            ]),
        { text: "Leave *False* empty and *Save*. Keep the action names as they are; the expressions use them." },
      ],
    });
  }

  parts.push({
    h: "No flows? Use automatic replies",
    p: "Works on any Microsoft 365 plan. It sends the same words to everyone, so the placeholders become plain words, and there’s no follow-up.",
    steps: [
      { text: "In the [Microsoft 365 admin centre](https://admin.microsoft.com) go to *Teams & groups*, *Shared mailboxes*, *Add a shared mailbox*. Shared mailboxes need no licence.", vals: [{ label: "Email", value: quotesAddress(s) }] },
      { text: "In Outlook on the web open it (your picture, *Open another mailbox*), then *Settings*, *Account*, *Automatic replies*." },
      { text: "Turn on automatic replies and choose to send replies outside your organisation to all external senders. Paste this message.", vals: [{ label: "Message", value: fill(r.thanksBody, values(s, {}, "other")), big: true }] },
      { text: "Point the form at the shared mailbox: put it in *Email requests go to* on the builder and download the form again. Outlook replies to each sender once until you switch it off and on." },
    ],
  });

  return {
    platform: "outlook",
    title: "Automatic replies in Outlook",
    lede: "Two small flows in Power Automate, inside your own Microsoft 365. They use only the standard Outlook actions.",
    parts,
    facts: [
      "Needs a Microsoft 365 business plan that includes Power Automate. Business Basic, Standard and Premium do. No premium licence is needed.",
      "If Create is greyed out, your IT admin has switched flows off. Ask them, or use automatic replies below.",
      "Outlook can’t read the customer’s name from the email reliably, so {name} becomes “there”.",
      "If requests go to a shared mailbox, use When a new email arrives in a shared mailbox (V2) for Flow A and put the address in Original Mailbox Address.",
      "A flow can wait at most 30 days, so the follow-up is 28 days at most. Each reply you send on a request starts its own wait.",
    ],
  };
}

// ---------------------------------------------------------------- Gmail: Apps Script

function gmail(s: Setup): Guide {
  const r = s.replies;
  return {
    platform: "gmail",
    title: "Automatic replies in Gmail",
    lede: "A short script in your own Google account. It checks every 15 minutes, thanks each new request once and follows up quotes that go quiet.",
    parts: [
      {
        h: "Set it up",
        steps: [
          { text: "Go to [script.google.com](https://script.google.com), signed in to the Gmail account that gets your quote requests. Press *New project*." },
          { text: "Click *Untitled project* at the top and call it Quote replies." },
          { text: "Delete everything in *Code.gs*, paste this script and press *Save* (Ctrl+S or Cmd+S). Your wording is already in it.", vals: [{ label: "Script", value: gmailScript(s), code: true, big: true }] },
          { text: "In the toolbar pick *setup* from the list of functions and press *Run*." },
          { text: "Google asks for permission. Press *Review permissions* and choose your account." },
          { text: "You’ll see “Google hasn’t verified this app”. That’s normal: it’s your own script, not an app from anyone else. Press *Advanced*, then *Go to Quote replies (unsafe)*, then *Allow*." },
          { text: "The log says “Set up. Checking every 15 minutes.” Send a test request from the form using a different email address." },
        ],
      },
      {
        h: "What it does",
        steps: [
          { text: "New emails whose subject starts “Quote request” get the label Quote requests and your thank-you, once per request. Requests from before you ran setup are left alone." },
          ...(r.follow
            ? [{
                text: r.followMode === "auto"
                  ? `When you reply to a request with your quote, it waits ${days(r.followDays, "day")}. If the customer hasn’t written back, it sends your chase once.`
                  : `When you reply to a request with your quote, it waits ${days(r.followDays, "day")}. If the customer hasn’t written back, it puts your chase in Drafts, stars the thread and moves it to your inbox.`,
              }]
            : []),
          { text: "To switch it off, open the script, pick *stop* and press *Run*. To change the wording, edit it at the top of the script and run *setup* again." },
        ],
      },
    ],
    facts: [
      "It runs as you, from your account. Nothing is sent to us or anyone else.",
      "Your first reply on a request counts as the quote.",
      "Gmail lets a script send about 100 emails a day on a free account and 1,500 on Google Workspace.",
      "On Google Workspace your admin may have to allow Apps Script.",
    ],
  };
}

// ---------------------------------------------------------------- other hosts

function other(s: Setup): Guide {
  const r = s.replies;
  const thanks = fill(r.thanksSubject, values(s, {}, "other"));
  const body = fill(r.thanksBody, values(s, {}, "other"));
  const q = quotesAddress(s);
  const parts: Part[] = [
    {
      h: "The thank-you",
      p: "Your email host can reply from a dedicated address. These steps fit cPanel, IONOS, 123-reg and most others.",
      steps: [
        { text: "Log in to your email host’s control panel." },
        { text: "Make a new mailbox for quote requests.", vals: [{ label: "Address", value: q }] },
        { text: "Find its autoresponder. In cPanel it’s *Email*, *Autoresponders*, *Add Autoresponder*. Other hosts call it Autoresponder, Auto reply or Out of office." },
        { text: "Set *Interval* to 1 hour if there’s one, so it never replies twice in a row. Paste the subject and message, and switch it on with no end date.", vals: [{ label: "Subject", value: thanks }, { label: "Message", value: body, big: true }] },
        { text: "Forward the new mailbox to your main inbox. In cPanel it’s *Email*, *Forwarders*, *Add Forwarder*." },
        { text: "Put the new address in *Email requests go to* on the builder and download the form again.", vals: [{ label: "Email requests go to", value: q }] },
        { text: "Send a test request from the form and check the thank-you arrives." },
      ],
    },
  ];
  if (r.follow) {
    parts.push({
      h: "The follow-up",
      p: "Sending chases automatically needs Outlook or Gmail. Here you get a reminder with your chase ready to paste.",
      steps: [
        { text: `When you send a quote, flag it for follow-up in ${days(r.followDays, "day")} in your email app. In Outlook it’s *Follow Up*, *Custom*, with a reminder. No flags? Put a reminder in your calendar.` },
        { text: "When it comes up and they haven’t replied, reply to your quote with this.", vals: [{ label: "Subject", value: fill(r.chaseSubject, values(s, {}, "other")) }, { label: "Message", value: fill(r.chaseBody, values(s, {}, "other")), big: true }] },
      ],
    });
  }
  return {
    platform: "other",
    title: "Automatic replies with your email host",
    lede: "A dedicated address that thanks every customer straight away, set up in your host’s own control panel.",
    parts,
    facts: [
      "An autoresponder sends the same words to everyone, so the placeholders become plain words.",
      "Change the thank-you on the builder and paste it again whenever you like.",
    ],
  };
}

export function guide(s: Setup): Guide {
  return s.replies.platform === "gmail" ? gmail(s) : s.replies.platform === "other" ? other(s) : outlook(s);
}

// ---------------------------------------------------------------- the file

// *bold* and [text](https://...) in step text, everything else escaped.
export function inline(text: string): string {
  return esc(text)
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (_m, t, u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`)
    .replace(/\*([^*]+)\*/g, "<b>$1</b>");
}

const CSS = `
*,*::before,*::after{box-sizing:border-box}
html{color-scheme:light;-webkit-text-size-adjust:100%}
body{margin:0;background:#F4F2EC;background-image:linear-gradient(rgba(17,17,17,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(17,17,17,.05) 1px,transparent 1px);background-size:24px 24px;color:#111;font:16px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.g{--ink:#111111;--dim:#5E5B55;--line:#CFCBC3;--sheet:#FBFAF6;--paper:#F4F2EC;padding:clamp(12px,4vw,56px) clamp(10px,3vw,32px) 40px}
.g-sheet{max-width:860px;margin:0 auto;border:1.5px solid var(--ink);border-radius:16px;background:var(--sheet);box-shadow:0 1px 0 var(--ink),0 2px 6px rgba(17,17,17,.06),0 28px 56px -28px rgba(17,17,17,.35)}
.g-tb{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;border-bottom:1.5px solid var(--ink);background:var(--paper);border-radius:14.5px 14.5px 0 0}
.g-tb>div{min-width:0;padding:10px clamp(14px,3vw,24px)}
.g-tb>div+div{border-left:1px solid var(--line)}
.g-tb dt{font-size:11.5px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.g-tb dd{margin:2px 0 0;font-size:14.5px;font-weight:650;overflow-wrap:anywhere}
.g-main{padding:clamp(22px,4vw,40px) clamp(16px,3vw,32px)}
.g-h1{margin:0;font-size:clamp(1.8rem,5vw,2.5rem);font-weight:800;letter-spacing:-.03em;line-height:1.05}
.g-lede{margin:10px 0 0;max-width:62ch;font-size:1.05rem;color:var(--dim)}
.g-part{margin-top:30px}
.g-h2{margin:0;padding-bottom:10px;border-bottom:1.5px solid var(--ink);font-size:1.3rem;font-weight:800;letter-spacing:-.02em}
.g-pp{margin:10px 0 0;color:var(--dim)}
.g-steps{list-style:none;margin:6px 0 0;padding:0}
.g-step{display:grid;grid-template-columns:26px minmax(0,1fr);gap:0 14px;padding:14px 0;border-bottom:1px solid var(--line)}
.g-n{display:inline-grid;place-items:center;width:26px;height:26px;border:1.5px solid var(--ink);border-radius:50%;background:#fff;font-size:12.5px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.g-t{margin:2px 0 0;overflow-wrap:anywhere}
.g-t a{color:inherit;text-decoration:underline;text-underline-offset:3px}
.g-val{grid-column:2;margin-top:10px;border:1.5px solid var(--ink);border-radius:10px;background:#fff;box-shadow:0 2px 0 var(--ink);overflow:hidden}
.g-vh{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 6px 6px 12px;border-bottom:1px solid var(--line);background:var(--paper)}
.g-vl{font-size:11.5px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.g-copy{min-height:34px;padding:0 14px;border:1.5px solid var(--ink);border-radius:999px;background:#fff;color:var(--ink);font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 0 var(--ink)}
.g-copy:hover{transform:translateY(-1px)}
.g-copy.ok{background:#D9F24A}
.g-copy:focus-visible{outline:2px solid #234BE0;outline-offset:2px}
.g-v{margin:0;padding:10px 12px;max-height:9rem;overflow:auto;font:14px/1.5 ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere}
.g-v.code{font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.g-v.big{max-height:22rem}
.g-facts{margin-top:30px;padding:16px 18px;border:1.5px solid var(--ink);border-left-width:5px;border-radius:10px;background:#fff}
.g-facts h2{margin:0 0 6px;font-size:1rem;font-weight:800}
.g-facts ul{margin:0;padding-left:1.1em;color:var(--dim)}
.g-facts li+li{margin-top:4px}
.g-end{margin:28px 0 0;padding-top:16px;border-top:1px solid var(--line);font-size:.95rem;color:var(--dim)}
.g-end a{color:var(--ink);font-weight:650;text-decoration:underline;text-underline-offset:3px}
.g-said{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);margin:0;padding:8px 16px;border-radius:999px;background:#111;color:#fff;font-size:14px;font-weight:600}
.g-said:empty{display:none}
@media (max-width:559px){.g-tb{grid-template-columns:minmax(0,1fr)}.g-tb>div+div{border-left:0;border-top:1px solid var(--line)}.g-step{grid-template-columns:minmax(0,1fr)}.g-n{margin-bottom:8px}.g-val{grid-column:1}}
@media print{body{background:#fff}.g{padding:0}.g-sheet{box-shadow:none;border:0}.g-copy,.g-said{display:none}.g-v,.g-v.big{max-height:none;overflow:visible}.g-step,.g-val{break-inside:avoid}}
`.trim();

// Copy buttons: the Clipboard API where the browser allows it (also on a file:// page in most browsers), otherwise
// select the text and copy that way.
export function guideRuntime() {
  const d = document;
  const said = d.getElementById("g-said") as HTMLElement;
  let timer = 0;
  function tell(b: HTMLElement, ok: boolean) {
    b.textContent = ok ? "Copied" : "Press Ctrl+C";
    b.classList.toggle("ok", ok);
    said.textContent = ok ? "Copied." : "Selected. Press Ctrl+C or Cmd+C to copy.";
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { b.textContent = "Copy"; b.classList.remove("ok"); said.textContent = ""; }, 1800);
  }
  d.addEventListener("click", function (ev) {
    const t = ev.target as HTMLElement;
    const b = t && t.closest ? (t.closest(".g-copy") as HTMLElement | null) : null;
    if (!b) return;
    const v = d.getElementById(b.getAttribute("data-copy") || "") as HTMLElement | null;
    if (!v) return;
    const text = v.textContent || "";
    function fallback() {
      const sel = window.getSelection();
      if (sel && v) { const r = d.createRange(); r.selectNodeContents(v); sel.removeAllRanges(); sel.addRange(r); }
      let ok = false;
      try { ok = d.execCommand("copy"); } catch { ok = false; }
      tell(b as HTMLElement, ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { tell(b as HTMLElement, true); }, fallback);
    else fallback();
  });
}

const CSP = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'none'; base-uri 'none'";

export function guideRoot(s: Setup): string {
  const g = guide(s);
  let n = 0;
  const val = (v: Val) => {
    const id = `v${++n}`;
    return `<div class="g-val"><div class="g-vh"><span class="g-vl" id="${id}-l">${esc(v.label)}</span><button class="g-copy" type="button" data-copy="${id}" aria-describedby="${id}-l">Copy</button></div><pre class="g-v${v.code ? " code" : ""}${v.big ? " big" : ""}" id="${id}" tabindex="0">${esc(v.value)}</pre></div>`;
  };
  const parts = g.parts.map((p) => `<section class="g-part"><h2 class="g-h2">${esc(p.h)}</h2>${p.p ? `<p class="g-pp">${esc(p.p)}</p>` : ""}<ol class="g-steps">${p.steps.map((st, i) => `<li class="g-step"><span class="g-n" aria-hidden="true">${i + 1}</span><div><p class="g-t">${inline(st.text)}</p></div>${(st.vals ?? []).map(val).join("")}</li>`).join("")}</ol></section>`).join("\n");
  return `<div class="g"><div class="g-sheet">
<dl class="g-tb"><div><dt>Document</dt><dd>Setup guide</dd></div><div><dt>Shop</dt><dd>${esc(shopName(s))}</dd></div><div><dt>Email</dt><dd>${esc(platformName(s.replies.platform))}</dd></div></dl>
<main class="g-main">
<h1 class="g-h1">${esc(g.title)}</h1>
<p class="g-lede">${esc(g.lede)}</p>
${parts}
<aside class="g-facts"><h2>Good to know</h2><ul>${g.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></aside>
<p class="g-end">${esc(END_LINE)} <a href="${START_URL}">Talk to us</a></p>
</main></div></div>`;
}

export function guideHtml(s: Setup): string {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="no-referrer">
<title>${esc(`Automatic replies setup | ${shopName(s)}`)}</title>
<!--
  Your setup guide for automatic replies, made at webflowoutreach.com/quote-form. It is yours to keep and print.
  Everything runs in your own email account. Nothing is sent to us.
-->
<style>${CSS}</style>
</head>
<body>
${guideRoot(s)}
<p class="g-said" id="g-said" role="status" aria-live="polite"></p>
<script>(${guideRuntime.toString()})();</script>
</body>
</html>
`;
}

export function guideFileName(s: Setup): string {
  const n = slug(s.shop.name);
  return n ? `quote-replies-setup-${n}.html` : "quote-replies-setup.html";
}
