import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../reveal";
import { Finale, Hero } from "@/components/page-kit";
import { social } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, and how we build.",
  alternates: { canonical: "/about" },
  ...social("About | Webflow Outreach", "/about"),
};

const HOW = [
  "We use AI to write the code. What runs afterwards is plain code where it can be, so it is almost free to run and gives the same answer every time. AI is used only where judgement is needed, with a person near the loop.",
  "Every build is run ten times and must give the same answer.",
  "An independent senior engineer reviews it before it goes live.",
  "You own the code.",
  "We don’t build systems that make clinical, payment or safety decisions.",
];

export default function About() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="About" title="How we build." />

        <section className="frame" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <ul className="cards">
              {HOW.map((h) => <li key={h} className="reveal"><p style={{ margin: 0, fontSize: 17, color: "var(--ink)" }}>{h}</p></li>)}
            </ul>
            <p className="fine reveal"><Link href="/examples">Three tools we built, on invented data.</Link></p>
          </div>
        </section>

        <Finale where="about-bottom" />
      </main>
    </>
  );
}
