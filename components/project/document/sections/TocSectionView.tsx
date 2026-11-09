"use client";

import { getPublishedDocument } from "@/lib/api/Document";
import type { PublishedSection, Section } from "@/lib/api/types";
import { useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { createDocumentExtensions } from "../editor/extensions";
import MainHeader from "../header/MainHeader";
import Document from "../layout/Document";
import A4 from "../paper/A4";
import SectionBar from "./SectionBar";
import TableOfContents from "./TableOfContents";

/** The Table of Contents section: generated, never edited. */
export default function TocSectionView({
  section,
  documentId,
  refreshKey,
  zoom,
  onZoomChange,
  onExport,
}: {
  section: Section;
  documentId: string;
  /** Changes when the document changes (live events), to regenerate. */
  refreshKey: unknown;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
}) {
  const [sections, setSections] = useState<PublishedSection[] | null>(null);
  const toolbarEditor = useEditor({
    extensions: createDocumentExtensions(),
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    let cancelled = false;
    getPublishedDocument(documentId)
      .then((list) => !cancelled && setSections(list))
      .catch(() => !cancelled && setSections([]));
    return () => {
      cancelled = true;
    };
  }, [documentId, refreshKey]);

  return (
    <>
      <SectionBar
        section={section}
        note="Generated automatically from the published headings of the sections below"
      />
      <MainHeader editor={toolbarEditor} readOnly zoom={zoom} onZoomChange={onZoomChange} onExport={onExport} />
      <Document zoom={zoom}>
        <A4>{sections && <TableOfContents sections={sections} />}</A4>
      </Document>
      <div className="flex items-center border-t px-3 py-1 text-xs text-muted-text">
        Page numbers are added in the downloaded .docx (Word fills them in when you open it).
      </div>
    </>
  );
}
