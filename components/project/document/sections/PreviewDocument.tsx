"use client";

import type { PublishedSection } from "@/lib/api/types";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Document from "../layout/Document";
import A4 from "../paper/A4";
import { parseContent } from "../tools/prosemirror";
import ReadOnlyContent from "./ReadOnlyContent";
import TableOfContents from "./TableOfContents";

/** Sections grouped into pages: a section that starts on a new page opens a new sheet. */
function toPages(sections: PublishedSection[]) {
  const pages: PublishedSection[][] = [];
  for (const section of sections) {
    if (pages.length === 0 || section.pageBreakBefore) pages.push([]);
    pages[pages.length - 1].push(section);
  }
  return pages;
}

/**
 * The whole document as the team sees it: every section's latest *published*
 * version, in order. Drafts are never included.
 */
export default function PreviewDocument({
  sections,
  isLoading,
  zoom,
  onClose,
  onExport,
}: {
  sections: PublishedSection[];
  isLoading: boolean;
  zoom: number;
  onClose: () => void;
  onExport: () => void;
}) {
  const unpublished = sections.filter((s) => s.kind === "CONTENT" && !s.contentJson).length;

  return (
    <>
      <div className="flex items-center justify-between gap-x-3 border-b px-3 py-1.5 min-h-[45px]">
        <div className="flex items-center gap-x-2 text-sm">
          <Eye size={16} />
          <span className="font-semibold">Preview</span>
          <span className="text-xs text-muted-text">
            Published versions only
            {unpublished > 0 && ` · ${unpublished} section${unpublished === 1 ? "" : "s"} not published yet`}
          </span>
        </div>
        <div className="flex items-center gap-x-2">
          <Button size="sm" variant="outline" onClick={onExport}>
            Download .docx
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close preview">
            <X />
          </Button>
        </div>
      </div>
      <Document zoom={zoom}>
        {isLoading ? (
          <A4>{null}</A4>
        ) : (
          toPages(sections).map((page, pageIndex) => (
            <A4 key={page[0]?.sectionId ?? pageIndex}>
              <div className="flex flex-col">
                {page.map((section) => (
                  <section
                    key={section.sectionId}
                    id={`section-${section.sectionId}`}
                    aria-label={section.title}
                    className="scroll-mt-12"
                  >
                    {section.kind === "TABLE_OF_CONTENTS" ? (
                      <TableOfContents sections={sections} linkable />
                    ) : section.contentJson ? (
                      <ReadOnlyContent content={parseContent(section.contentJson)} />
                    ) : (
                      <div className="my-3 rounded-md border border-dashed border-divider px-3 py-4 text-center text-xs text-muted-text">
                        {section.title}: nothing published yet
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </A4>
          ))
        )}
      </Document>
    </>
  );
}
