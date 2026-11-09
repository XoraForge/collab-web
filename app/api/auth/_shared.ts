import { NextResponse } from "next/server";
import { API_URL, setSessionCookie } from "@/lib/server/session";

/** Forwards a public auth request to collab-api and returns its JSON as-is. */
export async function forwardAuth(path: string, body: unknown) {
  try {
    const res = await fetch(`${API_URL}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 503,
      data: {
        code: "API_UNAVAILABLE",
        message: "Can't reach the Collab server. Please try again shortly.",
      },
    };
  }
}

/**
 * For login/sign-up: on success, store the JWT in the httpOnly cookie and
 * return only the email, never the token, to the browser.
 */
export function sessionResponse(result: Awaited<ReturnType<typeof forwardAuth>>) {
  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }
  const { jwtToken, email } = result.data as { jwtToken: string; email: string };
  const response = NextResponse.json({ email }, { status: 200 });
  setSessionCookie(response, jwtToken);
  return response;
}
