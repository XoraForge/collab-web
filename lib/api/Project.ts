import { api } from "./client";
import { CreateProjectRequest, Project } from "./types";

/** Projects the signed-in user is a member of. */
export function listProjects() {
  return api<Project[]>("/projects");
}

export function getProject(id: string) {
  return api<Project>(`/projects/${encodeURIComponent(id)}`);
}

/** Throws ApiError with code PROJECT_LIMIT_REACHED at the Free plan limit. */
export function createProject(project: CreateProjectRequest) {
  return api<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}
