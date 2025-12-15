"use client";

import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

type DialogContextType = {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
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
  return (
    <DialogContext.Provider value={{ isDialogOpen, setIsDialogOpen }}>
      {children}
    </DialogContext.Provider>
  );
}
