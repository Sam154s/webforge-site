import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Finale, Hero } from "@/components/page-kit";
import { PRICE, SALARY } from "@/lib/offer";
import { gbp } from "@/lib/sum";

export const metadata: Metadata = {
  title: "Hire an AI engineer, or use us",
  description: "A fair comparison. Median advertised UK AI engineer salary is £87,500 (IT Jobs Watch, November 2026). When hiring is the right answer, and when a fixed price build is.",
  alternates: { canonical: "/compare" },
  openGraph: { title: "Hire an AI engineer, or use us | Webflow Outreach", url: "/compare" },
};

const HIRE = 105000;
const YEAR = PRICE.embedded * 12;
const ROWS: [string, string, string][] = [
  ["What it costs", `Median advertised salary ${SALARY.median}. Roughly ${SALARY.loaded} a year with employer costs, before recruitment fees.`, `Sprint ${gbp(PRICE.sprint)}. First build from ${gbp(PRICE.build)}. Then from ${gbp(PRICE.embedded)} a month, if you want us to stay.`],
  ["Before any work starts", "An advert, interviews, an offer and a notice period.", "A free intro call, then the sprint."],
  ["When you know it works", "After they have joined and learned the business.", "In the sprint, on your real data, before you commit to a build."],
  ["If it does not work", "You have carried the salary.", "The second half of the build is only due when it passes the written test."],
  ["Their time", "All yours, all week.", "Shared. A named engineer on your ranked list, not a full-time member of staff."],
  ["Who owns the code", "You.", "You, on your own accounts."],
  ["Best when", "You have a long list of work and want a team.", "You want the first system working before you decide."],
];

export default function Compare() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="Compare" title="Hire an AI engineer," sub="or use us."
          lede="A fair comparison, with the salary figure sourced. Sometimes hiring is the right answer." />

        <section className="frame">
          <div className="wrap cols">
            <div>
              <h2 className="h2 reveal">A year, <span>in pounds.</span></h2>
              <p className="fine reveal">Salary: {SALARY.source}. The median is {SALARY.median}, or {SALARY.outsideLondon} outside London. {SALARY.loaded} adds employer costs and is a rough figure. Our figures are from prices: yours is fixed in writing.</p>
            </div>
            <ul className="bars reveal">
              <li>
                <div className="bl"><span>Hire one AI engineer, a year</span><b>Roughly {SALARY.loaded}</b></div>
                <div className="track"><i style={{ width: "100%" }} /></div>
                <small>Before recruitment fees. Full time, and yours.</small>
              </li>
              <li>
                <div className="bl"><span>Our embedded engineer, twelve months</span><b>From {gbp(YEAR)}</b></div>
                <div className="track"><i className="us" style={{ width: `${(YEAR / HIRE) * 100}%` }} /></div>
                <small>From {gbp(PRICE.embedded)} a month. Not full time.</small>
              </li>
              <li>
                <div className="bl"><span>One first build, once</span><b>From {gbp(PRICE.build)}</b></div>
                <div className="track"><i className="us" style={{ width: `${(PRICE.build / HIRE) * 100}%` }} /></div>
                <small>Half on signature, half when it passes the written test.</small>
              </li>
            </ul>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">Side by side.</h2>
            <dl className="vs" style={{ marginTop: 36 }}>
              {ROWS.map(([k, hire, us]) => (
                <div key={k} className="reveal">
                  <dt>{k}</dt>
                  <dd><small>Hire one</small>{hire}</dd>
                  <dd className="us"><small>Use us</small>{us}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">When to hire. <span>And when not to yet.</span></h2>
            <ul className="cards c3" style={{ marginTop: 36 }}>
              <li className="reveal"><b>Hire</b><p>If you already know you have years of work for one. A full-time engineer who knows your business is hard to beat. We will help you do it.</p></li>
              <li className="reveal"><b>Use us</b><p>If you have one or two processes that hurt and you do not yet know what you need built. Get the first system working, then decide.</p></li>
              <li className="reveal"><b>Do both</b><p>Start with us, then hire. You own the code and there is a runbook, so your new engineer picks it up on day one.</p></li>
            </ul>
            <p className="fine reveal"><Link href="/pricing">Pricing in full</Link>.</p>
          </div>
        </section>

        <Finale where="compare-bottom" />
      </main>
    </>
  );
}
