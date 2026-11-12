"use client";

import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { getVersion } from "@/lib/api/Document";
import type { VersionDetail, VersionSummary } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import * as Dialog from "@radix-ui/react-dialog";
import { diffWords } from "diff";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseContent, toPlainText } from "../tools/prosemirror";

/**
 * Shows what changed in a version compared with the one before it,
 * like a commit diff: additions in green, removals struck through in red.
 */
export default function VersionDiffDialog({
  sectionId,
  version,
  canRestore,
  onRestore,
  onClose,
}: {
  sectionId: string;
  version: VersionSummary | null;
  canRestore: boolean;
  onRestore: (version: VersionDetail) => void;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState<VersionDetail | null>(null);
  const [previous, setPrevious] = useState<VersionDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!version) return;
    let cancelled = false;
    Promise.all([
      getVersion(sectionId, version.number),
      version.number > 1 ? getVersion(sectionId, version.number - 1) : Promise.resolve(null),
    ])
      .then(([cur, prev]) => {
        if (cancelled) return;
        setCurrent(cur);
        setPrevious(prev);
      })
      .catch(() => !cancelled && setError("Couldn't load this version."));
    return () => {
      cancelled = true;
      setCurrent(null);
      setPrevious(null);
      setError("");
    };
  }, [sectionId, version]);

  const parts = useMemo(() => {
    if (!current) return [];
    const before = toPlainText(parseContent(previous?.contentJson));
    const after = toPlainText(parseContent(current.contentJson));
    return diffWords(before, after);
  }, [current, previous]);

  const added = parts.filter((p) => p.added).reduce((n, p) => n + p.value.split(/\s+/).filter(Boolean).length, 0);
  const removed = parts.filter((p) => p.removed).reduce((n, p) => n + p.value.split(/\s+/).filter(Boolean).length, 0);
  const authorName = version?.author?.name || version?.author?.email || "Someone";

  return (
    <Dialog.Root open={version !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-dialog w-[720px] max-w-[calc(100vw-2rem)] max-h-[calc(100svh-4rem)] rounded-md border flex flex-col focus:outline-none"
        >
          <div className="flex items-start justify-between gap-x-4 border-b p-4">
            <div className="flex flex-col gap-y-1 min-w-0">
              <Dialog.Title className="text-lg font-semibold">
                Version {version?.number}
                {version?.message && <span className="font-normal">: {version.message}</span>}
              </Dialog.Title>
              {version && (
                <div className="flex items-center gap-x-2 text-xs text-muted-text">
                  <Avatar src={version.author?.imageUrl ?? undefined} name={authorName} size={18} />
                  <span>
                    {authorName} · {dayjs(version.createdAt).format("D MMM YYYY, h:mmA")} ·{" "}
                    <span className="text-green-500">{added} words added</span>,{" "}
                    <span className="text-red-400">{removed} removed</span>
                  </span>
                </div>
              )}
            </div>
            <Dialog.Close aria-label="Close" className="opacity-70 hover:opacity-100">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="p-4 overflow-y-auto small-scrollbar text-sm leading-relaxed whitespace-pre-wrap">
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : !current ? (
              <p className="text-muted-text">Loading…</p>
            ) : version?.number === 1 && parts.length === 1 && parts[0].added ? (
              <>
                <p className="text-xs text-muted-text mb-3">First version. Everything is new.</p>
                <span className="bg-green-500/15 text-green-300">{parts[0].value}</span>
              </>
            ) : (
              parts.map((part, i) =>
                part.added ? (
                  <ins key={i} className="no-underline bg-green-500/15 text-green-300">
                    {part.value}
                  </ins>
                ) : part.removed ? (
                  <del key={i} className="bg-red-500/15 text-red-300">
                    {part.value}
                  </del>
                ) : (
                  <span key={i}>{part.value}</span>
                )
              )
            )}
          </div>

          {canRestore && current && (
            <div className="flex items-center justify-between gap-x-3 border-t p-3">
              <p className="text-xs text-muted-text">
                Restoring copies this version into the draft. Publish to make it the latest version again.
              </p>
              <Button size="sm" variant="outline" onClick={() => onRestore(current)}>
                Restore to draft
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
