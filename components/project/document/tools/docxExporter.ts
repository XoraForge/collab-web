import type { JSONContent } from "@tiptap/react";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  Paragraph,
  ParagraphChild,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { SectionKind } from "@/lib/api/types";
import { DEFAULT_FONT_SIZE } from "../editor/extensions";

/**
 * Converts a TipTap document (editor.getJSON()) into a .docx file.
 *
 * Supported: paragraphs, headings 1–3, bold/italic/underline/strike/code,
 * font family/size/colour, links, alignment, bullet & numbered lists (nested),
 * blockquotes, code blocks, horizontal rules, tables and images.
 */

const ORDERED_LIST_REF = "collab-ordered-list";
/** Usable width of an A4 page with the editor's 25mm margins, in px @96dpi. */
const MAX_IMAGE_WIDTH = 605;

type Block = Paragraph | Table | TableOfContents;

/** One document section, in order, for export. */
export type DocxSection = {
  kind: SectionKind;
  /** Published content; null = nothing published (skipped). */
  content: JSONContent | null;
  pageBreakBefore: boolean;
};

type Context = {
  /** Nesting depth for lists (0-based). */
  listLevel: number;
  listType?: "bullet" | "ordered";
  inQuote: boolean;
  inCode: boolean;
};

const BASE_CONTEXT: Context = { listLevel: 0, inQuote: false, inCode: false };

const ALIGNMENT = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
} as const;

const HEADINGS = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
} as const;

/** "12pt" / "16px" → docx half-points. */
function toHalfPoints(fontSize: unknown): number | undefined {
  if (typeof fontSize !== "string") return undefined;
  const value = parseFloat(fontSize);
  if (Number.isNaN(value)) return undefined;
  const points = fontSize.endsWith("px") ? value * 0.75 : value;
  return Math.round(points * 2);
}

/** '"Times New Roman", serif' → 'Times New Roman' */
function firstFontName(fontFamily: unknown): string | undefined {
  if (typeof fontFamily !== "string" || !fontFamily) return undefined;
  return fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
}

/** "#ff0000" / "rgb(255, 0, 0)" → "FF0000" */
function toHexColor(color: unknown): string | undefined {
  if (typeof color !== "string") return undefined;
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return (hex.length === 3 ? hex.replace(/./g, "$&$&") : hex.slice(0, 6))
      .toUpperCase();
  }
  const rgb = color.match(/\d+/g);
  if (color.startsWith("rgb") && rgb && rgb.length >= 3) {
    return rgb
      .slice(0, 3)
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  return undefined;
}

function textRun(node: JSONContent, ctx: Context): TextRun {
  const marks = node.marks ?? [];
  const has = (type: string) => marks.some((m) => m.type === type);
  const style = marks.find((m) => m.type === "textStyle")?.attrs ?? {};
  const isCode = ctx.inCode || has("code");

  return new TextRun({
    text: node.text ?? "",
    bold: has("bold") || undefined,
    italics: has("italic") || ctx.inQuote || undefined,
    underline: has("underline") || has("link") ? {} : undefined,
    strike: has("strike") || undefined,
    font: isCode ? "Courier New" : firstFontName(style.fontFamily),
    size: toHalfPoints(style.fontSize),
    color: has("link") ? "0563C1" : toHexColor(style.color),
  });
}

function inlineChildren(
  nodes: JSONContent[] | undefined,
  ctx: Context
): ParagraphChild[] {
  const children: ParagraphChild[] = [];
  for (const node of nodes ?? []) {
    if (node.type === "hardBreak") {
      children.push(new TextRun({ text: "", break: 1 }));
    } else if (node.type === "text" && ctx.inCode && node.text?.includes("\n")) {
      // Code blocks keep line breaks as "\n" inside a single text node.
      node.text.split("\n").forEach((line, i) => {
        if (i > 0) children.push(new TextRun({ text: "", break: 1 }));
        children.push(textRun({ ...node, text: line }, ctx));
      });
    } else if (node.type === "text") {
      const link = node.marks?.find((m) => m.type === "link");
      const run = textRun(node, ctx);
      children.push(
        link?.attrs?.href
          ? new ExternalHyperlink({ link: link.attrs.href, children: [run] })
          : run
      );
    }
  }
  return children;
}

function paragraph(
  node: JSONContent,
  ctx: Context,
  extra: { heading?: (typeof HEADINGS)[keyof typeof HEADINGS] } = {}
): Paragraph {
  const align = node.attrs?.textAlign as keyof typeof ALIGNMENT | undefined;
  return new Paragraph({
    children: inlineChildren(node.content, ctx),
    heading: extra.heading,
    alignment: align ? ALIGNMENT[align] : undefined,
    bullet:
      ctx.listType === "bullet" ? { level: ctx.listLevel } : undefined,
    numbering:
      ctx.listType === "ordered"
        ? { reference: ORDERED_LIST_REF, level: ctx.listLevel }
        : undefined,
    indent: ctx.inQuote ? { left: 567 } : undefined,
    border: ctx.inQuote
      ? {
          left: { style: BorderStyle.SINGLE, size: 12, color: "A3A3A3", space: 8 },
        }
      : undefined,
  });
}

