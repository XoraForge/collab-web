"use client";

import { SetStateAction, useState } from "react";
import NavigationLink from "./NavigationLink";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import ProjectNavigationLink from "./ProjectNavigationLink";
import Image from "next/image";
import Logo from "./Logo";
import Icon from "../ui/icon";
import { Badge } from "../ui/badge";

interface SideNavDropdownProps {
  title: string;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<SetStateAction<boolean>>;
  noSetter?: boolean;
  children: React.ReactNode;
}

function SideNavDropdown({
  title,
  isOpen,
  setIsOpen,
  children,
  noSetter = false,
}: SideNavDropdownProps) {
  const showChildren = noSetter ? true : isOpen;
  return (
    <div className="flex flex-col">
      <div
        className={`flex justify-between items-center ${
          !noSetter ? "cursor-pointer" : ""
        }`}
        onClick={() => !noSetter && setIsOpen && setIsOpen((prev) => !prev)}
      >
        <h3 className="text-[#ffffff90] text-sm">{title}</h3>

        {!noSetter &&
          (isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </div>

      {showChildren && (
        <div className="flex flex-col mt-2.5 gap-y-1.5">{children}</div>
      )}
    </div>
  );
}

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <section className="flex flex-col bg-[#222222] h-full w-[250px] justify-between py-6 px-3">
      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-8">
          {/* We need to split it into three sections */}
          {/* Main Menu - Dashboard / Notes / Schedule / Today's Todos */}
          <Logo />

          <div>
            <SideNavDropdown title="Main Menu" noSetter={true}>
              <NavigationLink
                href="/dashboard/"
                icon="material-symbols:dashboard-outline-rounded"
                title="Dashboard"
              />
              <NavigationLink
                href="/dashboard/schedule"
                icon="uil:schedule"
                title="Schedule"
              />
              <NavigationLink
                href="/dashboard/notes"
                icon="material-symbols:notes"
                title="Notes"
              />
              <NavigationLink
                href="/dashboard/activities"
                icon="material-symbols:history"
                title="Activities"
              />
              <NavigationLink href="/chat" icon="bx:chat" title="Inbox" />
            </SideNavDropdown>
          </div>
          {/* Projects - All projects */}
          <div>
            <SideNavDropdown
              title="My Project(s)"
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            >
              <ProjectNavigationLink
                href="/dashboard/project/ict374-business-analytics"
                title="Business Analytics"
              />
              <ProjectNavigationLink
                href="/dashboard/project/ict352-artificial-intelligence"
                title="Artificial Intelligence"
              />
            </SideNavDropdown>
          </div>
          {/* Recent Changes */}
          <div>
            <SideNavDropdown title="Recent" noSetter={true}>
              <ProjectNavigationLink
                href="/dashboard/project/ict374-business-analytics"
                title="Business Analytics"
              />
              <ProjectNavigationLink
                href="/dashboard/project/ict352-artificial-intelligence"
                title="Artificial Intelligence"
              />
            </SideNavDropdown>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3 border-t pt-3">
        <div className="border p-2 flex items-center justify-between rounded-full ">
          <div className="flex gap-2 items-center">
            <Icon icon="carbon:plan" />
            <p className="text-xs">Basic Tier</p>
          </div>
          <Badge>FREE</Badge>
        </div>
        <NavigationLink
          href="/dashboard/settings"
          icon="material-symbols:settings-outline-rounded"
          title="Settings"
          className="px-1 py-1"
        />
        <NavigationLink
          href="/dashboard/help-center"
          icon="material-symbols:help-outline"
          title="Help Center"
          className="px-1 py-1"
        />
      </div>
    </section>
  );
}
