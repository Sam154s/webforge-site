import { ImageResponse } from "next/og";

export const alt = "Webflow Outreach: AI engineers who work inside your business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pin = { display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: "3px solid #111", fontSize: 22, fontWeight: 700 } as const;

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#E8E6E1", color: "#111", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>webflow outreach</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 600 }}>
            <div style={pin}>A</div><span style={{ color: "#5E5B55", textDecoration: "line-through" }}>Done by hand</span>
            <span style={{ margin: "0 6px" }}>→</span>
            <div style={{ ...pin, background: "#D9F24A" }}>B</div><span>Runs itself</span>
          </div>
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -4, display: "flex", flexDirection: "column" }}>
          <span>AI engineers who work</span>
          <span>inside your business.</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div style={{ background: "#D9F24A", padding: "16px 30px", borderRadius: 999 }}>Sprint £3,500 fixed</div>
          <div style={{ border: "3px solid #111", padding: "13px 30px", borderRadius: 999 }}>First build from £12,000</div>
        </div>
      </div>
    ),
    size,
  );
}
