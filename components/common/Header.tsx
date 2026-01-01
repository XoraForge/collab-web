import { ChevronLeft, ChevronRight, Home, Plus } from "lucide-react";
import Icon from "../ui/icon";
import User from "./User";
import NavigationTab from "../header-tabs/NavigationTab";
import Link from "next/link";

export default function Header() {
  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-card border-b border-border">
      <div className="flex w-full items-center gap-x-4">
        {/* Navigation */}
        <div className="flex gap-x-3 pr-5 border-r border-border text-text">
          <ChevronLeft />
          <ChevronRight className="opacity-50 hover:opacity-100 transition-opacity duration-200" />
          <Link href="/dashboard">
            <Home />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex w-full gap-x-1">
          <NavigationTab title="Business Analytics" />
          <NavigationTab title="Artificial Intelligence" />

          {/* Add new project button */}
          <div className="flex items-center w-fit p-2 cursor-pointer hover:bg-border rounded-sm">
            <Plus size={15} />
          </div>
        </div>
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
