"use client";

import type { Project } from "@/lib/api/types";
import { useProjectContext } from "@/lib/CurrentProjectContext";
import { useNavTabContext } from "@/lib/NavTabsContext";
import { BookOpenText } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Tabs from "./Tabs";

/** Compact project header for project sub-pages (tasks, team, files...). */
export default function ProjectSubnav({
  project,
  actions,
}: {
  project: Project | null;
  actions?: React.ReactNode;
}) {
  const { setName, setImage } = useProjectContext();
  const { handleCreateTabs } = useNavTabContext();

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setImage(project.imageUrl ?? "");
    handleCreateTabs({ name: project.name, url: `/dashboard/project/${project.id}` });
  }, [project, setName, setImage, handleCreateTabs]);

  return (
    <div className="w-full bg-card dark:bg-(--default-sidebar) border-b border-border">
      <div className="flex items-center justify-between gap-x-4 px-6 pt-4">
        <Link href={project ? `/dashboard/project/${project.id}` : "#"} className="flex items-center gap-x-3 min-w-0 group">
          <span className="size-9 shrink-0 rounded-md border border-border overflow-hidden flex items-center justify-center">
            {project?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL from the API
              <img src={project.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <BookOpenText size={18} />
            )}
          </span>
          <span className="text-lg font-bold uppercase truncate group-hover:underline">
            {project?.name ?? " "}
          </span>
        </Link>
        {actions && <div className="flex items-center gap-x-2 shrink-0">{actions}</div>}
      </div>
      <div className="px-6 pt-3">{project && <Tabs projectId={project.id} compact />}</div>
    </div>
  );
}
