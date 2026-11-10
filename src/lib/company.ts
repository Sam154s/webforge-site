// Legal facts about the company. Every value comes from an env var and is empty until set,
// so nothing is ever shown to a visitor unless it is real. Set these in the host's environment.
const env = (v: string | undefined) => (v || "").trim();

export const COMPANY = {
  name: env(process.env.NEXT_PUBLIC_COMPANY_NAME),
  tradingAs: "Webflow Outreach",
  number: env(process.env.NEXT_PUBLIC_COMPANY_NUMBER),
  registeredIn: env(process.env.NEXT_PUBLIC_COMPANY_REGISTERED_IN),
  address: env(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),
  vat: env(process.env.NEXT_PUBLIC_COMPANY_VAT),
  ico: env(process.env.NEXT_PUBLIC_COMPANY_ICO),
};

// Whichever of name, number, place and office are set, as one phrase. Empty string when none are.
export function companyLine(c: typeof COMPANY): string {
  return [
    c.name,
    c.number && `company number ${c.number}`,
    c.registeredIn && `registered in ${c.registeredIn}`,
    c.address && `registered office ${c.address}`,
  ].filter(Boolean).join(", ");
}
