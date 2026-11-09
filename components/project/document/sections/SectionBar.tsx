import { Badge } from "@/components/ui/badge";
import type { Section } from "@/lib/api/types";
import { STATUS_CLASS, STATUS_LABEL } from "./sectionMeta";

/** Strip above the toolbar: which section you're in, its state, and actions. */
export default function SectionBar({
  section,
  note,
  actions,
}: {
  section: Section;
  /** e.g. "Draft · unpublished changes" or "View only · Assigned to Jordan" */
  note?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-x-3 border-b px-3 py-1.5 min-h-[45px]">
      <div className="flex items-center gap-x-3 min-w-0">
        <h2 className="text-sm font-semibold truncate">{section.title}</h2>
        <Badge className={STATUS_CLASS[section.status]}>{STATUS_LABEL[section.status]}</Badge>
        {section.publishedVersion > 0 && (
          <span className="text-xs text-muted-text whitespace-nowrap">v{section.publishedVersion}</span>
        )}
        {note && <span className="text-xs text-muted-text truncate">{note}</span>}
      </div>
      {actions && <div className="flex items-center gap-x-2 shrink-0">{actions}</div>}
    </div>
  );
}
