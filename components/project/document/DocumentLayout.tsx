"use client";

import MainHeader from "./header/MainHeader";
import SecondaryHeader from "./header/SecondaryHeader";
import Document from "./layout/Document";
import AdjustableSections from "./layout/AdjustableSections";
import Icon from "@/components/ui/icon";
import { useEffect } from "react";
import { useSidebarContext } from "@/lib/SidebarContext";
import { Settings } from "lucide-react";

export default function DocumentLayout() {
  const { setIsSidebarVisible } = useSidebarContext();

  useEffect(() => {
    setIsSidebarVisible(false);
  }, []);

  return (
    <div className="grid grid-cols-16 size-full">
      {/* Column 1: Sections (2) */}
      <div className="col-span-2 border p-3 flex flex-col gap-y-3">
        <div className="flex justify-between p-2">
          <div className="flex items-center gap-x-3">
            <Icon icon="icon-park-outline:word" />
            <div className="flex flex-col gap-y-1">
              <h1 className="text-xs font-medium">ICT374 Proposal</h1>
              <p className="text-xs">Updated 3 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <Settings className="size-3" />
          </div>
        </div>
        <div className="flex flex-col gap-y-2 py-2 border-t">
          <h1 className="text-xs font-medium">Sections</h1>
          <AdjustableSections />
        </div>
      </div>
      {/* Column 2: Body (12) */}
      <div className="col-span-12 border flex flex-col relative">
        <MainHeader />

        <div className="h-full flex flex-col flex-1">
          <Document />
        </div>
      </div>
      {/* Column 3: Properties (2) */}
      <div className="col-span-2 border">
        <SecondaryHeader />
      </div>
    </div>
  );
}
