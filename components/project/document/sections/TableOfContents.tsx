import type { PublishedSection } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { buildToc } from "../tools/toc";

/** Generated table of contents. Entries jump to the section in the preview. */
export default function TableOfContents({
  sections,
  linkable = false,
}: {
  sections: PublishedSection[];
  linkable?: boolean;
}) {
  const entries = buildToc(sections);

  return (
    <div className="tiptap-document">
      <h1>Table of Contents</h1>
      {entries.length === 0 ? (
        <p className="text-muted-text">
          Headings from the sections after this one will appear here once they&apos;re published.
        </p>
      ) : (
        <ol className="!list-none !pl-0 flex flex-col gap-y-1.5">
          {entries.map((entry, i) => (
            <li
              key={`${entry.sectionId}-${i}`}
              className={cn(
                "flex items-baseline gap-x-2",
                entry.level === 1 && "font-semibold",
                entry.level === 2 && "pl-6",
                entry.level === 3 && "pl-12 text-subtle-text"
              )}
            >
              {linkable ? (
                <a href={`#section-${entry.sectionId}`} className="!no-underline !text-inherit hover:!underline">
                  {entry.text}
                </a>
              ) : (
                <span>{entry.text}</span>
              )}
              <span aria-hidden className="flex-1 border-b border-dotted border-divider translate-y-[-4px]" />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
