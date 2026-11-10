"use client";

import ProjectSubnav from "@/components/dashboard/project/ProjectSubnav";
import { Button } from "@/components/ui/button";
import { personName, relativeTime } from "@/lib/activityText";
import { ApiError } from "@/lib/api/client";
import { createNote, deleteNote, listProjectNotes, renameNote } from "@/lib/api/Notes";
import { getProject } from "@/lib/api/Project";
import type { Note, Project } from "@/lib/api/types";
import { ProjectEvent, useProjectEvents } from "@/lib/realtime";
import { useToast } from "@/lib/ToastContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, NotebookPen, Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import NoteEditor from "./NoteEditor";

/** A project's shared notes: list on the left, the open note on the right. */
export default function ProjectNotesPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const toast = useToast();
  const noteId = useSearchParams().get("note");
  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(
    () =>
      listProjectNotes(projectId)
        .then((list) => {
          setNotes(list);
          setError("");
        })
        .catch((err) =>
          setError(err instanceof ApiError && err.status === 404 ? "Project not found." : "Couldn't load notes.")
        ),
    [projectId]
  );

  useEffect(() => {
    getProject(projectId).then(setProject).catch(() => undefined);
    load();
  }, [projectId, load]);

  // Autosaves fire NOTES_CHANGED every few seconds while someone types; refresh the list at most once a second.
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useProjectEvents(
    projectId,
    useCallback(
      (event: ProjectEvent) => {
        if (event.type !== "NOTES_CHANGED") return;
        if (reloadTimer.current) return;
        reloadTimer.current = setTimeout(() => {
          reloadTimer.current = null;
          load();
        }, 1000);
      },
      [load]
    )
  );
  useEffect(() => () => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
  }, []);

  const open = (id: string | null) => router.replace(id ? `?note=${id}` : "?", { scroll: false });
  const selected = notes?.find((n) => n.id === noteId) ?? null;

  async function addNote() {
    setCreating(true);
    try {
      const note = await createNote(projectId, "Untitled note");
      setNotes((list) => [note, ...(list ?? [])]);
      open(note.id);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't create the note.");
    } finally {
      setCreating(false);
    }
  }

  async function remove(note: Note) {
    if (!window.confirm(`Delete "${note.title}" for everyone?`)) return;
    try {
      await deleteNote(note.id);
      setNotes((list) => list?.filter((n) => n.id !== note.id) ?? null);
      if (noteId === note.id) open(null);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't delete the note.");
    }
  }

  const onGone = useCallback(() => {
    toast("This note was deleted.");
    router.replace("?", { scroll: false });
    load();
  }, [toast, router, load]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-bg text-text">
      <ProjectSubnav project={project} />
      <div className="flex flex-1 min-h-0">
        <aside className={cn("w-full md:w-72 md:shrink-0 border-r flex flex-col min-h-0", noteId && "hidden md:flex")}>
          <div className="flex items-center justify-between px-3 py-2.5 border-b">
            <h1 className="font-semibold">Notes</h1>
            <Button size="sm" onClick={addNote} disabled={creating}>
              <Plus size={14} /> New note
            </Button>
          </div>
          <div className="grow min-h-0 overflow-y-auto small-scrollbar">
            {error ? (
              <p className="p-4 text-sm text-muted-text">{error}</p>
            ) : !notes ? (
              <p className="p-4 text-sm text-muted-text">Loading…</p>
            ) : notes.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center gap-y-1.5">
                <NotebookPen size={22} className="opacity-50" />
                <p className="text-sm font-medium">No notes yet</p>
                <p className="text-xs text-muted-text">
                  Meeting notes, ideas, links: anything the team should keep. Everyone can edit, live.
                </p>
              </div>
            ) : (
              <ul>
                {notes.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => open(n.id)}
                      aria-current={n.id === noteId ? "true" : undefined}
                      className={cn(
                        "w-full text-left px-3 py-2.5 border-b border-border hover:bg-hover flex flex-col gap-y-0.5",
                        n.id === noteId && "bg-hover"
                      )}
                    >
                      <span className="text-sm font-semibold truncate">{n.title}</span>
                      <span className="text-xs text-muted-text line-clamp-2">{n.preview || "Empty note"}</span>
                      <span className="text-[11px] text-muted-text" suppressHydrationWarning>
                        {n.updatedAt ? `${personName(n.updatedBy)} · ${relativeTime(n.updatedAt)}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className={cn("grow min-w-0 flex flex-col min-h-0", !noteId && "hidden md:flex")}>
          {selected ? (
            <>
              <div className="flex items-center gap-x-2 px-3 py-2 border-b">
                <button type="button" aria-label="Back to notes" className="md:hidden rounded p-1 hover:bg-hover" onClick={() => open(null)}>
                  <ChevronLeft size={16} />
                </button>
                <NoteTitle key={`${selected.id}:${selected.title}`} note={selected} onRenamed={(n) => setNotes((list) => list?.map((x) => (x.id === n.id ? n : x)) ?? null)} />
                {selected.canDelete && (
                  <button
                    type="button"
                    aria-label="Delete note"
                    title="Delete note"
                    onClick={() => remove(selected)}
                    className="rounded p-1.5 text-muted-text hover:text-red-400 hover:bg-hover"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <NoteEditor key={selected.id} noteId={selected.id} projectId={projectId} onGone={onGone} />
            </>
          ) : noteId && notes && !error ? (
            <p className="m-auto text-sm text-muted-text">This note doesn&apos;t exist anymore.</p>
          ) : (
            <div className="m-auto flex flex-col items-center gap-y-2 text-center p-6">
              <NotebookPen size={26} className="opacity-50" />
              <p className="font-medium">Pick a note or start a new one</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** Click-to-edit title; saves on Enter or when you click away. */
function NoteTitle({ note, onRenamed }: { note: Note; onRenamed: (note: Note) => void }) {
  const toast = useToast();
  // Remounted (via key) when the note or its saved title changes.
  const [value, setValue] = useState(note.title);

  async function save() {
    const title = value.trim();
    if (!title) return setValue(note.title);
    if (title === note.title) return;
    try {
      onRenamed(await renameNote(note.id, title));
    } catch (err) {
      setValue(note.title);
      toast(err instanceof ApiError ? err.message : "Couldn't rename the note.");
    }
  }

  return (
    <input
      value={value}
      maxLength={200}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setValue(note.title);
          e.currentTarget.blur();
        }
      }}
      aria-label="Note title"
      className="grow min-w-0 bg-transparent text-lg font-semibold rounded px-1.5 py-0.5 outline-none hover:bg-hover focus:bg-hover"
    />
  );
}
