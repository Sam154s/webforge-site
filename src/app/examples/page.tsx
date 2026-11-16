import type { Metadata } from "next";
import { Reveal } from "../reveal";
import { Examples } from "../story/examples";
import { Finale, Hero } from "@/components/page-kit";

export const metadata: Metadata = {
  title: "Three working example tools",
  description: "Three tools you can open and use now, for an architect, a builder and a plumber. None is what we sell. They show how fast we can get into an unfamiliar business.",
  alternates: { canonical: "/examples" },
  openGraph: { title: "Three working example tools | Webflow Outreach", url: "/examples" },
};

const SHOWS = [
  ["Range", "An architect, a builder and a plumber. Three trades, three different kinds of problem: drawing, pricing and fault finding."],
  ["Speed", "We were outsiders to all three. Getting into an unfamiliar business quickly is the job."],
  ["Method", "Every step in these tools runs as plain code. Nothing is sent, and the same input gives the same output."],
];

export default function ExamplesPage() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="Examples" title="Three working tools." sub="Open one and use it."
          lede="None of these is what we sell. They show how fast we can get into an unfamiliar business. Yours is next." />
        <section className="frame" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Examples />
          </div>
        </section>
        <section className="frame">
          <div className="wrap">
            <h2 className="h2 reveal">What they show. <span>And what they do not.</span></h2>
            <ul className="cards c3" style={{ marginTop: 36 }}>
              {SHOWS.map(([t, d]) => <li key={t} className="reveal"><b>{t}</b><p>{d}</p></li>)}
            </ul>
            <p className="fine reveal">The three firms are made up. They are not clients, and these are not case studies. We have none yet.</p>
          </div>
        </section>
        <Finale where="examples-bottom" title="Yours is next." mark="Start with a call." />
      </main>
    </>
  );
}
