"use client";

import { listChannels } from "@/lib/api/Chat";
import type { ChatChannel } from "@/lib/api/types";
import { useUserEvent } from "@/lib/UserEventsContext";
import { useCallback, useEffect, useState } from "react";

/** My chatrooms with unread counts; refreshed live when a message arrives in any project. */
export function useChatChannels() {
  const [channels, setChannels] = useState<ChatChannel[] | null>(null);
  const [error, setError] = useState(false);

  const refresh = useCallback(
    () =>
      listChannels()
        .then((list) => {
          setChannels(list);
          setError(false);
        })
        .catch(() => setError(true)),
    []
  );

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);
  useUserEvent("CHAT", refresh);

  const totalUnread = (channels ?? []).reduce((sum, c) => sum + c.unreadCount, 0);
  return { channels, error, refresh, totalUnread };
}

/** Plain text for previews: drops the most common Markdown symbols. */
export function plainPreview(markdown: string | null, max = 80) {
  if (!markdown) return "";
  const text = markdown
    .replace(/```[\s\S]*?```/g, "[code]")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "[image]")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
