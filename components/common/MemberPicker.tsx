"use client";

import Avatar from "@/components/common/Avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Member } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Check, UserPlus } from "lucide-react";

/** Multi-select of project members (assignees). */
export default function MemberPicker({
  members,
  selected,
  onChange,
  disabled = false,
  emptyLabel = "Unassigned",
  className,
}: {
  members: Member[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
}) {
  const chosen = members.filter((m) => selected.includes(m.user.id));

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex items-center gap-x-2 min-h-8 w-full rounded-md border border-input dark:bg-input/30 px-2 py-1 text-xs text-left hover:bg-hover disabled:opacity-60 disabled:hover:bg-transparent",
            className
          )}
        >
          {chosen.length === 0 ? (
            <span className="flex items-center gap-x-1.5 text-muted-text">
              <UserPlus size={12} /> {emptyLabel}
            </span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {chosen.map((m) => (
                <span key={m.user.id} className="flex items-center gap-x-1 rounded-full bg-hover px-1.5 py-0.5">
                  <Avatar src={m.user.imageUrl ?? undefined} name={m.user.name || m.user.email} size={14} className="text-[6px]" />
                  {m.user.name || m.user.email}
                </span>
              ))}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-1">
        {members.length <= 1 && (
          <p className="px-2 py-1.5 text-[11px] text-muted-text">
            Invite teammates from the project page to assign them.
          </p>
        )}
        {members.map((m) => {
          const isOn = selected.includes(m.user.id);
          return (
            <button
              key={m.user.id}
              type="button"
              onClick={() => onChange(isOn ? selected.filter((id) => id !== m.user.id) : [...selected, m.user.id])}
              className="w-full flex items-center justify-between gap-x-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
            >
              <span className="flex items-center gap-x-2 min-w-0">
                <Avatar src={m.user.imageUrl ?? undefined} name={m.user.name || m.user.email} size={18} />
                <span className="truncate">
                  {m.user.name || m.user.email}
                  {m.role === "PROJECT_MANAGER" && <span className="text-muted-text"> · Leader</span>}
                </span>
              </span>
              {isOn && <Check size={14} />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
