import { STATUS_LABEL } from "@/components/tasks/taskMeta";
import type { Activity, AppNotification, TaskStatus, UserSummary } from "./api/types";
import dayjs from "./dayjs";

export function personName(user: UserSummary | null | undefined) {
  return user ? user.name || user.email : "Someone";
}

/** A sentence in parts, so the UI can bold the names. */
export type Phrase = { before: string; target?: string; after?: string };

/** "published | Intro | v3 · first draft" */
export function activityPhrase(a: Activity): Phrase {
  const t = a.targetTitle ?? "";
  switch (a.type) {
    case "PROJECT_CREATED":
      return { before: "created the project" };
    case "PROJECT_UPDATED":
      return { before: "updated the project details" };
    case "MEMBER_JOINED":
      return { before: "joined the project" };
    case "DOCUMENT_CREATED":
      return { before: "created the document", target: t };
    case "DOCUMENT_DELETED":
      return { before: "deleted the document", target: t };
    case "SECTION_ASSIGNED":
      return { before: `assigned ${a.detail ?? "someone"} to`, target: t };
    case "SECTION_PUBLISHED":
      return { before: "published", target: t, after: a.detail ?? undefined };
    case "SECTION_SUBMITTED":
      return { before: "submitted", target: t, after: "for review" };
    case "SECTION_APPROVED":
      return { before: "approved", target: t };
    case "SECTION_REOPENED":
      return { before: "reopened", target: t };
    case "TASK_CREATED":
      return { before: "created the task", target: t };
    case "TASK_STATUS_CHANGED":
      return {
        before: "moved",
        target: t,
        after: `to ${STATUS_LABEL[a.detail as TaskStatus] ?? a.detail ?? "a new column"}`,
      };
    case "TASK_DELETED":
      return { before: "deleted the task", target: t };
    case "NOTE_CREATED":
      return { before: "added the note", target: t };
    default:
      return { before: "made a change" };
  }
}

/** Where an activity entry leads, if its target still exists somewhere to open. */
export function activityLink(a: Activity): string | null {
  const project = `/dashboard/project/${a.projectId}`;
  if (a.sectionId && a.documentId) return `${project}/files/${a.documentId}?section=${a.sectionId}`;
  if (a.documentId && a.type !== "DOCUMENT_DELETED") return `${project}/files/${a.documentId}`;
  if (a.taskId && a.type !== "TASK_DELETED") return `${project}/assignments?task=${a.taskId}`;
  if (a.noteId) return `${project}/notes?note=${a.noteId}`;
  if (a.type === "MEMBER_JOINED") return `${project}/team-members`;
  return project;
}

/** "Due 2026-11-14" from the API → "Due Fri 14 Nov". */
function friendlyDetail(detail: string | null) {
  if (!detail) return null;
  const match = /^Due (\d{4}-\d{2}-\d{2})$/.exec(detail);
  return match ? `Due ${dayjs(match[1]).format("ddd D MMM")}` : detail;
}

export function notificationPhrase(n: AppNotification): Phrase & { actor: string | null; note: string | null } {
  const actor = n.actor ? personName(n.actor) : null;
  const t = n.targetTitle ?? "";
  const detail = friendlyDetail(n.detail);
  switch (n.type) {
    case "SECTION_ASSIGNED":
      return { actor, before: "assigned you to", target: t, note: detail };
    case "TASK_ASSIGNED":
      return { actor, before: "assigned you the task", target: t, note: detail };
    case "SECTION_SUBMITTED":
      return { actor, before: "submitted", target: t, after: "for review", note: null };
    case "SECTION_APPROVED":
      return { actor, before: "approved", target: t, note: "It's now locked." };
    case "SECTION_REOPENED":
      return { actor, before: "reopened", target: t, note: "You can edit it again." };
    case "MEMBER_JOINED":
      return { actor: null, before: "", target: t, after: "joined the project", note: null };
    case "DUE_SOON":
      return { actor: null, before: "", target: t, after: detail ? `· ${detail.toLowerCase()}` : "is due soon", note: null };
    default:
      return { actor, before: "", target: t, note: detail };
  }
}

export function relativeTime(iso: string) {
  const d = dayjs(iso);
  return dayjs().diff(d, "minute") < 1 ? "just now" : d.fromNow();
}

export function dayHeading(iso: string) {
  const d = dayjs(iso);
  if (d.isSame(dayjs(), "day")) return "Today";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return d.isSame(dayjs(), "year") ? d.format("dddd D MMMM") : d.format("D MMMM YYYY");
}
