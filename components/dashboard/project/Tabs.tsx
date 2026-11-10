"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const PROJECT_TABS = [
  { title: "Overview", path: "" },
  { title: "Tasks", path: "/assignments" },
  { title: "Team Members", path: "/team-members" },
  { title: "Schedule", path: "/schedules" },
  { title: "Notes", path: "/notes" },
  { title: "Files", path: "/files" },
] as const;

/** Project navigation. Each tab is a real page, so it can be linked and bookmarked. */
export default function Tabs({ projectId, compact = false }: { projectId: string; compact?: boolean }) {
  const pathname = usePathname();
  const base = `/dashboard/project/${projectId}`;

  return (
    <nav aria-label="Project" className={cn("flex w-full overflow-x-auto no-scrollbar", compact ? "gap-x-6" : "gap-x-8 lg:gap-x-12")}>
      {PROJECT_TABS.map((tab) => {
        const href = base + tab.path;
        const isActive = tab.path === "" ? pathname === base || pathname === `${base}/overview` : pathname.startsWith(href);
        return (
          <Link
            key={tab.title}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "duration-200 ease-in-out font-medium whitespace-nowrap shrink-0",
              compact && "text-sm py-2 border-b-2",
              isActive
                ? cn("text-(--text)", compact && "border-(--text)")
                : cn("text-(--text)/50 hover:text-(--text)", compact && "border-transparent")
            )}
          >
            {tab.title}
          </Link>
        );
      })}
    </nav>
  );
}
