// Automatic replies: the placeholders, how they are filled on each email system and the checks on the wording.
// Everything here is plain functions on the setup, used by the builder, the guides and the tests.
import type { Platform, Replies, Setup } from "./setup";

export const PLACEHOLDERS: { key: Key; means: string }[] = [
  { key: "name", means: "their name" },
  { key: "part", means: "the part" },
  { key: "quantity", means: "the quantity" },
  { key: "shop", means: "your shop name" },
  { key: "reply_days", means: "3 working days" },
];
export type Key = "name" | "part" | "quantity" | "shop" | "reply_days";
export type Values = Record<Key, string>;

export const PLATFORMS: { id: Platform; name: string; short: string }[] = [
  { id: "outlook", name: "Outlook / Microsoft 365", short: "Outlook" },
  { id: "gmail", name: "Gmail / Google Workspace", short: "Gmail" },
  { id: "other", name: "Something else", short: "Other email" },
];
export const platformName = (p: Platform) => PLATFORMS.find((x) => x.id === p)?.name ?? p;

// What a placeholder becomes when the email system can't read it from the request.
export const FALLBACK: Values = { name: "there", part: "your part", quantity: "the quantity you asked for", shop: "The team", reply_days: "" };
export const SAMPLE = { name: "Jo Bloggs", part: "BRK-204 rev C", quantity: "250" };

// Which placeholders each system can fill from the request itself. Outlook reads the part and quantity from the
// subject; a Power Automate expression can't pull the name out of the email reliably. A host's autoresponder sends
// the same text to everyone.
export const READS: Record<Platform, Key[]> = { outlook: ["part", "quantity"], gmail: ["name", "part", "quantity"], other: [] };

// The form's subject starts like this (see send.ts). The flows and the script look for it.
export const PREFIX = "Quote request";
export const PREFIX_COLON = "Quote request:";

export const days = (n: number, unit = "working day") => `${n} ${unit}${n === 1 ? "" : "s"}`;
export const shopName = (s: Setup) => s.shop.name.replace(/\s+/g, " ").trim() || FALLBACK.shop;

export function fill(template: string, v: Partial<Values>): string {
  return template.replace(/\{(name|part|quantity|shop|reply_days)\}/g, (all, k: Key) => (v[k] !== undefined ? v[k]! : all));
}

// The fixed values for this setup, with the request's own values where the system can read them.
export function values(s: Setup, request: Partial<Values> = {}, platform: Platform = s.replies.platform): Values {
  const reads = READS[platform];
  const pick = (k: "name" | "part" | "quantity") => (reads.includes(k) && request[k] ? request[k]! : FALLBACK[k]);
  return { name: pick("name"), part: pick("part"), quantity: pick("quantity"), shop: shopName(s), reply_days: days(s.replies.replyDays) };
}

// The reply as the customer reads it, on this system, for a sample request.
export function sample(s: Setup, which: "thanks" | "chase", platform: Platform = s.replies.platform) {
  const r = s.replies;
  const v = values(s, SAMPLE, platform);
  return which === "thanks"
    ? { subject: fill(r.thanksSubject, v), body: fill(r.thanksBody, v) }
    : { subject: fill(r.chaseSubject, v), body: fill(r.chaseBody, v) };
}

// The labels the form uses for the name, part and quantity lines in its email, so the Gmail script can read them.
export function labels(s: Setup) {
  const tidy = (x: string) => x.replace(/\s+/g, " ").trim();
  const part = s.blocks.find((b) => b.type === "text" && b.subject);
  const qty = s.blocks.find((b) => b.type === "quantity");
  const name = s.blocks.find((b) => b.type === "text" && (b.format ?? "text") === "text" && !b.subject && /name/i.test(b.label) && !/company|business|organi[sz]ation|part/i.test(b.label));
  return { name: name ? tidy(name.label) : "", part: part ? tidy(part.label) : "", quantity: qty ? tidy(qty.label) : "" };
}

// Problems with the wording, keyed by field. The flows tell the shop's quote from the thank-you and the chase by the
// subject, so neither may carry the form's subject line.
export function problems(r: Replies): Partial<Record<keyof Replies, string>> {
  const out: Partial<Record<keyof Replies, string>> = {};
  const clash = (x: string) => /quote request/i.test(x);
  if (!r.thanksSubject.trim()) out.thanksSubject = "Add a subject.";
  else if (clash(r.thanksSubject)) out.thanksSubject = "Leave “Quote request” out of this subject, so the follow-up can tell it from your quote.";
  if (!r.thanksBody.trim()) out.thanksBody = "Add the message.";
  if (r.follow) {
    if (!r.chaseSubject.trim()) out.chaseSubject = "Add a subject.";
    else if (clash(r.chaseSubject)) out.chaseSubject = "Leave “Quote request” out of this subject, so the chase is only sent once.";
    if (!r.chaseBody.trim()) out.chaseBody = "Add the message.";
  }
  return out;
}

// A dedicated address on the shop's own domain, for the no-flow route and other hosts.
export function quotesAddress(s: Setup): string {
  const m = /@([^\s@]+)$/.exec(s.shop.email.trim());
  return `quotes@${m ? m[1].toLowerCase() : "yourshop.co.uk"}`;
}
