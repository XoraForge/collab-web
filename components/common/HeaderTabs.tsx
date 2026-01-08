import { useNavTabContext } from "@/lib/NavTabsContext";
import NavigationTab from "../header-tabs/NavigationTab";
import { Plus } from "lucide-react";

export default function HeaderTabs() {
  const { navTabs } = useNavTabContext();

  return (
    <div className="flex w-full gap-x-1">
      {navTabs.map((tab) => (
        <NavigationTab {...tab} key={tab.url} />
      ))}

      {/* Add new project button */}
      <div className="flex items-center w-fit p-2 cursor-pointer hover:bg-border rounded-sm">
        <Plus size={15} />
      </div>
    </div>
  );
}
