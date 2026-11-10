"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { UserEvent, useUserEventsConnection } from "./realtime";
import { useSession } from "./SessionContext";

type Listener = (event: UserEvent) => void;
type Subscribe = (listener: Listener) => () => void;

const UserEventsContext = createContext<Subscribe>(() => () => {});

/** Opens the signed-in person's event room once and shares it with every component that listens. */
export default function UserEventsProvider({ children }: { children: React.ReactNode }) {
  const { me } = useSession();
  const listeners = useRef(new Set<Listener>());

  useUserEventsConnection(me?.user.id, (event) => {
    listeners.current.forEach((listener) => listener(event));
  });

  const subscribe = useCallback<Subscribe>((listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return <UserEventsContext.Provider value={subscribe}>{children}</UserEventsContext.Provider>;
}

/** Calls `onEvent` for each of my events of the given type (e.g. "NOTIFICATION"). */
export function useUserEvent(type: UserEvent["type"], onEvent: () => void) {
  const subscribe = useContext(UserEventsContext);
  const handler = useRef(onEvent);
  useEffect(() => {
    handler.current = onEvent;
  }, [onEvent]);
  useEffect(
    () =>
      subscribe((event) => {
        if (event.type === type) handler.current();
      }),
    [subscribe, type]
  );
}
