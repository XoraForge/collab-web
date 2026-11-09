"use client";

import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { createDocumentExtensions } from "../editor/extensions";

/** Renders TipTap JSON exactly like the editor does, but read-only. */
export default function ReadOnlyContent({ content }: { content: JSONContent | null }) {
  const editor = useEditor({
    extensions: createDocumentExtensions({ placeholder: "" }),
    content: content ?? "",
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap-document" } },
  });

  useEffect(() => {
    if (editor && content) editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, content]);

  return <EditorContent editor={editor} />;
}
