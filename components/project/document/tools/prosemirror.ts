import type { JSONContent } from "@tiptap/react";

const BLOCK_TYPES = new Set([
  "paragraph", "heading", "blockquote", "codeBlock", "listItem", "tableRow", "horizontalRule", "image",
]);

/** Plain text of a document, one line per block. Used for version diffs. */
export function toPlainText(doc: JSONContent | null | undefined): string {
  const lines: string[] = [];
  let current = "";

  function walk(node: JSONContent) {
    if (node.type === "text") {
      current += node.text ?? "";
      return;
    }
    if (node.type === "hardBreak") {
      current += "\n";
      return;
    }
    if (node.type === "image") {
      lines.push("[image]");
      return;
    }
    node.content?.forEach(walk);
    if (node.type && BLOCK_TYPES.has(node.type) && current) {
      lines.push(current);
      current = "";
    }
  }

  if (doc) walk(doc);
  if (current) lines.push(current);
  return lines.join("\n");
}

export function parseContent(contentJson: string | null | undefined): JSONContent | null {
  if (!contentJson) return null;
  try {
    return JSON.parse(contentJson) as JSONContent;
  } catch {
    return null;
  }
}

export function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}
