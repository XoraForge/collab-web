"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Avatar from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import { changeSectionStatus, deleteSection, updateSection } from "@/lib/api/Document";
import type { DocumentDetail, Member, Section, SectionKind, SectionStatus, VersionSummary } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { useSession } from "@/lib/SessionContext";
import { Check, History, UserPlus, X } from "lucide-react";
import { useState } from "react";
import SectionDetail from "../section/SectionDetail";
import { STATUS_CLASS, STATUS_LABEL, wordTargetLabel } from "../sections/sectionMeta";

type Props = {
  section: Section;
  members: Member[];
  canManage: boolean;
  hasUnpublished: boolean;
  versions: VersionSummary[];
  onSectionChange: (section: Section) => void;
  onDocumentChange: (document: DocumentDetail) => void;
  onOpenVersion: (version: VersionSummary) => void;
};

/** Right-hand panel: the selected section's task details and history. */
export default function SecondaryHeader(props: Props) {
  return (
    <div className="h-full w-full flex flex-col px-2 py-1">
      <Accordion type="multiple" className="w-full" defaultValue={["section-info", "history"]}>
        <AccordionItem value="section-info">
          <AccordionTrigger className="text-xs">Section Information</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            {/* Remount the form when switching sections so it starts from that section's values. */}
            <SectionInformation key={props.section.id} {...props} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="history">
          <AccordionTrigger className="text-xs">
            History ({props.versions.length})
          </AccordionTrigger>
          <AccordionContent>
            <VersionList versions={props.versions} onOpen={props.onOpenVersion} />
          </AccordionContent>
        </AccordionItem>
        {["Tasks", "Comments", "Problems"].map((title) => (
          <AccordionItem key={title} value={title.toLowerCase()}>
            <AccordionTrigger className="text-xs">{title}</AccordionTrigger>
            <AccordionContent>
              <p className="text-xs text-muted-text">Coming soon.</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// ---------- Section Information ----------

function SectionInformation({
  section,
  members,
  canManage,
  hasUnpublished,
  onSectionChange,
  onDocumentChange,
}: Props) {
  const { me } = useSession();
  const isAssignee = !!me && section.assignees.some((a) => a.id === me.user.id);

  const isToc = section.kind === "TABLE_OF_CONTENTS";

  return (
    <div className="flex flex-col gap-y-3">
      {isToc && (
        <p className="text-xs text-muted-text pb-2 border-b">
          This table of contents is generated from the published headings of the sections after it.
        </p>
      )}
      {!isToc && <StatusControl
        section={section}
        canManage={canManage}
        isAssignee={isAssignee}
        hasUnpublished={hasUnpublished}
        onChange={onSectionChange}
      />}
      {canManage ? (
        <LeaderForm
          section={section}
          members={members}
          onSaved={onSectionChange}
          onDeleted={onDocumentChange}
        />
      ) : isToc ? null : (
        <ReadOnlyDetails section={section} />
      )}
    </div>
  );
}

function StatusControl({
  section,
  canManage,
  isAssignee,
  hasUnpublished,
  onChange,
}: {
  section: Section;
  canManage: boolean;
  isAssignee: boolean;
  hasUnpublished: boolean;
  onChange: (section: Section) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function setStatus(status: SectionStatus) {
    setBusy(true);
    setError("");
    try {
      onChange(await changeSectionStatus(section.id, status));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update the status.");
    } finally {
      setBusy(false);
    }
  }

  const neverPublished = section.publishedVersion === 0;
  let action: { label: string; status: SectionStatus; hint?: string; disabled?: boolean } | null = null;

  if (canManage) {
    action =
      section.status === "DONE"
        ? { label: "Reopen for editing", status: "IN_PROGRESS" }
        : {
            label: "Approve & lock",
            status: "DONE",
            disabled: neverPublished,
            hint: neverPublished
              ? "Publish a version before approving."
              : hasUnpublished
              ? "Approves the published version. Unpublished draft changes stay unpublished."
              : undefined,
          };
  } else if (isAssignee) {
    if (section.status === "IN_REVIEW") {
      action = { label: "Withdraw from review", status: "IN_PROGRESS" };
    } else if (section.status !== "DONE") {
      action = {
        label: "Submit for review",
        status: "IN_REVIEW",
        disabled: neverPublished || hasUnpublished,
        hint: neverPublished || hasUnpublished ? "Publish your latest changes first." : undefined,
      };
    }
  }

  return (
    <div className="flex flex-col gap-y-2 pb-2 border-b">
      <SectionDetail icon="lets-icons:progress" title="Status:">
        <Badge className={STATUS_CLASS[section.status]}>{STATUS_LABEL[section.status]}</Badge>
      </SectionDetail>
      {action && (
        <>
          <Button
            size="sm"
            variant={action.status === "DONE" ? "default" : "outline"}
            disabled={busy || action.disabled}
            onClick={() => setStatus(action.status)}
          >
            {action.label}
          </Button>
          {action.hint && <p className="text-[11px] text-muted-text">{action.hint}</p>}
        </>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function ReadOnlyDetails({ section }: { section: Section }) {
  const target = wordTargetLabel(section);
  return (
    <div className="flex flex-col gap-y-1">
      <SectionDetail icon="clarity:assign-user-solid" title="Assigned To:">
        {section.assignees.length ? (
          <AssigneeAvatars section={section} />
        ) : (
          <p className="font-semibold">N/A</p>
        )}
      </SectionDetail>
      <SectionDetail icon="stash:calendar-end" title="Due:">
        <p className="font-semibold">
          {section.dueDate ? dayjs(section.dueDate).format("D MMM YYYY") : "N/A"}
        </p>
      </SectionDetail>
      <SectionDetail icon="material-symbols:text-fields" title="Word target:">
        <p className="font-semibold">{target ?? "N/A"}</p>
      </SectionDetail>
      <div className="flex flex-col gap-y-1 text-xs">
        <p className="font-medium text-subtle-text">Requirements</p>
        <p className="whitespace-pre-wrap">{section.requirements || "None set."}</p>
      </div>
    </div>
  );
}

function AssigneeAvatars({ section }: { section: Section }) {
  return (
    <div className="flex -space-x-1.5" title={section.assignees.map((a) => a.name || a.email).join(", ")}>
      {section.assignees.map((a) => (
        <Avatar key={a.id} src={a.imageUrl ?? undefined} name={a.name || a.email} size={20} className="ring-1 ring-(--default-sidebar)" />
      ))}
    </div>
  );
}

const numberOrNull = (v: string) => (v.trim() === "" ? null : Math.max(0, parseInt(v, 10) || 0));

function LeaderForm({
  section,
  members,
  onSaved,
  onDeleted,
}: {
  section: Section;
  members: Member[];
  onSaved: (section: Section) => void;
  onDeleted: (document: DocumentDetail) => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [assigneeIds, setAssigneeIds] = useState(section.assignees.map((a) => a.id));
  const [dueDate, setDueDate] = useState<Date | null>(section.dueDate ? dayjs(section.dueDate).toDate() : null);
  const [min, setMin] = useState(section.wordTargetMin?.toString() ?? "");
  const [max, setMax] = useState(section.wordTargetMax?.toString() ?? "");
  const [requirements, setRequirements] = useState(section.requirements ?? "");
  const [kind, setKind] = useState<SectionKind>(section.kind);
  const [pageBreakBefore, setPageBreakBefore] = useState(section.pageBreakBefore);
  const isToc = kind === "TABLE_OF_CONTENTS";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const original = JSON.stringify([
    section.title, section.assignees.map((a) => a.id).sort(), section.dueDate,
    section.wordTargetMin, section.wordTargetMax, section.requirements ?? "",
    section.kind, section.pageBreakBefore,
  ]);
  const current = JSON.stringify([
    title.trim(), [...assigneeIds].sort(), dueDate ? dayjs(dueDate).format("YYYY-MM-DD") : null,
    numberOrNull(min), numberOrNull(max), requirements.trim(),
    kind, pageBreakBefore,
  ]);
  const isDirty = original !== current;

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const saved = await updateSection(section.id, {
        title: title.trim(),
        assigneeIds,
        dueDate: dueDate ? dayjs(dueDate).format("YYYY-MM-DD") : null,
        wordTargetMin: numberOrNull(min),
        wordTargetMax: numberOrNull(max),
        requirements: requirements.trim() || null,
        kind,
        pageBreakBefore,
      });
      onSaved(saved);
      setMessage({ text: "Saved", isError: false });
    } catch (err) {
      setMessage({ text: err instanceof ApiError ? err.message : "Couldn't save.", isError: true });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${section.title}" and all its versions? This can't be undone.`)) return;
    setBusy(true);
    try {
      onDeleted(await deleteSection(section.id));
    } catch (err) {
      setMessage({ text: err instanceof ApiError ? err.message : "Couldn't delete.", isError: true });
      setBusy(false);
    }
  }

  const labelClass = "text-[11px] font-medium text-subtle-text";

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (isDirty && title.trim()) save();
      }}
    >
      <label className="flex flex-col gap-y-1">
        <span className={labelClass}>Title</span>
        <Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} className="h-8 text-xs" />
      </label>

      <div className="flex flex-col gap-y-1">
        <span className={labelClass}>Section type</span>
        <Select value={kind} onValueChange={(v) => setKind(v as SectionKind)}>
          <SelectTrigger size="sm" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONTENT" className="text-xs">Written content</SelectItem>
            <SelectItem value="TABLE_OF_CONTENTS" className="text-xs">Table of contents (generated)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-x-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={pageBreakBefore}
          onChange={(e) => setPageBreakBefore(e.target.checked)}
          className="accent-current"
        />
        Start on a new page
      </label>

      {!isToc && (<>
      <div className="flex flex-col gap-y-1">
        <span className={labelClass}>Assigned to</span>
        <AssigneePicker members={members} selected={assigneeIds} onChange={setAssigneeIds} />
      </div>

      <div className="flex flex-col gap-y-1">
        <span className={labelClass}>Due date</span>
        <div className="flex items-center gap-x-1">
          <div className="flex-1 [&_button]:h-8 [&_button]:text-xs">
            <DatePicker date={dueDate ?? new Date()} setDate={setDueDate} />
          </div>
          {dueDate && (
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Clear due date" onClick={() => setDueDate(null)}>
              <X />
            </Button>
          )}
        </div>
        {!dueDate && <span className="text-[11px] text-muted-text">No due date</span>}
      </div>

      <div className="flex flex-col gap-y-1">
        <span className={labelClass}>Word target</span>
        <div className="flex items-center gap-x-1.5">
          <Input inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} className="h-8 text-xs" aria-label="Minimum words" />
          <span className="text-xs">–</span>
          <Input inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} className="h-8 text-xs" aria-label="Maximum words" />
        </div>
      </div>

      <label className="flex flex-col gap-y-1">
        <span className={labelClass}>Requirements / rubric</span>
        <textarea
          rows={4}
          maxLength={5000}
          value={requirements}
          placeholder="What must this section cover?"
          onChange={(e) => setRequirements(e.target.value)}
          className="w-full resize-y rounded-md border border-input bg-transparent dark:bg-input/30 px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </label>
      </>)}

      <div className="flex items-center justify-between gap-x-2">
        <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={remove}>
          Delete
        </Button>
        <Button type="submit" size="sm" disabled={busy || !isDirty || !title.trim()}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
      {message && (
        <p className={`text-[11px] ${message.isError ? "text-destructive" : "text-muted-text"}`}>{message.text}</p>
      )}
    </form>
  );
}

function AssigneePicker({
  members,
  selected,
  onChange,
}: {
  members: Member[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const chosen = members.filter((m) => selected.includes(m.user.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-x-2 min-h-8 w-full rounded-md border border-input dark:bg-input/30 px-2 py-1 text-xs text-left hover:bg-hover"
        >
          {chosen.length === 0 ? (
            <span className="flex items-center gap-x-1.5 text-muted-text">
              <UserPlus size={12} /> Unassigned (team leader only)
            </span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {chosen.map((m) => (
                <span key={m.user.id} className="flex items-center gap-x-1 rounded-full bg-hover px-1.5 py-0.5">
                  <Avatar src={m.user.imageUrl ?? undefined} name={m.user.name || m.user.email} size={14} className="text-[6px]" />
                  {m.user.name || m.user.email}
                </span>
              ))}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-1">
        {members.length <= 1 && (
          <p className="px-2 py-1.5 text-[11px] text-muted-text">
            Invite teammates from the project page to assign them.
          </p>
        )}
        {members.map((m) => {
          const isOn = selected.includes(m.user.id);
          return (
            <button
              key={m.user.id}
              type="button"
              onClick={() => onChange(isOn ? selected.filter((id) => id !== m.user.id) : [...selected, m.user.id])}
              className="w-full flex items-center justify-between gap-x-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
            >
              <span className="flex items-center gap-x-2 min-w-0">
                <Avatar src={m.user.imageUrl ?? undefined} name={m.user.name || m.user.email} size={18} />
                <span className="truncate">
                  {m.user.name || m.user.email}
                  {m.role === "PROJECT_MANAGER" && <span className="text-muted-text"> · Leader</span>}
                </span>
              </span>
              {isOn && <Check size={14} />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ---------- History ----------

function VersionList({
  versions,
  onOpen,
}: {
  versions: VersionSummary[];
  onOpen: (version: VersionSummary) => void;
}) {
  if (versions.length === 0) {
    return (
      <p className="text-xs text-muted-text">
        No versions yet. Publishing a section saves a version here, like a commit.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-y-1">
      {versions.map((v) => {
        const author = v.author?.name || v.author?.email || "Someone";
        return (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => onOpen(v)}
              className="w-full text-left rounded-sm px-2 py-1.5 hover:bg-hover flex gap-x-2"
            >
              <History size={12} className="mt-0.5 shrink-0 text-muted-text" />
              <span className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate">
                  v{v.number}
                  {v.message ? ` · ${v.message}` : ""}
                </span>
                <span className="text-[11px] text-muted-text truncate">
                  {author} · {dayjs(v.createdAt).fromNow()} · {v.wordCount} words
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
