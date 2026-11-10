import { NextRequest, NextResponse } from "next/server";
import { opsRpc, validToken } from "@/lib/outreach";

// Reached by POST /unsubscribe?t=<token> (see middleware.ts). Never by GET, so mail scanners cannot unsubscribe anyone.
// A bad or unknown token looks exactly like a good one, so the response never says whether a token was real.
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  const body = await req.text().catch(() => "");
  const oneClick = body.includes("List-Unsubscribe=One-Click");
  let ok = true;
  if (validToken(token)) ok = (await opsRpc("outreach_unsubscribe", { p_token: token }, 4000)).ok;

  // Mail provider: plain 200 when done. If our database could not be reached, say so, so the provider can retry.
  if (oneClick) return new NextResponse(ok ? "Unsubscribed" : "Try again later", { status: ok ? 200 : 503 });
  // Person pressing the button on the page: back to a plain page, without the token in the URL.
  return NextResponse.redirect(new URL(`/unsubscribe?${ok ? "done" : "failed"}=1`, req.url), 303);
}
