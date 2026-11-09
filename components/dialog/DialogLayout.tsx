"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useDialogContext } from "@/lib/DialogContext";
import { X } from "lucide-react";
import InitProjectDialog from "./variants/InitProjectDialog";

export default function DialogLayout() {
  const { isDialogOpen, isDialogType, handleCloseDialog } = useDialogContext();

  return (
    <Dialog.Root
      open={isDialogOpen}
      onOpenChange={(open) => !open && handleCloseDialog()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-dialog min-h-[min(600px,calc(100svh-2rem))] max-h-[calc(100svh-2rem)] w-[500px] max-w-[calc(100vw-2rem)] rounded-md border p-4 overflow-y-auto small-scrollbar flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* Dialog Exit */}
          <div className="flex justify-end">
            <Dialog.Close
              aria-label="Close dialog"
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={15} />
            </Dialog.Close>
          </div>
          {/* Title & Children */}
          {isDialogType == "projectCreation" && (
            <InitProjectDialog handleCloseDialog={handleCloseDialog} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
