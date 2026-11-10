"use client";

import Avatar from "@/components/common/Avatar";
import Icon from "@/components/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationPhrase, relativeTime } from "@/lib/activityText";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/Activity";
import type { AppNotification, NotificationList, NotificationType } from "@/lib/api/types";
import { useUserEvent } from "@/lib/UserEventsContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const TYPE_ICON: Record<NotificationType, string> = {
  SECTION_ASSIGNED: "mdi:file-account-outline",
  TASK_ASSIGNED: "mdi:clipboard-account-outline",
  SECTION_SUBMITTED: "mdi:file-send-outline",
  SECTION_APPROVED: "mdi:check-decagram-outline",
  SECTION_REOPENED: "mdi:lock-open-variant-outline",
  MEMBER_JOINED: "mdi:account-plus-outline",
  DUE_SOON: "mdi:clock-alert-outline",
};

const iconButton =
  "relative rounded-md p-1.5 opacity-80 hover:opacity-100 hover:bg-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The header bell: unread badge, list, mark read. Updates live. */
export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationList | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(
    () =>
      listNotifications(30)
        .then((list) => {
          setData(list);
          setError(false);
        })
        .catch(() => setError(true)),
    []
  );

  useEffect(() => {
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [load]);
  useUserEvent("NOTIFICATION", load);

  async function openNotification(n: AppNotification) {
    setOpen(false);
    if (!n.read) {
      setData((d) => d && { items: d.items.map((i) => (i.id === n.id ? { ...i, read: true } : i)), unreadCount: Math.max(0, d.unreadCount - 1) });
      markNotificationRead(n.id).catch(() => load());
    }
    if (n.link) router.push(n.link);
  }

  async function readAll() {
    setData((d) => d && { items: d.items.map((i) => ({ ...i, read: true })), unreadCount: 0 });
    markAllNotificationsRead().catch(() => load());
  }

  const unread = data?.unreadCount ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          title="Notifications"
          className={iconButton}
        >
          <Icon icon="ion:notifications" fontSize={17} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-4 text-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] p-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button type="button" onClick={readAll} className="text-xs text-muted-text hover:text-text hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {error && !data ? (
          <p className="px-3 py-6 text-sm text-center text-muted-text">Couldn&apos;t load notifications.</p>
        ) : !data ? (
          <p className="px-3 py-6 text-sm text-center text-muted-text">Loading…</p>
        ) : data.items.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-y-1 py-8 px-4">
            <Icon icon="ion:notifications-off-outline" fontSize={26} className="opacity-50" />
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-xs text-muted-text max-w-60">
              Assignments, reviews, approvals and deadline reminders show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-[min(28rem,70vh)] overflow-y-auto small-scrollbar py-1">
            {data.items.map((n) => (
              <li key={n.id}>
                <NotificationRow notification={n} onOpen={() => openNotification(n)} />
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({ notification: n, onOpen }: { notification: AppNotification; onOpen: () => void }) {
  const phrase = notificationPhrase(n);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn("w-full flex gap-x-3 px-3 py-2.5 text-left hover:bg-hover transition-colors", !n.read && "bg-hover/40")}
    >
      <span className="relative shrink-0 mt-0.5">
        {n.actor ? (
          <Avatar src={n.actor.imageUrl ?? undefined} name={phrase.actor ?? ""} size={28} />
        ) : (
          <span className="size-7 rounded-full border flex items-center justify-center">
            <Icon icon={TYPE_ICON[n.type]} fontSize={15} />
          </span>
        )}
      </span>
      <span className="flex flex-col min-w-0 grow">
        <span className="text-sm leading-snug break-words">
          {phrase.actor && <span className="font-medium">{phrase.actor} </span>}
          {phrase.before && <>{phrase.before} </>}
          {phrase.target && <span className="font-semibold">{phrase.target}</span>}
          {phrase.after && <> {phrase.after}</>}
        </span>
        {phrase.note && <span className="text-xs text-muted-text">{phrase.note}</span>}
        <span className="text-[11px] text-muted-text mt-0.5" suppressHydrationWarning>
          {n.projectName ? `${n.projectName} · ` : ""}
          {relativeTime(n.createdAt)}
        </span>
      </span>
      {!n.read && <span className="size-2 rounded-full bg-blue-500 shrink-0 mt-2" aria-label="Unread" />}
    </button>
  );
}
