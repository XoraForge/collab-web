"use client";

import { listOnlineTeammates } from "@/lib/api/Presence";
import type { UserSummary } from "@/lib/api/types";
import { useCallback, useEffect, useState } from "react";
import Icon from "../ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Avatar from "./Avatar";

const REFRESH_MS = 20_000;

/** Header button: which of my teammates are online right now. */
export default function ActiveTeammates({ buttonClassName }: { buttonClassName: string }) {
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<UserSummary[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(
    () =>
      listOnlineTeammates()
        .then((list) => {
          setPeople(list);
          setError(false);
        })
        .catch(() => setError(true)),
    []
  );

  // Fresh when opened, and kept fresh while open.
  useEffect(() => {
    if (!open) return;
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [open, load]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Active team members" title="Active team members" className={buttonClassName}>
          <Icon icon="nrk:latest-news" fontSize={22} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <p className="px-4 pt-3 pb-2 text-sm font-semibold">Active team members</p>
        <div className="max-h-80 overflow-y-auto small-scrollbar pb-2">
          {people === null ? (
            <p className="px-4 py-2 text-xs text-muted-text">{error ? "Couldn't load who is online." : "Loading…"}</p>
          ) : people.length === 0 ? (
            <p className="px-4 py-2 text-xs text-muted-text">None of your teammates are online right now.</p>
          ) : (
            <ul>
              {people.map((person) => {
                const name = person.name || person.email;
                return (
                  <li key={person.id} className="flex items-center gap-x-3 px-4 py-2">
                    <Avatar src={person.imageUrl ?? undefined} name={name} size={36} className="text-xs" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{name}</span>
                      <span className="text-xs text-muted-text">Active now</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
