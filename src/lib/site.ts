// One place for facts that appear on several pages. Anything in [SQUARE BRACKETS] is a legal fact Sam must supply.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://webflowoutreach.com").replace(/\/$/, "");
export const EMAIL = "sam@webflowoutreach.com";
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "";

export const COMPANY = {
  name: "[COMPANY NAME]",
  tradingAs: "Webflow Outreach",
  number: "[COMPANY NUMBER]",
  office: "[REGISTERED OFFICE ADDRESS]",
  place: "[PLACE OF REGISTRATION, e.g. England and Wales]",
  vat: "[VAT NUMBER, if registered]",
  ico: "[ICO REGISTRATION NUMBER]",
  director: "[RESPONSIBLE PERSON NAME]",
};

export const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/sample-report", label: "Sample report" },
  { href: "/method", label: "Method" },
  { href: "/#pricing", label: "Pricing" },
];

export const SYSTEMS = [
  "Xero", "QuickBooks", "Sage", "FreeAgent", "Microsoft 365", "Google Workspace",
  "HubSpot", "A job or CRM system", "Mostly spreadsheets",
];

// Shown under the form button and stored with the enquiry as proof of what the person saw.
export const CONSENT_TEXT =
  "We use these details to prepare for and run your diagnostic call and to send your report. Before the call we look at information your company has published: Companies House, your website and your public email settings. We do not enter anything into your site. Privacy notice: /privacy";
export const MARKETING_TEXT =
  "Send me occasional emails about how businesses like mine use automation. I can unsubscribe at any time.";
