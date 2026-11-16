// One place for facts that appear on several pages. Legal company facts live in company.ts.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://webflowoutreach.com").replace(/\/$/, "");
export const EMAIL = "sam@webflowoutreach.com";
// Optional booking link. Only an https URL is accepted; anything else is ignored.
function httpsUrl(v: string | undefined): string {
  try {
    const u = new URL((v || "").trim());
    return u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}
export const BOOKING_URL = httpsUrl(process.env.NEXT_PUBLIC_BOOKING_URL);

export const NAV = [
  { href: "/examples", label: "Examples" },
  { href: "/sprint", label: "The sprint" },
  { href: "/method", label: "Method" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Hard questions" },
  { href: "/about", label: "About" },
];

export const LABEL = "AI engineers who work inside your business";
export const EXPLAINER = "Like having your own engineering team on call, without hiring one.";
export const DESCRIPTION =
  "We work inside UK firms of up to 250 people, find the work that still runs by hand, and build the system that does it. Sprint £3,500. First build from £12,000. You own the code.";

// The intro call form. The answers below are added to the message text, because the enquiry route accepts a fixed set of keys.
export const STAFF_BANDS = ["Under 30", "30 to 99", "100 to 250", "Over 250"];

// Shown under the form button and stored with the enquiry as proof of what the person saw.
export const CONSENT_TEXT =
  "We use these details to arrange and prepare for your intro call. Before the call we look at information your company has published: Companies House, your website and your public email settings. We do not enter anything into your site. Privacy notice: /privacy";
export const MARKETING_TEXT =
  "Send me occasional emails about how firms like mine take work off their people. I can unsubscribe at any time.";

// The honeypot field. Hidden from people, tempting to bots. Must never match a real field name.
export const HONEYPOT = "hp_fax_x9k2";
