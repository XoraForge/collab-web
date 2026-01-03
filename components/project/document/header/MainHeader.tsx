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
} from "lucide-react";

export default function MainHeader() {
  return (
    <div className="w-full flex justify-center p-1 gap-x-2 items-center border-b">
      <div className="flex items-center gap-x-2 border-r pr-2">
        <Button variant="ghost" className="rounded-none">
          <Undo2 />
        </Button>
        <Button variant="ghost" className="rounded-none">
          <Redo2 />
        </Button>
        <Button variant="ghost" className="rounded-none">
          <Plus />
        </Button>
        <Input value="100%" className="w-[60px] text-right" />
        <Button variant="ghost" className="rounded-none">
          <Minus />
        </Button>
      </div>
      <div className="flex items-center gap-x-2 border-r pr-2">
        <Button variant="ghost">
          <Bold />
        </Button>
        <Button variant="ghost">
          <Italic />
        </Button>
        <Button variant="ghost">
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
      </div>
    </div>
  );
}
