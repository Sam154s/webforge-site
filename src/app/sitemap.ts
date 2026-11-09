import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Draft legal pages, thank-you page and email landing pages are noindex, so they are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-09");
  return [
    ["/", 1], ["/diagnostic", 0.9], ["/sample-report", 0.8], ["/method", 0.7],
  ].map(([p, priority]) => ({ url: `${SITE_URL}${p}`, lastModified: now, priority: priority as number }));
}
