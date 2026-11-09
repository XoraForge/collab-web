import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import type { HocuspocusProvider } from "@hocuspocus/provider";
import type * as Y from "yjs";

export const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Calibri", value: "Calibri, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: '"Courier New", monospace' },
] as const;

/** Word-style point sizes. The page's base size is 12pt. */
export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72,
] as const;
export const DEFAULT_FONT_SIZE = 12;

export type CollaborationOptions = {
  document: Y.Doc;
  provider: HocuspocusProvider;
  user: { name: string; color: string };
};

/**
 * Editor extensions. With `collaboration`, the content comes from the shared
 * Yjs document and undo/redo only affects your own changes.
 */
export function createDocumentExtensions({
  collaboration,
  placeholder = "Start writing…",
}: {
  collaboration?: CollaborationOptions;
  placeholder?: string;
} = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false, autolink: true },
      // Collaboration ships its own (per-user) undo/redo.
      undoRedo: collaboration ? false : undefined,
    }),
    TextStyleKit,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Image.configure({ allowBase64: true }),
    TableKit.configure({ table: { resizable: true } }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
    ...(collaboration
      ? [
          Collaboration.configure({ document: collaboration.document }),
          CollaborationCaret.configure({
            provider: collaboration.provider,
            user: collaboration.user,
          }),
        ]
      : []),
  ];
}

/** Stable colour per user, used for their cursor and presence badge. */
const CURSOR_COLORS = [
  "#f97316", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6",
  "#eab308", "#ef4444", "#6366f1", "#84cc16", "#06b6d4", "#d946ef",
];
export function colorForUser(id: string) {
  // FNV-1a hash spreads similar ids (e.g. UUIDs) evenly over the palette.
  let hash = 0x811c9dc5;
  for (const ch of id) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
