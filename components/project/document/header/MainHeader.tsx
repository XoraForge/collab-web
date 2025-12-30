"use client";

import { Button } from "@/components/ui/button";
import { ImageIcon, Redo2, Search, Table, Text, Undo2 } from "lucide-react";
import { SelectionType } from "../DocumentLayout";

interface MainHeaderProps {
  selection: SelectionType;
  handleOnToggle: (selection: SelectionType) => void;
}

export default function MainHeader({
  selection,
  handleOnToggle,
}: MainHeaderProps) {
  return (
    <section className="absolute top-6 left-1/2 translate-x-[-50%] flex flex-col p-2 bg-black">
      <div className="w-full flex justify-center gap-x-2 items-center">
        <Button variant="outline" className="rounded-none">
          <Undo2 />
        </Button>
        <Button variant="outline" className="rounded-none">
          <Redo2 />
        </Button>
        <Button
          variant={selection == "Text" ? "default" : "outline"}
          className="rounded-none border"
          onClick={() => handleOnToggle("Text")}
        >
          <p className="text-sm">T</p>
        </Button>
        <Button
          variant={selection == "Image" ? "default" : "outline"}
          className="rounded-none border"
          onClick={() => handleOnToggle("Image")}
        >
          <ImageIcon />
        </Button>
        <Button
          variant={selection == "Paragraph" ? "default" : "outline"}
          className="rounded-none border"
          onClick={() => handleOnToggle("Paragraph")}
        >
          <Text />
        </Button>
        <Button
          variant={selection == "Search" ? "default" : "outline"}
          className="rounded-none border"
          onClick={() => handleOnToggle("Search")}
        >
          <Search />
        </Button>
        <Button
          variant={selection == "Table" ? "default" : "outline"}
          className="rounded-none border"
          onClick={() => handleOnToggle("Table")}
        >
          <Table />
        </Button>
      </div>
    </section>
  );
}
