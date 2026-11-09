"use client";

import { useEffect, useState } from "react";
import { listWorkItems } from "./api/Task";
import type { Project, WorkItem } from "./api/types";
import { useSession } from "./SessionContext";

export type ProjectWorkItem = WorkItem & { projectId: string; projectName: string };

/** Tasks and sections from every project you're in (dashboard + schedule). */
export function useAllWork() {
  const { projects, isLoading: sessionLoading } = useSession();
  const [items, setItems] = useState<ProjectWorkItem[] | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    let cancelled = false;
    Promise.all(
      projects.map((p: Project) =>
        listWorkItems(p.id)
          .then((list) => list.map((i) => ({ ...i, projectId: p.id, projectName: p.name })))
          .catch(() => [] as ProjectWorkItem[])
      )
    ).then((lists) => !cancelled && setItems(lists.flat()));
    return () => {
      cancelled = true;
    };
  }, [projects, sessionLoading]);

  return { projects, items, isLoading: sessionLoading || items === null };
}
