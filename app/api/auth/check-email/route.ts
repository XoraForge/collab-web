import { NextResponse } from "next/server";
import { forwardAuth } from "../_shared";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await forwardAuth("check-email", body);
  return NextResponse.json(result.data, { status: result.status });
}
