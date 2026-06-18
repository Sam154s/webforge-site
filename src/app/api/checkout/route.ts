import { NextRequest, NextResponse } from "next/server";
import { stripe, PACKAGES, type PackageKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { package: pkg, email, name } = await req.json() as {
    package: PackageKey;
    email: string;
    name: string;
  };

  const tier = PACKAGES[pkg];
  if (!tier) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    // Save card for the automatic balance charge later
    payment_intent_data: {
      setup_future_usage: "off_session",
      metadata: { client_name: name, package: pkg },
    },
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: tier.deposit * 100, // pence
          product_data: {
            name: `WebForge ${tier.name} — 50% Deposit`,
            description: `Deposit for your ${tier.name} website build. The remaining £${tier.deposit} is charged automatically once your site is approved.`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      client_name: name,
      client_email: email,
      package: pkg,
      total_amount: tier.price,
      balance_due: tier.deposit,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?package=${pkg}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/packages`,
  });

  return NextResponse.json({ url: session.url });
}
