import Logo from "../Logo";
import NavigationLink from "../NavigationLink";
import ProjectCreationLink from "../ProjectCreationLink";
import ProjectNavigationLink from "../ProjectNavigationLink";

export default function ExpandedDoubleNav() {
  return (
    <>
      <div className="flex flex-col size-full justify-between w-1/3 items-center border-r py-6">
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-8 ">
            {/* We need to split it into three sections */}
            {/* Main Menu - Dashboard / Notes / Schedule / Today's Todos */}
            <Logo noText={true} />

            <div>
              <NavigationLink
                href="/dashboard"
                icon="material-symbols:dashboard-outline-rounded"
                title="Dashboard"
                isExpanded={true}
              />
              <NavigationLink
                href="/dashboard/schedule"
                icon="uil:schedule"
                title="Schedule"
                isExpanded={true}
              />
              <NavigationLink
                href="/dashboard/notes"
                icon="material-symbols:notes"
                title="Notes"
                isExpanded={true}
              />
              <NavigationLink
                href="/dashboard/activities"
                icon="material-symbols:history"
                title="Activities"
                isExpanded={true}
              />
              <NavigationLink
                href="/chat"
                icon="bx:chat"
                title="Inbox"
                isExpanded={true}
              />
            </div>
            {/* Projects - All projects */}
            <div className="flex flex-col gap-y-2">
              <ProjectNavigationLink
                href="/dashboard/project/ict374-business-analytics"
                title="Business Analytics"
                isExpanded={true}
              />
              <ProjectNavigationLink
                href="/dashboard/project/ict352-artificial-intelligence"
                title="Artificial Intelligence"
                isExpanded={true}
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
          />

          <NavigationLink
            href="/dashboard/settings"
            icon="material-symbols:settings-outline-rounded"
            title="Settings"
            className="px-1 py-1"
            isExpanded={true}
          />
          <NavigationLink
            href="/dashboard/help-center"
            icon="material-symbols:help-outline"
            title="Help Center"
            className="px-1 py-1"
            isExpanded={true}
          />
        </div>
      </div>
      <div className="flex flex-col w-full">aa</div>
    </>
  );
}
