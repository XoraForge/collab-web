"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useDialogContext } from "@/lib/DialogContext";

export default function ProjectCreationLink({ title }: { title: string }) {
  const { handleOpenDialog } = useDialogContext();
  return (
    <Button
      className="text-xs font-medium justify-start cursor-pointer"
      variant="outline"
      onClick={() => handleOpenDialog("projectCreation")}
    >
      <Plus />
      {title}
    </Button>
  );
}
