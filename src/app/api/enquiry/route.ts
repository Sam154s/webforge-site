import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Enquiries go to the ops database (shows in Sales and "Needs you") and, if Resend is set up, to the inbox.
// The ops RPC validates and rate-limits, so this route holds no database secret: the key is the public one.
const OPS_URL = process.env.OPS_SUPABASE_URL ?? "https://qqqdjtjqizawgkzznxvm.supabase.co";
const OPS_KEY = process.env.OPS_SUPABASE_KEY ?? "sb_publishable_f0kovNXdeLq1qZziijFi8g_YemeRMi5";
const NOTIFY = process.env.CONTACT_EMAIL && !process.env.CONTACT_EMAIL.endsWith("webforge.build")
  ? process.env.CONTACT_EMAIL : "sam@webflowoutreach.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string | undefined>;
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: bots fill hidden fields
  const name = b.name?.trim() ?? "", email = b.email?.trim() ?? "", business = b.business?.trim() ?? "", message = b.message?.trim() ?? "";
  if (!name || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Add your name and a valid email." }, { status: 400 });

  const res = await fetch(`${OPS_URL}/rest/v1/rpc/submit_enquiry`, {
    method: "POST",
    headers: { apikey: OPS_KEY, Authorization: `Bearer ${OPS_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ p_name: name, p_email: email, p_business: business, p_message: message }),
  });
  if (!res.ok) {
    const limited = (await res.text()).includes("rate limited");
    return NextResponse.json({ error: limited ? "We've already got your message. We'll be in touch." : "Something went wrong. Email us instead." }, { status: limited ? 429 : 502 });
  }

  if (process.env.RESEND_API_KEY) {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "WebForge <onboarding@resend.dev>",
      to: NOTIFY,
      replyTo: email,
      subject: `New enquiry: ${business || name}`,
      html: `<p><strong>${esc(name)}</strong> (${esc(email)})${business ? `, ${esc(business)}` : ""}</p><p>${esc(message || "No message").replace(/\n/g, "<br>")}</p>`,
    }).catch((e) => console.error("Resend failed", e));
  }
  return NextResponse.json({ ok: true });
}
