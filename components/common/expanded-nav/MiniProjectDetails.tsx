"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProjectContext } from "@/lib/CurrentProjectContext";
import { useSession } from "@/lib/SessionContext";
import { useDialogContext } from "@/lib/DialogContext";
import { BookOpenText, Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

/** Current project card in the expanded sidebar; click to switch projects. */
export default function MiniProjectDetails() {
  const { name, image } = useProjectContext();
  const { projects } = useSession();
  const { handleOpenDialog } = useDialogContext();
  const params = useParams<{ id?: string }>();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Switch project"
          className="flex gap-x-2 items-center justify-between px-2 py-2.5 border rounded-lg hover:bg-hover text-left"
        >
          <div className="flex gap-x-2 items-center min-w-0">
            <div className="size-8 shrink-0 p-2 relative border border-border flex items-center justify-center rounded-md overflow-hidden">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL from the API
                <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <BookOpenText />
              )}
            </div>
            <h1 className="text-sm font-bold truncate">{name || "Project"}</h1>
          </div>
          <ChevronsUpDown size={15} className="shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1">
        <p className="px-2 py-1.5 text-[11px] font-medium text-muted-text">Your projects</p>
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/project/${project.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <span className="truncate">{project.name}</span>
            {project.id === params.id && <Check size={14} className="shrink-0" />}
          </Link>
        ))}
        <div className="my-1 border-t" />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            handleOpenDialog("projectCreation");
          }}
          className="w-full flex items-center gap-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left"
        >
          <Plus size={14} /> Create new project
        </button>
      </PopoverContent>
    </Popover>
  );
}
