import type { Section, SectionStatus } from "@/lib/api/types";

export const STATUS_LABEL: Record<SectionStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Approved",
};

export const STATUS_CLASS: Record<SectionStatus, string> = {
  NOT_STARTED: "bg-border text-text",
  IN_PROGRESS: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  IN_REVIEW: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  DONE: "bg-green-600/20 text-green-700 dark:text-green-300",
};

/** "300–500", "300+", "≤500" or null. */
export function wordTargetLabel(section: Pick<Section, "wordTargetMin" | "wordTargetMax">) {
  const { wordTargetMin: min, wordTargetMax: max } = section;
  if (min != null && max != null) return `${min}–${max}`;
  if (min != null) return `${min}+`;
  if (max != null) return `≤${max}`;
  return null;
}

export function isWithinTarget(words: number, section: Pick<Section, "wordTargetMin" | "wordTargetMax">) {
  if (section.wordTargetMin != null && words < section.wordTargetMin) return false;
  if (section.wordTargetMax != null && words > section.wordTargetMax) return false;
  return true;
}

export function assigneeNames(section: Section) {
  return section.assignees.map((a) => a.name || a.email).join(", ");
}

/** Why the current user can't edit this section (shown to viewers). */
export function viewOnlyReason(section: Section) {
  if (section.status === "DONE") return "Approved by the team leader · locked";
  if (section.assignees.length === 0) return "Not assigned yet · only the team leader can edit";
  return `Assigned to ${assigneeNames(section)} · view only`;
}
