"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastAction = { label: string; onClick: () => void };
type ToastOptions = { action?: ToastAction; durationMs?: number };
type Toast = { id: number; text: string; action?: ToastAction };
type ToastFn = (text: string, options?: ToastOptions) => void;

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

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback<ToastFn>(
    (text, options) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-2), { id, text, action: options?.action }]);
      setTimeout(() => dismiss(id), options?.durationMs ?? (options?.action ? 10000 : 3500));
    },
    [dismiss]
  );

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
            className="pointer-events-auto flex items-center gap-x-3 rounded-md border bg-popover text-popover-foreground px-4 py-2 text-sm shadow-lg animate-in fade-in-0 slide-in-from-bottom-2"
          >
            <span>{t.text}</span>
            {t.action && (
              <button
                type="button"
                className="shrink-0 rounded-md bg-primary text-primary-foreground px-2.5 py-1 text-xs font-semibold hover:opacity-90"
                onClick={() => {
                  dismiss(t.id);
                  t.action?.onClick();
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
