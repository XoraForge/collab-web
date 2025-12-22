"use client";

import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/lib/CurrentProjectContext";
import { BookOpenText } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function ProjectDetails({
  projectName,
}: {
  projectName: string;
}) {
  const { setName } = useProjectContext();

  useEffect(() => {
    setName(projectName);
  }, [projectName]);

  return (
    <div className="flex justify-between items-center text-white">
      {/* Image and Name */}
      <div className="flex gap-x-6 ">
        <div className="size-32 relative border border-white flex items-center justify-center rounded-md">
          <BookOpenText size={50} />
        </div>
        <div className="flex flex-col justify-center gap-y-1.5">
          <p className="text-sm font-medium">Public Project</p>
          <h1 className="text-4xl font-bold">{projectName}</h1>
          <div className="flex items-center">
            <p className="text-sm font-regular">Created By: </p>
            <div className="size-6 relative overflow-hidden ml-2.5">
              <Image
                src="/testimage.png"
                fill
                className="object-cover"
                alt="user"
              />
            </div>
            <p className="text-sm font-medium ml-1.5">Alex Hunter</p>
          </div>
        </div>
      </div>
      {/* Team Members and Actions */}
      <div className="flex gap-x-3 items-center">
        {/* Team members */}
        <div className="flex self-end pb-2"></div>
        <div className="flex flex-col gap-y-2">
          <div className="text-right">
            <p className="font-medium text-xs">Last Update: 2 hour ago</p>
          </div>
          {/* Actions (Share | Invite | Edit) */}
          <div className="flex gap-x-3">
            <Button variant="outline">Share</Button>
            <Button variant="outline">Invite</Button>
            <Button>Edit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
