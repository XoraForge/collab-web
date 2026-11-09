import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

/**
 * Server-side session helpers. The API's JWT lives in an httpOnly cookie, so
 * browser JavaScript can never read it. Browser code talks to the API through
 * the `/api/backend/*` proxy route, which attaches the token.
 */

export const SESSION_COOKIE = "collab_session";

/** Base URL of collab-api, e.g. http://localhost:8080/api/v1 */
export const API_URL = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1"
).replace(/\/$/, "");

const FALLBACK_MAX_AGE = 60 * 60 * 24; // 1 day

/** Reads the `exp` claim (seconds) without verifying. The API verifies the token. */
function secondsUntilExpiry(jwt: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split(".")[1], "base64url").toString("utf8")
    ) as { exp?: number };
    if (!payload.exp) return FALLBACK_MAX_AGE;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return FALLBACK_MAX_AGE;
  }
}

export function setSessionCookie(response: NextResponse, jwt: string) {
  response.cookies.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: secondsUntilExpiry(jwt),
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Calls collab-api from the server with the signed-in user's token. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getSessionToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
