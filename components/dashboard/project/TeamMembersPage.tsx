"use client";

import Avatar from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { listMembers } from "@/lib/api/Document";
import { getProject } from "@/lib/api/Project";
import type { Member, Project } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { ProjectEvent, useProjectEvents } from "@/lib/realtime";
import { useCallback, useEffect, useState } from "react";
import InviteButton from "./InviteButton";
import ProjectSubnav from "./ProjectSubnav";

export default function TeamMembersPage({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);

  const load = useCallback(
    () =>
      Promise.all([getProject(projectId), listMembers(projectId)])
        .then(([p, m]) => {
          setProject(p);
          setMembers(m);
        })
        .catch(() => setMembers([])),
    [projectId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useProjectEvents(
    projectId,
    useCallback((e: ProjectEvent) => (e.type === "MEMBERS_CHANGED" || e.type === "PROJECT_CHANGED") && load(), [load])
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-bg text-text">
      <ProjectSubnav
        project={project}
        actions={project && <InviteButton projectId={project.id} canInvite={project.role === "PROJECT_MANAGER"} />}
      />
      <div className="px-6 py-5 overflow-y-auto small-scrollbar">
        <p className="text-sm text-muted-text mb-3">
          {members ? `${members.length} member${members.length === 1 ? "" : "s"}` : "Loading…"}
        </p>
        <div className="rounded-md border overflow-hidden max-w-3xl">
          {members?.map((m) => (
            <div key={m.user.id} className="flex items-center justify-between gap-x-4 px-4 py-3 border-b last:border-b-0">
              <div className="flex items-center gap-x-3 min-w-0">
                <Avatar src={m.user.imageUrl ?? undefined} name={m.user.name || m.user.email} size={32} className="text-xs" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.user.name || m.user.email}</p>
                  <p className="text-xs text-muted-text truncate">{m.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-x-4 shrink-0">
                <span className="text-xs text-muted-text">Joined {dayjs(m.joinedDate).format("D MMM YYYY")}</span>
                <Badge className={m.role === "PROJECT_MANAGER" ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100" : "bg-border text-text"}>
                  {m.role === "PROJECT_MANAGER" ? "Team leader" : "Member"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
