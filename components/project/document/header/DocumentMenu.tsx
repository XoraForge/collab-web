"use client";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ApiError } from "@/lib/api/client";
import { deleteDocument, renameDocument } from "@/lib/api/Document";
import type { DocumentDetail } from "@/lib/api/types";
import { useToast } from "@/lib/ToastContext";
import { Download, Pencil, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const item = "w-full flex items-center gap-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left disabled:opacity-50 disabled:hover:bg-transparent";

/** Document settings: rename, download, delete. */
export default function DocumentMenu({
  document,
  onRenamed,
  onExport,
}: {
  document: DocumentDetail;
  onRenamed: (doc: DocumentDetail) => void;
  onExport: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(document.title);

  async function rename() {
    if (!title.trim() || title.trim() === document.title) {
      setRenaming(false);
      return;
    }
    try {
      onRenamed(await renameDocument(document.id, title.trim()));
      setRenaming(false);
      setOpen(false);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't rename the document.");
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${document.title}" with all its sections and versions? This can't be undone.`)) return;
    try {
      await deleteDocument(document.id);
      toast("Document deleted.");
      router.push(`/dashboard/project/${document.projectId}/files`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't delete the document.");
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setRenaming(false);
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" aria-label="Document settings" title="Document settings" className="rounded-sm p-1 hover:bg-hover">
          <Settings className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-1">
        {renaming ? (
          <form
            className="p-1 flex flex-col gap-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              rename();
            }}
          >
            <Input autoFocus value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" aria-label="Document title" />
            <p className="text-[11px] text-muted-text">Press Enter to save, Esc to cancel.</p>
          </form>
        ) : (
          <>
            <button
              type="button"
              className={item}
              disabled={!document.canManage}
              title={document.canManage ? undefined : "Only the team leader can rename documents"}
              onClick={() => {
                setTitle(document.title);
                setRenaming(true);
              }}
            >
              <Pencil size={14} /> Rename
            </button>
            <button
              type="button"
              className={item}
              onClick={() => {
                setOpen(false);
                onExport();
              }}
            >
              <Download size={14} /> Download .docx
            </button>
            <div className="my-1 border-t" />
            <button
              type="button"
              className={`${item} text-destructive`}
              disabled={!document.canManage}
              title={document.canManage ? undefined : "Only the team leader can delete documents"}
              onClick={remove}
            >
              <Trash2 size={14} /> Delete document
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
