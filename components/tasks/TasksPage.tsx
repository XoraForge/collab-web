"use client";

import ProjectSubnav from "@/components/dashboard/project/ProjectSubnav";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { listMembers } from "@/lib/api/Document";
import { getProject } from "@/lib/api/Project";
import { listWorkItems, moveTask, scheduleWorkItem } from "@/lib/api/Task";
import type { Member, Project, TaskStatus, WorkItem } from "@/lib/api/types";
import { ProjectEvent, useProjectEvents } from "@/lib/realtime";
import { useSession } from "@/lib/SessionContext";
import { cn } from "@/lib/utils";
import { GanttChart, KanbanSquare, List, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BoardView from "./BoardView";
import ListView from "./ListView";
import TaskDialog, { TaskDialogState } from "./TaskDialog";
import TimelineView, { TimelineZoom } from "./TimelineView";

type View = "board" | "list" | "timeline";
const VIEWS: { id: View; label: string; icon: typeof List }[] = [
  { id: "board", label: "Board", icon: KanbanSquare },
  { id: "list", label: "List", icon: List },
  { id: "timeline", label: "Timeline", icon: GanttChart },
];

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        checked ? "bg-text text-bg border-transparent" : "hover:bg-hover"
      )}
    >
      {children}
    </button>
  );
}

export default function TasksPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as View) ?? "board";
  const { me } = useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<WorkItem[] | null>(null);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<TaskDialogState | null>(null);
  const [notice, setNotice] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [showSections, setShowSections] = useState(true);
  const [zoom, setZoom] = useState<TimelineZoom>("day");
  const [showCritical, setShowCritical] = useState(false);

  const load = useCallback(
    () =>
      Promise.all([getProject(projectId), listWorkItems(projectId), listMembers(projectId)])
        .then(([p, list, m]) => {
          setProject(p);
          setItems(list);
          setMembers(m);
        })
        .catch((err) =>
          setError(err instanceof ApiError && err.status === 404 ? "Project not found." : "Couldn't load tasks.")
        ),
    [projectId]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Links from notifications and activity (?task=<id>) open that task until it's closed.
  const linkedTask = searchParams.get("task");
  const [closedLink, setClosedLink] = useState<string | null>(null);
  const linkedItem = linkedTask && linkedTask !== closedLink ? items?.find((i) => i.id === linkedTask) : undefined;
  const activeDialog: TaskDialogState | null = dialog ?? (linkedItem ? { mode: "edit", item: linkedItem } : null);

  // Teammates' changes appear live.
  useProjectEvents(
    projectId,
    useCallback(
      (event: ProjectEvent) => {
        if (["TASKS_CHANGED", "DOCUMENT_CHANGED", "DOCUMENTS_CHANGED", "MEMBERS_CHANGED", "PROJECT_CHANGED"].includes(event.type)) load();
      },
      [load]
    )
  );

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  function setView(next: View) {
    router.replace(`?view=${next}`, { scroll: false });
  }

  async function handleMove(item: WorkItem, status: TaskStatus, position: number) {
    if (item.status === status && item.position === position) return;
    // Optimistic: show the card in its new column right away.
    setItems((list) => list?.map((i) => (i.id === item.id ? { ...i, status, position: position - 0.5 } : i)) ?? null);
    try {
      await moveTask(item.id, status, position);
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : "Couldn't move the task.");
    }
    load();
  }

  async function handleSchedule(item: WorkItem, startDate: string | null, dueDate: string) {
    setItems((list) => list?.map((i) => (i.id === item.id ? { ...i, startDate, dueDate } : i)) ?? null);
    try {
      const { shifted } = await scheduleWorkItem(item.id, startDate, dueDate);
      // Redraw first, so the message matches what's on screen.
      await load();
      if (shifted.length) setNotice(`${shifted.length} dependent item${shifted.length === 1 ? " was" : "s were"} moved later.`);
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : "Couldn't reschedule.");
      load();
    }
  }

  const visible = (items ?? []).filter(
    (i) =>
      (showSections || i.kind === "TASK") &&
      (!onlyMine || (me && i.assignees.some((a) => a.id === me.user.id)))
  );
  const total = items?.length ?? 0;
  const done = items?.filter((i) => i.status === "DONE").length ?? 0;

  if (error) {
    return <p className="p-8 text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-bg text-text">
      <ProjectSubnav
        project={project}
        actions={
          <Button size="sm" onClick={() => setDialog({ mode: "create" })} disabled={!project}>
            <Plus /> New task
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-x-4 px-6 py-3 flex-wrap gap-y-2">
        <div className="flex items-center gap-x-1 rounded-md border p-0.5" role="tablist" aria-label="View">
          {VIEWS.map(({ id, label, icon: ViewIcon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-x-1.5 rounded-sm px-3 py-1 text-xs font-medium",
                view === id ? "bg-hover text-text" : "text-muted-text hover:text-text"
              )}
            >
              <ViewIcon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-x-2 flex-wrap gap-y-2">
          {total > 0 && (
            <span className="text-xs text-muted-text mr-2">
              {done}/{total} done
            </span>
          )}
          <Toggle checked={onlyMine} onChange={setOnlyMine}>My tasks</Toggle>
          <Toggle checked={showSections} onChange={setShowSections}>Document sections</Toggle>
          {view === "timeline" && (
            <>
              <Toggle checked={showCritical} onChange={setShowCritical}>Critical path</Toggle>
              <div className="flex items-center rounded-md border p-0.5 text-xs">
                {(["day", "week"] as const).map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    aria-pressed={zoom === z}
                    className={cn("rounded-sm px-2 py-0.5", zoom === z ? "bg-hover" : "text-muted-text hover:text-text")}
                  >
                    {z === "day" ? "Days" : "Weeks"}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-6 overflow-auto small-scrollbar relative">
        {notice && (
          <div role="status" className="sticky top-0 z-30 mx-auto mb-2 w-fit rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
            {notice}
          </div>
        )}
        {items === null || !project ? (
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-64 rounded-md bg-border/40 animate-pulse" />)}
          </div>
        ) : view === "list" ? (
          <ListView items={visible} onOpen={(item) => setDialog({ mode: "edit", item })} />
        ) : view === "timeline" ? (
          <TimelineView
            items={visible}
            project={project}
            zoom={zoom}
            showCritical={showCritical}
            onOpen={(item) => setDialog({ mode: "edit", item })}
            onCreateAt={(date) => setDialog({ mode: "create", startDate: date, dueDate: date })}
            onSchedule={handleSchedule}
          />
        ) : (
          <BoardView
            items={visible}
            onOpen={(item) => setDialog({ mode: "edit", item })}
            onCreate={(status) => setDialog({ mode: "create", status })}
            onMove={handleMove}
          />
        )}
      </div>

      {project && (
        <TaskDialog
          state={activeDialog}
          projectId={project.id}
          members={members}
          items={items ?? []}
          onClose={() => {
            setDialog(null);
            setClosedLink(linkedTask);
          }}
          onSaved={(message) => {
            if (message) setNotice(message);
            load();
          }}
        />
      )}
    </div>
  );
}
