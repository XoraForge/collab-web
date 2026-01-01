"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/lib/CurrentProjectContext";

export default function Page() {
  const { name } = useProjectContext();
  return (
    <div className="flex flex-col px-8 py-4 gap-y-3 h-full">
      <div className="flex justify-between">
        <div>
          <h1 className="text-lg font-semibold">Project Information</h1>
        </div>
        <div className="flex gap-x-3">
          <Button variant="outline">Plan</Button>
        </div>
      </div>
      <div className="border rounded-md w-full h-[400px] grid grid-cols-8 gap-x-3 py-4 px-8">
        {/* Project Image */}
        <div className="w-[90%] border col-span-1"></div>
        {/* Project Information */}
        <div className="flex flex-col justify-between col-span-4">
          <div className="flex items-center gap-x-3">
            <h1 className="font-medium">{name}</h1>
            <Badge variant="destructive">IN PROGRESS</Badge>
          </div>
          <p className="text-xs">
            The Business Analytics for Retail Market Optimization project aims
            to analyze and optimize retail business performance using
            data-driven techniques in the field of business analytics. This
            project is focused on applying analytical tools and methodologies to
            understand consumer behavior, optimize inventory management, and
            improve sales strategies for retail businesses.
          </p>
          <div className="flex gap-x-3">
            <h1>Current Stage:</h1>
            <p>Planning</p>
            <p>Development</p>
            <p>Finalising</p>
          </div>
        </div>
        <div className="col-span-3 border-l flex flex-col justify-between px-3 text-sm">
          <p>Duration: 12 September 2025 - 19 December 2025</p>
          <p>Project Manager: You</p>
          <p>Team Members: 4</p>
          <p>Files: 3</p>
          <p>Viewers: 139</p>
        </div>
      </div>
      <div className="flex h-full justify-between">
        <div>Project Health</div>
        <div>Project Progress</div>
        <div>Project Activities</div>
      </div>
      <div className="flex h-full justify-between">
        <div>Project Schedule</div>
        <div>Project Notes</div>
        <div>Project Team Members</div>
      </div>
    </div>
  );
}
