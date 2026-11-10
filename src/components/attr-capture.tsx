"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

// Keeps the landing slug and any utm_ / c= tags for the visit (no cookies) so the form can send them with the enquiry.
export function AttrCapture({ slug }: { slug: string }) {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    q.forEach((v, k) => { if (k.startsWith("utm_") || k === "c") utm[k] = v.slice(0, 120); });
    try { sessionStorage.setItem("wo_attr", JSON.stringify({ source: `for-${slug}`, utm })); } catch {}
    track("landing_view", { slug });
  }, [slug]);
  return null;
}
