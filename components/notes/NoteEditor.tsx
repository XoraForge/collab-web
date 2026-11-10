"use client";

import { colorForUser, createDocumentExtensions } from "@/components/project/document/editor/extensions";
import { useConnectionState, usePresence } from "@/components/project/document/sections/LiveSectionEditor";
import { ApiError } from "@/lib/api/client";
import { uploadImage } from "@/lib/api/Files";
import { fetchRealtimeToken, REALTIME_URL } from "@/lib/realtime";
import { useSession } from "@/lib/SessionContext";
import { useToast } from "@/lib/ToastContext";
import { cn } from "@/lib/utils";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import * as Y from "yjs";

type Collab = { doc: Y.Doc; provider: HocuspocusProvider };

/**
 * A shared note, edited live by everyone in the project ("note:<id>" room).
 * Changes save automatically; there are no drafts or versions.
 */
export default function NoteEditor({
  noteId,
  projectId,
  onGone,
}: {
  noteId: string;
  projectId: string;
  /** The note was deleted, or you lost access to the project. */
  onGone: () => void;
}) {
  const [collab, setCollab] = useState<Collab | null>(null);
  const onGoneRef = useRef(onGone);
  useEffect(() => {
    onGoneRef.current = onGone;
  }, [onGone]);

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: REALTIME_URL,
      name: `note:${noteId}`,
      document: doc,
      token: fetchRealtimeToken,
      onAuthenticationFailed: () => onGoneRef.current(),
      onClose: ({ event }) => {
        if (event.code === 4401 || event.reason === "session-expired") {
          window.location.href = "/api/auth/logout";
        } else if (event.code === 4403 || event.reason === "permission-denied") {
          onGoneRef.current();
        }
      },
    });
    setCollab({ doc, provider });
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [noteId]);

  if (!collab) return <p className="p-6 text-sm text-muted-text">Connecting…</p>;
  return <CollabNote key={noteId} collab={collab} projectId={projectId} />;
}

function CollabNote({ collab, projectId }: { collab: Collab; projectId: string }) {
  const { me } = useSession();
  const { doc, provider } = collab;
  const user = useMemo(
    () => ({ name: me?.user.name || me?.user.email || "Teammate", color: colorForUser(me?.user.id ?? "anonymous") }),
    [me]
  );

  const editor = useEditor(
    {
      extensions: createDocumentExtensions({
        collaboration: { document: doc, provider, user },
        placeholder: "Write something for the team…",
      }),
      immediatelyRender: false,
      editorProps: {
        attributes: { class: "tiptap-document tiptap-note", spellcheck: "true", "aria-label": "Note" },
      },
    },
    [doc, provider]
  );

  const connection = useConnectionState(provider);
  const people = usePresence(provider);

  return (
    <div className="flex flex-col min-h-0 grow">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-1.5">
        {editor ? <Toolbar editor={editor} projectId={projectId} /> : <span />}
        <div className="flex items-center gap-x-3 text-xs text-muted-text">
          <span className="flex -space-x-1.5" aria-label={`${people.length} editing now`}>
            {people.slice(0, 5).map((p) => (
              <span
                key={p.name + p.color}
                title={p.name}
                className="size-6 rounded-full border-2 border-background text-[10px] font-semibold text-white flex items-center justify-center"
                style={{ background: p.color }}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
            ))}
          </span>
          <span className="flex items-center gap-x-1.5" aria-live="polite">
            <span className={cn("size-2 rounded-full", connection.connected ? "bg-green-500" : "bg-amber-500")} />
            {connection.connected ? (connection.saving ? "Saving…" : "Saved") : connection.label}
          </span>
        </div>
      </div>
      <div className="grow min-h-0 overflow-y-auto small-scrollbar">
        <EditorContent editor={editor} className="max-w-3xl mx-auto px-6 py-6" />
      </div>
    </div>
  );
}

const tool =
  "rounded p-1.5 hover:bg-hover disabled:opacity-30 data-[active=true]:bg-hover data-[active=true]:text-text text-muted-text";

function Toolbar({ editor, projectId }: { editor: Editor; projectId: string }) {
  const toast = useToast();
  const fileInputId = useId();
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  async function insertImage(file: File) {
    try {
      const uploaded = await uploadImage(file, { projectId });
      editor.chain().focus().setImage({ src: uploaded.url, alt: file.name }).run();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "The image couldn't be uploaded.");
    }
  }

  const buttons: { label: string; icon: React.ReactNode; active?: boolean; disabled?: boolean; run: () => void }[] = [
    { label: "Undo", icon: <Undo2 size={15} />, disabled: !state.canUndo, run: () => editor.chain().focus().undo().run() },
    { label: "Redo", icon: <Redo2 size={15} />, disabled: !state.canRedo, run: () => editor.chain().focus().redo().run() },
    { label: "Bold", icon: <Bold size={15} />, active: state.bold, run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: <Italic size={15} />, active: state.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Strikethrough", icon: <Strikethrough size={15} />, active: state.strike, run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Heading", icon: <Heading2 size={15} />, active: state.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Subheading", icon: <Heading3 size={15} />, active: state.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bulleted list", icon: <List size={15} />, active: state.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: <ListOrdered size={15} />, active: state.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", icon: <Quote size={15} />, active: state.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Code", icon: <Code size={15} />, active: state.code, run: () => editor.chain().focus().toggleCode().run() },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Formatting">
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          aria-label={b.label}
          title={b.label}
          aria-pressed={b.active ?? undefined}
          data-active={b.active ? "true" : undefined}
          disabled={b.disabled}
          onClick={b.run}
          className={tool}
        >
          {b.icon}
        </button>
      ))}
      <label htmlFor={fileInputId} aria-label="Insert image" title="Insert image" className={cn(tool, "cursor-pointer")}>
        <ImagePlus size={15} />
      </label>
      <input
        id={fileInputId}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) insertImage(file);
        }}
      />
    </div>
  );
}
