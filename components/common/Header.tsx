import { ChevronLeft, ChevronRight, Home, Menu } from "lucide-react";
import User from "./User";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebarContext } from "@/lib/SidebarContext";
import HeaderTabs from "./HeaderTabs";
import HeaderActions from "./HeaderActions";

export default function Header() {
  const { setIsSidebarVisible, setIsMobileNavOpen } = useSidebarContext();
  const router = useRouter();

  return (
    <div className="w-full flex items-center justify-between gap-x-3 px-3 sm:px-6 py-3 bg-(--default-sidebar) border border-border">
      <div className="flex w-full min-w-0 items-center gap-x-3 sm:gap-x-4">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden text-text opacity-70 hover:opacity-100"
        >
          <Menu />
        </button>
        {/* Navigation */}
        <div className="flex gap-x-3 pr-3 sm:pr-5 border-r border-border text-text shrink-0">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="hidden sm:block opacity-50 hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Go forward"
            onClick={() => router.forward()}
            className="hidden sm:block opacity-50 hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight />
          </button>
          <Link
            href="/dashboard"
            aria-label="Dashboard home"
            onClick={() => setIsSidebarVisible(true)}
          >
            <Home />
          </Link>
        </div>

        <div className="hidden md:flex min-w-0 overflow-x-auto no-scrollbar">
          <HeaderTabs />
        </div>
      </div>

      {/* User & Notifications */}
      <div className="flex gap-x-2 sm:gap-x-3 items-center text-text shrink-0">
        <HeaderActions />
        <User />
      </div>
    </div>
  );
}
