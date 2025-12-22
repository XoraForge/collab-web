"use client";

import Icon from "@/components/ui/icon";
import Logo from "../Logo";
import NavigationLink from "../NavigationLink";
import ProjectCreationLink from "../ProjectCreationLink";
import ProjectNavigationLink from "../ProjectNavigationLink";
import SideNavDropdown from "../SideNavDropdown";
import { Badge } from "@/components/ui/badge";
import { Dispatch, SetStateAction, useState } from "react";

interface MainNavProps {
  handleExpandedTrue: () => void;
  handleExpandedFalse: () => void;
}

export default function MainNav({
  handleExpandedTrue,
  handleExpandedFalse,
}: MainNavProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`flex flex-col size-full justify-between py-6 px-3`}>
      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-8">
          {/* We need to split it into three sections */}
          {/* Main Menu - Dashboard / Notes / Schedule / Today's Todos */}
          <Logo handleOnClick={handleExpandedFalse} />

          <div>
            <SideNavDropdown title="Main Menu" noSetter={true}>
              <NavigationLink
                href="/dashboard"
                icon="material-symbols:dashboard-outline-rounded"
                title="Dashboard"
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/schedule"
                icon="uil:schedule"
                title="Schedule"
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/notes"
                icon="material-symbols:notes"
                title="Notes"
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/activities"
                icon="material-symbols:history"
                title="Activities"
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/chat"
                icon="bx:chat"
                title="Inbox"
                handleExpandedToggle={handleExpandedFalse}
              />
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
                handleExpandedToggle={handleExpandedTrue}
              />
              <ProjectNavigationLink
                href="/dashboard/project/ict352-artificial-intelligence"
                title="Artificial Intelligence"
                handleExpandedToggle={handleExpandedTrue}
              />
              <ProjectCreationLink title="Create New Project" />
            </SideNavDropdown>
          </div>
          {/* Recent Changes */}
          <div>
            <SideNavDropdown title="Recent" noSetter={true}>
              <ProjectNavigationLink
                href="/dashboard/project/ict374-business-analytics"
                title="Business Analytics"
                handleExpandedToggle={handleExpandedTrue}
              />
              <ProjectNavigationLink
                href="/dashboard/project/ict352-artificial-intelligence"
                title="Artificial Intelligence"
                handleExpandedToggle={handleExpandedTrue}
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
          handleExpandedToggle={handleExpandedFalse}
        />
        <NavigationLink
          href="/dashboard/help-center"
          icon="material-symbols:help-outline"
          title="Help Center"
          className="px-1 py-1"
          handleExpandedToggle={handleExpandedFalse}
        />
      </div>
    </div>
  );
}
