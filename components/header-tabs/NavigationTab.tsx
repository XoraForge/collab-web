import { NavTabsType, useNavTabContext } from "@/lib/NavTabsContext";
import { BookOpenText, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavigationTab({
  title,
  name,
  url,
  isActive = false,
}: NavTabsType & { isActive?: boolean }) {
  const { navTabs, handleDeleteTabs } = useNavTabContext();
  const router = useRouter();

  function handleClose() {
    // Closing the tab you're on moves you to the neighbouring tab, like a browser.
    if (isActive) {
      const index = navTabs.findIndex((tab) => tab.url === url);
      const next = navTabs[index - 1] ?? navTabs[index + 1];
      router.push(next?.url ?? "/dashboard");
    }
    handleDeleteTabs(url);
  }

  return (
    <div
      className={`flex gap-x-5 items-center w-fit px-3 py-2 rounded-tl-lg rounded-br-lg border hover:bg-border transition-colors duration-200 ${
        isActive ? "bg-border" : "bg-(--default-sidebar)"
      }`}
    >
      <Link
        className="flex gap-x-2 items-center"
        href={url}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="p-1 border border-border rounded-sm">
          <BookOpenText size={15} className="text-text" />
        </div>
        <p className="text-xs font-medium text-text">
          {title && [title]} {name}
        </p>
      </Link>

      <button
        type="button"
        aria-label={`Close ${name} tab`}
        onClick={handleClose}
        className="text-text opacity-70 hover:opacity-100 transition-opacity duration-200"
      >
        <X size={15} />
      </button>
    </div>
  );
}
