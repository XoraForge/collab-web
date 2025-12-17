"use client";
import ProjectTab from "@/components/common/ProjectTab";
import { useState } from "react";

export default function Tabs() {
  const [currentTab, setCurrentTab] = useState("Overview");
  return (
    <div className="flex gap-x-12 w-full">
      <ProjectTab
        title="Overview"
        isActive={currentTab}
        setIsActive={setCurrentTab}
      />
      <ProjectTab
        title="Assignment"
        isActive={currentTab}
        setIsActive={setCurrentTab}
      />
      <ProjectTab
        title="Team Members"
        isActive={currentTab}
        setIsActive={setCurrentTab}
      />
      <ProjectTab
        title="Schedule"
        isActive={currentTab}
        setIsActive={setCurrentTab}
      />
      <ProjectTab
        title="Notes"
        isActive={currentTab}
        setIsActive={setCurrentTab}
      />
      <ProjectTab
        title="Files"
        isActive={currentTab}
        setIsActive={setCurrentTab}
      />
    </div>
  );
}
