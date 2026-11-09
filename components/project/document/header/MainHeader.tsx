"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Editor, useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
} from "lucide-react";
import { createContext, useContext, useRef, useState } from "react";
import {
  DEFAULT_FONT_SIZE,
  FONT_FAMILIES,
  FONT_SIZES,
} from "../editor/extensions";

type Props = {
  editor: Editor | null;
  /** Viewing a section you can't edit: formatting is disabled, zoom/export still work. */
  readOnly?: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport?: () => void;
};

export const MIN_ZOOM = 50;
export const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

const BLOCK_TYPES = [
  { label: "Normal text", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
] as const;

const ReadOnlyContext = createContext(false);

/** Toolbar button that keeps the editor's selection (mousedown would steal focus). */
function ToolButton({
  label,
  isActive = false,
  disabled = false,
  alwaysEnabled = false,
  onClick,
  className,
  children,
}: {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  /** Stays usable in read-only mode (zoom, export). */
  alwaysEnabled?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const readOnly = useContext(ReadOnlyContext);
  disabled = disabled || (readOnly && !alwaysEnabled);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      disabled={disabled}
      className={cn(isActive && "bg-accent text-accent-foreground", className)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Group({
  children,
  last = false,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-x-1 pr-2", !last && "border-r")}>
      {children}
    </div>
  );
}

function ZoomInput({
  zoom,
  onZoomChange,
}: {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  function commit() {
    if (draft === null) return;
    const parsed = parseInt(draft.replace("%", ""), 10);
    if (!Number.isNaN(parsed)) {
      onZoomChange(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parsed)));
    }
    setDraft(null);
  }

  return (
    <Input
      aria-label="Zoom"
      value={draft ?? `${zoom}%`}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(null);
          e.currentTarget.blur();
        }
      }}
      className="w-[60px] h-8 text-right"
    />
  );
}

