import { api } from "./client";
import {
  AddMemberResult,
  DocumentDetail,
  Invite,
  InvitePreview,
  DocumentSummary,
  DocumentType,
  Member,
  PublishedSection,
  Section,
  SectionStatus,
  UpdateSectionRequest,
  VersionDetail,
  VersionSummary,
} from "./types";

const json = (body: unknown) => JSON.stringify(body);

// ---------- Documents ----------

export function listDocuments(projectId: string) {
  return api<DocumentSummary[]>(`/projects/${projectId}/documents`);
}

export function createDocument(
  projectId: string,
  body: { title: string; type?: DocumentType; template?: "BLANK" | "PROPOSAL" }
) {
  return api<DocumentDetail>(`/projects/${projectId}/documents`, { method: "POST", body: json(body) });
}

export function getDocument(id: string) {
  return api<DocumentDetail>(`/documents/${id}`);
}

/** Latest published version of every section, in order. */
export function getPublishedDocument(id: string) {
  return api<PublishedSection[]>(`/documents/${id}/published`);
}

// ---------- Sections (team leader) ----------

export function addSection(documentId: string, title: string) {
  return api<DocumentDetail>(`/documents/${documentId}/sections`, { method: "POST", body: json({ title }) });
}

export function reorderSections(documentId: string, sectionIds: string[]) {
  return api<DocumentDetail>(`/documents/${documentId}/sections/order`, {
    method: "PUT",
    body: json({ sectionIds }),
  });
}

export function updateSection(sectionId: string, body: UpdateSectionRequest) {
  return api<Section>(`/sections/${sectionId}`, { method: "PUT", body: json(body) });
}

export function deleteSection(sectionId: string) {
  return api<DocumentDetail>(`/sections/${sectionId}`, { method: "DELETE" });
}

export function changeSectionStatus(sectionId: string, status: SectionStatus) {
  return api<Section>(`/sections/${sectionId}/status`, { method: "POST", body: json({ status }) });
}

// ---------- Versions ("commits") ----------

/** Throws ApiError NO_CHANGES when nothing changed since the last version. */
export function publishSection(
  sectionId: string,
  body: { message?: string; contentJson: string; wordCount: number }
) {
  return api<VersionSummary>(`/sections/${sectionId}/versions`, { method: "POST", body: json(body) });
}

export function listVersions(sectionId: string) {
  return api<VersionSummary[]>(`/sections/${sectionId}/versions`);
}

export function getVersion(sectionId: string, number: number) {
  return api<VersionDetail>(`/sections/${sectionId}/versions/${number}`);
}

// ---------- Members ----------

export function listMembers(projectId: string) {
  return api<Member[]>(`/projects/${projectId}/members`);
}

/** Existing users join now; anyone else gets a pending invite (joins when they sign up). */
export function addMember(projectId: string, email: string) {
  return api<AddMemberResult>(`/projects/${projectId}/members`, { method: "POST", body: json({ email }) });
}

// ---------- Invites ----------

export function listPendingInvites(projectId: string) {
  return api<Invite[]>(`/projects/${projectId}/invites`);
}

export function revokeInvite(projectId: string, inviteId: string) {
  return api<void>(`/projects/${projectId}/invites/${inviteId}`, { method: "DELETE" });
}

export function getInviteLink(projectId: string) {
  return api<Invite>(`/projects/${projectId}/invite-link`);
}

export function resetInviteLink(projectId: string) {
  return api<Invite>(`/projects/${projectId}/invite-link/reset`, { method: "POST" });
}

export function getInvite(token: string) {
  return api<InvitePreview>(`/invites/${encodeURIComponent(token)}`);
}

export function acceptInvite(token: string) {
  return api<{ projectId: string; alreadyMember: boolean }>(`/invites/${encodeURIComponent(token)}/accept`, {
    method: "POST",
  });
}

export function renameDocument(id: string, title: string) {
  return api<DocumentDetail>(`/documents/${id}`, { method: "PATCH", body: json({ title }) });
}

export function deleteDocument(id: string) {
  return api<void>(`/documents/${id}`, { method: "DELETE" });
}
