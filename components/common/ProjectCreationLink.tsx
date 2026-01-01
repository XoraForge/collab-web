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
        text-[#00000070] dark:text-[#ffffff70]
        hover:text-black dark:hover:text-white
        hover:bg-[#e5e5e5] dark:hover:bg-[#383838]
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
    <div
      onClick={() => handleOpenDialog("projectCreation")}
      className="
        py-2.5 px-2.5 rounded-sm border text-xs cursor-pointer
        text-[#00000070] dark:text-[#ffffff70]
        border-[#d4d4d4] dark:border-[#404040]
        hover:text-black dark:hover:text-white
        hover:bg-[#e5e5e5] dark:hover:bg-[#383838]
        duration-200 ease-in-out
      "
    >
      <Plus size={15} />
    </div>
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
