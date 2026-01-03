"use client";

import { useState } from "react";
import MainHeader from "./header/MainHeader";
import SecondaryHeader from "./header/SecondaryHeader";
import Document from "./layout/Document";
import { Button } from "@/components/ui/button";
import {
  LockKeyholeIcon,
  LockKeyholeOpen,
  LucideChevronRight,
  Rows3Icon,
} from "lucide-react";
import Section from "./doc-section/Section";

export default function DocumentLayout() {
  return (
    <div className="grid grid-cols-16 size-full">
      {/* Column 1: Sections (2) */}
      <div className="col-span-2 border p-3">
        {/* CoverPage / Table of Content */}
        <div className="flex flex-col gap-y-1.5">
          <Section isLocked={true} title="Cover" />
          <Section isLocked={true} title="Table of Content" />
          <Section isLocked={true} title="Introduction" />
          <Section isLocked={false} title="Research" />
          <Section isLocked={false} title="SWOT Analysis" />
          <Section isLocked={false} title="Comparison" />
          <Section isLocked={true} title="Conclusion" />
        </div>
        {/* Sections */}
        {/* Footer / Citations */}
      </div>
      {/* Column 2: Body (10) */}
      <div className="col-span-11 border flex flex-col relative">
        <MainHeader />

        {/* Body?: Actual Document (Top) - Criteria (Word count, sentence, paragraph) - Description + Comments (Bottom) */}
        <div className="h-full flex flex-col flex-1">
          <Document />
          {/* <Guidelines /> */}
        </div>
      </div>
      {/* Column 3: Properties (3) */}
      <div className="col-span-3 border">
        <SecondaryHeader />
      </div>
    </div>
  );
}
