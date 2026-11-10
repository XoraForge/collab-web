"use client";

import { listProjectActivity } from "@/lib/api/Activity";
import type { Activity } from "@/lib/api/types";
import { ProjectEvent, useProjectEvents } from "@/lib/realtime";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ActivityList from "./ActivityList";

/** "Recent Activities" on the project page: the latest entries, updated live. */
export default function ProjectActivity({ projectId, limit = 8 }: { projectId: string; limit?: number }) {
  const [items, setItems] = useState<Activity[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(
    () =>
      listProjectActivity(projectId, undefined, limit)
        .then((list) => {
          setItems(list);
          setError(false);
        })
        .catch(() => setError(true)),
    [projectId, limit]
  );

  useEffect(() => {
    load();
  }, [load]);

  useProjectEvents(
    projectId,
    useCallback((event: ProjectEvent) => {
      if (event.type === "ACTIVITY_ADDED") load();
    }, [load])
  );

  if (error && !items) return <p className="text-sm text-muted-text mt-3">Couldn&apos;t load activity.</p>;
  if (!items) return <p className="text-sm text-muted-text mt-3">Loading…</p>;
  if (items.length === 0) return <p className="text-sm text-muted-text mt-3">Nothing has happened yet.</p>;

  return (
    <div className="mt-3 flex flex-col gap-y-3">
      <ActivityList items={items} compact />
      <Link href={`/dashboard/activities?project=${projectId}`} className="text-xs text-muted-text hover:text-text hover:underline self-start">
        See all activity
      </Link>
    </div>
  );
}
