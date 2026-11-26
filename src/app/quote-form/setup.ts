// The quote form setup: the shop's details and the blocks of their form. Plain data, so it can live in localStorage,
// be saved as a JSON file and be read back. Anything read back is cleaned here before it is used.

export type BlockType = "text" | "longtext" | "quantity" | "date" | "yesno" | "choice" | "dims" | "drawing";
export type TextFormat = "text" | "email" | "tel";
export type Unit = "mm" | "in";

export type Block = {
  id: string;
  type: BlockType;
  label: string;
  help: string;
  required: boolean;
  format?: TextFormat; // text: what kind of answer
  subject?: boolean; // text: the part name that goes in the email subject
  options?: string[]; // choice
  multiple?: boolean; // choice
  fields?: string[]; // dims
  unit?: Unit; // dims
};

export type Shop = {
  name: string;
  email: string;
  title: string;
  intro: string;
  logo: string; // a data: URL read in the browser, or ""
  accent: string; // #rrggbb, or "" for ink
  credit: boolean;
};

export type Platform = "outlook" | "gmail" | "other";
export type FollowMode = "auto" | "remind";

// Automatic replies: the wording and settings that go into the shop's own email. Nothing here reaches us.
export type Replies = {
  platform: Platform;
  replyDays: number; // "We usually reply within N working days", also shown on the form
  thanksSubject: string;
  thanksBody: string;
  follow: boolean;
  followDays: number; // days after the shop sends its quote
  followMode: FollowMode;
  chaseSubject: string;
  chaseBody: string;
};

export type Setup = { shop: Shop; blocks: Block[]; replies: Replies };

export const TYPES: { type: BlockType; name: string; label: string }[] = [
  { type: "dims", name: "Dimensions", label: "Main sizes" },
  { type: "choice", name: "Pick from a list", label: "Material" },
  { type: "quantity", name: "Quantity", label: "Quantity" },
  { type: "date", name: "Date needed by", label: "Date needed by" },
  { type: "text", name: "Short text", label: "Your question" },
  { type: "longtext", name: "Long text", label: "Notes" },
  { type: "yesno", name: "Yes or no", label: "Do you need material certificates?" },
  { type: "drawing", name: "Drawing reminder", label: "Drawing" },
];
export const typeName = (t: BlockType) => TYPES.find((x) => x.type === t)?.name ?? t;

export const LIMITS = { subject: 150, mailBody: 2000, replyDays: [1, 20], followDays: [1, 28], label: 120, help: 300, option: 120, options: 60, fields: 8, blocks: 60, name: 120, title: 120, intro: 400, logoBytes: 400_000 };

export const DEFAULT_SHOP: Shop = {
  name: "",
  email: "",
  title: "Request a quote",
  intro: "Tell us about the part and we’ll come back to you with a price.",
  logo: "",
  accent: "",
  credit: true,
};

const b = (id: string, type: BlockType, label: string, extra: Partial<Block> = {}): Block => ({ id, type, label, help: "", required: false, ...extra });

export const DEFAULT_BLOCKS: Block[] = [
  b("name", "text", "Your name", { required: true, format: "text" }),
  b("company", "text", "Company", { format: "text" }),
  b("email", "text", "Email", { required: true, format: "email" }),
  b("phone", "text", "Phone", { format: "tel" }),
  b("part", "text", "Part name or number", { required: true, format: "text", subject: true }),
  b("qty", "quantity", "Quantity", { required: true, help: "If you want prices for more than one quantity, put the others in the notes." }),
  b("material", "choice", "Material", { options: ["Aluminium 6082", "Aluminium 7075", "Stainless steel 303", "Stainless steel 316", "Mild steel EN3B", "Brass CZ121", "Acetal", "Other, see notes"], multiple: false }),
  b("processes", "choice", "Processes", { help: "Tick all that apply.", options: ["CNC turning", "CNC milling", "5 axis milling", "Sliding head turning", "Grinding", "Wire EDM", "Assembly"], multiple: true }),
  b("finish", "choice", "Finish", { options: ["As machined", "Anodise clear", "Anodise black", "Hard anodise", "Zinc plate", "Passivate", "Powder coat", "Not sure yet"], multiple: false }),
  b("sizes", "dims", "Main sizes", { help: "Rough overall sizes. The drawing has the detail.", fields: ["Length", "Diameter or width", "Height"], unit: "mm" }),
  b("date", "date", "Date needed by"),
  b("notes", "longtext", "Anything else", { help: "Tolerances, certificates, repeat orders, anything we should know." }),
  b("drawing", "drawing", "Drawing", { help: "Attach your drawing to the email before you send it. PDF, STEP or DXF is best." }),
];

export const DEFAULT_REPLIES: Replies = {
  platform: "outlook",
  replyDays: 3,
  thanksSubject: "Thanks, we've got your request for {part}",
  thanksBody: "Hi {name},\n\nThanks for your quote request for {part}. It's with us now.\n\nWe usually reply within {reply_days}. If you haven't sent the drawing yet, just reply to this email with it attached.\n\n{shop}",
  follow: true,
  followDays: 5,
  followMode: "auto",
  chaseSubject: "Just checking you got our quote for {part}",
  chaseBody: "Hi {name},\n\nJust checking you got our quote for {part}. Happy to answer any questions or price a different quantity.\n\n{shop}",
};

