import { NextRequest, NextResponse } from "next/server";

// Keep in sync with SESSION_COOKIE in lib/server/session.ts
const SESSION_COOKIE = "collab_session";

/**
 * Route guard (Next 16's replacement for middleware). It only checks that a
 * session cookie exists; collab-api verifies the token on every request, and
 * an invalid one clears the cookie (see app/api/backend).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isSignedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/dashboard") && !isSignedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && isSignedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
