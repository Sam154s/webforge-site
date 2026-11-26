import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Draft legal pages, the thank-you page and the private pages are noindex, so they are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-16");
  return [
    ["/", 1], ["/pricing", 0.9], ["/start", 0.9], ["/examples", 0.8], ["/about", 0.6], ["/sample-report", 0.5],
    ["/examples/architect", 0.6], ["/examples/builder", 0.6], ["/examples/plumber", 0.6], ["/drawings-to-quote", 0.6],
  ].map(([p, priority]) => ({ url: `${SITE_URL}${p}`, lastModified: now, priority: priority as number }));
}
