import { ApiErrorBody } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
  return new ApiError(
    res.status,
    body.code ?? "UNKNOWN",
    body.message ?? "Something went wrong. Please try again."
  );
}

/** JSON request from the browser to a Next.js route. Throws ApiError on failure. */
export async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "You appear to be offline.");
  }
  if (!res.ok) throw await toApiError(res);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/**
 * Calls collab-api through the Next.js proxy (which adds the session token).
 * A 401 means the session ended, so the user is sent back to login.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await request<T>(`/api/backend${path}`, init);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && typeof window !== "undefined") {
      const next = window.location.pathname + window.location.search;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
    }
    throw err;
  }
}
