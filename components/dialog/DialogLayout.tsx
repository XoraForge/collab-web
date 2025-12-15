"use client";

import { useDialogContext } from "@/lib/DialogContext";
import { X } from "lucide-react";

export default function DialogLayout() {
  const { isDialogOpen, handleCloseDialog } = useDialogContext();

  if (!isDialogOpen) return;

  return (
    <div
      className="absolute top-0 left-0 size-full bg-[#00000090] flex items-center justify-center z-50"
      id="dialog"
      onClick={(e) => e.target.id == "dialog" && handleCloseDialog()}
    >
      <div className="bg-[#2e2e2e] h-[600px] w-[500px] rounded-md border p-4">
        {/* Dialog Exit */}
        <div className="flex justify-end">
          <X size={15} onClick={() => handleCloseDialog()} />
        </div>
        {/* Title & Children */}
      </div>
    </div>
  );
}
