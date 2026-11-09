"use client";

import { Badge } from "@/components/ui/badge";
import { UserCircle2 } from "lucide-react";

export type PresenceUser = { name: string; color: string };

/** An A4 sheet. `people` shows who is editing right now (above the page content). */
export default function A4({
  people = [],
  onMarginClick,
  children,
}: {
  people?: PresenceUser[];
  onMarginClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      id="a4-editor"
      className="w-[210mm] min-h-[297mm] h-fit shrink-0 bg-paper shadow-lg p-[25mm] cursor-text"
      onClick={(e) => {
        // Clicking the page margins focuses the end of the document, like Word.
        if (e.target === e.currentTarget) onMarginClick?.();
      }}
    >
      <div className="w-full flex flex-col items-center relative">
        {people.length > 0 && (
          <div className="absolute left-0 -top-8">
            <div className="flex gap-x-2">
              {people.map((person, i) => (
                <Badge
                  key={`${person.name}-${i}`}
                  className="text-white"
                  style={{ backgroundColor: person.color }}
                >
                  <UserCircle2 />
                  <p>{person.name}</p>
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
