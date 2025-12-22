import { ChevronLeft, ChevronRight, Home, Plus } from "lucide-react";
import Icon from "../ui/icon";
import User from "./User";
import NavigationTab from "../header-tabs/NavigationTab";
import Link from "next/link";

export default function Header() {
  return (
    <div className="bg-[#353535] py-3 w-full flex items-center justify-between px-6">
      <div className="w-full flex items-center gap-x-4">
        {/* Navigation */}
        <div className="flex gap-x-3 pr-5 border-r border-white">
          <ChevronLeft />
          <ChevronRight className="text-gray-600" />
          <Link href="/dashboard">
            <Home />
          </Link>
        </div>
        {/* Tabs */}
        <div className="w-full flex gap-x-1">
          <NavigationTab title="Business Analytics" />
          <NavigationTab title="Artificial Intelligence" />
          <div className="flex items-center w-fit p-2">
            <Plus size={15} />
          </div>
        </div>
      </div>

      <div className="flex gap-x-5 items-center">
        <Icon icon="nrk:latest-news" fontSize={22} />
        <Icon icon="lets-icons:message-alt-fill" fontSize={20} />
        <Icon icon="ion:notifcations" fontSize={17} />
        <User />
      </div>
    </div>
  );
}
