"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type SidebarType = {
  isSidebarVisible: boolean;
  setIsSidebarVisible: Dispatch<SetStateAction<boolean>>;
  /** Small screens: the sidebar slides in over the page. */
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarType | null>(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("Sidebar context is used outside!");
  return context;
}

export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarVisible, setIsSidebarVisible, isMobileNavOpen, setIsMobileNavOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}
