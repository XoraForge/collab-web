"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { DIALOG_TYPE, useDialogContext } from "@/lib/DialogContext";

interface DefButtonProps {
  handleOpenDialog: (type: DIALOG_TYPE) => void;
  title: string;
}

interface ExpandedButtonProps {
  handleOpenDialog: (type: DIALOG_TYPE) => void;
}

function DefButton({ handleOpenDialog, title }: DefButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => handleOpenDialog("projectCreation")}
      className="
        text-xs font-medium justify-start cursor-pointer
        text-muted-text
        hover:text-black dark:hover:text-white
        hover:bg-hover
        duration-200 ease-in-out
      "
    >
      <Plus />
      {title}
    </Button>
  );
}

function ExpandedButton({ handleOpenDialog }: ExpandedButtonProps) {
  return (
    <button
      type="button"
      aria-label="Create new project"
      title="Create new project"
      onClick={() => handleOpenDialog("projectCreation")}
      className="
        flex items-center justify-center
        py-2.5 px-2.5 rounded-sm border text-xs cursor-pointer
        text-muted-text
        border-divider
        hover:text-black dark:hover:text-white
        hover:bg-hover
        duration-200 ease-in-out
      "
    >
      <Plus size={15} />
    </button>
  );
}

export default function ProjectCreationLink({
  title,
  isExpanded = false,
}: {
  title: string;
  isExpanded?: boolean;
}) {
  const { handleOpenDialog } = useDialogContext();
  return isExpanded ? (
    <ExpandedButton handleOpenDialog={handleOpenDialog} />
  ) : (
    <DefButton handleOpenDialog={handleOpenDialog} title={title} />
  );
}
