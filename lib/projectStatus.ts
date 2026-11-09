import dayjs from "./dayjs";
import { Project, ProjectVisibility } from "./api/types";

export type ProjectStatus = {
  label: string;
  className: string;
};

/** Until tasks exist, status comes from the due date alone. */
export function getProjectStatus(project: Pick<Project, "dueDate">): ProjectStatus {
  if (project.dueDate) {
    const daysLeft = dayjs(project.dueDate).startOf("day").diff(dayjs().startOf("day"), "day");
    if (daysLeft < 0) {
      return { label: "Overdue", className: "bg-destructive text-white dark:bg-destructive/60" };
    }
    if (daysLeft <= 3) {
      return {
        label: daysLeft === 0 ? "Due Today" : "Due Soon",
        className: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
      };
    }
  }
  return {
    label: "In Progress",
    className: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  };
}

export const VISIBILITY_LABEL: Record<ProjectVisibility, string> = {
  PUBLIC: "Public Project",
  PRIVATE: "Private Project",
  ORGANIZATION: "Organization Project",
};
