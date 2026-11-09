"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE, STATUS_LABEL, isOverdue, shortDate } from "@/components/tasks/taskMeta";
import dayjs from "@/lib/dayjs";
import { useDialogContext } from "@/lib/DialogContext";
import { getProjectStatus, VISIBILITY_LABEL } from "@/lib/projectStatus";
import { useSession } from "@/lib/SessionContext";
import { useAllWork } from "@/lib/useAllWork";
import { cn } from "@/lib/utils";
import { BookOpenText, CalendarClock, Diamond, FileText, Plus } from "lucide-react";
import Link from "next/link";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-md border bg-card dark:bg-(--default-sidebar) flex flex-col min-h-0">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </header>
      <div className="p-2 flex flex-col">{children}</div>
    </section>
  );
}

export default function DashboardHome() {
  const { me } = useSession();
  const { projects, items, isLoading } = useAllWork();
  const { handleOpenDialog } = useDialogContext();
  const firstName = (me?.user.name || "").split(" ")[0];

  const myOpenTasks = (items ?? [])
    .filter((i) => i.status !== "DONE" && me && i.assignees.some((a) => a.id === me.user.id))
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 8);

  const horizon = dayjs().add(30, "day");
  const deadlines = [
    ...(items ?? [])
      .filter((i) => i.milestone && i.dueDate && i.status !== "DONE")
      .map((i) => ({ key: i.id, title: i.title, project: i.projectName, projectId: i.projectId, date: i.dueDate!, kind: "milestone" as const })),
    ...projects
      .filter((p) => p.dueDate)
      .map((p) => ({ key: `p-${p.id}`, title: `${p.name} due`, project: p.name, projectId: p.id, date: p.dueDate!, kind: "project" as const })),
  ]
    .filter((d) => !dayjs(d.date).isBefore(dayjs(), "day") && dayjs(d.date).isBefore(horizon))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-y-6 px-8 py-6 text-text">
      <div>
        <p className="text-sm text-muted-text" suppressHydrationWarning>
          {dayjs().format("dddd, D MMMM YYYY")}
        </p>
        <h1 className="text-2xl font-bold" suppressHydrationWarning>
          {greeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
      </div>

      {/* Projects */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {projects.map((project) => {
          const projectItems = (items ?? []).filter((i) => i.projectId === project.id);
          const done = projectItems.filter((i) => i.status === "DONE").length;
          const pct = projectItems.length ? Math.round((done / projectItems.length) * 100) : 0;
          const status = getProjectStatus(project);
          return (
            <Link
              key={project.id}
              href={`/dashboard/project/${project.id}`}
              className="rounded-md border bg-card dark:bg-(--default-sidebar) p-4 flex flex-col gap-y-3 hover:border-divider hover:bg-hover transition-colors"
            >
              <div className="flex items-start justify-between gap-x-3">
                <div className="flex items-center gap-x-3 min-w-0">
                  <span className="size-10 shrink-0 rounded-md border border-border overflow-hidden flex items-center justify-center">
                    {project.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- data URL from the API
                      <img src={project.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <BookOpenText size={18} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{project.name}</p>
                    <p className="text-xs text-muted-text">{VISIBILITY_LABEL[project.visibility]}</p>
                  </div>
                </div>
                <Badge className={status.className}>{status.label}</Badge>
              </div>
              <div className="flex flex-col gap-y-1.5">
                <div className="flex justify-between text-xs text-muted-text">
                  <span>{isLoading ? "…" : `${done}/${projectItems.length} done`}</span>
                  <span>{project.dueDate ? `Due ${shortDate(project.dueDate)}` : "No due date"}</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${project.name} progress`}>
                  <div className="h-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => handleOpenDialog("projectCreation")}
          className="rounded-md border border-dashed border-divider p-4 flex flex-col items-center justify-center gap-y-1 text-sm text-muted-text hover:bg-hover hover:text-text min-h-[132px]"
        >
          <Plus size={18} /> New project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Card title="My tasks">
          {isLoading ? (
            <p className="p-3 text-sm text-muted-text">Loading…</p>
          ) : myOpenTasks.length === 0 ? (
            <p className="p-3 text-sm text-muted-text">Nothing assigned to you right now. 🎉</p>
          ) : (
            myOpenTasks.map((task) => (
              <Link
                key={task.id}
                href={
                  task.kind === "SECTION" && task.documentId
                    ? `/dashboard/project/${task.projectId}/files/${task.documentId}?section=${task.id}`
                    : `/dashboard/project/${task.projectId}/assignments`
                }
                className="flex items-center justify-between gap-x-3 rounded-sm px-2 py-2 hover:bg-hover"
              >
                <span className="flex items-center gap-x-2 min-w-0">
                  {task.kind === "SECTION" && <FileText size={13} className="shrink-0 text-muted-text" />}
                  <span className="text-sm truncate">{task.title}</span>
                  <span className="text-xs text-muted-text truncate">· {task.projectName}</span>
                </span>
                <span className="flex items-center gap-x-2 shrink-0">
                  <Badge className={STATUS_BADGE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                  {task.dueDate && (
                    <span className={cn("text-xs w-16 text-right", isOverdue(task) ? "text-red-400 font-medium" : "text-muted-text")}>
                      {isOverdue(task) ? "Overdue" : shortDate(task.dueDate)}
                    </span>
                  )}
                </span>
              </Link>
            ))
          )}
        </Card>

        <Card
          title="Upcoming deadlines"
          action={
            <Link href="/dashboard/schedule" className="text-xs text-muted-text hover:text-text">
              Calendar
            </Link>
          }
        >
          {deadlines.length === 0 ? (
            <p className="p-3 text-sm text-muted-text">No deadlines in the next 30 days.</p>
          ) : (
            deadlines.map((d) => (
              <Link
                key={d.key}
                href={`/dashboard/project/${d.projectId}/assignments?view=timeline`}
                className="flex items-center justify-between gap-x-3 rounded-sm px-2 py-2 hover:bg-hover"
              >
                <span className="flex items-center gap-x-2 min-w-0">
                  {d.kind === "milestone" ? (
                    <Diamond size={12} className="shrink-0 text-amber-400" />
                  ) : (
                    <CalendarClock size={13} className="shrink-0 text-red-400" />
                  )}
                  <span className="text-sm truncate">{d.title}</span>
                </span>
                <span className="text-xs text-muted-text shrink-0" suppressHydrationWarning>
                  {dayjs(d.date).isSame(dayjs(), "day") ? "Today" : `${shortDate(d.date)} · ${dayjs(d.date).fromNow()}`}
                </span>
              </Link>
            ))
          )}
        </Card>
      </div>

    </div>
  );
}
