import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { EMAIL, HONEYPOT } from "@/lib/site";
import { opsConfig, validToken } from "@/lib/outreach";

// Enquiries go to the ops database (shows in Sales and "Needs you") and, if Resend is set up, to the inbox.
// The ops RPC validates and rate-limits, so this route holds no database secret: the key is the public one.
// It keeps only an allowlist of detail keys (submit_enquiry in the ops migrations), so the names below must match it exactly.
const NOTIFY = process.env.CONTACT_EMAIL && !process.env.CONTACT_EMAIL.endsWith("webforge.build")
  ? process.env.CONTACT_EMAIL : "sam@webflowoutreach.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function cleanWebsite(raw: string) {
  if (!raw) return "";
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try { const u = new URL(url); return u.hostname.includes(".") ? u.toString() : ""; } catch { return ""; }
}

const UTM = ["utm_source", "utm_medium", "utm_campaign"] as const;

async function rpc(ops: { url: string; key: string }, body: Record<string, unknown>) {
  // A network failure reads as a failed response, so the visitor still gets the plain "email us" message.
  return fetch(`${ops.url}/rest/v1/rpc/submit_enquiry`, {
    method: "POST",
    headers: { apikey: ops.key, Authorization: `Bearer ${ops.key}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch((e) => { console.error("[enquiry] ops database unreachable", e); return new Response("unreachable", { status: 502 }); });
}

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b[HONEYPOT]) return NextResponse.json({ ok: true }); // bots fill hidden fields
  if (typeof b._t === "number" && b._t < 1500) return NextResponse.json({ ok: true }); // submitted faster than a person can type

  const name = str(b.name, 200), email = str(b.email, 254), phone = str(b.phone, 40);
  const company = str(b.company_name, 200), website = cleanWebsite(str(b.website, 300));
  const companyNumber = str(b.company_number, 12).toUpperCase().replace(/\s/g, "");
  const message = str(b.message, 4000);
  const systems = (Array.isArray(b.systems) ? b.systems : []).map((s) => str(s, 60)).filter(Boolean).slice(0, 20);
  const consentText = str(b.consent_text, 1500);
  const marketing = b.marketing_opt_in === true;

  if (!name || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Add your name and a valid email." }, { status: 400 });
  if (!company) return NextResponse.json({ error: "Add your company name." }, { status: 400 });
  if (!website) return NextResponse.json({ error: "Add your website, for example yourcompany.co.uk." }, { status: 400 });
  if (companyNumber && !/^[A-Z0-9]{6,8}$/.test(companyNumber)) return NextResponse.json({ error: "A company number is 8 characters, like 01234567. Leave it blank if you are not sure." }, { status: 400 });

  // Not set up (a dev run or a preview without the ops variables): say so plainly and save nothing anywhere.
  const ops = opsConfig();
  if (!ops) {
    console.error("[enquiry] Not saved: OPS_SUPABASE_URL or OPS_SUPABASE_KEY is not set.");
    return NextResponse.json({ error: `The form is not working right now. Please email us at ${EMAIL}.` }, { status: 503 });
  }

  // Key names match the database allowlist. Empty values are left out rather than sent blank.
  const utm = (typeof b.utm === "object" && b.utm ? b.utm : {}) as Record<string, unknown>;
  const details: Record<string, unknown> = {
    company_name: company, website, consent_text: consentText, consent_at: new Date().toISOString(),
    marketing_opt_in: marketing, source: str(b.source, 80) || "diagnostic",
  };
  if (companyNumber) details.company_number = companyNumber;
  if (phone) details.phone = phone;
  if (systems.length) details.systems = systems;
  if (validToken(b.c_token)) details.c_token = b.c_token;
  for (const k of UTM) { const v = str(utm[k], 120); if (v) details[k] = v; }

  let res = await rpc(ops, { p_name: name, p_email: email, p_business: company, p_message: message, p_details: details });
  if (!res.ok) {
    const text = await res.text();
    if (text.includes("rate limited")) return NextResponse.json({ error: "We've already got your message. We'll be in touch." }, { status: 429 });
    // Until the ops database has the p_details argument, send the old four and put the details in the message.
    const appended = `${message}\n\n--- details ---\n${JSON.stringify(details, null, 2)}`.trim();
    res = await rpc(ops, { p_name: name, p_email: email, p_business: company, p_message: appended });
    if (!res.ok) {
      const limited = (await res.text()).includes("rate limited");
      return NextResponse.json({ error: limited ? "We've already got your message. We'll be in touch." : "Something went wrong. Email us instead." }, { status: limited ? 429 : 502 });
    }
  }

  if (process.env.RESEND_API_KEY) {
    const rows = [
      ["Company", company], ["Website", website], ["Company number", companyNumber || "not given"], ["Phone", phone || "not given"],
      ["Systems", systems.join(", ") || "none ticked"], ["Marketing emails", marketing ? "yes" : "no"], ["Source", details.source],
    ];
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Webflow Outreach <onboarding@resend.dev>",
      to: NOTIFY,
      replyTo: email,
      subject: `Intro call request: ${company}`,
      html: `<p><strong>${esc(name)}</strong> (${esc(email)})</p><table>${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${esc(String(v))}</td></tr>`).join("")}</table><p>${esc(message || "No message").replace(/\n/g, "<br>")}</p>`,
    }).catch((e) => console.error("Resend failed", e));
  }
  return NextResponse.json({ ok: true });
}
