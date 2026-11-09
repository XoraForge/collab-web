"use client";

import MemberPicker from "@/components/common/MemberPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionalDate } from "@/components/ui/optional-date";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import {
  createTask,
  deleteTask,
  moveTask,
  scheduleWorkItem,
  setDependencies,
  updateTask,
} from "@/lib/api/Task";
import type { Member, TaskPriority, TaskStatus, WorkItem } from "@/lib/api/types";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, FileText, Link2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  PRIORITIES,
  PRIORITY_DOT,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  fromIsoDate,
  toIsoDate,
} from "./taskMeta";

export type TaskDialogState =
  | { mode: "create"; status?: TaskStatus; startDate?: string; dueDate?: string }
  | { mode: "edit"; item: WorkItem };

const labelClass = "text-[11px] font-medium text-subtle-text";

/** Create or edit a task. Sections open read-only, except dates and dependencies for the leader. */
export default function TaskDialog({
  state,
  projectId,
  members,
  items,
  onClose,
  onSaved,
}: {
  state: TaskDialogState | null;
  projectId: string;
  members: Member[];
  items: WorkItem[];
  onClose: () => void;
  /** After any change; `notice` is shown to the user (e.g. auto-scheduling). */
  onSaved: (notice?: string) => void;
}) {
  return (
    <Dialog.Root open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-dialog w-[560px] max-w-[calc(100vw-2rem)] max-h-[calc(100svh-2rem)] overflow-y-auto small-scrollbar rounded-md border p-5 focus:outline-none"
        >
          {state && (
            <TaskForm
              key={state.mode === "edit" ? state.item.id : "new"}
              state={state}
              projectId={projectId}
              members={members}
              items={items}
              onClose={onClose}
              onSaved={onSaved}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function TaskForm({
  state,
  projectId,
  members,
  items,
  onClose,
  onSaved,
}: {
  state: TaskDialogState;
  projectId: string;
  members: Member[];
  items: WorkItem[];
  onClose: () => void;
  onSaved: (notice?: string) => void;
}) {
  const item = state.mode === "edit" ? state.item : null;
  const isSection = item?.kind === "SECTION";
  const canEdit = !item || item.canEdit;
  const canSchedule = !item || item.canSchedule;
  const canChangeStatus = !item || item.canChangeStatus;

  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(item?.status ?? (state.mode === "create" ? state.status ?? "TODO" : "TODO"));
  const [priority, setPriority] = useState<TaskPriority>(item?.priority ?? "MEDIUM");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(item?.assignees.map((a) => a.id) ?? []);
  const [startDate, setStartDate] = useState<Date | null>(
    fromIsoDate(item?.startDate ?? (state.mode === "create" ? state.startDate ?? null : null))
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    fromIsoDate(item?.dueDate ?? (state.mode === "create" ? state.dueDate ?? null : null))
  );
  const [milestone, setMilestone] = useState(item?.milestone ?? false);
  const [dependsOn, setDependsOn] = useState<string[]>(item?.dependsOn ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const dateError = startDate && dueDate && dueDate < startDate ? "The due date can't be before the start date." : "";

  async function save() {
    if (!title.trim() || dateError) return;
    setBusy(true);
    setError("");
    try {
      if (!item) {
        await createTask(projectId, {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          assigneeIds,
          startDate: toIsoDate(milestone ? dueDate : startDate),
          dueDate: toIsoDate(dueDate),
          milestone,
          dependsOn,
        });
        onSaved("Task created.");
        onClose();
        return;
      }

      let shifted = 0;
      if (item.kind === "TASK" && canEdit) {
        await updateTask(item.id, {
          title: title.trim(),
          description: description.trim() || null,
          priority,
          assigneeIds,
          milestone,
        });
      }
      if (canChangeStatus && status !== item.status) {
        await moveTask(item.id, status, 100_000); // end of the column
      }
      const newStart = toIsoDate(milestone ? dueDate : startDate);
      const newDue = toIsoDate(dueDate);
      if (canSchedule && (newStart !== item.startDate || newDue !== item.dueDate)) {
        shifted += (await scheduleWorkItem(item.id, newStart, newDue)).shifted.length;
      }
      if (canSchedule && [...dependsOn].sort().join() !== [...item.dependsOn].sort().join()) {
        shifted += (await setDependencies(item.id, dependsOn)).shifted.length;
      }
      onSaved(shifted > 0 ? `Saved. ${shifted} dependent item${shifted === 1 ? " was" : "s were"} moved later.` : "Saved.");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the task.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!item || !window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await deleteTask(item.id);
      onSaved("Task deleted.");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete the task.");
      setBusy(false);
    }
  }

  const otherItems = items.filter((i) => i.id !== item?.id);

  return (
    <form
      className="flex flex-col gap-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="flex items-start justify-between gap-x-3">
        <div className="flex flex-col gap-y-1 min-w-0 flex-1">
          {isSection && (
            <span className="flex items-center gap-x-1.5 text-xs text-muted-text">
              <FileText size={12} /> Section of {item?.documentTitle}
            </span>
          )}
          <Dialog.Title className="sr-only">{item ? `Edit ${item.title}` : "New task"}</Dialog.Title>
          {isSection ? (
            <h2 className="text-lg font-semibold">{item?.title}</h2>
          ) : (
            <Input
              autoFocus={!item}
              value={title}
              maxLength={200}
              disabled={!canEdit}
              placeholder="Task title"
              aria-label="Task title"
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-semibold h-10"
            />
          )}
        </div>
        <Dialog.Close aria-label="Close" className="opacity-70 hover:opacity-100 mt-1">
          <X size={16} />
        </Dialog.Close>
      </div>

      {isSection && item?.documentId && (
        <div className="rounded-md border border-divider px-3 py-2 text-xs flex items-center justify-between gap-x-3">
          <span className="text-muted-text">
            Status and assignees follow the document workflow (publish → review → approve).
          </span>
          <Link
            href={`/dashboard/project/${projectId}/files/${item.documentId}?section=${item.id}`}
            className="shrink-0 underline"
          >
            Open section
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-y-1">
          <span className={labelClass}>Status</span>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)} disabled={!canChangeStatus}>
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-y-1">
          <span className={labelClass}>Priority</span>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)} disabled={!canEdit || isSection}>
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  <span className={`size-2 rounded-full ${PRIORITY_DOT[p]}`} /> {PRIORITY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="flex flex-col gap-y-1">
        <span className={labelClass}>Assigned to</span>
        <MemberPicker members={members} selected={assigneeIds} onChange={setAssigneeIds} disabled={!canEdit || isSection} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {!milestone && (
          <div className="flex flex-col gap-y-1">
            <span className={labelClass}>Start date</span>
            <OptionalDate label="Start date" value={startDate} onChange={setStartDate} disabled={!canSchedule} />
          </div>
        )}
        <div className={`flex flex-col gap-y-1 ${milestone ? "col-span-2" : ""}`}>
          <span className={labelClass}>{milestone ? "Milestone date" : "Due date"}</span>
          <OptionalDate label="Due date" value={dueDate} onChange={setDueDate} disabled={!canSchedule} />
        </div>
      </div>
      {dateError && <p className="text-xs text-destructive -mt-2">{dateError}</p>}

      {!isSection && (
        <label className="flex items-center gap-x-2 text-xs cursor-pointer w-fit">
          <input type="checkbox" checked={milestone} disabled={!canEdit} onChange={(e) => setMilestone(e.target.checked)} />
          Milestone (a checkpoint with a single date, shown as ◆ on the timeline)
        </label>
      )}

      <div className="flex flex-col gap-y-1">
        <span className={labelClass}>Waits for (can&apos;t start until these finish)</span>
        <DependencyPicker items={otherItems} selected={dependsOn} onChange={setDependsOn} disabled={!canSchedule} />
      </div>

      <label className="flex flex-col gap-y-1">
        <span className={labelClass}>{isSection ? "Requirements" : "Description"}</span>
        <textarea
          rows={4}
          maxLength={5000}
          value={description}
          disabled={!canEdit || isSection}
          placeholder={isSection ? "No requirements set." : "Add details, links or a checklist…"}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-y rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-70 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </label>

      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-x-2 border-t pt-3">
        {item?.canDelete ? (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={busy} onClick={remove}>
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-x-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={busy || (!isSection && !title.trim()) || !!dateError}>
            {busy ? "Saving…" : item ? "Save" : "Create task"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function DependencyPicker({
  items,
  selected,
  onChange,
  disabled,
}: {
  items: WorkItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled: boolean;
}) {
  const chosen = items.filter((i) => selected.includes(i.id));
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="flex items-center gap-x-2 min-h-8 w-full rounded-md border border-input dark:bg-input/30 px-2 py-1 text-xs text-left hover:bg-hover disabled:opacity-60 disabled:hover:bg-transparent"
        >
          {chosen.length === 0 ? (
            <span className="flex items-center gap-x-1.5 text-muted-text">
              <Link2 size={12} /> Nothing. It can start any time.
            </span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {chosen.map((i) => (
                <span key={i.id} className="rounded-full bg-hover px-2 py-0.5">{i.title}</span>
              ))}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1 max-h-72 overflow-y-auto small-scrollbar">
        {items.length === 0 && <p className="px-2 py-1.5 text-xs text-muted-text">No other tasks yet.</p>}
        {items.map((i) => {
          const isOn = selected.includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => onChange(isOn ? selected.filter((id) => id !== i.id) : [...selected, i.id])}
              className="w-full flex items-center justify-between gap-x-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent text-left"
            >
              <span className="flex items-center gap-x-2 min-w-0">
                {i.kind === "SECTION" && <FileText size={12} className="shrink-0 text-muted-text" />}
                <span className="truncate">{i.title}</span>
              </span>
              {isOn && <Check size={14} className="shrink-0" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
