"use client";

import type { Section } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { useEditor } from "@tiptap/react";
import { useMemo } from "react";
import { createDocumentExtensions } from "../editor/extensions";
import MainHeader from "../header/MainHeader";
import Document from "../layout/Document";
import A4 from "../paper/A4";
import { parseContent } from "../tools/prosemirror";
import ReadOnlyContent from "./ReadOnlyContent";
import SectionBar from "./SectionBar";
import { viewOnlyReason } from "./sectionMeta";

/** What teammates see for sections they can't edit: the latest published version. */
export default function PublishedSectionView({
  section,
  latestPublished,
  isLoading,
  zoom,
  onZoomChange,
  onExport,
}: {
  section: Section;
  latestPublished: string | null;
  isLoading: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
}) {
  const content = useMemo(() => parseContent(latestPublished), [latestPublished]);

  return (
    <>
      <SectionBar section={section} note={viewOnlyReason(section)} />
      <ReadOnlyToolbar zoom={zoom} onZoomChange={onZoomChange} onExport={onExport} />
      <Document zoom={zoom}>
        <A4>
          {isLoading ? null : content ? (
            <ReadOnlyContent content={content} />
          ) : (
            <p className="text-sm text-muted-text py-10 text-center">
              Nothing has been published in this section yet.
            </p>
          )}
        </A4>
      </Document>
      <div className="flex items-center border-t px-3 py-1 text-xs text-muted-text">
        {section.publishedVersion > 0 && section.publishedAt
          ? `Showing v${section.publishedVersion}, published ${dayjs(section.publishedAt).fromNow()}`
          : "No published version"}
      </div>
    </>
  );
}

/** The normal toolbar in read-only mode (it reads state from an editor, so give it an empty one). */
function ReadOnlyToolbar({
  zoom,
  onZoomChange,
  onExport,
}: {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
}) {
  const editor = useEditor({
    extensions: createDocumentExtensions(),
    editable: false,
    immediatelyRender: false,
  });
  return (
    <MainHeader editor={editor} readOnly zoom={zoom} onZoomChange={onZoomChange} onExport={onExport} />
  );
}
