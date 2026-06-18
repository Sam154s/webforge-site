import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { PACKAGES, type PackageKey } from "@/lib/packages";

const resend = new Resend(process.env.RESEND_API_KEY);

const VALID_PACKAGES: PackageKey[] = ["landing", "standard", "premium"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    package?: string;
    name?: string;
    email?: string;
    business?: string;
    details?: string;
  };

  const { package: pkg, name, email, business, details } = body;

  if (!pkg || !name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!VALID_PACKAGES.includes(pkg as PackageKey)) {
    return NextResponse.json({ error: "Invalid package." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const packageInfo = PACKAGES[pkg as PackageKey];

  const { error } = await resend.emails.send({
    from: "WebForge <onboarding@resend.dev>",
    to: "sam@webflowoutreach.com",
    replyTo: email.trim(),
    subject: `New build enquiry — ${packageInfo.name} (£${packageInfo.price.toLocaleString()})`,
    html: `
      <h2>New Build Enquiry</h2>
      <p><strong>Package:</strong> ${esc(packageInfo.name)} — £${packageInfo.price.toLocaleString()} (£${packageInfo.deposit.toLocaleString()} deposit)</p>
      <p><strong>Name:</strong> ${esc(name.trim())}</p>
      <p><strong>Email:</strong> ${esc(email.trim())}</p>
      <p><strong>Business:</strong> ${esc(business?.trim() || "—")}</p>
      <p><strong>Project details:</strong></p>
      <p>${esc(details?.trim() || "—").replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
