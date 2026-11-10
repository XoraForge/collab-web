"use client";

import { personName, relativeTime } from "@/lib/activityText";
import { listAllNotes } from "@/lib/api/Notes";
import type { Note } from "@/lib/api/types";
import { useSession } from "@/lib/SessionContext";
import { NotebookPen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Notes from all of my projects, grouped by project. */
export default function Page() {
  const { projects } = useSession();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = () =>
      listAllNotes()
        .then((list) => {
          setNotes(list);
          setError(false);
        })
        .catch(() => setError(true));
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  const byProject = projects
    .map((p) => ({ project: p, notes: (notes ?? []).filter((n) => n.projectId === p.id) }))
    .filter((g) => g.notes.length > 0);

  return (
    <div className="flex flex-col gap-y-6 px-4 sm:px-8 py-6 text-text">
      <div>
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-sm text-muted-text">Shared notes from all your projects. Everyone in a project can edit its notes.</p>
      </div>

      {error && !notes ? (
        <p className="text-sm text-muted-text">Couldn&apos;t load notes.</p>
      ) : !notes ? (
        <p className="text-sm text-muted-text">Loading…</p>
      ) : byProject.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 flex flex-col items-center gap-y-2 text-center">
          <NotebookPen size={24} className="opacity-50" />
          <p className="font-medium">No notes yet</p>
          <p className="text-sm text-muted-text max-w-sm">Open a project and go to its Notes tab to write the first one.</p>
          {projects.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {projects.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/dashboard/project/${p.id}/notes`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-hover">
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        byProject.map(({ project, notes: list }) => (
          <section key={project.id} className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{project.name}</h2>
              <Link href={`/dashboard/project/${project.id}/notes`} className="text-xs text-muted-text hover:text-text hover:underline">
                Open notes
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
              {list.map((n) => (
                <Link
                  key={n.id}
                  href={`/dashboard/project/${project.id}/notes?note=${n.id}`}
                  className="rounded-md border bg-card dark:bg-(--default-sidebar) p-3 flex flex-col gap-y-1 hover:bg-hover transition-colors"
                >
                  <span className="font-semibold text-sm truncate">{n.title}</span>
                  <span className="text-xs text-muted-text line-clamp-3 min-h-[3em]">{n.preview || "Empty note"}</span>
                  <span className="text-[11px] text-muted-text" suppressHydrationWarning>
                    {n.updatedAt ? `${personName(n.updatedBy)} · ${relativeTime(n.updatedAt)}` : ""}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
