"use client";

import type { ChatChannel } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { useSession } from "@/lib/SessionContext";
import { cn } from "@/lib/utils";
import { BookOpenText } from "lucide-react";
import { plainPreview } from "./useChatChannels";

function shortTime(iso: string) {
  const d = dayjs(iso);
  if (d.isSame(dayjs(), "day")) return d.format("h:mmA");
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return d.isSame(dayjs(), "year") ? d.format("D MMM") : d.format("D MMM YY");
}

/** Project chatrooms: image, name, last message, unread count. */
export default function ChannelList({
  channels,
  error,
  selectedId,
  onSelect,
}: {
  channels: ChatChannel[] | null;
  error?: boolean;
  selectedId?: string | null;
  onSelect: (channel: ChatChannel) => void;
}) {
  const { me } = useSession();

  if (error && !channels) return <p className="p-4 text-sm text-muted-text">Couldn&apos;t load your chats.</p>;
  if (!channels) return <p className="p-4 text-sm text-muted-text">Loading…</p>;
  if (channels.length === 0) {
    return (
      <div className="p-6 text-center flex flex-col gap-y-1">
        <p className="text-sm font-medium">No chats yet</p>
        <p className="text-xs text-muted-text">Every project gets a chatroom. Create or join a project to start talking.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {channels.map((c) => {
        const last = c.lastMessage;
        const author = last ? (last.author.id === me?.user.id ? "You" : last.author.name || last.author.email) : null;
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              aria-current={selectedId === c.id ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-x-3 px-3 py-3 text-left border-b border-border hover:bg-hover transition-colors",
                selectedId === c.id && "bg-hover"
              )}
            >
              <span className="size-10 shrink-0 rounded-full border border-border overflow-hidden flex items-center justify-center bg-card">
                {c.projectImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded image served by the API
                  <img src={c.projectImageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <BookOpenText size={16} />
                )}
              </span>
              <span className="flex flex-col min-w-0 grow">
                <span className="flex items-center justify-between gap-x-2">
                  <span className={cn("text-sm truncate", c.unreadCount > 0 ? "font-bold" : "font-semibold")}>
                    {c.projectName}
                  </span>
                  {last && (
                    <span className="text-[10px] text-muted-text shrink-0" suppressHydrationWarning>
                      {shortTime(last.createdAt)}
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-between gap-x-2">
                  <span className={cn("text-xs truncate", c.unreadCount > 0 ? "text-text font-medium" : "text-muted-text")}>
                    {last ? `${author}: ${plainPreview(last.body)}` : "No messages yet. Say hello!"}
                  </span>
                  {c.unreadCount > 0 && (
                    <span
                      className="min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold leading-5 text-center shrink-0"
                      aria-label={`${c.unreadCount} unread`}
                    >
                      {c.unreadCount > 99 ? "99+" : c.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
