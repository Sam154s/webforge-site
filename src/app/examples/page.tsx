import type { Metadata } from "next";
import { Reveal } from "../reveal";
import { Examples } from "../story/examples";
import { Finale, Hero } from "@/components/page-kit";
import { social } from "@/lib/site";

export const metadata: Metadata = {
  title: "Three tools we built",
  description: "Three tools we built to show how we build. The firms and figures are invented.",
  alternates: { canonical: "/examples" },
  ...social("Three tools we built | Webflow Outreach", "/examples"),
};

export default function ExamplesPage() {
  return (
    <>
      <Reveal />
      <main className="sb sub">
        <Hero kicker="Examples" title="Three tools we built" sub="to show how we build." lede="The firms and figures are invented." />
        <section className="frame" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Examples />
          </div>
        </section>
        <Finale where="examples-bottom" />
      </main>
    </>
  );
}
