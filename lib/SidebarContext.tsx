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
};

const SidebarContext = createContext<SidebarType | null>(null);

export function useSidebarContext() {
  if (!SidebarContext) throw new Error("Sidebar context is used outside!");
  return useContext(SidebarContext);
}

export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <SidebarContext.Provider value={{ isSidebarVisible, setIsSidebarVisible }}>
      {children}
    </SidebarContext.Provider>
  );
}
