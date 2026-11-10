import { api } from "./client";
import { Activity, AppNotification, NotificationList } from "./types";

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Activity across all of my projects, newest first. Pass `before` (oldest createdAt) to load more. */
export function listActivity(before?: string, limit = 30) {
  return api<Activity[]>(`/activity${query({ before, limit })}`);
}

export function listProjectActivity(projectId: string, before?: string, limit = 30) {
  return api<Activity[]>(`/projects/${encodeURIComponent(projectId)}/activity${query({ before, limit })}`);
}

export function listNotifications(limit = 30) {
  return api<NotificationList>(`/notifications${query({ limit })}`);
}

export function markNotificationRead(id: AppNotification["id"]) {
  return api<void>(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return api<void>("/notifications/read-all", { method: "POST" });
}
