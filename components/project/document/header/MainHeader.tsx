"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImageIcon,
  Italic,
  List,
  Minus,
  Plus,
  Quote,
  Redo2,
  Table,
  Underline,
  Undo2,
  Download,
} from "lucide-react";

type Props = {
  onAddSection?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
};

export default function MainHeader({
  onAddSection,
  onUndo,
  onRedo,
  onExport,
}: Props) {
  function Style(type: "bold" | "italic" | "underline") {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const wrapper = document.createElement("span");

    if (type === "bold") wrapper.style.fontWeight = "bold";
    if (type === "italic") wrapper.style.fontStyle = "italic";
    if (type === "underline") wrapper.style.textDecoration = "underline";

    const contents = range.extractContents();
    wrapper.appendChild(contents);
    range.insertNode(wrapper);

    // restore selection
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.addRange(newRange);
  }

  return (
    <div className="w-full flex justify-center p-1 gap-x-2 items-center border-b">
      <div className="flex items-center gap-x-2 border-r pr-2">
        <Button
          variant="ghost"
          className="rounded-none"
          onClick={() => onUndo && onUndo()}
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          className="rounded-none"
          onClick={() => onRedo && onRedo()}
        >
          <Redo2 />
        </Button>
        <Button
          variant="ghost"
          className="rounded-none"
          onMouseDown={(e) => {
            e.preventDefault();
            if (onAddSection) onAddSection();
          }}
        >
          <Plus />
        </Button>
        <Input value="100%" className="w-[60px] text-right" />
        <Button variant="ghost" className="rounded-none">
          <Minus />
        </Button>
      </div>
      <div className="flex items-center gap-x-2 border-r pr-2">
        <Button
          variant="ghost"
          onMouseDown={(e) => {
            e.preventDefault();
            Style("bold");
          }}
        >
          <Bold />
        </Button>
        <Button
          variant="ghost"
          onMouseDown={(e) => {
            e.preventDefault();
            Style("italic");
          }}
        >
          <Italic />
        </Button>
        <Button
          variant="ghost"
          onMouseDown={(e) => {
            e.preventDefault();
            Style("underline");
          }}
        >
          <Underline />
        </Button>
      </div>
      <div className="flex items-center gap-x-2 border-r pr-2">
        <Button variant="ghost">
          <AlignLeft />
        </Button>
        <Button variant="ghost">
          <AlignCenter />
        </Button>
        <Button variant="ghost">
          <AlignRight />
        </Button>
        <Button variant="ghost">
          <List />
        </Button>
      </div>
      <div className="flex items-center gap-x-2 pr-2">
        <Button variant="ghost">
          <ImageIcon />
        </Button>
        <Button variant="ghost">
          <Table />
        </Button>
        <Button variant="ghost">
          <Quote />
        </Button>
        <Button
          variant="ghost"
          title="Download .docx"
          onClick={() => {
            if (onExport) onExport();
          }}
        >
          <Download />
        </Button>
      </div>
    </div>
  );
}
