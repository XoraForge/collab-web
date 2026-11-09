"use client";

import ComingSoon from "@/components/common/ComingSoon";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  addSection,
  getDocument,
  getPublishedDocument,
  getVersion,
  listMembers,
  listVersions,
  reorderSections,
} from "@/lib/api/Document";
import type {
  DocumentDetail,
  Member,
  PublishedSection,
  Section,
  VersionDetail,
  VersionSummary,
} from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { ProjectEvent, useProjectEvents } from "@/lib/realtime";
import { useSidebarContext } from "@/lib/SidebarContext";
import type { Editor } from "@tiptap/react";
import { Eye, Plus } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DocumentMenu from "./header/DocumentMenu";
import SecondaryHeader from "./header/SecondaryHeader";
import AdjustableSections from "./layout/AdjustableSections";
import LiveSectionEditor from "./sections/LiveSectionEditor";
import PreviewDocument from "./sections/PreviewDocument";
import PublishedSectionView from "./sections/PublishedSectionView";
import TocSectionView from "./sections/TocSectionView";
import VersionDiffDialog from "./sections/VersionDiffDialog";
import { parseContent } from "./tools/prosemirror";
import { downloadDocx } from "./tools/docxExporter";

function lastActivity(document: DocumentDetail) {
  const times = [
    document.updatedAt,
    ...document.sections.flatMap((s) => [s.publishedAt, s.draftUpdatedAt]),
  ].filter(Boolean) as string[];
  return times.sort().at(-1) ?? null;
}

