import type { TaskPriority, TaskStatus, WorkItem } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";

export const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

/** Badge colours (same palette as section statuses). */
export const STATUS_BADGE: Record<TaskStatus, string> = {
  TODO: "bg-border text-text",
  IN_PROGRESS: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  IN_REVIEW: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  DONE: "bg-green-600/20 text-green-700 dark:text-green-300",
};

/** Timeline bar colours. */
export const STATUS_BAR: Record<TaskStatus, string> = {
  TODO: "bg-neutral-500",
  IN_PROGRESS: "bg-blue-600",
  IN_REVIEW: "bg-amber-500",
  DONE: "bg-green-600",
};

export const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: "bg-neutral-400",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-amber-400",
  URGENT: "bg-red-500",
};

export const toIsoDate = (d: Date | null) => (d ? dayjs(d).format("YYYY-MM-DD") : null);
export const fromIsoDate = (s: string | null) => (s ? dayjs(s).toDate() : null);

export function isOverdue(item: Pick<WorkItem, "dueDate" | "status">) {
  return !!item.dueDate && item.status !== "DONE" && dayjs(item.dueDate).isBefore(dayjs(), "day");
}

export function shortDate(iso: string | null) {
  if (!iso) return null;
  const d = dayjs(iso);
  return d.year() === dayjs().year() ? d.format("D MMM") : d.format("D MMM YYYY");
}

export function dateRangeLabel(item: Pick<WorkItem, "startDate" | "dueDate">) {
  if (item.startDate && item.dueDate && item.startDate !== item.dueDate) {
    return `${shortDate(item.startDate)} – ${shortDate(item.dueDate)}`;
  }
  return item.dueDate ? `Due ${shortDate(item.dueDate)}` : item.startDate ? `Starts ${shortDate(item.startDate)}` : null;
}
