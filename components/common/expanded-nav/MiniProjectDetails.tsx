"use client";

import { useProjectContext } from "@/lib/CurrentProjectContext";
import { BookOpenText } from "lucide-react";

export default function MiniProjectDetails() {
  const { name } = useProjectContext();
  return (
    <div className="flex gap-x-2 items-center px-2 py-2.5 border rounded-lg">
      <div className="size-8 p-2 relative border border-white flex items-center justify-center rounded-md">
        <BookOpenText />
      </div>
      <h1 className="text-xs font-bold">{name}</h1>
    </div>
  );
}
