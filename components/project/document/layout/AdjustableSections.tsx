"use client";

import { Input } from "@/components/ui/input";
import type { Section as SectionType } from "@/lib/api/types";
import { useState } from "react";
import Section from "../doc-section/Section";

/**
 * The document's sections. The team leader can drag to reorder and add sections.
 */
export default function AdjustableSections({
  sections,
  selectedId,
  canManage,
  isAdding,
  onSelect,
  onReorder,
  onAdd,
  onCancelAdd,
}: {
  sections: SectionType[];
  selectedId: string | null;
  canManage: boolean;
  isAdding: boolean;
  onSelect: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onAdd: (title: string) => void;
  onCancelAdd: () => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  function drop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const ids = sections.map((s) => s.id).filter((id) => id !== draggingId);
    ids.splice(ids.indexOf(targetId), 0, draggingId);
    onReorder(ids);
  }

  return (
    <div className="flex flex-col gap-y-1.5">
      {sections.map((section) => (
        <Section
          key={section.id}
          section={section}
          isSelected={section.id === selectedId}
          isDraggable={canManage}
          isDropTarget={overId === section.id && draggingId !== section.id}
          onSelect={() => onSelect(section.id)}
          dragHandlers={
            canManage
              ? {
                  onDragStart: (e) => {
                    setDraggingId(section.id);
                    e.dataTransfer.effectAllowed = "move";
                  },
                  onDragOver: (e) => {
                    e.preventDefault();
                    setOverId(section.id);
                  },
                  onDragLeave: () => setOverId((id) => (id === section.id ? null : id)),
                  onDrop: (e) => {
                    e.preventDefault();
                    drop(section.id);
                    setOverId(null);
                  },
                  onDragEnd: () => {
                    setDraggingId(null);
                    setOverId(null);
                  },
                }
              : undefined
          }
        />
      ))}

      {isAdding && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;
            onAdd(newTitle.trim());
            setNewTitle("");
          }}
        >
          <Input
            autoFocus
            value={newTitle}
            maxLength={120}
            placeholder="Section title, then Enter"
            className="h-8 text-xs"
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onCancelAdd()}
            onBlur={() => !newTitle.trim() && onCancelAdd()}
          />
        </form>
      )}
    </div>
  );
}
