import Avatar from "@/components/common/Avatar";
import type { Section as SectionType } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  ListTree,
  LockKeyholeIcon,
  LockKeyholeOpen,
  LucideChevronRight,
  Rows3Icon,
} from "lucide-react";
import { viewOnlyReason } from "../sections/sectionMeta";

/**
 * One row in the Sections list.
 * Green open lock = you can edit · red lock = view only · green check = approved.
 */
export default function Section({
  section,
  isSelected,
  isDraggable,
  isDropTarget,
  onSelect,
  dragHandlers,
}: {
  section: SectionType;
  isSelected: boolean;
  isDraggable: boolean;
  isDropTarget: boolean;
  onSelect: () => void;
  dragHandlers?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const isToc = section.kind === "TABLE_OF_CONTENTS";
  const lockTitle = isToc
    ? "Generated automatically from the sections' headings"
    : section.canEdit
    ? "You can edit this section"
    : viewOnlyReason(section);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={isSelected ? "true" : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      draggable={isDraggable}
      {...dragHandlers}
      className={cn(
        "flex items-center justify-between gap-x-2 border p-2 cursor-pointer transition-colors duration-150 hover:bg-hover",
        isSelected && "bg-hover border-divider",
        isDropTarget && "border-t-2 border-t-blue-500"
      )}
    >
      <div className="flex items-center gap-x-3 min-w-0">
        <span title={lockTitle} className="shrink-0">
          {isToc ? (
            <ListTree className="size-3 text-muted-text" />
          ) : section.status === "DONE" ? (
            <BadgeCheck className="size-3 text-green-400" />
          ) : section.canEdit ? (
            <LockKeyholeOpen className="size-3 text-green-400" />
          ) : (
            <LockKeyholeIcon className="size-3 text-red-400" />
          )}
        </span>
        <p className="text-xs font-medium truncate">{section.title}</p>
      </div>
      <div className="flex items-center gap-x-2 shrink-0">
        {section.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {section.assignees.slice(0, 3).map((a) => (
              <Avatar
                key={a.id}
                src={a.imageUrl ?? undefined}
                name={a.name || a.email}
                size={16}
                className="ring-1 ring-(--default-sidebar) text-[7px]"
              />
            ))}
          </div>
        )}
        {isDraggable && (
          <Rows3Icon className="size-3 cursor-grab" aria-label="Drag to reorder" />
        )}
        <LucideChevronRight className="size-3" />
      </div>
    </div>
  );
}
