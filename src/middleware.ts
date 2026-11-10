import { NextResponse, type NextRequest } from "next/server";

// RFC 8058 one-click: mail providers POST to the same /unsubscribe URL that people open with GET.
// A page cannot also be a route handler, so POSTs are sent to the API route. GETs are untouched.
export function middleware(req: NextRequest) {
  if (req.method !== "POST") return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/api/unsubscribe";
  return NextResponse.rewrite(url);
}

export const config = { matcher: "/unsubscribe" };
