import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Finale, Hero } from "@/components/page-kit";
import { COMPANY } from "@/lib/company";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About: a hospital doctor who builds software",
  description: "Webflow Outreach is a small UK firm of AI engineers who work inside your business. Founded by a practising hospital doctor who builds clinical software.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About | Webflow Outreach", url: "/about" },
};

const BELIEFS = [
  ["See the problem before you propose the fix.", "We watch the work first. A workshop tells you what people think happens."],
  ["Boring code beats clever AI, wherever it can.", "If a rule will do, we write a rule."],
  ["A person near the work.", "Checking what matters, not watching every step."],
  ["If you cannot test it, you cannot ship it.", "And what ships is yours."],
];
const NOT = ["A chatbot agency.", "A consultancy that leaves a slide deck.", "A licence reseller."];

export default function About() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="About" title="A hospital doctor" sub="who builds software." />

        <section className="frame" style={{ paddingTop: 0 }}>
          <div className="wrap cols">
            <div className="who-me reveal">
              <p><b>I&rsquo;m Sam.</b> I work in a hospital and I build clinical software, where a mistake can hurt someone.</p>
            </div>
            <div className="prose big">
              <p className="reveal">That changed how I build. I want to see the problem myself. I keep the system simple. I test it properly, and I make sure a person is checking what matters.</p>
              <p className="reveal">Webflow Outreach does the same for businesses. We are AI engineers who work inside your business, sometimes called forward deployed engineers. We go in, see the problem first hand, and build whatever fixes it.</p>
              <p className="reveal">We are small and we are new at this. I am not available every day, so we agree days and response times in writing before you sign. <Link href="/trust#time">More on that</Link>.</p>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">What we believe.</h2>
            <ul className="cards c2" style={{ marginTop: 36 }}>
              {BELIEFS.map(([t, d]) => <li key={t} className="reveal"><b>{t}</b><p>{d}</p></li>)}
            </ul>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">What we are not.</h2>
            <div>
              <div className="notfor reveal" style={{ marginTop: 0 }}>
                <ul style={{ marginTop: 0, gridTemplateColumns: "1fr" }}>{NOT.map((n) => <li key={n}>{n}</li>)}</ul>
              </div>
              <p className="fine reveal">We build things that go live, are tested first, and belong to you. <Link href="/method">The method</Link>.</p>
            </div>
          </div>
        </section>

        <section className="frame">
          <div className="wrap cols">
            <h2 className="h2 reveal">The company.</h2>
            <dl className="qa">
              <div className="reveal"><dt>Trading name</dt><dd>{COMPANY.tradingAs}</dd></div>
              {COMPANY.name && <div className="reveal"><dt>Registered name</dt><dd>{COMPANY.name}</dd></div>}
              {COMPANY.number && (
                <div className="reveal"><dt>Company number</dt><dd>{COMPANY.number}{COMPANY.registeredIn && `, registered in ${COMPANY.registeredIn}`}. <a href={`https://find-and-update.company-information.service.gov.uk/company/${encodeURIComponent(COMPANY.number)}`} rel="noopener">Check it at Companies House</a>.</dd></div>
              )}
              {COMPANY.address && <div className="reveal"><dt>Registered office</dt><dd>{COMPANY.address}</dd></div>}
              {COMPANY.vat && <div className="reveal"><dt>VAT number</dt><dd>{COMPANY.vat}</dd></div>}
              <div className="reveal"><dt>Email</dt><dd><a href={`mailto:${EMAIL}`}>{EMAIL}</a></dd></div>
            </dl>
          </div>
        </section>

        <Finale where="about-bottom" />
      </main>
    </>
  );
}
