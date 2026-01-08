import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Icon from "../ui/icon";
import User from "./User";
import Link from "next/link";
import { useSidebarContext } from "@/lib/SidebarContext";
import HeaderTabs from "./HeaderTabs";

export default function Header() {
  const { setIsSidebarVisible } = useSidebarContext();
  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-(--default-sidebar) border border-border">
      <div className="flex w-full items-center gap-x-4">
        {/* Navigation */}
        <div className="flex gap-x-3 pr-5 border-r border-border text-text">
          <ChevronLeft />
          <ChevronRight className="opacity-50 hover:opacity-100 transition-opacity duration-200" />
          <Link href="/dashboard" onClick={() => setIsSidebarVisible(true)}>
            <Home />
          </Link>
        </div>

        <HeaderTabs />
      </div>

      {/* User & Notifications */}
      <div className="flex gap-x-5 items-center text-text)">
        <Icon icon="nrk:latest-news" fontSize={22} />
        <Icon icon="lets-icons:message-alt-fill" fontSize={20} />
        <Icon icon="ion:notifications" fontSize={17} />
        <User />
      </div>
    </div>
  );
}
