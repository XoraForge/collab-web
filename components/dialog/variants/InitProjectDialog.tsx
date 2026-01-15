"use client";

import Fieldset from "@/components/common/Fieldset";
import ImageCropper from "@/components/image/ImageCropper";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export type VisibilityType = {
  title: "Public" | "Private" | "Organization";
  icon: string;
};

const VISIBILITY = [
  {
    title: "Public",
    icon: "material-symbols:public",
  },
  {
    title: "Private",
    icon: "material-symbols:public-off",
  },
  {
    title: "Organization",
    icon: "gg:organisation",
  },
];

const DEFAULT_DUE_DATE = (() => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
})();

function daysFrom(date: Date, from: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((date.getTime() - from.getTime()) / msPerDay);
}

export default function InitProjectDialog({
  handleCloseDialog,
}: {
  handleCloseDialog: () => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [projectVisibility, setProjectVisibility] = useState("");
  const [date, setDate] = useState<Date>(DEFAULT_DUE_DATE);

  return (
    <div className="flex flex-col px-4 py-2 gap-y-2 h-full">
      <h1 className="text-2xl font-semibold">Create a project</h1>
      <p className="text-xs">
        You can create a project or join an existing project with an invitation
        link.
      </p>
      <div className="flex flex-col gap-y-4 h-full mt-1.5">
        <ImageCropper />
        <Fieldset
          label="Project Name"
          type="input"
          value={projectName}
          setValue={setProjectName}
        />
        <div className="flex gap-x-3">
          <Fieldset
            label="Visibility"
            type="dropdown"
            selectItems={VISIBILITY}
            setItems={setProjectVisibility}
          />
          <Fieldset
            label="Due Date"
            type="datepicker"
            date={date}
            setDate={setDate}
          />
        </div>
        <div className="flex flex-col gap-y-0.5">
          {/* Information */}
          {projectVisibility == "Public" && (
            <p className="text-xs">Anyone can view the project.</p>
          )}
          {projectVisibility == "Private" && (
            <p className="text-xs">
              Only project team members can view the project.
            </p>
          )}
          {projectVisibility == "Organization" && (
            <p className="text-xs">
              All organization members can view the project.
            </p>
          )}

          <p className="text-xs">
            Project is due {daysFrom(date, new Date())} days from now.
          </p>
        </div>
      </div>

      <hr />
      <div className="flex self-end gap-x-3">
        <Button variant="outline" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button variant="outline">Create Project</Button>
      </div>
    </div>
  );
}
