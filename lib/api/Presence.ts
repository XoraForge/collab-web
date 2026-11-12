import { api } from "./client";
import { UserSummary } from "./types";

/** People I share a project with who are online now. */
export function listOnlineTeammates() {
  return api<UserSummary[]>("/teammates/online");
}
