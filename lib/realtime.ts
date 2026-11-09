"use client";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useRef } from "react";
import * as Y from "yjs";

export const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:3001";

/** Token for the WebSocket handshake (the session cookie is httpOnly). */
export async function fetchRealtimeToken(): Promise<string> {
  const res = await fetch("/api/auth/realtime-token", { cache: "no-store" });
  if (!res.ok) throw new Error("Not signed in");
  return ((await res.json()) as { token: string }).token;
}

export type ProjectEvent = {
  projectId: string;
  type: "DOCUMENTS_CHANGED" | "DOCUMENT_CHANGED" | "MEMBERS_CHANGED" | "TASKS_CHANGED" | "PROJECT_CHANGED";
  documentId?: string;
  sectionId?: string;
};

/**
 * Live change events for a project (sent by collab-api through collab-realtime):
 * documents created/renamed, sections published/approved/assigned, members joined...
 */
export function useProjectEvents(
  projectId: string | null | undefined,
  onEvent: (event: ProjectEvent) => void
) {
  const handlerRef = useRef(onEvent);
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
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [projectId]);
}
