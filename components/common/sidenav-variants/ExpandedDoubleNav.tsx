"use client";

import { useProjectContext } from "@/lib/CurrentProjectContext";
import Logo from "../Logo";
import NavigationLink from "../NavigationLink";
import ProjectCreationLink from "../ProjectCreationLink";
import ProjectNavigationLink from "../ProjectNavigationLink";
import SideNavDropdown from "../SideNavDropdown";
import MiniProjectDetails from "../expanded-nav/MiniProjectDetails";
import { useEffect, useState } from "react";

interface SideNavProps {
  handleExpandedTrue: () => void;
  handleExpandedFalse: () => void;
}

export default function ExpandedDoubleNav({
  handleExpandedTrue,
  handleExpandedFalse,
}: SideNavProps) {
  const [pageId, setPageId] = useState("");
  const { name } = useProjectContext();

  useEffect(() => {
    setPageId(name.replaceAll(" ", "-").toLowerCase());
  }, [name]);

  return (
    <>
      <div className="flex flex-col size-full justify-between w-1/3 items-center border-r py-6">
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-8 ">
            {/* We need to split it into three sections */}
            {/* Main Menu - Dashboard / Notes / Schedule / Today's Todos */}
            <Logo noText={true} handleOnClick={handleExpandedFalse} />

            <div className="flex flex-col gap-y-2">
              <NavigationLink
                href="/dashboard"
                icon="material-symbols:dashboard-outline-rounded"
                title="Dashboard"
                isExpanded={true}
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/schedule"
                icon="uil:schedule"
                title="Schedule"
                isExpanded={true}
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/notes"
                icon="material-symbols:notes"
                title="Notes"
                isExpanded={true}
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/activities"
                icon="material-symbols:history"
                title="Activities"
                isExpanded={true}
                handleExpandedToggle={handleExpandedFalse}
              />
              <NavigationLink
                href="/dashboard/chat"
                icon="bx:chat"
                title="Inbox"
                isExpanded={true}
                handleExpandedToggle={handleExpandedFalse}
              />
            </div>
            {/* Projects - All projects */}
            <div className="flex flex-col gap-y-2">
              <ProjectNavigationLink
                href="/dashboard/project/ict374-business-analytics"
                title="Business Analytics"
                isExpanded={true}
                handleExpandedToggle={handleExpandedTrue}
              />
              <ProjectNavigationLink
                href="/dashboard/project/ict352-artificial-intelligence"
                title="Artificial Intelligence"
                isExpanded={true}
                handleExpandedToggle={handleExpandedTrue}
              />
              <ProjectCreationLink
                title="Create New Project"
                isExpanded={true}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-3 border-t pt-3">
          <NavigationLink
            href="/dashboard/plans"
            title="plan"
            isExpanded={true}
            className="px-1 py-1"
            icon="carbon:plan"
            handleExpandedToggle={handleExpandedFalse}
          />

          <NavigationLink
            href="/dashboard/settings"
            icon="material-symbols:settings-outline-rounded"
            title="Settings"
            className="px-1 py-1"
            isExpanded={true}
            handleExpandedToggle={handleExpandedFalse}
          />
          <NavigationLink
            href="/dashboard/help-center"
            icon="material-symbols:help-outline"
            title="Help Center"
            className="px-1 py-1"
            isExpanded={true}
            handleExpandedToggle={handleExpandedFalse}
          />
        </div>
      </div>
      <div className="flex flex-col w-full px-3 py-6 border-r gap-y-4">
        {/* Project Information */}
        <MiniProjectDetails />
        <hr />
        {/* Project Navigation */}
        <SideNavDropdown title="Components" noSetter={true}>
          <NavigationLink
            href={`/dashboard/project/${pageId}/overview`}
            icon="grommet-icons:overview"
            title="Overview"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
          <NavigationLink
            href={`/dashboard/project/${pageId}/assignments`}
            icon="fa7-solid:tasks"
            title="Assignments"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
          <NavigationLink
            href={`/dashboard/project/${pageId}/team-members`}
            icon="ri:team-fill"
            title="Team Members"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
          <NavigationLink
            href={`/dashboard/project/${pageId}/activities`}
            icon="grommet-icons:schedule-new"
            title="Schedules"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
          <NavigationLink
            href={`/dashboard/project/${pageId}/activities`}
            icon="fluent:notepad-edit-16-regular"
            title="Notes"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
        </SideNavDropdown>
        <SideNavDropdown title="Files" noSetter={true}>
          <NavigationLink
            href="/dashboard/test"
            icon="icon-park-outline:word"
            title="Word"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
          <NavigationLink
            href="/dashboard/chat"
            icon="icon-park-outline:excel-one"
            title="Excel"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
          <NavigationLink
            href="/dashboard/chat"
            icon="icon-park-outline:powerpoint"
            title="PowerPoint"
            isExpanded={false}
            handleExpandedToggle={handleExpandedTrue}
          />
        </SideNavDropdown>
      </div>
    </>
  );
}
