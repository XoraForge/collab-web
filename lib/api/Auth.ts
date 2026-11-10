import { api, request } from "./client";
import { CurrentUser } from "./types";

export async function checkEmail(email: string) {
  // The API names this field "exist".
  const res = await request<{ exist: boolean }>("/api/auth/check-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return res.exist;
}

export function login(email: string, password: string) {
  return request<{ email: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signUp(name: string, email: string, password: string) {
  return request<{ email: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return api<CurrentUser>("/auth/me");
}

/** Settings: name and profile picture (imageUrl: null = unchanged, "" = remove). */
export function updateProfile(name: string, imageUrl?: string | null) {
  return api<CurrentUser>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ name, imageUrl: imageUrl ?? null }),
  });
}

/** Throws ApiError WRONG_PASSWORD when the current password is wrong. */
export function changePassword(currentPassword: string, newPassword: string) {
  return api<void>("/auth/me/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
