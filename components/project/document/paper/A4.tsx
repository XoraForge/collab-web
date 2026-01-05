"use client";

import { Badge } from "@/components/ui/badge";
import ParagraphEditor from "../tools/ParagraphEditor";
import { UserCircle2 } from "lucide-react";
import { useState } from "react";

type EditorType = {
  user: string[];
  text: string;
};

const initialState = {
  user: ["Jian Wei", "Wei Jian"],
  text: "",
};

export default function A4() {
  const [currentSelection, setCurrentSelection] = useState<string>("");
  const [currentParagraph, setCurrentParagraph] =
    useState<EditorType>(initialState);

  function handleAddText(text: string) {
    setCurrentParagraph((prev) => {
      return { ...prev, text };
    });
  }

  return (
    <div className="w-[210mm] h-[297mm] bg-white dark:bg-[#2c2c2c] shadow-lg p-[25mm]">
      <div className="w-full flex flex-col items-center relative">
        <div className="absolute left-0 -top-8">
          {currentParagraph.user && (
            <div className="flex gap-x-2">
              {currentParagraph.user.map((user) => (
                <Badge
                  className="bg-blue-100 dark:bg-blue-900 text-black dark:text-white"
                  key={user}
                >
                  <UserCircle2 />
                  <p>{user}</p>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <ParagraphEditor
          className="w-full"
          handleAddText={handleAddText}
          value={currentParagraph.text}
          setCurrentSelection={setCurrentSelection}
        />
        {currentSelection}
      </div>
    </div>
  );
}
