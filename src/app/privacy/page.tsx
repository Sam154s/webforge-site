import type { Metadata } from "next";
import { EMAIL } from "@/lib/site";
import { COMPANY } from "@/lib/company";
import { Co, LegalPage, Ph } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy notice (draft)",
  description: "How Webflow Outreach uses personal data: what we collect, why, how long we keep it, who processes it, and your rights.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy notice" updated="9 November 2026">
      <p>This notice explains how we use personal data. It covers people who use this website or ask for a diagnostic (UK GDPR Article 13), and people at companies we contact who did not give us their details first (Article 14). It is written to be read, not skimmed past.</p>

      <h2>Who we are</h2>
      <p>The controller is <Co />, trading as {COMPANY.tradingAs}. ICO registration: {COMPANY.ico ? <Ph>{COMPANY.ico}</Ph> : "being confirmed"}. Contact for anything in this notice: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We have not appointed a data protection officer <Ph>CONFIRM</Ph>.</p>

      <h2>What we collect, and where from</h2>
      <p><strong>From you, on the diagnostic form:</strong> name, work email, phone (optional), company name, website, company number (optional), the systems you use, anything you tell us about your week, whether you ticked the optional marketing box, the exact consent wording you saw and when you submitted, and which page and campaign brought you here.</p>
      <p><strong>From public sources, before the call:</strong> your company&apos;s record on Companies House (including directors named there), your public website, your public email settings (DNS records) and public page-speed test results. We read these only. We do not log in to anything or enter anything into your site.</p>
      <p><strong>From you, during the diagnostic:</strong> what you say on the call, and any export you choose to send, such as an aged debtors list. Exports may contain your customers&apos; names. Please send only what we ask for, and never passwords, bank logins or special category data.</p>
      <p><strong>From this website:</strong> aggregate visit and click counts through Vercel Web Analytics. It sets no cookies and does not follow you across other sites.</p>

      <h2>Why we use it, and our legal basis</h2>
      <ul>
        <li><strong>To prepare for and run your diagnostic and send your report.</strong> Taking steps at your request before a contract (Article 6(1)(b)).</li>
        <li><strong>To read public information about your company before the call.</strong> Our legitimate interest in preparing properly for a business conversation you asked for (Article 6(1)(f)). A written assessment is available on request <Ph>CONFIRM LIA DONE</Ph>.</li>
        <li><strong>To contact companies we think could use the diagnostic.</strong> Our legitimate interest in B2B marketing (Article 6(1)(f)). See &ldquo;If we contacted you first&rdquo; below.</li>
        <li><strong>To send you occasional emails about automation.</strong> Only if you ticked the separate box. Your consent (Article 6(1)(a)). You can withdraw it at any time.</li>
        <li><strong>To keep records, accounts and defend legal claims.</strong> Legal obligation and legitimate interest (Article 6(1)(c) and (f)).</li>
        <li><strong>To understand which pages work.</strong> Legitimate interest, using cookieless analytics (Article 6(1)(f)).</li>
      </ul>

      <h2>If we contacted you first (Article 14)</h2>
      <p>We may email people at UK limited companies and LLPs. Where we do:</p>
      <ul>
        <li>We got your business email address and your name or role from Companies House, your company&apos;s own website, or a business directory <Ph>CONFIRM SOURCES USED</Ph>.</li>
        <li>We use it only to offer the free diagnostic. We send to corporate subscribers only, and we screen out sole traders and ordinary partnerships.</li>
        <li>Every email says who we are and has a working opt-out. If you opt out, or tell us, we add your address to a suppression list and do not contact you again. We must keep that address to remember not to contact you.</li>
        <li>You can object to this use of your data at any time by replying &ldquo;no&rdquo; or emailing <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>Enquiries that go no further: <Ph>12 months, CONFIRM</Ph> from the last contact, then deleted.</li>
        <li>Exports and files you send: deleted <Ph>90 days, CONFIRM</Ph> after your report is delivered, unless you ask us to keep them for a fix.</li>
        <li>Clients: contract, invoice and report records for <Ph>6 years, CONFIRM</Ph> after the work ends.</li>
        <li>Marketing consent: until you withdraw it. Suppression list: kept for as long as needed to honour your opt-out.</li>
        <li>Analytics: aggregate only, no personal profile.</li>
      </ul>

      <h2>Who processes it for us</h2>
      <p>We use these services to run the site and the diagnostic. Each handles personal data only on our instructions.</p>
      <ul>
        <li><strong>Supabase</strong>: our database for enquiries and reports. Region: <Ph>CONFIRM REGION</Ph>.</li>
        <li><strong>Vercel</strong>: website hosting and cookieless analytics.</li>
        <li><strong>Resend</strong>: sending notification and transactional email.</li>
        <li><strong>Google</strong>: Workspace email, calendar and documents.</li>
        <li><strong>Anthropic</strong>: AI used to write plain-English wording in reports. Numbers and rankings are calculated by our own code. We send the minimum text needed and do not send exports or customer names <Ph>CONFIRM</Ph>.</li>
      </ul>
      <p>We do not sell personal data.</p>

      <h2>Transfers outside the UK</h2>
      <p>Some of these providers process data in the United States or elsewhere. Where they do, we rely on the UK&apos;s adequacy arrangements or the UK International Data Transfer Agreement or Addendum <Ph>CONFIRM SAFEGUARD PER PROVIDER</Ph>.</p>

      <h2>Automated decisions</h2>
      <p>Our software calculates the ranking in your report, and a person reviews the report before you see it. We do not make decisions about you that have legal or similarly significant effects by automated means.</p>

      <h2>Your rights</h2>
      <p>You can ask to see your data, correct it, delete it, restrict its use, receive a copy, or object to how we use it. You can withdraw consent at any time. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will reply within one month. You can also complain to the Information Commissioner&apos;s Office at <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk</a> or on 0303 123 1113.</p>

      <h2>Changes</h2>
      <p>If we change this notice in a way that matters, we will update the date at the top and, where we hold your email, tell you.</p>
    </LegalPage>
  );
}
