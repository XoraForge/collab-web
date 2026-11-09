"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Project } from "@/lib/api/types";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

const WHO_CAN_OPEN: Record<Project["visibility"], string> = {
  PUBLIC: "Anyone signed in to Collab can view this project with the link.",
  PRIVATE: "Only project members can open this link. Use Invite to add people.",
  ORGANIZATION: "Members of your organization can view this project with the link.",
};

/** Copy the project's link. */
export default function ShareButton({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/dashboard/project/${project.id}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Share</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 flex flex-col gap-y-2">
        <p className="text-sm font-semibold">Share this project</p>
        <p className="text-xs text-muted-text">{WHO_CAN_OPEN[project.visibility]}</p>
        <div className="flex items-center gap-x-1.5">
          <Input readOnly value={url} className="h-8 text-xs" onFocus={(e) => e.currentTarget.select()} aria-label="Project link" />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard?.writeText(url).catch(() => undefined);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
