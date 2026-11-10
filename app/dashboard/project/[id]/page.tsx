import ProjectActivity from "@/components/activity/ProjectActivity";
import DetailTitle from "@/components/dashboard/project/DetailTitle";
import ProjectDetails from "@/components/dashboard/project/ProjectDetails";
import Tabs from "@/components/dashboard/project/Tabs";
import Avatar from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { getProjectStatus } from "@/lib/projectStatus";
import { apiFetch } from "@/lib/server/session";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";

async function loadProject(id: string): Promise<Project> {
  const res = await apiFetch(`/projects/${encodeURIComponent(id)}`);
  if (res.status === 401) {
    redirect(`/api/auth/logout?next=${encodeURIComponent(`/dashboard/project/${id}`)}`);
  }
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to load project (${res.status})`);
  return res.json();
}

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await loadProject(id);
  const status = getProjectStatus(project);
  const ownerName = project.owner.name || project.owner.email;

  return (
    <div className="flex flex-col size-full bg-bg text-text">
      {/* Banner */}
      <div className="w-full bg-card dark:bg-(--default-sidebar) border-b border-border flex justify-center">
        <div className="w-full px-4 lg:px-0 lg:w-[80%] py-6 flex flex-col gap-y-8">
          <ProjectDetails project={project} />
          <Tabs projectId={project.id} />
        </div>
      </div>

      {/* Screens */}
      <div className="flex flex-1 min-h-0 justify-center overflow-y-auto lg:overflow-visible">
        <div className="w-full px-4 lg:px-0 lg:w-[80%] flex flex-col lg:flex-row gap-6 pt-5">
          {/* Left */}
          <div className="flex flex-col lg:w-[70%] lg:overflow-y-auto no-scrollbar gap-y-3 pb-6">
            <h3 className="text-lg">Overview</h3>
            <hr />
            {project.description ? (
              <div className="markdown-body px-2">
                <ReactMarkdown>{project.description}</ReactMarkdown>
              </div>
            ) : (
              <div className="px-2 py-10 flex flex-col items-center text-center gap-y-1">
                <p className="font-medium">No overview yet</p>
                <p className="text-sm text-muted-text max-w-sm">
                  Add a description so your team knows what this project is
                  about, its goals and who does what.
                </p>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="lg:w-[30%] h-fit flex flex-col gap-y-3 pb-24 lg:pb-0">
            {/* Project Details */}
            <div className="bg-card dark:bg-(--default-sidebar) border border-border rounded-md px-3 py-2">
              <h1 className="text-lg font-medium">Project Details</h1>

              <div className="flex flex-col gap-y-2 opacity-70">
                {project.createdAt && (
                  <div className="flex justify-between gap-x-3">
                    <DetailTitle icon="mingcute:time-line" title="Created At" />
                    <p className="text-right">
                      {dayjs(project.createdAt).format("D MMMM YYYY, h:mmA")}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <DetailTitle icon="lets-icons:progress" title="Status" />
                  <Badge className={status.className}>{status.label}</Badge>
                </div>

                <div className="flex justify-between">
                  <DetailTitle icon="stash:calendar-end" title="Due By" />
                  <p>
                    {project.dueDate
                      ? dayjs(project.dueDate).format("D MMMM YYYY")
                      : "No due date"}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <DetailTitle icon="mdi:users" title="Contributors" />
                  <div className="flex items-center gap-x-2">
                    <Avatar
                      src={project.owner.imageUrl ?? undefined}
                      name={ownerName}
                    />
                    {project.memberCount > 1 && (
                      <span className="text-sm">+{project.memberCount - 1}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-card dark:bg-(--default-sidebar) border border-border rounded-md px-3 py-2">
              <h1 className="text-lg font-medium">Recent Activities</h1>

              <ProjectActivity projectId={project.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
