"use client";

import Header from "@/components/common/Header";
import Messenger from "@/components/common/Messenger";
import SideNav from "@/components/common/SideNav";
import DialogLayout from "@/components/dialog/DialogLayout";
import SessionProvider from "@/lib/SessionContext";
import { useSidebarContext } from "@/lib/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarVisible } = useSidebarContext();
  return (
    <SessionProvider>
      <div className="flex h-screen relative">
        {/* Side Navigation */}
        {isSidebarVisible && <SideNav />}
        <div className="flex flex-col size-full min-w-0">
          {/* Header */}
          <Header />

          {/* Body */}
          <div className="w-full flex flex-col grow min-h-0 overflow-y-auto small-scrollbar">
            {children}
          </div>
        </div>
        {/* Messenger */}
        <Messenger />
      </div>
      {/* Dialogs need the session (e.g. to refresh projects after creating one) */}
      <DialogLayout />
    </SessionProvider>
  );
}
