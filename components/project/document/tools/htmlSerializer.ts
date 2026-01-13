import { Text } from "../model/node/Text";
import { Style } from "../model/node/Style";

export function parseParagraphHtml(html: string): Text[] {
  const container = document.createElement("div");
  container.innerHTML = html;

  const results: Text[] = [];

  function walk(
    node: Node,
    inherited: { bold: boolean; italic: boolean; underline: boolean }
  ) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text.length > 0) {
        const style = new Style(
          !!inherited.bold,
          !!inherited.italic,
          !!inherited.underline
        );
        results.push(new Text(text, [style]));
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // compute styles from tag name and inline style
      const next = { ...inherited };
      const tag = el.tagName.toLowerCase();
      if (tag === "b" || tag === "strong") next.bold = true;
      if (tag === "i" || tag === "em") next.italic = true;
      if (tag === "u") next.underline = true;

      const fs = (el.style.fontWeight || "").toLowerCase();
      const td = (el.style.textDecoration || "").toLowerCase();
      if (fs === "bold" || +fs > 600) next.bold = true;
      if (td.includes("underline")) next.underline = true;

      // handle <br>
      if (tag === "br") {
        results.push(new Text("\n", [new Style(false, false, false)]));
      }

      // walk children
      node.childNodes.forEach((child) => walk(child, next));
    }
  }

  container.childNodes.forEach((n) =>
    walk(n, { bold: false, italic: false, underline: false })
  );

  return results;
}

export function textNodesToHtml(nodes: Text[]): string {
  function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return nodes
    .map((n) => {
      if (n.text === "\n") return "<br/>";
      let out = escapeHtml(n.text);
      // wrap in tags
      if (n.style && n.style[0]) {
        const s = n.style[0];
        if (s.bold) out = `<b>${out}</b>`;
        if (s.italic) out = `<i>${out}</i>`;
        if (s.underline) out = `<u>${out}</u>`;
      }
      return out;
    })
    .join("");
}
