"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

// Keeps the landing slug and any utm_ tags and the c= token for the visit (no cookies) so the form can send them with the enquiry.
export function AttrCapture({ slug }: { slug: string }) {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    q.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v.slice(0, 120); });
    try { sessionStorage.setItem("wo_attr", JSON.stringify({ source: `for-${slug}`, utm, c: (q.get("c") || "").slice(0, 64) })); } catch {}
    track("landing_view", { slug });
  }, [slug]);
  return null;
}
