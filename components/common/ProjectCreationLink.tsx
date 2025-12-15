"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useDialogContext } from "@/lib/DialogContext";

export default function ProjectCreationLink({ title }: { title: string }) {
  const { setIsDialogOpen } = useDialogContext();
  return (
    <Button
      className="text-xs font-medium justify-start"
      variant="outline"
      onClick={() => setIsDialogOpen(true)}
    >
      <Plus />
      {title}
    </Button>
  );
}
