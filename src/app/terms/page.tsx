import type { Metadata } from "next";
import Link from "next/link";
import { EMAIL } from "@/lib/site";
import { Co, LegalPage, Ph } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms (draft)",
  description: "Terms for the free diagnostic and the Fix this service from Webflow Outreach.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function Terms() {
  return (
    <LegalPage title="Terms" updated="9 November 2026">
      <p>These terms cover the free diagnostic and the &ldquo;Fix this&rdquo; service. Larger work, such as the builder, extra workflows, support and websites, is agreed in a separate written order that refers to these terms.</p>

      <h2>Who we are</h2>
      <p><Co />, trading as Webflow Outreach. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>

      <h2>The free diagnostic</h2>
      <ul>
        <li>It is free, with no obligation. It is a 30 minute call and a report, for UK limited companies with 5 to 50 staff.</li>
        <li>We need one export from your accounts or job system. If we do not receive it, we cannot produce a report, because we will not guess your numbers.</li>
        <li>The report is an estimate based on what you told us and what you shared, at the date it is made. Every figure is a range, not a promise. It is not financial, tax, legal or HR advice. See the <Link href="/sample-report">sample report</Link> for the full wording.</li>
        <li>You must have the right to share the information you give us, and you should not send passwords, bank logins or special category data.</li>
        <li>You may keep and use the report whether or not you buy anything.</li>
      </ul>

      <h2>Fix this</h2>
      <ul>
        <li>You pick one item from your report. We agree the scope, the finish line and a fixed price in writing before we start. The price is £750 to £1,000, depending on the size of the job. Prices exclude VAT <Ph>CONFIRM VAT STATUS</Ph>.</li>
        <li>Work starts when you sign the order. Payment terms: <Ph>CONFIRM, e.g. invoice on pass, 14 days</Ph>.</li>
        <li><strong>Ten-run test.</strong> Before the fix goes live we run it ten times against examples you supply, including an empty input and a bad input. Every run must give the identical result, or stop safely. If the fix fails its tests and we cannot bring it to a pass, you owe nothing for it.</li>
        <li>We tell you plainly if a job should not be automated or will not pay back, and we decline it.</li>
        <li>What we deliver is yours to keep and use. Ownership of the code and any third-party components: <Ph>CONFIRM IP WORDING</Ph>.</li>
        <li>Running costs for hosting and AI usage, where they exist, are on your own accounts and agreed up front.</li>
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
