import { NextRequest, NextResponse } from "next/server";
import { apiFetch, clearSessionCookie } from "@/lib/server/session";

/**
 * Proxies browser requests to collab-api, attaching the session JWT from the
 * httpOnly cookie:  /api/backend/projects  →  {API_URL}/projects
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const target = `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let res: Response;
  try {
    res = await apiFetch(target, {
      method: request.method,
      body: hasBody ? await request.text() : undefined,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    return NextResponse.json(
      { code: "API_UNAVAILABLE", message: "Can't reach the Collab server." },
      { status: 503 }
    );
  }

  const body = res.status === 204 ? null : await res.text();
  const response = new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });

  // Expired or invalid token: drop the cookie so the user is sent to login.
  if (res.status === 401) clearSessionCookie(response);
  return response;
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
