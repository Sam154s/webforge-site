"use client";

import { Analytics } from "@vercel/analytics/next";

// Personal email links carry a token in ?c= or ?t=. Remove it from every analytics event before it leaves the browser.
export function SafeAnalytics() {
  return (
    <Analytics
      beforeSend={(e) => {
        try {
          const u = new URL(e.url);
          if (!u.searchParams.has("c") && !u.searchParams.has("t")) return e;
          u.searchParams.delete("c");
          u.searchParams.delete("t");
          return { ...e, url: u.toString() };
        } catch {
          return e;
        }
      }}
    />
  );
}
