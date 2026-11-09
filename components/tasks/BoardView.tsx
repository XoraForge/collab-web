"use client";

import { Badge } from "@/components/ui/badge";
import type { TaskStatus, WorkItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import TaskCard from "./TaskCard";
import { STATUSES, STATUS_BADGE, STATUS_LABEL } from "./taskMeta";

/** Kanban board. Tasks can be dragged between columns; sections follow their document workflow. */
export default function BoardView({
  items,
  onOpen,
  onCreate,
  onMove,
}: {
  items: WorkItem[];
  onOpen: (item: WorkItem) => void;
  onCreate: (status: TaskStatus) => void;
  onMove: (item: WorkItem, status: TaskStatus, position: number) => void;
}) {
  const [dragging, setDragging] = useState<WorkItem | null>(null);
  const [over, setOver] = useState<{ status: TaskStatus; index: number } | null>(null);

  function columnItems(status: TaskStatus) {
    const tasks = items.filter((i) => i.kind === "TASK" && i.status === status).sort((a, b) => a.position - b.position);
    const sections = items
      .filter((i) => i.kind === "SECTION" && i.status === status)
      .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
    return [...tasks, ...sections];
  }

  return (
    <div className="grid grid-cols-4 gap-4 min-h-0 h-full">
      {STATUSES.map((status) => {
        const column = columnItems(status);
        const taskCount = column.filter((i) => i.kind === "TASK").length;
        const isTarget = over?.status === status && dragging !== null;

        return (
          <section
            key={status}
            aria-label={STATUS_LABEL[status]}
            className={cn(
              "flex flex-col min-h-0 rounded-md border bg-bg/50 transition-colors",
              isTarget && "border-blue-500/60 bg-blue-500/5"
            )}
            onDragOver={(e) => {
              if (!dragging) return;
              e.preventDefault();
              if (over?.status !== status) setOver({ status, index: taskCount });
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging && over) onMove(dragging, over.status, over.index);
              setDragging(null);
              setOver(null);
            }}
          >
            <header className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-x-2">
                <Badge className={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>
                <span className="text-xs text-muted-text">{column.length}</span>
              </div>
              <button
                type="button"
                aria-label={`Add task to ${STATUS_LABEL[status]}`}
                title="Add task"
                onClick={() => onCreate(status)}
                className="rounded-sm p-1 hover:bg-hover"
              >
                <Plus size={14} />
              </button>
            </header>
            <div className="flex flex-col gap-y-2 p-2 overflow-y-auto small-scrollbar min-h-24">
              {column.map((item, index) => (
                <div key={item.id}>
                  {isTarget && over?.index === index && item.kind === "TASK" && (
                    <div className="h-1 rounded-full bg-blue-500 mb-2" />
                  )}
                  <TaskCard
                    item={item}
                    isDragging={dragging?.id === item.id}
                    onOpen={() => onOpen(item)}
                    dragProps={
                      item.canChangeStatus
                        ? {
                            draggable: true,
                            onDragStart: (e) => {
                              setDragging(item);
                              e.dataTransfer.effectAllowed = "move";
                            },
                            onDragOver: (e) => {
                              if (!dragging || item.kind !== "TASK") return;
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const after = e.clientY > rect.top + rect.height / 2;
                              const taskIndex = column.filter((i) => i.kind === "TASK").indexOf(item);
                              setOver({ status, index: taskIndex + (after ? 1 : 0) });
                            },
                            onDragEnd: () => {
                              setDragging(null);
                              setOver(null);
                            },
                          }
                        : { title: "Sections move with their document workflow (publish, review, approve)" }
                    }
                  />
                </div>
              ))}
              {isTarget && over?.index === taskCount && <div className="h-1 rounded-full bg-blue-500" />}
              {column.length === 0 && (
                <button
                  type="button"
                  onClick={() => onCreate(status)}
                  className="rounded-md border border-dashed border-divider py-6 text-xs text-muted-text hover:bg-hover"
                >
                  + Add a task
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
