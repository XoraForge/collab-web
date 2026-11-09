import { useNavTabContext } from "@/lib/NavTabsContext";
import { useDialogContext } from "@/lib/DialogContext";
import NavigationTab from "../header-tabs/NavigationTab";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export default function HeaderTabs() {
  const { navTabs } = useNavTabContext();
  const { handleOpenDialog } = useDialogContext();
  const pathname = usePathname();

  // The active tab is the one whose URL is the longest prefix of the path,
  // so /dashboard/project/x/notes highlights the project tab, not Dashboard.
  const activeUrl = navTabs
    .filter((tab) => pathname === tab.url || pathname.startsWith(tab.url + "/"))
    .sort((a, b) => b.url.length - a.url.length)[0]?.url;

  return (
    <div className="flex w-full gap-x-1">
      {navTabs.map((tab) => (
        <NavigationTab {...tab} key={tab.url} isActive={tab.url === activeUrl} />
      ))}

      {/* Add new project button */}
      <button
        type="button"
        aria-label="Create new project"
        title="Create new project"
        onClick={() => handleOpenDialog("projectCreation")}
        className="flex items-center w-fit p-2 cursor-pointer hover:bg-border rounded-sm"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
