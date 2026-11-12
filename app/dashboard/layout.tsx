"use client";

import Header from "@/components/common/Header";
import Messenger from "@/components/common/Messenger";
import SideNav from "@/components/common/SideNav";
import DialogLayout from "@/components/dialog/DialogLayout";
import CallProvider from "@/lib/CallContext";
import SessionProvider from "@/lib/SessionContext";
import UserEventsProvider from "@/lib/UserEventsContext";
import { useSidebarContext } from "@/lib/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarVisible, isMobileNavOpen, setIsMobileNavOpen } = useSidebarContext();
  return (
    <SessionProvider>
      <UserEventsProvider>
      <CallProvider>
      <div className="flex h-screen relative">
        {/* Side Navigation: fixed on large screens, a slide-in drawer on small ones */}
        <div className="hidden lg:flex h-full">{isSidebarVisible && <SideNav />}</div>
        {isMobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-overlay"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div
              className="relative h-full max-w-[85vw] overflow-y-auto shadow-xl"
              // Following a link closes the drawer.
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) setIsMobileNavOpen(false);
              }}
              onKeyDown={(e) => e.key === "Escape" && setIsMobileNavOpen(false)}
            >
              <SideNav />
            </div>
          </div>
        )}
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
      </CallProvider>
      </UserEventsProvider>
    </SessionProvider>
  );
}
