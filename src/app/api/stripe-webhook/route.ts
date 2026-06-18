import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import type Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata!;

    // Retrieve PaymentIntent to get the saved payment method
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

    const clientSlug = slugify(meta.client_name);
    const clientDir = path.join(process.cwd(), "..", "webforge", "clients", clientSlug);
    fs.mkdirSync(clientDir, { recursive: true });

    // Write status.json for this client
    const status = {
      name: meta.client_name,
      email: meta.client_email,
      package: meta.package,
      deposit_amount: Number(meta.total_amount) / 2,
      total_agreed: Number(meta.total_amount),
      balance_due: Number(meta.balance_due),
      stripe_customer_id: session.customer as string | null,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_payment_method_id: paymentIntent.payment_method as string | null,
      deposit_paid: true,
      deposit_paid_at: new Date().toISOString(),
      balance_charged: false,
      balance_charged_at: null,
      stage: "intake",
    };

    fs.writeFileSync(
      path.join(clientDir, "status.json"),
      JSON.stringify(status, null, 2)
    );

    // Send welcome email to client
    await resend.emails.send({
      from: `WebForge <${process.env.CONTACT_EMAIL}>`,
      to: meta.client_email,
      subject: "Your build starts here.",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; color: #1a1a1a;">
          <p>Hi ${meta.client_name},</p>

          <p>Deposit received. We're good to go.</p>

          <p>Over the next few days I'll send you 3-4 short emails with questions about your business.
          They're not what you'd normally expect from a web agency - no briefs, no dropdowns.
          Just a conversation that helps us understand what makes you different.</p>

          <p>We recommend going set by set - it gives us a chance to ask for clarification
          and build the vision together properly. That said, if you'd prefer all the questions
          in one go, just reply and say so and I'll send them all across.</p>

          <p>First set coming shortly.</p>

          <p style="color: #666; font-size: 14px;">
            Receipt: £${Number(meta.total_amount) / 2} deposit paid for ${meta.package} package.<br/>
            Remaining balance (£${meta.balance_due}) is charged automatically once your site is approved.
          </p>

          <p>— WebForge</p>
        </div>
      `,
    });

    // Notify Sam
    await resend.emails.send({
      from: `WebForge <${process.env.CONTACT_EMAIL}>`,
      to: process.env.CONTACT_EMAIL!,
      subject: `New client: ${meta.client_name} (${meta.package})`,
      html: `
        <p><strong>New deposit received.</strong></p>
        <ul>
          <li>Name: ${meta.client_name}</li>
          <li>Email: ${meta.client_email}</li>
          <li>Package: ${meta.package}</li>
          <li>Deposit: £${Number(meta.total_amount) / 2}</li>
          <li>Balance due: £${meta.balance_due}</li>
        </ul>
        <p>Client directory created: clients/${clientSlug}/</p>
      `,
    });
  }

  return NextResponse.json({ received: true });
}
