import { api } from "./client";
import { Note, NoteDetail } from "./types";

/** Notes from all of my projects, most recently edited first. */
export function listAllNotes() {
  return api<Note[]>("/notes");
}

export function listProjectNotes(projectId: string) {
  return api<Note[]>(`/projects/${encodeURIComponent(projectId)}/notes`);
}

export function createNote(projectId: string, title: string) {
  return api<Note>(`/projects/${encodeURIComponent(projectId)}/notes`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function getNote(noteId: string) {
  return api<NoteDetail>(`/notes/${encodeURIComponent(noteId)}`);
}

export function renameNote(noteId: string, title: string) {
  return api<Note>(`/notes/${encodeURIComponent(noteId)}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export function deleteNote(noteId: string) {
  return api<void>(`/notes/${encodeURIComponent(noteId)}`, { method: "DELETE" });
}
