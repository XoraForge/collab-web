"use client";

import ComingSoon from "@/components/common/ComingSoon";
import { Button } from "@/components/ui/button";
import { getProject } from "@/lib/api/Project";
import type { Project } from "@/lib/api/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProjectSubnav from "./ProjectSubnav";

/** A project tab that isn't built yet, keeping the project header and tabs. */
export default function ProjectComingSoon({
  projectId,
  title,
  description,
  icon,
  action,
}: {
  projectId: string;
  title: string;
  description?: string;
  icon: string;
  action?: { label: string; href: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  useEffect(() => {
    getProject(projectId).then(setProject).catch(() => {});
  }, [projectId]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-bg text-text">
      <ProjectSubnav project={project} />
      <div className="flex flex-1 flex-col items-center justify-center">
        <ComingSoon title={title} description={description} icon={icon} />
        {action && (
          <Button asChild variant="outline" className="-mt-2">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
