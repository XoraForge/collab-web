"use client";

import { Button } from "@/components/ui/button";
import { STATUS_BAR } from "@/components/tasks/taskMeta";
import dayjs from "@/lib/dayjs";
import { useAllWork, type ProjectWorkItem } from "@/lib/useAllWork";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Diamond } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MAX_PER_DAY = 3;

type CalendarEvent = {
  key: string;
  title: string;
  href: string;
  color: string;
  milestone: boolean;
  done: boolean;
};

function hrefFor(item: ProjectWorkItem) {
  return item.kind === "SECTION" && item.documentId
    ? `/dashboard/project/${item.projectId}/files/${item.documentId}?section=${item.id}`
    : `/dashboard/project/${item.projectId}/assignments?view=timeline`;
}

/** Month view of due dates and milestones across all your projects. */
export default function Calendar() {
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const { items, projects } = useAllWork();

  const days = useMemo(() => {
    const start = month.startOf("week");
    const end = month.endOf("month").endOf("week");
    const list = [];
    for (let d = start; d.isSameOrBefore(end, "day"); d = d.add(1, "day")) list.push(d);
    return list;
  }, [month]);

  // Events by ISO date: task/section due dates, milestones, and project due dates.
  const events = useMemo(() => {
    const byDay = new Map<string, CalendarEvent[]>();
    const add = (date: string, e: CalendarEvent) => byDay.set(date, [...(byDay.get(date) ?? []), e]);
    for (const item of items ?? []) {
      if (!item.dueDate) continue;
      add(item.dueDate, {
        key: item.id,
        title: `${item.title} · ${item.projectName}`,
        href: hrefFor(item),
        color: item.milestone ? "bg-amber-500" : STATUS_BAR[item.status],
        milestone: item.milestone,
        done: item.status === "DONE",
      });
    }
    for (const p of projects) {
      if (p.dueDate) {
        add(p.dueDate, {
          key: `project-${p.id}`,
          title: `${p.name} due`,
          href: `/dashboard/project/${p.id}`,
          color: "bg-red-600",
          milestone: true,
          done: false,
        });
      }
    }
    return byDay;
  }, [items, projects]);

  const today = dayjs();

  return (
    <div className="flex flex-col text-text">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold">{month.format("MMMM YYYY")}</h1>
        <div className="flex items-center gap-x-2">
          <Button variant="outline" size="sm" onClick={() => setMonth(dayjs().startOf("month"))}>
            Today
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Previous month" onClick={() => setMonth((m) => m.subtract(1, "month"))}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next month" onClick={() => setMonth((m) => m.add(1, "month"))}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div key={day} className="border py-1.5 flex items-center justify-center text-sm">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {days.map((date) => {
          const iso = date.format("YYYY-MM-DD");
          const dayEvents = events.get(iso) ?? [];
          const isToday = date.isSame(today, "day");
          const inMonth = date.month() === month.month();
          return (
            <div key={iso} className={cn("border p-2 flex flex-col gap-y-1 min-w-0", !inMonth && "opacity-40")}>
              <span
                className={cn(
                  "self-end text-sm size-7 flex items-center justify-center rounded-full",
                  isToday && "bg-white text-black font-semibold"
                )}
              >
                {date.date()}
              </span>
              {dayEvents.slice(0, MAX_PER_DAY).map((e) => (
                <Link
                  key={e.key}
                  href={e.href}
                  title={e.title}
                  className={cn(
                    "flex items-center gap-x-1 rounded-sm px-1.5 py-0.5 text-[11px] text-white truncate hover:brightness-110",
                    e.color,
                    e.done && "opacity-60 line-through"
                  )}
                >
                  {e.milestone && <Diamond size={9} className="shrink-0" />}
                  <span className="truncate">{e.title}</span>
                </Link>
              ))}
              {dayEvents.length > MAX_PER_DAY && (
                <span className="text-[11px] text-muted-text px-1" title={dayEvents.slice(MAX_PER_DAY).map((e) => e.title).join("\n")}>
                  +{dayEvents.length - MAX_PER_DAY} more
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
