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
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export const LABEL = "We\u2019re forward deployed engineers.";
export const DESCRIPTION = "We go into your company, find what\u2019s holding it back, and engineer the solution.";

// The social preview image (the file-based route in app/opengraph-image.tsx). A page that sets its own openGraph or twitter
// object replaces the root one, so every public page spreads social() to keep the image.
const ogImage = { url: "/opengraph-image", width: 1200, height: 630, alt: `Webflow Outreach: ${LABEL}` };
export function social(title: string, url: string, description?: string) {
  return {
    openGraph: { title, url, ...(description && { description }), images: [ogImage] },
    twitter: { card: "summary_large_image" as const, title, ...(description && { description }), images: [{ url: ogImage.url, alt: ogImage.alt }] },
  };
}

// The intro call form. The answers below are added to the message text, because the enquiry route accepts a fixed set of keys.
export const STAFF_BANDS = ["Under 30", "30 to 99", "100 to 250", "Over 250"];

// Shown under the form button and stored with the enquiry as proof of what the person saw.
export const CONSENT_TEXT =
  "We use these details to arrange and prepare for your intro call. Before the call we look at information your company has published: Companies House, your website and your public email settings. We do not enter anything into your site. Privacy notice: /privacy";
export const MARKETING_TEXT =
  "Send occasional emails about how firms like yours take work off their people. You can unsubscribe at any time.";

// The honeypot field. Hidden from people, tempting to bots. Must never match a real field name.
export const HONEYPOT = "hp_fax_x9k2";
