"use client";

import Header from "@/components/common/Header";
import Messenger from "@/components/common/Messenger";
import SideNav from "@/components/common/SideNav";
import { useSidebarContext } from "@/lib/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarVisible } = useSidebarContext();
  return (
    <div className="flex h-screen relative">
      {/* Side Navigation */}
      {isSidebarVisible && <SideNav />}
      <div className="flex flex-col size-full">
        {/* Header */}
        <Header />

        {/* Body */}
        <div className="w-full flex flex-col grow">{children}</div>
      </div>
      {/* Messenger */}
      <Messenger />
    </div>
  );
}
