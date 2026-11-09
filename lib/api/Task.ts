import { api } from "./client";
import {
  CreateTaskRequest,
  Project,
  TaskStatus,
  UpdateProjectRequest,
  UpdateTaskRequest,
  WorkItem,
} from "./types";

const json = (body: unknown) => JSON.stringify(body);

/** Tasks + document sections, for the board, list and timeline. */
export function listWorkItems(projectId: string) {
  return api<WorkItem[]>(`/projects/${projectId}/work-items`);
}

export function createTask(projectId: string, body: CreateTaskRequest) {
  return api<WorkItem>(`/projects/${projectId}/tasks`, { method: "POST", body: json(body) });
}

export function updateTask(taskId: string, body: UpdateTaskRequest) {
  return api<WorkItem>(`/tasks/${taskId}`, { method: "PUT", body: json(body) });
}

/** Board drag & drop. */
export function moveTask(taskId: string, status: TaskStatus, position: number) {
  return api<WorkItem>(`/tasks/${taskId}/move`, { method: "POST", body: json({ status, position }) });
}

export function deleteTask(taskId: string) {
  return api<void>(`/tasks/${taskId}`, { method: "DELETE" });
}

/** Timeline drag. Returns ids of dependent items that were pushed later. */
export function scheduleWorkItem(itemId: string, startDate: string | null, dueDate: string | null) {
  return api<{ shifted: string[] }>(`/work-items/${itemId}/schedule`, {
    method: "PUT",
    body: json({ startDate, dueDate }),
  });
}

export function setDependencies(itemId: string, dependsOn: string[]) {
  return api<{ shifted: string[] }>(`/work-items/${itemId}/dependencies`, {
    method: "PUT",
    body: json({ dependsOn }),
  });
}

export function updateProject(projectId: string, body: UpdateProjectRequest) {
  return api<Project>(`/projects/${projectId}`, { method: "PATCH", body: json(body) });
}
