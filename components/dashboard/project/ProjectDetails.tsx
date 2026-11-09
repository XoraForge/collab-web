"use client";

import Avatar from "@/components/common/Avatar";
import { Project } from "@/lib/api/types";
import { useProjectContext } from "@/lib/CurrentProjectContext";
import dayjs from "@/lib/dayjs";
import { useNavTabContext } from "@/lib/NavTabsContext";
import { VISIBILITY_LABEL } from "@/lib/projectStatus";
import { BookOpenText } from "lucide-react";
import EditProjectButton from "./EditProjectButton";
import InviteButton from "./InviteButton";
import ShareButton from "./ShareButton";
import { useEffect } from "react";

export default function ProjectDetails({ project }: { project: Project }) {
  const { setName, setImage } = useProjectContext();
  const { handleCreateTabs } = useNavTabContext();

  useEffect(() => {
    setName(project.name);
    setImage(project.imageUrl ?? "");
    // Opening a project adds it to the header tabs (de-duplicated by URL).
    handleCreateTabs({
      name: project.name,
      url: `/dashboard/project/${project.id}`,
    });
  }, [project.id, project.name, project.imageUrl, setName, setImage, handleCreateTabs]);

  const ownerName = project.owner.name || project.owner.email;

  return (
    <div className="flex justify-between items-center gap-x-6 text-text">
      {/* Image and Name */}
      <div className="flex gap-x-6 min-w-0">
        <div className="size-32 shrink-0 relative overflow-hidden border border-border flex items-center justify-center rounded-md">
          {project.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from the API
            <img
              src={project.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <BookOpenText size={50} />
          )}
        </div>
        <div className="flex flex-col justify-center gap-y-1.5 min-w-0">
          <p className="text-sm font-medium">
            {VISIBILITY_LABEL[project.visibility]}
          </p>
          <h1 className="text-4xl font-bold uppercase break-words">
            {project.name}
          </h1>
          <div className="flex items-center">
            <p className="text-sm font-regular">Created By: </p>
            <Avatar
              src={project.owner.imageUrl ?? undefined}
              name={ownerName}
              className="ml-2.5"
            />
            <p className="text-sm font-medium ml-1.5">{ownerName}</p>
          </div>
        </div>
      </div>
      {/* Team Members and Actions */}
      <div className="flex gap-x-3 items-center shrink-0">
        {/* Team members */}
        <div className="flex self-end pb-2"></div>
        <div className="flex flex-col gap-y-2">
          {project.lastUpdatedAt && (
            <div className="text-right">
              <p className="font-medium text-xs" suppressHydrationWarning>
                Last Update: {dayjs(project.lastUpdatedAt).fromNow()}
              </p>
            </div>
          )}
          {/* Actions (Share | Invite | Edit) */}
          <div className="flex gap-x-3">
            <ShareButton project={project} />
            <InviteButton
              projectId={project.id}
              canInvite={project.role === "PROJECT_MANAGER"}
            />
            <EditProjectButton project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}
