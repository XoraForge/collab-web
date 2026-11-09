"use client";

import { useSession } from "@/lib/SessionContext";
import ProjectNavigationLink from "./ProjectNavigationLink";

/** The signed-in user's projects, for both sidebar variants. */
export default function ProjectLinks({
  isExpanded = false,
  handleExpandedToggle,
}: {
  isExpanded?: boolean;
  handleExpandedToggle: () => void;
}) {
  const { projects, isLoading } = useSession();

  if (isLoading) {
    return (
      <>
        {[0, 1].map((i) => (
          <div
            key={i}
            aria-hidden
            className={`rounded-sm bg-border/60 animate-pulse ${
              isExpanded ? "size-[38px]" : "h-[30px] w-full"
            }`}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {projects.map((project) => (
        <ProjectNavigationLink
          key={project.id}
          href={`/dashboard/project/${project.id}`}
          title={project.name}
          isExpanded={isExpanded}
          handleExpandedToggle={handleExpandedToggle}
        />
      ))}
    </>
  );
}
