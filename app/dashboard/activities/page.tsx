"use client";

import RecentActivity from "@/components/activity/RecentActivity";
import { useSession } from "@/lib/SessionContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ActivitiesPage() {
  const { projects } = useSession();
  const router = useRouter();
  const projectId = useSearchParams().get("project") ?? "";

  return (
    <div className="flex flex-col gap-y-5 px-4 sm:px-8 py-6 text-text max-w-3xl w-full">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-sm text-muted-text">Everything that happened in your projects, newest first.</p>
        </div>
        <label className="flex items-center gap-x-2 text-sm">
          <span className="text-muted-text">Project</span>
          <select
            value={projectId}
            onChange={(e) => router.replace(e.target.value ? `?project=${e.target.value}` : "?", { scroll: false })}
            className="rounded-md border bg-background px-2 py-1.5 text-sm"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="rounded-md border bg-card dark:bg-(--default-sidebar) p-4">
        <RecentActivity key={projectId || "all"} projectId={projectId || undefined} paged />
      </div>
    </div>
  );
}

export default function Page() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense>
      <ActivitiesPage />
    </Suspense>
  );
}
