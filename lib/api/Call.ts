import { api } from "./client";
import { ActiveCall, CallInfo, CallToken } from "./types";

/** A LiveKit token for the project's call (members only). */
export function getCallToken(projectId: string) {
  return api<CallToken>(`/projects/${encodeURIComponent(projectId)}/call/token`, { method: "POST" });
}

/** Who is in the project's call right now. */
export function getCall(projectId: string) {
  return api<CallInfo>(`/projects/${encodeURIComponent(projectId)}/call`);
}

/** Calls going on in my projects. */
export function listActiveCalls() {
  return api<ActiveCall[]>("/calls");
}
