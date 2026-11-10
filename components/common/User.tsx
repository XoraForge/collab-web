"use client";

import { ChevronDown, CircleHelp, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/SessionContext";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Avatar from "./Avatar";

export default function User() {
  const { me, logout } = useSession();
  const name = me?.user.name || me?.user.email || "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="border p-2 flex items-center justify-between gap-x-2 rounded-full sm:min-w-[150px] max-w-[220px] hover:bg-border transition-colors duration-200"
        >
          <div className="flex gap-x-2 items-center min-w-0">
            {me ? (
              <Avatar src={me.user.imageUrl ?? undefined} name={name} />
            ) : (
              <span className="size-6 shrink-0 rounded-full bg-border animate-pulse" />
            )}
            <p className="hidden sm:block text-sm truncate">{me ? name : ""}</p>
          </div>
          <div className="flex items-center gap-x-1 shrink-0">
            <div className="size-1.5 rounded-full bg-green-500"></div>
            <ChevronDown size={10} />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-1">
        {me && (
          <div className="px-2 py-2 border-b mb-1">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-text truncate">{me.user.email}</p>
          </div>
        )}
        <Link
          href="/dashboard/settings"
          className="w-full flex items-center gap-x-2 text-sm rounded-sm px-2 py-1.5 hover:bg-accent"
        >
          <Settings size={14} />
          Settings
        </Link>
        <Link
          href="/dashboard/help-center"
          className="w-full flex items-center gap-x-2 text-sm rounded-sm px-2 py-1.5 hover:bg-accent"
        >
          <CircleHelp size={14} />
          Help Center
        </Link>
        <div className="my-1 border-t" />
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-x-2 text-sm rounded-sm px-2 py-1.5 hover:bg-accent text-left"
        >
          <LogOut size={14} />
          Log out
        </button>
      </PopoverContent>
    </Popover>
  );
}
