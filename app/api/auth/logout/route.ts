import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/session";

/** Called by the account menu. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}

/**
 * Used by server components when the API rejects the token: clears the cookie
 * and sends the user to login. Server components can't modify cookies themselves,
 * and without this the guard in proxy.ts would bounce /login back to /dashboard.
 */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const url = new URL("/login", request.url);
  if (next?.startsWith("/")) url.searchParams.set("next", next);

  const response = NextResponse.redirect(url);
  clearSessionCookie(response);
  return response;
}
