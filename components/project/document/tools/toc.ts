import type { JSONContent } from "@tiptap/react";
import type { PublishedSection } from "@/lib/api/types";
import { parseContent } from "./prosemirror";

export type TocEntry = { level: 1 | 2 | 3; text: string; sectionId: string };

function headingText(node: JSONContent): string {
  return (node.content ?? []).map((c) => c.text ?? (c.type === "hardBreak" ? " " : "")).join("").trim();
}

/**
 * Table of contents from the published sections *after* the TOC section
 * (so the cover and the TOC itself aren't listed). Uses each section's
 * headings; a section without headings is listed by its title.
 */
export function buildToc(sections: PublishedSection[]): TocEntry[] {
  const tocIndex = sections.findIndex((s) => s.kind === "TABLE_OF_CONTENTS");
  const entries: TocEntry[] = [];

  for (const section of sections.slice(tocIndex + 1)) {
    if (section.kind !== "CONTENT") continue;
    const doc = parseContent(section.contentJson);
    if (!doc) continue; // not published yet
    const headings = (doc?.content ?? [])
      .filter((n) => n.type === "heading" && headingText(n))
      .map((n) => ({
        level: Math.min(3, Math.max(1, Number(n.attrs?.level ?? 1))) as 1 | 2 | 3,
        text: headingText(n),
        sectionId: section.sectionId,
      }));
    entries.push(...(headings.length ? headings : [{ level: 1 as const, text: section.title, sectionId: section.sectionId }]));
  }
  return entries;
}
