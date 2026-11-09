import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/server/session";

/**
 * Hands the session token to the editor so it can open the WebSocket to
 * collab-realtime (WebSockets can't send our httpOnly cookie cross-origin).
 * The realtime server verifies it with collab-api on connect.
 * TODO: mint a short-lived, section-scoped token in collab-api instead.
 */
export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
