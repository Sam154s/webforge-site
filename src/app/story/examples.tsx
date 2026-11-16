import Link from "next/link";
import { FIRMS, type Firm } from "@/lib/sandbox/journey";
import { Shots, type Shot } from "./parts";

// The three example tools: photos of the real thing, one line on what it does, and a button to open it and play.
const CASES: { no: string; firm: Firm; href: string; does: string; shots: Shot[] }[] = [
  {
    no: "EX-01", firm: FIRMS.architect, href: "/examples/architect",
    does: "Drag blocks on a plot to shape a house in 3D. You get a seven sheet drawing set, a planning guide, a cost plan and a fee proposal.",
    shots: [
      { src: "/showcase/arch-model.webp", w: 1238, h: 871, title: "The 3D designer" },
      { src: "/showcase/arch-exploded.webp", w: 1238, h: 871, title: "Exploded view" },
      { src: "/showcase/arch-sheet.webp", w: 1238, h: 838, title: "Sheet SK00, the cover" },
      { src: "/showcase/arch-cost.webp", w: 1238, h: 484, title: "Cost plan" },
    ],
  },
  {
    no: "EX-02", firm: FIRMS.builder, href: "/examples/builder",
    does: "Drag units and fittings onto a plan of a kitchen, bathroom or extension. You get a nine sheet job pack with drawings, quantities and three priced options.",
    shots: [
      { src: "/showcase/build-planner.webp", w: 1238, h: 1059, title: "The room planner" },
      { src: "/showcase/build-plan.webp", w: 1230, h: 1110, title: "Sheet A-101, floor plan" },
      { src: "/showcase/build-model.webp", w: 1230, h: 1079, title: "Sheet A-301, ink model" },
      { src: "/showcase/build-options.webp", w: 1230, h: 1305, title: "Sheet Q-502, three priced options" },
    ],
  },
  {
    no: "EX-03", firm: FIRMS.plumber, href: "/examples/plumber",
    does: "Two tools. A fault finder that reads the boiler code, orders the part and books the engineer. And a heating planner that works out heat loss room by room and prices a new system.",
    shots: [
      { src: "/showcase/plumb-diagnosis.webp", w: 1238, h: 945, title: "The fault finder" },
      { src: "/showcase/plumb-schematic.webp", w: 620, h: 945, title: "Fig. 1, the service schematic" },
      { src: "/showcase/plumb-heatplan.webp", w: 1238, h: 836, title: "The heating planner" },
      { src: "/showcase/plumb-heatloss.webp", w: 1294, h: 1747, title: "Thermal plan and heat loss" },
    ],
  },
];

export function Examples() {
  return (
    <div className="cases">
      {CASES.map((c) => (
        <article key={c.no} className="case reveal">
          <header className="case-head">
            <span className="case-no">{c.no}</span>
            <div>
              <h3>{c.firm.name}</h3>
              <p>{c.does}</p>
              <span className="stamp">Example firm, not a client</span>
            </div>
            <Link href={c.href} className="open-tool">Open the full tool <i aria-hidden>→</i></Link>
          </header>
          <div className="case-foot">
            <Shots items={c.shots} />
          </div>
        </article>
      ))}
    </div>
  );
}
