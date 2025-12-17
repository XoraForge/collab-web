"use client";

import Fieldset from "@/components/common/Fieldset";
import ImageCropper from "@/components/image/ImageCropper";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const VISILIBTY = [
  {
    title: "Public",
    icon: "material-symbols:public",
  },
  {
    title: "Private",
    icon: "material-symbols:public-off",
  },
];

export default function InitProjectDialog() {
  // const [projectName, setProjectName] = useState("");
  // const [projectVisibility, setProjectVisibility] = useState<"Public" | "Private">()
  return (
    <div className="flex flex-col px-4 py-2 gap-y-2 h-full">
      <h1 className="text-2xl font-semibold">Create a project</h1>
      <p className="text-xs">
        You can create a project or join an existing project with an invitation
        link.
      </p>
      <div className="flex flex-col gap-y-4 h-full mt-1.5">
        <ImageCropper />
        <Fieldset label="Project Name" type="input" />
        <div className="flex gap-x-3">
          <Fieldset
            label="Visibility"
            type="dropdown"
            selectItems={VISILIBTY}
          />
          <Fieldset label="Due Date" type="datepicker" />
        </div>
        <div className="flex flex-col gap-y-0.5">
          {/* Information */}
          <p className="text-xs">Anyone can view the project.</p>
          <p className="text-xs">Project is due 7 days from now.</p>
        </div>
      </div>

      <hr />
      <div className="flex self-end gap-x-3">
        <Button>Save As Draft</Button>
        <Button>Create Project</Button>
      </div>
    </div>
  );
}
