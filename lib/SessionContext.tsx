"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout as logoutRequest } from "./api/Auth";
import { listProjects } from "./api/Project";
import { CurrentUser, Project } from "./api/types";

type SessionContextType = {
  me: CurrentUser | null;
  projects: Project[];
  isLoading: boolean;
  /** Set when loading failed for a reason other than being signed out. */
  error: string | null;
  /** Re-fetch the user (plan usage) and the project list, e.g. after creating a project. */
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [user, list] = await Promise.all([getCurrentUser(), listProjects()]);
      setMe(user);
      setProjects(list);
      setError(null);
    } catch (err) {
      // A 401 already redirects to login (lib/api/client.ts).
      setError(err instanceof Error ? err.message : "Couldn't load your workspace.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest().catch(() => undefined);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    // Fetch the workspace once when the dashboard mounts.
    refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ me, projects, isLoading, error, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
