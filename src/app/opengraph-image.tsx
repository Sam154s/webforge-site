import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Webflow Outreach: we’re forward deployed engineers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image is drawn outside the browser, so the site's web fonts are not available to it. These are static cuts of the
// same two faces the pages use (Bricolage Grotesque for display, Figtree for labels), read from disk when the image is built.
const font = (file: string) => readFile(join(process.cwd(), "src/app/og-fonts", file));

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
        </div>
        <div style={{ fontFamily: "Bricolage Headline", fontSize: 92, lineHeight: 1, letterSpacing: -2.6, display: "flex", flexDirection: "column" }}>
          <span>We&rsquo;re forward</span>
          <span>deployed engineers.</span>
        </div>
        <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 32, lineHeight: 1.25, letterSpacing: -0.6, color: "#5E5B55", maxWidth: 900 }}>We go into your company, find what&rsquo;s holding it back, and engineer the solution.</div>
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
