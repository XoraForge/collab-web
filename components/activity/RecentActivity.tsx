"use client";

import { listActivity, listProjectActivity } from "@/lib/api/Activity";
import type { Activity } from "@/lib/api/types";
import { useCallback, useEffect, useState } from "react";
import ActivityList from "./ActivityList";

/**
 * Activity across my projects (or one project), newest first, with "Load more".
 * Refreshes when the tab regains focus.
 */
export default function RecentActivity({
  limit = 30,
  projectId,
  paged = false,
}: {
  limit?: number;
  projectId?: string;
  /** Show a "Load more" button. */
  paged?: boolean;
}) {
  const [items, setItems] = useState<Activity[] | null>(null);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    (before?: string) => (projectId ? listProjectActivity(projectId, before, limit) : listActivity(before, limit)),
    [projectId, limit]
  );

  const load = useCallback(
    () =>
      fetchPage()
        .then((list) => {
          setItems(list);
          setHasMore(list.length === limit);
          setError(false);
        })
        .catch(() => setError(true)),
    [fetchPage, limit]
  );

  useEffect(() => {
    setItems(null);
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [load]);

  async function loadMore() {
    if (!items?.length) return;
    setLoadingMore(true);
    try {
      const older = await fetchPage(items[items.length - 1].createdAt);
      setItems((list) => [...(list ?? []), ...older.filter((o) => !list?.some((i) => i.id === o.id))]);
      setHasMore(older.length === limit);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  if (error && !items) return <p className="p-2 text-sm text-muted-text">Couldn&apos;t load activity.</p>;
  if (!items) return <p className="p-2 text-sm text-muted-text">Loading…</p>;
  if (items.length === 0) {
    return <p className="p-2 text-sm text-muted-text">Nothing has happened in your projects yet.</p>;
  }

  return (
    <div className="flex flex-col gap-y-4 py-1">
      <ActivityList items={items} showProject={!projectId} />
      {paged && hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="self-start rounded-md border px-3 py-1.5 text-sm hover:bg-hover disabled:opacity-50"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
