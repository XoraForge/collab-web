import { forwardAuth, sessionResponse } from "../_shared";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return sessionResponse(await forwardAuth("signup", body));
}