export const DEFAULT_SETUP: Setup = { shop: DEFAULT_SHOP, blocks: DEFAULT_BLOCKS, replies: DEFAULT_REPLIES };

let seq = 0;
export function newId(taken: Set<string>): string {
  let id = "";
  do { seq += 1; id = `b${Date.now().toString(36).slice(-4)}${seq.toString(36)}`; } while (taken.has(id));
  return id;
}

export function newBlock(type: BlockType, taken: Set<string>): Block {
  const t = TYPES.find((x) => x.type === type)!;
  const base = b(newId(taken), type, t.label);
  if (type === "text") return { ...base, format: "text" };
  if (type === "choice") return { ...base, options: ["First option", "Second option"], multiple: false };
  if (type === "dims") return { ...base, fields: ["Length", "Diameter"], unit: "mm" };
  if (type === "drawing") return { ...base, help: "Attach your drawing to the email before you send it." };
  return base;
}

// ---------------------------------------------------------------- reading a setup back

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max) : "");
const BLOCK_TYPES: BlockType[] = ["text", "longtext", "quantity", "date", "yesno", "choice", "dims", "drawing"];

export const EMAIL_RE = /^[^\s@<>()[\]\\,;:"']+@[^\s@<>()[\]\\,;:"']+\.[^\s@<>()[\]\\,;:"']+$/;
export const isEmail = (s: string) => s.length <= 254 && EMAIL_RE.test(s);
export const cleanAccent = (v: unknown) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim().toLowerCase() : "");
export const cleanLogo = (v: unknown) => (typeof v === "string" && v.length <= LIMITS.logoBytes * 1.4 && /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+=*$/.test(v) ? v : "");

export function readShop(v: unknown): Shop {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const email = str(o.email, 254);
  return {
    name: str(o.name, LIMITS.name),
    email,
    title: str(o.title, LIMITS.title) || DEFAULT_SHOP.title,
    intro: str(o.intro, LIMITS.intro),
    logo: cleanLogo(o.logo),
    accent: cleanAccent(o.accent),
    credit: o.credit !== false,
  };
}

export function readBlock(v: unknown, taken: Set<string>): Block | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const type = BLOCK_TYPES.find((t) => t === o.type);
  if (!type) return null;
  const rawId = typeof o.id === "string" && /^[a-z][a-z0-9]{0,15}$/.test(o.id) ? o.id : "";
  const id = rawId && !taken.has(rawId) ? rawId : newId(taken);
  taken.add(id);
  const out: Block = { id, type, label: str(o.label, LIMITS.label) || typeName(type), help: str(o.help, LIMITS.help), required: o.required === true };
  if (type === "text") {
    out.format = o.format === "email" || o.format === "tel" ? o.format : "text";
    if (o.subject === true) out.subject = true;
  }
  if (type === "choice") {
    const opts = Array.isArray(o.options) ? o.options.map((x) => str(x, LIMITS.option)).filter(Boolean).slice(0, LIMITS.options) : [];
    out.options = opts.length ? opts : ["First option"];
    out.multiple = o.multiple === true;
  }
  if (type === "dims") {
    const f = Array.isArray(o.fields) ? o.fields.map((x) => str(x, LIMITS.label)).filter(Boolean).slice(0, LIMITS.fields) : [];
    out.fields = f.length ? f : ["Length"];
    out.unit = o.unit === "in" ? "in" : "mm";
  }
  return out;
}

// Keeps line breaks (an email body), drops control characters, at most one blank line in a row.
export const textBlock = (v: unknown, max: number) => (typeof v === "string"
  ? v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max)
  : "");
const int = (v: unknown, [lo, hi]: number[], d: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : d);

// Setups saved before automatic replies existed have no replies: they get the defaults.
export function readReplies(v: unknown): Replies {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const d = DEFAULT_REPLIES;
  const has = (k: string) => typeof o[k] === "string";
  return {
    platform: o.platform === "gmail" || o.platform === "other" ? o.platform : "outlook",
    replyDays: int(o.replyDays, LIMITS.replyDays, d.replyDays),
    thanksSubject: has("thanksSubject") ? str(o.thanksSubject, LIMITS.subject) : d.thanksSubject,
    thanksBody: has("thanksBody") ? textBlock(o.thanksBody, LIMITS.mailBody) : d.thanksBody,
    follow: o.follow === undefined ? d.follow : o.follow === true,
    followDays: int(o.followDays, LIMITS.followDays, d.followDays),
    followMode: o.followMode === "remind" ? "remind" : "auto",
    chaseSubject: has("chaseSubject") ? str(o.chaseSubject, LIMITS.subject) : d.chaseSubject,
    chaseBody: has("chaseBody") ? textBlock(o.chaseBody, LIMITS.mailBody) : d.chaseBody,
  };
}

export function readSetup(v: unknown): Setup | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.blocks)) return null;
  const taken = new Set<string>();
  const blocks = o.blocks.slice(0, LIMITS.blocks).map((x) => readBlock(x, taken)).filter((x): x is Block => !!x);
  // Only one block names the part in the subject.
  let seen = false;
  for (const bl of blocks) if (bl.subject) { if (seen) delete bl.subject; seen = true; }
  return { shop: readShop(o.shop), blocks, replies: readReplies(o.replies) };
}

export const SETUP_KIND = "webflow-outreach-quote-form";
export const setupFile = (s: Setup) => JSON.stringify({ kind: SETUP_KIND, version: 2, ...s }, null, 2);

export function slug(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
