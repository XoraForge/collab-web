import Avatar from "@/components/common/Avatar";
import type { WorkItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { CalendarDays, Diamond, FileText, Link2 } from "lucide-react";
import { PRIORITY_DOT, PRIORITY_LABEL, dateRangeLabel, isOverdue } from "./taskMeta";

export default function TaskCard({
  item,
  isDragging = false,
  onOpen,
  dragProps,
}: {
  item: WorkItem;
  isDragging?: boolean;
  onOpen: () => void;
  dragProps?: React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean };
}) {
  const overdue = isOverdue(item);
  const dates = dateRangeLabel(item);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      {...dragProps}
      className={cn(
        "flex flex-col gap-y-2 rounded-md border bg-card dark:bg-(--default-sidebar) p-3 text-left cursor-pointer hover:border-divider hover:bg-hover transition-colors",
        isDragging && "opacity-40",
        dragProps?.draggable && "active:cursor-grabbing"
      )}
    >
      {item.kind === "SECTION" && (
        <span className="flex items-center gap-x-1 text-[11px] text-muted-text truncate">
          <FileText size={11} className="shrink-0" /> {item.documentTitle}
        </span>
      )}
      <p className="text-sm font-medium leading-snug flex items-start gap-x-1.5">
        {item.milestone && <Diamond size={12} className="mt-1 shrink-0 text-amber-400" aria-label="Milestone" />}
        {item.title}
      </p>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2 text-[11px] text-muted-text min-w-0">
          {item.kind === "TASK" && (
            <span className="flex items-center gap-x-1" title={`${PRIORITY_LABEL[item.priority]} priority`}>
              <span className={`size-2 rounded-full ${PRIORITY_DOT[item.priority]}`} />
            </span>
          )}
          {dates && (
            <span className={cn("flex items-center gap-x-1 truncate", overdue && "text-red-400 font-medium")}>
              <CalendarDays size={11} className="shrink-0" />
              {overdue ? `Overdue · ${dates}` : dates}
            </span>
          )}
          {item.dependsOn.length > 0 && (
            <span className="flex items-center gap-x-0.5" title={`Waits for ${item.dependsOn.length} item(s)`}>
              <Link2 size={11} /> {item.dependsOn.length}
            </span>
          )}
        </div>
        {item.assignees.length > 0 && (
          <div className="flex -space-x-1.5 shrink-0">
            {item.assignees.slice(0, 3).map((a) => (
              <Avatar
                key={a.id}
                src={a.imageUrl ?? undefined}
                name={a.name || a.email}
                size={20}
                className="ring-1 ring-(--default-sidebar) text-[8px]"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
