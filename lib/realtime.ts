"use client";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { useCallback, useEffect, useRef } from "react";
import * as Y from "yjs";
import type { ChatMessage } from "./api/types";

export const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:3001";

/** Token for the WebSocket handshake (the session cookie is httpOnly). */
export async function fetchRealtimeToken(): Promise<string> {
  const res = await fetch("/api/auth/realtime-token", { cache: "no-store" });
  if (!res.ok) throw new Error("Not signed in");
  return ((await res.json()) as { token: string }).token;
}

export type ProjectEventType =
  | "DOCUMENTS_CHANGED"
  | "DOCUMENT_CHANGED"
  | "MEMBERS_CHANGED"
  | "TASKS_CHANGED"
  | "PROJECT_CHANGED"
  | "ACTIVITY_ADDED"
  | "NOTES_CHANGED"
  | "CHAT_MESSAGE"
  | "CHAT_MESSAGE_UPDATED"
  /** Someone joined or left the project's call. */
  | "CALL_CHANGED"
  /** Sent by collab-realtime itself when a member is typing in a chat. */
  | "TYPING";

export type ProjectEvent = {
  projectId: string;
  type: ProjectEventType;
  documentId?: string;
  sectionId?: string;
  noteId?: string;
  deleted?: boolean;
  /** Chat events */
  channelId?: string;
  message?: ChatMessage;
  /** Typing events */
  user?: { id: string; name: string | null };
};

/**
 * Live change events for a project (sent by collab-api through collab-realtime):
 * documents created/renamed, sections published/approved/assigned, members joined,
 * chat messages... Returns `send`, for chat typing signals.
 */
export function useProjectEvents(
  projectId: string | null | undefined,
  onEvent: (event: ProjectEvent) => void
) {
  const handlerRef = useRef(onEvent);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!projectId) return;
    const doc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: REALTIME_URL,
      name: `project:${projectId}`,
      document: doc,
      token: fetchRealtimeToken,
      onStateless: ({ payload }) => {
        try {
          handlerRef.current(JSON.parse(payload) as ProjectEvent);
        } catch {
          // ignore malformed events
        }
      },
    });
    providerRef.current = provider;
    return () => {
      providerRef.current = null;
      provider.destroy();
      doc.destroy();
    };
  }, [projectId]);

  const send = useCallback((message: Record<string, unknown>) => {
    providerRef.current?.sendStateless(JSON.stringify(message));
  }, []);

  return { send };
}

export type UserEvent = {
  userId: string;
  /** CALL: a call in one of my projects changed. CALL_STARTED: someone started one. */
  type: "NOTIFICATION" | "CHAT" | "CALL" | "CALL_STARTED";
  /** CALL and CALL_STARTED */
  projectId?: string;
  /** CALL: how many people are in that project's call now */
  participantCount?: number;
  projectName?: string;
  startedBy?: { id: string; name: string };
};

/**
 * Events for the signed-in person only (new notifications, chat activity in any of
 * their projects). One connection per tab, shared through UserEventsProvider.
 */
export function useUserEventsConnection(userId: string | null | undefined, onEvent: (event: UserEvent) => void) {
  const handlerRef = useRef(onEvent);
  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!userId) return;
    const doc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: REALTIME_URL,
      name: `user:${userId}`,
      document: doc,
      token: fetchRealtimeToken,
      // After connecting (or reconnecting), refresh: events sent while we weren't listening are lost.
      onSynced: () => {
        handlerRef.current({ userId, type: "NOTIFICATION" });
        handlerRef.current({ userId, type: "CHAT" });
        handlerRef.current({ userId, type: "CALL" });
      },
      onStateless: ({ payload }) => {
        try {
          handlerRef.current(JSON.parse(payload) as UserEvent);
        } catch {
          // ignore malformed events
        }
      },
    });
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [userId]);
}
