import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import User from "./User";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebarContext } from "@/lib/SidebarContext";
import HeaderTabs from "./HeaderTabs";
import HeaderActions from "./HeaderActions";

export default function Header() {
  const { setIsSidebarVisible } = useSidebarContext();
  const router = useRouter();

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-(--default-sidebar) border border-border">
      <div className="flex w-full items-center gap-x-4">
        {/* Navigation */}
        <div className="flex gap-x-3 pr-5 border-r border-border text-text">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="opacity-50 hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Go forward"
            onClick={() => router.forward()}
            className="opacity-50 hover:opacity-100 transition-opacity duration-200"
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

        <HeaderTabs />
      </div>

      {/* User & Notifications */}
      <div className="flex gap-x-3 items-center text-text">
        <HeaderActions />
        <User />
      </div>
    </div>
  );
}
