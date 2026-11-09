"use client";

import { ApiError } from "@/lib/api/client";
import { createDocument, listDocuments } from "@/lib/api/Document";
import type { DocumentSummary } from "@/lib/api/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useProjectEvents } from "@/lib/realtime";
import NavigationLink from "../NavigationLink";

/** The project's documents, for the expanded sidebar's "Files" group. */
export default function ProjectFiles({
  projectId,
  handleExpandedToggle,
}: {
  projectId: string;
  handleExpandedToggle: () => void;
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    () => listDocuments(projectId).then(setDocuments).catch(() => setDocuments([])),
    [projectId]
  );

  useEffect(() => {
    load();
  }, [load]);

  // A teammate created, renamed or deleted a document.
  useProjectEvents(
    projectId,
    useCallback((event) => event.type === "DOCUMENTS_CHANGED" && load(), [load])
  );

  async function handleCreate() {
    setIsCreating(true);
    setError("");
    try {
      const doc = await createDocument(projectId, {
        title: "Project Proposal",
        type: "WORD",
        template: "PROPOSAL",
      });
      setDocuments((list) => [...(list ?? []), { ...doc, sectionCount: doc.sections.length }]);
      handleExpandedToggle();
      router.push(`/dashboard/project/${projectId}/files/${doc.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the document.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      {documents === null &&
        [0, 1].map((i) => <div key={i} aria-hidden className="h-8 rounded-sm bg-border/60 animate-pulse" />)}

      {documents?.map((doc) => (
        <NavigationLink
          key={doc.id}
          href={`/dashboard/project/${projectId}/files/${doc.id}`}
          icon="icon-park-outline:word"
          title={doc.title}
          isExpanded={false}
          handleExpandedToggle={handleExpandedToggle}
        />
      ))}

      {documents?.length === 0 && (
        <p className="text-xs text-muted-text px-2">No documents yet.</p>
      )}

      <button
        type="button"
        onClick={handleCreate}
        disabled={isCreating}
        className="flex items-center gap-x-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 duration-200 ease-in-out p-2 rounded-sm text-sm font-medium disabled:opacity-50"
      >
        <Plus className="size-4" />
        {isCreating ? "Creating…" : "New Word document"}
      </button>
      {error && <p className="text-xs text-destructive px-2">{error}</p>}
    </>
  );
}