function TableMenu({ editor, inTable }: { editor: Editor; inTable: boolean }) {
  const [open, setOpen] = useState(false);
  const readOnly = useContext(ReadOnlyContext);

  const actions: { label: string; run: () => void; destructive?: boolean }[] =
    inTable
      ? [
          {
            label: "Add row above",
            run: () => editor.chain().focus().addRowBefore().run(),
          },
          {
            label: "Add row below",
            run: () => editor.chain().focus().addRowAfter().run(),
          },
          {
            label: "Add column left",
            run: () => editor.chain().focus().addColumnBefore().run(),
          },
          {
            label: "Add column right",
            run: () => editor.chain().focus().addColumnAfter().run(),
          },
          {
            label: "Delete row",
            run: () => editor.chain().focus().deleteRow().run(),
          },
          {
            label: "Delete column",
            run: () => editor.chain().focus().deleteColumn().run(),
          },
          {
            label: "Delete table",
            run: () => editor.chain().focus().deleteTable().run(),
            destructive: true,
          },
        ]
      : [
          {
            label: "Insert 3 × 3 table",
            run: () =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
          },
        ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Table"
          aria-label="Table"
          disabled={readOnly}
          className={cn(inTable && "bg-accent text-accent-foreground")}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Table />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-1"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                action.run();
                setOpen(false);
              }}
              className={cn(
                "text-left text-sm rounded-sm px-2 py-1.5 hover:bg-accent",
                action.destructive && "text-destructive"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({
  editor,
  readOnly = false,
  zoom,
  onZoomChange,
  onExport,
}: Props & { editor: Editor }) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      const textStyle = editor.getAttributes("textStyle");
      const headingLevel = [1, 2, 3].find((level) =>
        editor.isActive("heading", { level })
      );
      return {
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isUnderline: editor.isActive("underline"),
        isStrike: editor.isActive("strike"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        isQuote: editor.isActive("blockquote"),
        inTable: editor.isActive("table"),
        align: (["center", "right", "justify"].find((a) =>
          editor.isActive({ textAlign: a })
        ) ?? "left") as "left" | "center" | "right" | "justify",
        blockType: headingLevel ? `h${headingLevel}` : "paragraph",
        fontFamily: (textStyle.fontFamily as string | undefined) ?? "",
        fontSize: (textStyle.fontSize as string | undefined) ?? "",
      };
    },
  });

  function setBlockType(value: string) {
    const chain = editor.chain().focus();
    if (value === "paragraph") chain.setParagraph().run();
    else
      chain.setHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run();
  }

  function setFontFamily(value: string) {
    const chain = editor.chain().focus();
    if (value === "default") chain.unsetFontFamily().run();
    else chain.setFontFamily(value).run();
  }

  function setFontSize(value: string) {
    editor.chain().focus().setFontSize(`${value}pt`).run();
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // TODO(backend): upload the file and insert its URL instead of a data URL.
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        editor
          .chain()
          .focus()
          .setImage({ src: reader.result, alt: file.name })
          .run();
      }
    };
    reader.readAsDataURL(file);
  }

  const currentFontSize = state.fontSize
    ? String(parseFloat(state.fontSize))
    : String(DEFAULT_FONT_SIZE);
  const fontSizeOptions = FONT_SIZES.map(String).includes(currentFontSize)
    ? FONT_SIZES.map(String)
    : [...FONT_SIZES.map(String), currentFontSize].sort(
        (a, b) => Number(a) - Number(b)
      );

  return (
    <ReadOnlyContext.Provider value={readOnly}>
    <div className="w-full flex flex-wrap justify-center px-1 py-1.5 gap-x-2 gap-y-1 items-center border-b">
      <Group>
        <ToolButton
          label="Undo (Ctrl+Z)"
          disabled={!state.canUndo}
          className="rounded-none"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 />
        </ToolButton>
        <ToolButton
          label="Redo (Ctrl+Shift+Z)"
          disabled={!state.canRedo}
          className="rounded-none"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </ToolButton>
        <ToolButton
          label="Zoom in"
          alwaysEnabled
          disabled={zoom >= MAX_ZOOM}
          className="rounded-none"
          onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
        >
          <Plus />
        </ToolButton>
        <ZoomInput zoom={zoom} onZoomChange={onZoomChange} />
        <ToolButton
          label="Zoom out"
          alwaysEnabled
          disabled={zoom <= MIN_ZOOM}
          className="rounded-none"
          onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
        >
          <Minus />
        </ToolButton>
      </Group>

      <Group>
        <Select value={state.blockType} onValueChange={setBlockType} disabled={readOnly}>
          <SelectTrigger size="sm" aria-label="Text style" className="w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOCK_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-xs">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={state.fontFamily || "default"}
          onValueChange={setFontFamily}
          disabled={readOnly}
        >
          <SelectTrigger size="sm" aria-label="Font" className="w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem
                key={font.label}
                value={font.value || "default"}
                className="text-xs"
                style={{ fontFamily: font.value || undefined }}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={currentFontSize} onValueChange={setFontSize} disabled={readOnly}>
          <SelectTrigger size="sm" aria-label="Font size" className="w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontSizeOptions.map((size) => (
              <SelectItem key={size} value={size} className="text-xs">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Group>

      <Group>
        <ToolButton
          label="Bold (Ctrl+B)"
          isActive={state.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolButton>
        <ToolButton
          label="Italic (Ctrl+I)"
          isActive={state.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolButton>
        <ToolButton
          label="Underline (Ctrl+U)"
          isActive={state.isUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline />
        </ToolButton>
        <ToolButton
          label="Strikethrough"
          isActive={state.isStrike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolButton>
      </Group>

      <Group>
        <ToolButton
          label="Align left"
          isActive={state.align === "left"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft />
        </ToolButton>
        <ToolButton
          label="Align center"
          isActive={state.align === "center"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter />
        </ToolButton>
        <ToolButton
          label="Align right"
          isActive={state.align === "right"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight />
        </ToolButton>
        <ToolButton
          label="Justify"
          isActive={state.align === "justify"}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify />
        </ToolButton>
        <ToolButton
          label="Bulleted list"
          isActive={state.isBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          isActive={state.isOrderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolButton>
      </Group>

      <Group last>
        <ToolButton
          label="Insert image"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon />
        </ToolButton>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif"
          className="hidden"
          onChange={handleImageFile}
        />
        <TableMenu editor={editor} inTable={state.inTable} />
        <ToolButton
          label="Quote"
          isActive={state.isQuote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToolButton>
        <ToolButton
          label="Download published document (.docx)"
          alwaysEnabled
          onClick={() => onExport?.()}
        >
          <Download />
        </ToolButton>
      </Group>
    </div>
    </ReadOnlyContext.Provider>
  );
}

export default function MainHeader(props: Props) {
  if (!props.editor) {
    // Same height as the toolbar so the page doesn't jump when it mounts.
    return <div className="w-full h-[45px] border-b" />;
  }
  return <Toolbar {...props} editor={props.editor} />;
}
