"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; text: string };
type ToastFn = (text: string) => void;

const ToastContext = createContext<ToastFn>(() => {});

/** Show a short message at the bottom of the screen. */
export function useToast() {
  return useContext(ToastContext);
}

/** For buttons whose feature isn't built yet: say so instead of doing nothing. */
export function useComingSoon() {
  const toast = useToast();
  return useCallback((feature: string) => toast(`${feature} is coming soon.`), [toast]);
}

let nextId = 1;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((text: string) => {
    const id = nextId++;
    setToasts((list) => [...list.slice(-2), { id, text }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-y-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto rounded-md border bg-popover text-popover-foreground px-4 py-2 text-sm shadow-lg animate-in fade-in-0 slide-in-from-bottom-2"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