async function imageParagraph(node: JSONContent): Promise<Paragraph | null> {
  const src = node.attrs?.src as string | undefined;
  if (!src) return null;

  try {
    const blob = await (await fetch(src)).blob();
    const type = blob.type.includes("png")
      ? "png"
      : blob.type.includes("gif")
      ? "gif"
      : blob.type.includes("jpeg") || blob.type.includes("jpg")
      ? "jpg"
      : null;
    if (!type) return null; // docx only supports png/jpg/gif/bmp here

    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
    const transformation = {
      width: Math.round(bitmap.width * scale),
      height: Math.round(bitmap.height * scale),
    };
    bitmap.close();

    return new Paragraph({
      children: [
        new ImageRun({
          type,
          data: new Uint8Array(await blob.arrayBuffer()),
          transformation,
          altText: node.attrs?.alt
            ? { name: node.attrs.alt, description: node.attrs.alt, title: node.attrs.alt }
            : undefined,
        }),
      ],
    });
  } catch (err) {
    console.warn("Skipping image that couldn't be exported", err);
    return null;
  }
}

async function table(node: JSONContent): Promise<Table> {
  const rows = await Promise.all(
    (node.content ?? []).map(async (row) => {
      const cells = await Promise.all(
        (row.content ?? []).map(async (cell) => {
          const blocks = await convertBlocks(cell.content, BASE_CONTEXT);
          const isHeader = cell.type === "tableHeader";
          return new TableCell({
            children: blocks.length
              ? blocks.filter((b): b is Paragraph | Table => !(b instanceof TableOfContents))
              : [new Paragraph("")],
            columnSpan: cell.attrs?.colspan ?? undefined,
            rowSpan: cell.attrs?.rowspan ?? undefined,
            shading: isHeader ? { fill: "F2F2F2" } : undefined,
          });
        })
      );
      return new TableRow({ children: cells });
    })
  );

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

async function convertBlocks(
  nodes: JSONContent[] | undefined,
  ctx: Context
): Promise<Block[]> {
  const blocks: Block[] = [];

  for (const node of nodes ?? []) {
    switch (node.type) {
      case "paragraph":
        blocks.push(paragraph(node, ctx));
        break;

      case "heading": {
        const level = (node.attrs?.level ?? 1) as keyof typeof HEADINGS;
        blocks.push(paragraph(node, ctx, { heading: HEADINGS[level] }));
        break;
      }

      case "bulletList":
      case "orderedList": {
        const listType = node.type === "bulletList" ? "bullet" : "ordered";
        const isNested = ctx.listType !== undefined;
        for (const item of node.content ?? []) {
          blocks.push(
            ...(await convertBlocks(item.content, {
              ...ctx,
              listType,
              listLevel: isNested ? ctx.listLevel + 1 : 0,
            }))
          );
        }
        break;
      }

      case "blockquote":
        blocks.push(...(await convertBlocks(node.content, { ...ctx, inQuote: true })));
        break;

      case "codeBlock":
        blocks.push(paragraph(node, { ...ctx, inCode: true }));
        break;

      case "horizontalRule":
        blocks.push(
          new Paragraph({
            children: [],
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "A3A3A3", space: 1 },
            },
          })
        );
        break;

      case "image": {
        const image = await imageParagraph(node);
        if (image) blocks.push(image);
        break;
      }

      case "table":
        blocks.push(await table(node));
        // Word merges back-to-back tables; keep them apart.
        blocks.push(new Paragraph(""));
        break;

      default:
        // Unknown block: export whatever it contains.
        if (node.content) blocks.push(...(await convertBlocks(node.content, ctx)));
    }
  }

  return blocks;
}

export async function buildDocx(sections: DocxSection[]): Promise<Blob> {
  const children: Block[] = [];

  for (const section of sections) {
    const isToc = section.kind === "TABLE_OF_CONTENTS";
    if (!isToc && !section.content?.content?.length) continue; // nothing published

    if (children.length > 0 && section.pageBreakBefore) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    if (isToc) {
      // A real Word TOC field: Word fills in entries and page numbers when the file opens.
      children.push(new Paragraph({ text: "Table of Contents", heading: HeadingLevel.HEADING_1 }));
      children.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }));
    } else {
      children.push(...(await convertBlocks(section.content!.content, BASE_CONTEXT)));
    }
  }

  const document = new Document({
    // Ask Word to fill in the table of contents (page numbers) on open.
    features: { updateFields: sections.some((s) => s.kind === "TABLE_OF_CONTENTS") },
    styles: {
      default: {
        document: { run: { size: DEFAULT_FONT_SIZE * 2 } },
      },
    },
    numbering: {
      config: [
        {
          reference: ORDERED_LIST_REF,
          levels: [0, 1, 2, 3, 4, 5].map((level) => ({
            level,
            format: [LevelFormat.DECIMAL, LevelFormat.LOWER_LETTER, LevelFormat.LOWER_ROMAN][
              level % 3
            ],
            text: `%${level + 1}.`,
            alignment: AlignmentType.START,
            style: {
              paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } },
            },
          })),
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            // A4 with 25mm margins, matching the on-screen page.
            size: { width: 11906, height: 16838 },
            margin: { top: 1417, right: 1417, bottom: 1417, left: 1417 },
          },
        },
        children: children.length ? children : [new Paragraph("")],
      },
    ],
  });

  return Packer.toBlob(document);
}

export async function downloadDocx(sections: DocxSection[], filename: string) {
  const blob = await buildDocx(sections);
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  window.document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