export default function DocumentLayout() {
  const { setIsSidebarVisible } = useSidebarContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string; fileid: string }>();
  const documentId = params.fileid;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("section"));
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [zoom, setZoom] = useState(100);

  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [latestPublished, setLatestPublished] = useState<string | null>(null);
  const [publishedLoading, setPublishedLoading] = useState(true);
  const [hasUnpublished, setHasUnpublished] = useState(false);
  const [openVersion, setOpenVersion] = useState<VersionSummary | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const [preview, setPreview] = useState<PublishedSection[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [notice, setNotice] = useState("");
  /** Bumped on every live change event, so generated views (TOC, preview) refresh. */
  const [changeCount, setChangeCount] = useState(0);

  useEffect(() => {
    setIsSidebarVisible(false);
  }, [setIsSidebarVisible]);

  const loadDocument = useCallback(async () => {
    try {
      setDocument(await getDocument(documentId));
    } catch (err) {
      setLoadError(
        err instanceof ApiError && err.status === 404
          ? "not-found"
          : "Couldn't load this document."
      );
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Fallback refresh in case a live event was missed (e.g. while offline).
  useEffect(() => {
    const refresh = () => {
      if (window.document.visibilityState === "visible") loadDocument();
    };
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [loadDocument]);

  // Members are only needed by the team leader (to assign sections).
  const projectId = document?.projectId;
  const canManage = document?.canManage ?? false;
  const loadMembers = useCallback(() => {
    if (projectId && canManage) listMembers(projectId).then(setMembers).catch(() => setMembers([]));
  }, [projectId, canManage]);
  useEffect(loadMembers, [loadMembers]);

  // Live updates: teammates publish, submit, get approved, are assigned...
  const isPreviewOpen = preview !== null;
  useProjectEvents(
    projectId,
    useCallback(
      (event: ProjectEvent) => {
        if (event.type === "MEMBERS_CHANGED") {
          loadMembers();
          return;
        }
        if (event.documentId !== documentId) return;
        loadDocument();
        setChangeCount((n) => n + 1);
        if (isPreviewOpen) getPublishedDocument(documentId).then(setPreview).catch(() => {});
      },
      [documentId, loadDocument, loadMembers, isPreviewOpen]
    )
  );

  const section: Section | null =
    document?.sections.find((s) => s.id === selectedId) ?? document?.sections[0] ?? null;

  // History + latest published content for the selected section.
  const sectionId = section?.id;
  const publishedVersion = section?.publishedVersion ?? 0;
  useEffect(() => {
    if (!sectionId) return;
    let cancelled = false;
    setPublishedLoading(true);
    Promise.all([
      listVersions(sectionId),
      publishedVersion > 0 ? getVersion(sectionId, publishedVersion) : Promise.resolve(null),
    ])
      .then(([list, latest]) => {
        if (cancelled) return;
        setVersions(list);
        setLatestPublished(latest?.contentJson ?? null);
      })
      .catch(() => !cancelled && setVersions([]))
      .finally(() => !cancelled && setPublishedLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sectionId, publishedVersion]);

  function selectSection(id: string) {
    setSelectedId(id);
    setPreview(null);
    setHasUnpublished(false);
    router.replace(`?section=${id}`, { scroll: false });
  }

  function replaceSection(updated: Section) {
    setDocument((d) =>
      d ? { ...d, sections: d.sections.map((s) => (s.id === updated.id ? updated : s)) } : d
    );
  }

  async function handleReorder(ids: string[]) {
    if (!document) return;
    // Optimistic: show the new order immediately.
    const byId = new Map(document.sections.map((s) => [s.id, s]));
    setDocument({ ...document, sections: ids.map((id, i) => ({ ...byId.get(id)!, position: i })) });
    try {
      setDocument(await reorderSections(document.id, ids));
    } catch {
      loadDocument();
    }
  }

  async function handleAddSection(title: string) {
    if (!document) return;
    try {
      const updated = await addSection(document.id, title);
      setDocument(updated);
      setIsAddingSection(false);
      selectSection(updated.sections[updated.sections.length - 1].id);
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : "Couldn't add the section.");
    }
  }

  // Uses the id from the URL, so it works even before the document has loaded.
  function fetchPublished() {
    return getPublishedDocument(documentId);
  }

  async function openPreview() {
    setPreviewLoading(true);
    setPreview([]);
    try {
      setPreview(await fetchPublished());
    } catch {
      setPreview(null);
      setNotice("Couldn't load the preview.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleExport() {
    if (!document) return;
    try {
      const sections = await fetchPublished();
      if (sections.every((s) => !s.contentJson)) {
        setNotice("Nothing has been published yet, so there's nothing to download.");
        return;
      }
      await downloadDocx(
        sections.map((s) => ({
          kind: s.kind,
          pageBreakBefore: s.pageBreakBefore,
          content: parseContent(s.contentJson),
        })),
        document.title
      );
    } catch (err) {
      console.error("Failed to export .docx", err);
      setNotice("Couldn't export the document.");
    }
  }

  function handleRestore(version: VersionDetail) {
    const content = parseContent(version.contentJson);
    if (activeEditor && content) {
      activeEditor.commands.setContent(content);
      setOpenVersion(null);
      setNotice(`Restored v${version.number} into the draft. Publish to make it the latest version.`);
    }
  }

  // Dismiss notices after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ComingSoon
          title={loadError === "not-found" ? "Document not found" : "Something went wrong"}
          description={
            loadError === "not-found"
              ? "It may have been deleted, or you don't have access to it."
              : loadError
          }
          icon="icon-park-outline:word"
        />
      </div>
    );
  }

  const updatedAt = document ? lastActivity(document) : null;

  return (
    <div className="grid grid-cols-16 flex-1 min-h-0">
      {/* Column 1: Sections (2) */}
      <div className="col-span-2 border p-3 flex flex-col gap-y-3 min-h-0 overflow-y-auto small-scrollbar">
        <div className="flex justify-between p-2">
          <div className="flex items-center gap-x-3 min-w-0">
            <Icon icon="icon-park-outline:word" className="shrink-0" />
            <div className="flex flex-col gap-y-1 min-w-0">
              <h1 className="text-xs font-medium truncate">{document?.title ?? "Loading…"}</h1>
              {updatedAt && (
                <p className="text-xs" suppressHydrationWarning>
                  Updated {dayjs(updatedAt).fromNow()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            {document && (
              <DocumentMenu document={document} onRenamed={setDocument} onExport={handleExport} />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-y-2 py-2 border-t">
          <div className="flex justify-between items-center">
            <h1 className="text-xs font-medium">Sections</h1>
            {canManage && (
              <button
                type="button"
                aria-label="Add section"
                title="Add section"
                onClick={() => setIsAddingSection(true)}
                className="rounded-sm p-0.5 hover:bg-hover"
              >
                <Plus className="size-3" />
              </button>
            )}
          </div>

          {document && (
            <AdjustableSections
              sections={document.sections}
              selectedId={preview ? null : section?.id ?? null}
              canManage={canManage}
              isAdding={isAddingSection}
              onSelect={selectSection}
              onReorder={handleReorder}
              onAdd={handleAddSection}
              onCancelAdd={() => setIsAddingSection(false)}
            />
          )}
        </div>
        <Button
          variant={preview ? "default" : "outline"}
          size="sm"
          className="mt-auto"
          disabled={!document}
          onClick={() => (preview ? setPreview(null) : openPreview())}
        >
          <Eye /> {preview ? "Back to editing" : "Preview document"}
        </Button>
      </div>

      {/* Column 2: Body (12) */}
      <div className="col-span-12 border flex flex-col min-h-0 relative">
        {notice && (
          <div
            role="status"
            className="absolute left-1/2 top-14 -translate-x-1/2 z-20 rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
          >
            {notice}
          </div>
        )}
        {preview ? (
          <PreviewDocument
            sections={preview}
            isLoading={previewLoading}
            zoom={zoom}
            onClose={() => setPreview(null)}
            onExport={handleExport}
          />
        ) : !section ? (
          <div className="flex-1 bg-canvas" />
        ) : section.kind === "TABLE_OF_CONTENTS" ? (
          <TocSectionView
            key={section.id}
            section={section}
            documentId={documentId}
            refreshKey={changeCount}
            zoom={zoom}
            onZoomChange={setZoom}
            onExport={handleExport}
          />
        ) : section.canEdit ? (
          <LiveSectionEditor
            // Reconnect if the section changes or edit permission changes.
            key={`${section.id}:${section.canEdit}`}
            section={section}
            latestPublished={latestPublished}
            zoom={zoom}
            onZoomChange={setZoom}
            onExport={handleExport}
            onPublished={() => {
              setNotice("Published. Your team can now see this version.");
              loadDocument();
            }}
            onAccessLost={loadDocument}
            onEditorChange={setActiveEditor}
            onUnpublishedChange={setHasUnpublished}
          />
        ) : (
          <PublishedSectionView
            key={section.id}
            section={section}
            latestPublished={latestPublished}
            isLoading={publishedLoading}
            zoom={zoom}
            onZoomChange={setZoom}
            onExport={handleExport}
          />
        )}
      </div>

      {/* Column 3: Properties (2) */}
      <div className="col-span-2 border min-h-0 overflow-y-auto small-scrollbar">
        {section && !preview && (
          <SecondaryHeader
            section={section}
            members={members}
            canManage={canManage}
            hasUnpublished={section.canEdit && hasUnpublished}
            versions={versions}
            onSectionChange={replaceSection}
            onDocumentChange={(d) => {
              setDocument(d);
              setSelectedId(d.sections[0]?.id ?? null);
            }}
            onOpenVersion={setOpenVersion}
          />
        )}
      </div>

      {section && (
        <VersionDiffDialog
          sectionId={section.id}
          version={openVersion}
          canRestore={section.canEdit && activeEditor !== null}
          onRestore={handleRestore}
          onClose={() => setOpenVersion(null)}
        />
      )}
    </div>
  );
}
