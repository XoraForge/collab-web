import { NextRequest, NextResponse } from "next/server";
import { apiFetch, clearSessionCookie } from "@/lib/server/session";

/** Response headers kept from the API (images are cached and shown inline). */
const PASSED_HEADERS = ["Cache-Control", "Content-Disposition", "X-Content-Type-Options"];

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

  // Bodies are passed through as bytes, so JSON and file uploads (multipart) both work.
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let res: Response;
  try {
    res = await apiFetch(target, {
      method: request.method,
      body: body && body.byteLength > 0 ? body : undefined,
      headers: hasBody
        ? { "Content-Type": request.headers.get("Content-Type") ?? "application/json" }
        : undefined,
    });
  } catch {
    return NextResponse.json(
      { code: "API_UNAVAILABLE", message: "Can't reach the Collab server." },
      { status: 503 }
    );
  }

  const headers = new Headers({ "Content-Type": res.headers.get("Content-Type") ?? "application/json" });
  for (const name of PASSED_HEADERS) {
    const value = res.headers.get(name);
    if (value) headers.set(name, value);
  }
  const response = new NextResponse(res.status === 204 ? null : await res.arrayBuffer(), {
    status: res.status,
    headers,
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
