"use client";

import Avatar from "@/components/common/Avatar";
import { activityLink, activityPhrase, dayHeading, personName } from "@/lib/activityText";
import type { Activity } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import Link from "next/link";

/** Activity entries grouped by day: time, avatar, "**Alice** published **Intro** v3". */
export default function ActivityList({
  items,
  showProject = false,
  compact = false,
}: {
  items: Activity[];
  /** Show which project each entry belongs to (for feeds across projects). */
  showProject?: boolean;
  compact?: boolean;
}) {
  const groups: { day: string; items: Activity[] }[] = [];
  for (const item of items) {
    const day = dayHeading(item.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }

  return (
    <div className={compact ? "flex flex-col gap-y-4" : "flex flex-col gap-y-6"}>
      {groups.map((group) => (
        <section key={group.day} className="flex flex-col gap-y-2">
          <h2 className={compact ? "text-sm font-medium" : "font-medium"}>{group.day}</h2>
          <ul className="flex flex-col gap-y-2.5">
            {group.items.map((a) => (
              <ActivityRow key={a.id} activity={a} showProject={showProject} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ActivityRow({ activity: a, showProject }: { activity: Activity; showProject: boolean }) {
  const phrase = activityPhrase(a);
  const name = personName(a.actor);
  const href = activityLink(a);

  return (
    <li className="flex gap-x-3 text-sm">
      <time className="w-14 shrink-0 text-xs text-muted-text pt-0.5" dateTime={a.createdAt}>
        {dayjs(a.createdAt).format("h:mmA")}
      </time>
      <div className="flex gap-x-2 min-w-0">
        <Avatar src={a.actor?.imageUrl ?? undefined} name={name} size={20} className="mt-px" />
        <p className="leading-normal min-w-0 break-words">
          <span className="font-medium">{name}</span> {phrase.before}{" "}
          {phrase.target &&
            (href ? (
              <Link href={href} className="font-semibold hover:underline">
                {phrase.target}
              </Link>
            ) : (
              <span className="font-semibold">{phrase.target}</span>
            ))}
          {phrase.after && <> {phrase.after}</>}
          {showProject && a.projectName && (
            <span className="block text-xs text-muted-text">
              in{" "}
              <Link href={`/dashboard/project/${a.projectId}`} className="hover:underline">
                {a.projectName}
              </Link>
            </span>
          )}
        </p>
      </div>
    </li>
  );
}
