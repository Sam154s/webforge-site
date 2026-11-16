import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Webflow Outreach: AI engineers who work inside your business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image is drawn outside the browser, so the site's web fonts are not available to it. These are static cuts of the
// same two faces the pages use (Bricolage Grotesque for display, Figtree for labels), read from disk when the image is built.
const font = (file: string) => readFile(join(process.cwd(), "src/app/og-fonts", file));

const pin = { display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: "3px solid #111", fontSize: 22 } as const;

export default async function Image() {
  const [headline, display, label] = await Promise.all([
    font("BricolageGrotesque-SemiCondensed-ExtraBold.ttf"),
    font("BricolageGrotesque-Bold.ttf"),
    font("Figtree-SemiBold.ttf"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#E8E6E1", color: "#111", padding: 72, fontFamily: "Figtree" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "Bricolage", fontSize: 36, letterSpacing: -0.7 }}>webflow outreach</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26 }}>
            <div style={pin}>A</div><span style={{ color: "#5E5B55", textDecoration: "line-through" }}>Done by hand</span>
            <svg width="40" height="20" viewBox="0 0 40 20" style={{ margin: "0 6px" }}><path d="M2 10h34M28 3l8 7l-8 7" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{ ...pin, background: "#D9F24A" }}>B</div><span>Runs itself</span>
          </div>
        </div>
        <div style={{ fontFamily: "Bricolage Headline", fontSize: 108, lineHeight: 0.96, letterSpacing: -3.2, display: "flex", flexDirection: "column" }}>
          <span>AI engineers who work</span>
          <span>inside your business.</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontFamily: "Bricolage", fontSize: 32, letterSpacing: -0.6 }}>
          <div style={{ background: "#D9F24A", padding: "16px 30px", borderRadius: 999 }}>Sprint £3,500 fixed</div>
          <div style={{ border: "3px solid #111", padding: "13px 30px", borderRadius: 999 }}>First build from £12,000</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage Headline", data: headline, weight: 800, style: "normal" },
        { name: "Bricolage", data: display, weight: 700, style: "normal" },
        { name: "Figtree", data: label, weight: 600, style: "normal" },
      ],
    },
  );
}
