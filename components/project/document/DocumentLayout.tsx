"use client";

import { useState } from "react";
import MainHeader from "./header/MainHeader";
import SecondaryHeader from "./header/SecondaryHeader";

export type SelectionType =
  | "Text"
  | "Image"
  | "Paragraph"
  | "Search"
  | "Table"
  | "None";

export default function DocumentLayout() {
  const [selection, setSelection] = useState<SelectionType>("None");

  function handleOnToggle(selection: SelectionType) {
    setSelection((prev) => (prev == selection ? "None" : selection));
  }
  return (
    <div className="grid grid-cols-16 size-full">
      {/* Column 1: Sections (2) */}
      <div className="col-span-2 border">
        {/* CoverPage / Table of Content */}
        {/* Sections */}
        {/* Footer / Citations */}
      </div>
      {/* Column 2: Body (10) */}
      <div className="col-span-11 border flex flex-col relative">
        <MainHeader selection={selection} handleOnToggle={handleOnToggle} />

        {/* Body?: Criteria? Actual Document? */}
        <div className="size-full flex items-center justify-center bg-white"></div>
      </div>
      {/* Column 3: Properties (3) */}
      <div className="col-span-3 border">
        <SecondaryHeader type={selection} />
      </div>
    </div>
  );
}
