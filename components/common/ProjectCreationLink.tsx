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
      className="text-xs font-medium justify-start cursor-pointer text-[#ffffff70] hover:text-white hover:bg-[#383838] duration-200 ease-in-out"
      variant="outline"
      onClick={() => handleOpenDialog("projectCreation")}
    >
      <Plus />
      {title}
    </Button>
  );
}

function ExpandedButton({ handleOpenDialog }: ExpandedButtonProps) {
  return (
    <div
      className="py-2.5 px-2.5 rounded-sm border text-xs cursor-pointer text-[#ffffff70] hover:text-white hover:bg-[#383838] duration-200 ease-in-out"
      onClick={() => handleOpenDialog("projectCreation")}
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
