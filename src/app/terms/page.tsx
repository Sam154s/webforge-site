import type { Metadata } from "next";
import Link from "next/link";
import { EMAIL } from "@/lib/site";
import { Co, LegalPage, Ph } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms (draft)",
  description: "Terms for the intro call, the Diagnosis, the Solution and Upkeep from Webflow Outreach.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function Terms() {
  return (
    <LegalPage title="Terms" updated="16 November 2026">
      <p>These terms cover the free intro call, the Diagnosis (a fixed-price piece of work), the Solution and Upkeep. Any later build is agreed in a separate written order that refers to these terms.</p>

      <h2>Who we are</h2>
      <p>We are <Co />. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>

      <h2>The intro call</h2>
      <ul>
        <li>It is free, with no obligation. It is a 30 minute call for UK limited companies with up to about 250 people.</li>
        <li>It is a conversation, not a report and not advice.</li>
      </ul>

      <h2>The Diagnosis</h2>
      <ul>
        <li>The price is £3,500, fixed, and paid on booking. Prices exclude VAT <Ph>CONFIRM VAT STATUS</Ph>.</li>
        <li>If you sign a build with us within 30 days, the Diagnosis fee is credited in full against the price of that build.</li>
        <li>You get a ranked list of problems with a pound range and a payback on each, one thing working on your real data, and a fixed quote for a first build.</li>
        <li>The report is an estimate based on what we saw and what you shared, at the date it is made. Every figure is a range, not a promise. It is not financial, tax, legal or HR advice.</li>
        <li>We agree in writing, before we start, what we may see and where any data is processed. You must have the right to share what you give us, and you should not send passwords, bank logins or special category data.</li>
      </ul>

      <h2>The first build</h2>
      <ul>
        <li>We agree the scope, a written pass test and a fixed price in writing before we start. Prices start at £12,000 and exclude VAT <Ph>CONFIRM VAT STATUS</Ph>.</li>
        <li>You pay half on signature and half when the build passes the written pass test. We keep working until it passes.</li>
        <li><strong>Ten-run test.</strong> Before release we run each workflow ten times against examples you supply, including an empty input and a bad input. Every run must give the identical result, or stop safely.</li>
        <li>An independent senior engineer reviews each build before it goes live. Their fee is inside the fixed price.</li>
        <li>We tell you plainly if something should not be built or will not pay back, and we decline it. We do not build systems that make clinical decisions, take payments from the public, or are safety-critical.</li>
        <li>What we deliver is yours, and it runs on your own accounts. Ownership of the code and any third-party components: <Ph>CONFIRM IP WORDING</Ph>.</li>
        <li>Running costs for hosting and AI usage, where they exist, are on your own accounts, at cost, and agreed up front.</li>
      </ul>

      <h2>Upkeep</h2>
      <ul>
        <li>From £750 a month per system, paid monthly. We watch the system, fix it, and make small changes.</li>
        <li>Either of us can end it with 30 days&apos; notice. The details are in the written order.</li>
        <li>Running costs for hosting and AI usage are at cost, on your own accounts.</li>
      </ul>

      <h2>Our responsibility</h2>
      <p>We take reasonable care and use reasonable skill. We do not guarantee any saving, revenue or time. Nothing in these terms limits liability that the law does not allow us to limit, including for death or personal injury caused by negligence, or for fraud. Our other liability limit: <Ph>SOLICITOR TO CONFIRM CAP AND WORDING</Ph>. Insurance: <Ph>ADD ONLY WHEN BOUND</Ph>.</p>

      <h2>This website</h2>
      <p>Use it lawfully. The content is provided as information, not advice. We may change it at any time.</p>

      <h2>Data</h2>
      <p>How we handle personal data is in the <Link href="/privacy">privacy notice</Link>. Where we handle your customers&apos; personal data for you in later work, we will agree a data processing agreement first <Ph>CONFIRM</Ph>.</p>

      <h2>Law</h2>
      <p>These terms are governed by the law of <Ph>England and Wales, CONFIRM</Ph>, and its courts have jurisdiction.</p>
    </LegalPage>
  );
}
