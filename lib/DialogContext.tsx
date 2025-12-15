"use client";

import { createContext, useContext, useState } from "react";

type DIALOG_TYPE = "projectCreation" | "";

type DialogContextType = {
  // Open dialog and set dialog type to type
  handleOpenDialog: (type: DIALOG_TYPE) => void;
  // Close dialog and set dialog back to empty string
  handleCloseDialog: () => void;
  isDialogOpen: boolean;
  isDialogType: DIALOG_TYPE;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialogContext() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useDialogContext must be used within a DialogProvider");
  }

  return context;
}

export default function DialogContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogType, setIsDialogType] = useState<DIALOG_TYPE>("");

  function handleOpenDialog(type: DIALOG_TYPE) {
    setIsDialogOpen(true);
    setIsDialogType(type);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setIsDialogType("");
  }

  return (
    <DialogContext.Provider
      value={{
        handleOpenDialog,
        handleCloseDialog,
        isDialogOpen,
        isDialogType,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}
