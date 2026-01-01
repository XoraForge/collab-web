"use client";

import { useProjectContext } from "@/lib/CurrentProjectContext";
import { BookOpenText, ChevronsUpDown } from "lucide-react";

export default function MiniProjectDetails() {
  const { name } = useProjectContext();

  const shorten = name.split(" ")[0];

  return (
    <div className="flex gap-x-2 items-center justify-between px-2 py-2.5 border rounded-lg">
      <div className="flex gap-x-2 items-center">
        <div className="size-8 p-2 relative border border-border flex items-center justify-center rounded-md">
          <BookOpenText />
        </div>
        <h1 className="text-sm font-bold">{shorten + "..."}</h1>
      </div>
      <ChevronsUpDown size={15} />
    </div>
  );
}
