import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Open to every crawler, search and AI alike. Private pages and thank-you pages are kept out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/start/booked", "/for", "/unsubscribe"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
