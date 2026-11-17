"use client";

import { useEffect, useRef, useState } from "react";

// The one animation on the homepage: a technical drawing of a forward deployed engineer's work, drawn once as it scrolls
// into view. It follows the four steps beside it: go in, find the symptoms, diagnose, engineer the solution.
// The finished drawing is the default markup. The hidden start state only exists after this component has mounted and
// the browser supports IntersectionObserver, so no-JS and reduced-motion visitors see the finished drawing.
// Two drawings share one set of classes: a wide one and a tall one for phones. CSS shows one of them.

type Stage = "rest" | "armed" | "go";
const D = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

const LABEL = "A drawing in four steps. An engineer outside your company crosses the boundary and goes in. Inside, three symptoms are marked: slow, done twice, and waits on one person. Lines from all three meet at one point, the cause. From the cause, one line leads to the solution.";

function Badge({ n, x, y, d }: { n: number; x: number; y: number; d: number }) {
  return (
    <g className="fi" style={D(d)}>
      <circle cx={x} cy={y} r={11} className="fde-badge" />
      <text x={x} y={y + 4.5} textAnchor="middle" className="fde-no">{n}</text>
    </g>
  );
}

export function Diagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setStage("armed");
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setStage("go"); io.disconnect(); } },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`fde ${stage}`} role="img" aria-label={LABEL}>
      {/* Wide drawing */}
      <svg className="fde-wide" viewBox="0 30 1000 340" aria-hidden="true" focusable="false">
        <g className="fi" style={D(0)}>
          <rect x={130} y={40} width={850} height={320} rx={30} className="fde-co" />
          <text x={162} y={78} className="fde-t">Your company</text>
        </g>
        {/* 1 Go in */}
        <Badge n={1} x={100} y={168} d={0.4} />
        <g className="fi" style={D(0.4)}>
          <circle cx={50} cy={200} r={9} className="fde-node" />
          <text x={50} y={178} textAnchor="middle" className="fde-t">Engineer</text>
        </g>
        <path d="M59 200 H163" pathLength={1} className="dr" style={{ ...D(0.7), "--t": "0.8s" } as React.CSSProperties} />
        <circle cx={170} cy={200} r={7} className="fde-node fi" style={D(1.4)} />
        {/* 2 Symptoms */}
        <Badge n={2} x={420} y={66} d={1.5} />
        {[["Slow", 110, 1.5], ["Done twice", 200, 1.7], ["Waits on one person", 290, 1.9]].map(([t, y, d]) => (
          <g key={t as string} className="fi" style={D(d as number)}>
            <circle cx={420} cy={y as number} r={7} className="fde-mark" />
            <text x={404} y={(y as number) + 5} textAnchor="end" className="fde-t">{t}</text>
          </g>
        ))}
        {/* 3 Diagnose */}
        <Badge n={3} x={640} y={154} d={2.2} />
        <path d="M426.500 112.700 L628.900 195.500" pathLength={1} className="dr" style={{ ...D(2.2), "--t": "0.8s" } as React.CSSProperties} />
        <path d="M427 200 H628" pathLength={1} className="dr" style={{ ...D(2.35), "--t": "0.8s" } as React.CSSProperties} />
        <path d="M426.500 287.300 L628.900 204.500" pathLength={1} className="dr" style={{ ...D(2.5), "--t": "0.8s" } as React.CSSProperties} />
        <g className="fi" style={D(3.1)}>
          <circle cx={640} cy={200} r={12} className="fde-ring" />
          <circle cx={640} cy={200} r={4} className="fde-node" />
          <text x={640} y={246} textAnchor="middle" className="fde-t">The cause</text>
        </g>
        {/* 4 Solution */}
        <Badge n={4} x={875} y={122} d={3.2} />
        <path d="M652 200 H800" pathLength={1} className="dr" style={{ ...D(3.3), "--t": "0.5s" } as React.CSSProperties} />
        <g className="fi" style={D(3.6)}>
          <rect x={800} y={150} width={150} height={100} rx={10} className="fde-box" />
          <text x={875} y={188} textAnchor="middle" className="fde-t">The solution</text>
          <rect x={822} y={210} width={106} height={20} rx={3} className="fde-track" />
        </g>
        <rect x={822} y={210} width={106} height={20} rx={3} className="fde-lime" style={D(3.7)} />
      </svg>

      {/* Tall drawing for phones */}
      <svg className="fde-tall" viewBox="0 0 360 650" aria-hidden="true" focusable="false">
        <g className="fi" style={D(0)}>
          <rect x={10} y={90} width={340} height={550} rx={26} className="fde-co" />
          <text x={30} y={122} className="fde-t">Your company</text>
        </g>
        <Badge n={1} x={140} y={62} d={0.4} />
        <g className="fi" style={D(0.4)}>
          <circle cx={180} cy={28} r={9} className="fde-node" />
          <text x={198} y={33} className="fde-t">Engineer</text>
        </g>
        <path d="M180 37 V133" pathLength={1} className="dr" style={{ ...D(0.7), "--t": "0.8s" } as React.CSSProperties} />
        <circle cx={180} cy={140} r={7} className="fde-node fi" style={D(1.4)} />
        <Badge n={2} x={318} y={250} d={1.5} />
        {[["Slow", 200, 1.5], ["Done twice", 250, 1.7], ["Waits on one person", 300, 1.9]].map(([t, y, d]) => (
          <g key={t as string} className="fi" style={D(d as number)}>
            <circle cx={70} cy={y as number} r={7} className="fde-mark" />
            <text x={90} y={(y as number) + 5} className="fde-t">{t}</text>
          </g>
        ))}
        <Badge n={3} x={318} y={420} d={2.2} />
        <path d="M63 200 H34 V420 H168" pathLength={1} className="dr" style={{ ...D(2.2), "--t": "0.9s" } as React.CSSProperties} />
        <path d="M63 250 H34 V420 H168" pathLength={1} className="dr" style={{ ...D(2.35), "--t": "0.9s" } as React.CSSProperties} />
        <path d="M63 300 H34 V420 H168" pathLength={1} className="dr" style={{ ...D(2.5), "--t": "0.9s" } as React.CSSProperties} />
        <g className="fi" style={D(3.1)}>
          <circle cx={180} cy={420} r={12} className="fde-ring" />
          <circle cx={180} cy={420} r={4} className="fde-node" />
          <text x={204} y={425} className="fde-t">The cause</text>
        </g>
        <Badge n={4} x={318} y={558} d={3.2} />
        <path d="M180 432 V508" pathLength={1} className="dr" style={{ ...D(3.3), "--t": "0.5s" } as React.CSSProperties} />
        <g className="fi" style={D(3.6)}>
          <rect x={100} y={508} width={160} height={100} rx={10} className="fde-box" />
          <text x={180} y={546} textAnchor="middle" className="fde-t">The solution</text>
          <rect x={122} y={568} width={116} height={20} rx={3} className="fde-track" />
        </g>
        <rect x={122} y={568} width={116} height={20} rx={3} className="fde-lime" style={D(3.7)} />
      </svg>
    </div>
  );
}
