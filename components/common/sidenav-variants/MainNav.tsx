"use client";

import Icon from "@/components/ui/icon";
import Logo from "../Logo";
import NavigationLink from "../NavigationLink";
import ProjectCreationLink from "../ProjectCreationLink";
import ProjectLinks from "../ProjectLinks";
import { useSession } from "@/lib/SessionContext";
import SideNavDropdown from "../SideNavDropdown";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";

interface MainNavProps {
  handleExpandedTrue: () => void;
  handleExpandedFalse: () => void;
}

/** Current plan, with project usage on the Free plan (e.g. "1/2 projects"). */
function PlanPill() {
  const { me } = useSession();
  const isPremium = me?.plan === "PREMIUM";

  return (
    <Link
      href="/dashboard/plans"
      className="border p-2 flex items-center justify-between rounded-full hover:bg-hover transition-colors"
      title={
        me && me.projectLimit !== null
          ? `${me.ownedProjects} of ${me.projectLimit} projects used`
          : undefined
      }
    >
      <div className="flex gap-2 items-center">
        <Icon icon="carbon:plan" />
        <p className="text-xs whitespace-nowrap">
          {isPremium ? "Premium Tier" : "Basic Tier"}
          {me && me.projectLimit !== null && (
            <span className="text-muted-text">
              {" · "}
              {me.ownedProjects}/{me.projectLimit}
            </span>
          )}
        </p>
      </div>
      <Badge>{isPremium ? "PRO" : "FREE"}</Badge>
    </Link>
  );
}

export default function MainNav({
  handleExpandedTrue,
  handleExpandedFalse,
}: MainNavProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`flex flex-col size-full justify-between border-r py-6 px-3`}
    >
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
                title="Chats"
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
              <ProjectLinks handleExpandedToggle={handleExpandedTrue} />
              <ProjectCreationLink title="Create New Project" />
            </SideNavDropdown>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3 border-t pt-3">
        <PlanPill />
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
