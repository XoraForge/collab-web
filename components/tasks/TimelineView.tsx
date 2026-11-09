"use client";

import Avatar from "@/components/common/Avatar";
import type { Project, WorkItem } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { Dayjs } from "dayjs";
import { FileText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { computeCriticalPath } from "./criticalPath";
import { STATUS_BAR, STATUS_LABEL, dateRangeLabel } from "./taskMeta";

const ROW_H = 40;
const LEFT_W = 260;
const HEADER_H = 52;
const ZOOM_W = { day: 36, week: 14 } as const;
export type TimelineZoom = keyof typeof ZOOM_W;

type DragMode = "move" | "start" | "end";
type Drag = { id: string; mode: DragMode; originX: number; delta: number; moved: boolean };

const ISO = "YYYY-MM-DD";

/**
 * Gantt timeline. Bars run from start to due; arrows show "waits for" links.
 * Dragging a bar reschedules it, and the API pushes dependent items later.
 */
export default function TimelineView({
  items,
  project,
  zoom,
  showCritical,
  onOpen,
  onCreateAt,
  onSchedule,
}: {
  items: WorkItem[];
  project: Project;
  zoom: TimelineZoom;
  showCritical: boolean;
  onOpen: (item: WorkItem) => void;
  /** Double-click on an empty day. */
  onCreateAt: (dateIso: string) => void;
  onSchedule: (item: WorkItem, startDate: string | null, dueDate: string) => void;
}) {
  const W = ZOOM_W[zoom];
  const [drag, setDrag] = useState<Drag | null>(null);
  const suppressClick = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scheduled = useMemo(
    () =>
      items
        .filter((i) => i.dueDate)
        .sort((a, b) => (a.startDate ?? a.dueDate!).localeCompare(b.startDate ?? b.dueDate!) || a.title.localeCompare(b.title)),
    [items]
  );
  const unscheduled = items.filter((i) => !i.dueDate);
  const critical = useMemo(() => (showCritical ? computeCriticalPath(items) : null), [items, showCritical]);

  // Visible range: project dates and all items, with some padding.
  const { rangeStart, days } = useMemo(() => {
    const dates = [
      project.startDate,
      project.dueDate,
      dayjs().format(ISO),
      ...scheduled.flatMap((i) => [i.startDate, i.dueDate]),
    ].filter(Boolean) as string[];
    const min = dates.reduce((a, b) => (a < b ? a : b));
    const max = dates.reduce((a, b) => (a > b ? a : b));
    const start = dayjs(min).subtract(3, "day").startOf("day");
    const end = dayjs(max).add(zoom === "week" ? 21 : 10, "day");
    return { rangeStart: start, days: end.diff(start, "day") + 1 };
  }, [project.startDate, project.dueDate, scheduled, zoom]);

  const dayList = useMemo(() => Array.from({ length: days }, (_, i) => rangeStart.add(i, "day")), [rangeStart, days]);
  const x = (d: Dayjs | string) => dayjs(d).startOf("day").diff(rangeStart, "day") * W;

  // Dates of an item, including an in-progress drag.
  function displayed(item: WorkItem) {
    const due = dayjs(item.dueDate!);
    const start = item.startDate ? dayjs(item.startDate) : null;
    if (!drag || drag.id !== item.id || drag.delta === 0) return { start, due };
    const d = drag.delta;
    if (drag.mode === "move") return { start: start?.add(d, "day") ?? null, due: due.add(d, "day") };
    if (drag.mode === "end") {
      const newDue = due.add(d, "day");
      const s = start ?? due;
      return { start, due: newDue.isBefore(s) ? s : newDue };
    }
    const newStart = (start ?? due).add(d, "day");
    return { start: newStart.isAfter(due) ? due : newStart, due };
  }

  function geometry(item: WorkItem) {
    const { start, due } = displayed(item);
    const s = start ?? due;
    return { left: x(s), width: (due.diff(s, "day") + 1) * W, start, due };
  }

  const rowOf = new Map(scheduled.map((item, i) => [item.id, i]));

  function onPointerDown(e: React.PointerEvent, item: WorkItem, mode: DragMode) {
    if (!item.canSchedule || e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ id: item.id, mode, originX: e.clientX, delta: 0, moved: false });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const delta = Math.round((e.clientX - drag.originX) / W);
    const moved = drag.moved || Math.abs(e.clientX - drag.originX) > 3;
    if (delta !== drag.delta || moved !== drag.moved) setDrag({ ...drag, delta, moved });
  }

  function onPointerUp(item: WorkItem) {
    if (!drag || drag.id !== item.id) return;
    const { start, due } = displayed(item);
    const changed = drag.delta !== 0;
    suppressClick.current = drag.moved;
    setDrag(null);
    if (changed) onSchedule(item, start ? start.format(ISO) : null, due.format(ISO));
  }

  const today = dayjs().startOf("day");
  const gridW = days * W;

  // Open scrolled to about a week before today, so current work is in view.
  const todayOffset = today.diff(rangeStart, "day") * W;
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, todayOffset - 7 * W);
  }, [todayOffset, W]);
  const gridH = scheduled.length * ROW_H;

  // Month header segments
  const months: { label: string; left: number; width: number }[] = [];
  dayList.forEach((d, i) => {
    const last = months[months.length - 1];
    const label = d.format("MMM YYYY");
    if (last && last.label === label) last.width += W;
    else months.push({ label, left: i * W, width: W });
  });

  return (
    <div className="flex flex-col gap-y-4 min-h-0">
      <div ref={scrollRef} className="relative overflow-auto small-scrollbar rounded-md border bg-bg/40 max-h-[calc(100vh-260px)]">
        <div className="relative" style={{ width: LEFT_W + gridW, height: HEADER_H + Math.max(gridH, ROW_H * 3) }}>
          {/* Header */}
          <div className="sticky top-0 z-20 flex bg-card dark:bg-(--default-sidebar) border-b" style={{ height: HEADER_H }}>
            <div className="sticky left-0 z-30 shrink-0 bg-card dark:bg-(--default-sidebar) border-r px-3 flex items-end pb-2 text-xs font-medium text-subtle-text" style={{ width: LEFT_W }}>
              Task
            </div>
            <div className="relative" style={{ width: gridW }}>
              {months.map((m) => (
                <div key={m.label} className="absolute top-0 h-6 border-l border-divider px-2 text-xs font-medium flex items-center truncate" style={{ left: m.left, width: m.width }}>
                  {m.label}
                </div>
              ))}
              {dayList.map((d, i) =>
                zoom === "day" || d.day() === 1 ? (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-6 h-[26px] text-[10px] flex items-center justify-center text-muted-text",
                      d.isSame(today, "day") && "text-blue-400 font-semibold"
                    )}
                    style={{ left: i * W, width: zoom === "day" ? W : W * 7 }}
                  >
                    {zoom === "day" ? d.format("D") : d.format("D MMM")}
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Grid background: weekends, today, project end */}
          <div
            className="absolute"
            style={{ left: LEFT_W, top: HEADER_H, width: gridW, height: Math.max(gridH, ROW_H * 3) }}
            onDoubleClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const index = Math.floor((e.clientX - rect.left) / W);
              onCreateAt(rangeStart.add(index, "day").format(ISO));
            }}
            title="Double-click to add a task on this day"
          >
            {zoom === "day" &&
              dayList.map((d, i) =>
                d.day() === 0 || d.day() === 6 ? (
                  <div key={i} className="absolute top-0 bottom-0 bg-hover/40" style={{ left: i * W, width: W }} />
                ) : null
              )}
            {scheduled.map((_, i) => (
              <div key={i} className="absolute left-0 right-0 border-b border-border/50" style={{ top: (i + 1) * ROW_H - 1 }} />
            ))}
            {project.dueDate && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500/60"
                style={{ left: x(project.dueDate) + W }}
                title={`Project due ${dayjs(project.dueDate).format("D MMM YYYY")}`}
              />
            )}
            <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500/70" style={{ left: x(today) + W / 2 }} title="Today" />
          </div>

          {/* Dependency arrows */}
          <svg
            className="absolute pointer-events-none z-[5]"
            style={{ left: LEFT_W, top: HEADER_H }}
            width={gridW}
            height={Math.max(gridH, 1)}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="fill-neutral-400" />
              </marker>
              <marker id="arrow-critical" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="fill-red-500" />
              </marker>
            </defs>
            {scheduled.flatMap((item) =>
              item.dependsOn
                .filter((pre) => rowOf.has(pre))
                .map((pre) => {
                  const p = scheduled[rowOf.get(pre)!];
                  const pg = geometry(p);
                  const ig = geometry(item);
                  const x1 = pg.left + pg.width;
                  const y1 = rowOf.get(pre)! * ROW_H + ROW_H / 2;
                  const x2 = ig.left;
                  const y2 = rowOf.get(item.id)! * ROW_H + ROW_H / 2;
                  const mid = y1 + (y2 > y1 ? ROW_H / 2 : -ROW_H / 2);
                  const d =
                    x2 - x1 >= 16
                      ? `M${x1},${y1} H${x1 + 8} V${y2} H${x2 - 2}`
                      : `M${x1},${y1} H${x1 + 8} V${mid} H${x2 - 10} V${y2} H${x2 - 2}`;
                  const isCritical = critical?.edges.has(`${pre}>${item.id}`);
                  return (
                    <path
                      key={`${pre}>${item.id}`}
                      d={d}
                      fill="none"
                      strokeWidth={isCritical ? 2 : 1.25}
                      className={isCritical ? "stroke-red-500" : "stroke-neutral-400"}
                      markerEnd={`url(#${isCritical ? "arrow-critical" : "arrow"})`}
                    />
                  );
                })
            )}
          </svg>

          {/* Rows: sticky labels + bars */}
          {scheduled.map((item, row) => {
            const g = geometry(item);
            const isCritical = critical?.ids.has(item.id);
            const isDragging = drag?.id === item.id;
            const label = `${item.title} · ${STATUS_LABEL[item.status]} · ${dateRangeLabel({
              startDate: g.start?.format(ISO) ?? null,
              dueDate: g.due.format(ISO),
            })}`;
            return (
              <div key={item.id} className="absolute left-0" style={{ top: HEADER_H + row * ROW_H, height: ROW_H, width: LEFT_W + gridW }}>
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="sticky left-0 z-10 h-full flex items-center gap-x-2 px-3 border-r border-b border-border/50 bg-card dark:bg-(--default-sidebar) hover:bg-hover text-left"
                  style={{ width: LEFT_W }}
                >
                  {item.kind === "SECTION" && <FileText size={12} className="shrink-0 text-muted-text" />}
                  <span className={cn("text-xs truncate flex-1", item.status === "DONE" && "line-through opacity-60")}>{item.title}</span>
                  <span className="flex -space-x-1 shrink-0">
                    {item.assignees.slice(0, 2).map((a) => (
                      <Avatar key={a.id} src={a.imageUrl ?? undefined} name={a.name || a.email} size={16} className="text-[6px] ring-1 ring-(--default-sidebar)" />
                    ))}
                  </span>
                </button>

                {item.milestone ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    title={label}
                    className={cn(
                      "absolute z-10 top-1/2 size-4 -translate-y-1/2 rotate-45 rounded-[2px] bg-amber-400 border border-amber-200",
                      item.canSchedule ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                      isCritical && "ring-2 ring-red-500"
                    )}
                    style={{ left: LEFT_W + x(g.due) + W / 2 - 8 }}
                    onPointerDown={(e) => onPointerDown(e, item, "move")}
                    onPointerMove={onPointerMove}
                    onPointerUp={() => onPointerUp(item)}
                    onClick={() => (suppressClick.current ? (suppressClick.current = false) : onOpen(item))}
                    onKeyDown={(e) => e.key === "Enter" && onOpen(item)}
                  />
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    title={label}
                    className={cn(
                      "group absolute z-10 top-2 h-6 rounded-md text-[11px] text-white flex items-center overflow-hidden shadow-sm select-none",
                      STATUS_BAR[item.status],
                      item.kind === "SECTION" && "bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(255_255_255/0.12)_6px_12px)]",
                      item.canSchedule ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                      isDragging && "ring-2 ring-white/70 opacity-90",
                      isCritical && "ring-2 ring-red-500"
                    )}
                    style={{ left: LEFT_W + g.left, width: Math.max(g.width, W) }}
                    onPointerDown={(e) => onPointerDown(e, item, "move")}
                    onPointerMove={onPointerMove}
                    onPointerUp={() => onPointerUp(item)}
                    onClick={() => (suppressClick.current ? (suppressClick.current = false) : onOpen(item))}
                    onKeyDown={(e) => e.key === "Enter" && onOpen(item)}
                  >
                    {item.canSchedule && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30"
                        onPointerDown={(e) => onPointerDown(e, item, "start")}
                      />
                    )}
                    <span className="px-2 truncate">{g.width > 60 ? item.title : ""}</span>
                    {item.canSchedule && (
                      <span
                        aria-hidden
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30"
                        onPointerDown={(e) => onPointerDown(e, item, "end")}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {scheduled.length === 0 && (
            <div className="absolute text-sm text-muted-text" style={{ left: LEFT_W + 24, top: HEADER_H + 24 }}>
              Nothing scheduled yet. Give a task a due date, or double-click a day to add one.
            </div>
          )}
        </div>
      </div>

      {unscheduled.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="text-xs font-medium text-subtle-text">Not scheduled ({unscheduled.length})</p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item)}
                className="flex items-center gap-x-1.5 rounded-full border px-3 py-1 text-xs hover:bg-hover"
              >
                {item.kind === "SECTION" && <FileText size={11} className="text-muted-text" />}
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
