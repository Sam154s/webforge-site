import { ImageResponse } from "next/og";

export const alt = "Webflow Outreach: find the jobs costing you money, then fix the first one";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#E8E6E1", color: "#111", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 34, fontWeight: 700 }}>webflow outreach</div>
        <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, letterSpacing: -3, display: "flex", flexDirection: "column" }}>
          <span>Find the jobs costing you money.</span>
          <span>Then fix the first one.</span>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ background: "#D9F24A", padding: "16px 32px", borderRadius: 999, fontSize: 32, fontWeight: 700 }}>Free diagnostic for UK limited companies</div>
        </div>
      </div>
    ),
    size,
  );
}
