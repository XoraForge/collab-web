"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { createDocument, listDocuments } from "@/lib/api/Document";
import { getProject } from "@/lib/api/Project";
import type { DocumentSummary, Project } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { ProjectEvent, useProjectEvents } from "@/lib/realtime";
import { useComingSoon, useToast } from "@/lib/ToastContext";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ProjectSubnav from "./ProjectSubnav";

const OTHER_TOOLS = [
  { label: "Excel sheet", icon: "icon-park-outline:excel-one" },
  { label: "PowerPoint", icon: "icon-park-outline:powerpoint" },
  { label: "UML diagram", icon: "mdi:sitemap-outline" },
];

export default function FilesPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const toast = useToast();
  const comingSoon = useComingSoon();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(
    () =>
      Promise.all([getProject(projectId), listDocuments(projectId)])
        .then(([p, docs]) => {
          setProject(p);
          setDocuments(docs);
        })
        .catch(() => setDocuments([])),
    [projectId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useProjectEvents(projectId, useCallback((e: ProjectEvent) => e.type === "DOCUMENTS_CHANGED" && load(), [load]));

  async function create() {
    setCreating(true);
    try {
      const doc = await createDocument(projectId, { title: "Project Proposal", type: "WORD", template: "PROPOSAL" });
      router.push(`/dashboard/project/${projectId}/files/${doc.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't create the document.");
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-bg text-text">
      <ProjectSubnav
        project={project}
        actions={
          <Button size="sm" onClick={create} disabled={creating}>
            <Plus /> {creating ? "Creating…" : "New Word document"}
          </Button>
        }
      />
      <div className="px-6 py-5 flex flex-col gap-y-6 overflow-y-auto small-scrollbar">
        <div className="rounded-md border overflow-hidden max-w-4xl">
          {documents === null ? (
            <p className="px-4 py-6 text-sm text-muted-text">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-text">No documents yet. Create the first one.</p>
          ) : (
            documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/dashboard/project/${projectId}/files/${doc.id}`}
                className="flex items-center justify-between gap-x-4 px-4 py-3 border-b last:border-b-0 hover:bg-hover"
              >
                <span className="flex items-center gap-x-3 min-w-0">
                  <Icon icon="icon-park-outline:word" fontSize={20} className="shrink-0" />
                  <span className="text-sm font-medium truncate">{doc.title}</span>
                </span>
                <span className="text-xs text-muted-text shrink-0">
                  {doc.sectionCount} sections
                  {doc.updatedAt && ` · updated ${dayjs(doc.updatedAt).fromNow()}`}
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="max-w-4xl">
          <p className="text-xs font-medium text-subtle-text mb-2">More tools</p>
          <div className="flex flex-wrap gap-2">
            {OTHER_TOOLS.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={() => comingSoon(tool.label)}
                className="flex items-center gap-x-2 rounded-md border px-3 py-2 text-sm hover:bg-hover"
              >
                <Icon icon={tool.icon} fontSize={18} /> {tool.label}
                <span className="text-[10px] text-muted-text">Soon</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
