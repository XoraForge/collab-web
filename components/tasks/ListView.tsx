import Avatar from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import type { WorkItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Diamond, FileText } from "lucide-react";
import { PRIORITY_DOT, PRIORITY_LABEL, STATUS_BADGE, STATUS_LABEL, isOverdue, shortDate } from "./taskMeta";

/** Table of everything, soonest due first. */
export default function ListView({ items, onOpen }: { items: WorkItem[]; onOpen: (item: WorkItem) => void }) {
  const sorted = [...items].sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-text py-10 text-center">No tasks yet.</p>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-hover text-xs text-subtle-text">
          <tr>
            <th className="text-left font-medium px-3 py-2">Task</th>
            <th className="text-left font-medium px-3 py-2 w-32">Status</th>
            <th className="text-left font-medium px-3 py-2 w-28">Priority</th>
            <th className="text-left font-medium px-3 py-2 w-32">Assignees</th>
            <th className="text-left font-medium px-3 py-2 w-28">Start</th>
            <th className="text-left font-medium px-3 py-2 w-28">Due</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr
              key={item.id}
              tabIndex={0}
              onClick={() => onOpen(item)}
              onKeyDown={(e) => e.key === "Enter" && onOpen(item)}
              className="border-t cursor-pointer hover:bg-hover focus:bg-hover focus:outline-none"
            >
              <td className="px-3 py-2">
                <div className="flex items-center gap-x-2 min-w-0">
                  {item.kind === "SECTION" && <FileText size={13} className="shrink-0 text-muted-text" aria-label="Document section" />}
                  {item.milestone && <Diamond size={12} className="shrink-0 text-amber-400" aria-label="Milestone" />}
                  <span className="truncate">{item.title}</span>
                  {item.kind === "SECTION" && <span className="text-xs text-muted-text truncate">· {item.documentTitle}</span>}
                </div>
              </td>
              <td className="px-3 py-2">
                <Badge className={STATUS_BADGE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
              </td>
              <td className="px-3 py-2 text-xs">
                {item.kind === "TASK" ? (
                  <span className="flex items-center gap-x-1.5">
                    <span className={`size-2 rounded-full ${PRIORITY_DOT[item.priority]}`} />
                    {PRIORITY_LABEL[item.priority]}
                  </span>
                ) : (
                  <span className="text-muted-text">—</span>
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex -space-x-1.5">
                  {item.assignees.slice(0, 4).map((a) => (
                    <Avatar key={a.id} src={a.imageUrl ?? undefined} name={a.name || a.email} size={20} className="ring-1 ring-(--default-sidebar) text-[8px]" />
                  ))}
                  {item.assignees.length === 0 && <span className="text-xs text-muted-text">—</span>}
                </div>
              </td>
              <td className="px-3 py-2 text-xs">{shortDate(item.startDate) ?? <span className="text-muted-text">—</span>}</td>
              <td className={cn("px-3 py-2 text-xs", isOverdue(item) && "text-red-400 font-medium")}>
                {shortDate(item.dueDate) ?? <span className="text-muted-text">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
