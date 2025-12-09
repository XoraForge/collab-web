import ProjectTab from "@/components/common/ProjectTab";
import { Button } from "@/components/ui/button";
import { BookOpenText } from "lucide-react";
import Image from "next/image";

export default async function page({ params }) {
  const { id } = await params;

  return (
    <div className="flex flex-col size-full">
      {/* Banner */}
      <div className="h-[350px] w-full bg-[#242424] border-b border-[#313131] flex justify-center">
        {/* Image -> Name -> Team Members -> Invite / Edit */}
        <div className="w-[80%] py-6 flex flex-col justify-between">
          <div className="flex justify-between items-center text-white">
            {/* Image and Name */}
            <div className="flex gap-x-6 ">
              <div className="size-32 relative border border-white flex items-center justify-center rounded-md">
                <BookOpenText size={50} />
              </div>
              <div className="flex flex-col justify-center gap-y-1.5">
                <p className="text-sm font-medium">Public Project</p>
                <h1 className="text-4xl font-bold">
                  {id.replaceAll("-", " ").toUpperCase()}
                </h1>
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
                  <Button>Share</Button>
                  <Button>Invite</Button>
                  <Button>Edit</Button>
                </div>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <div className="flex gap-x-12 w-full">
            <ProjectTab title="Overview" />
            <ProjectTab title="Chat" />
            <ProjectTab title="Team Members" />
            <ProjectTab title="Schedule" />
            <ProjectTab title="Notes" />
            <ProjectTab title="Files" />
          </div>
        </div>
      </div>

      {/* Screens */}
      <div className="h-full bg-[#181818] flex justify-center">
        {/* For overview, it will be overview | activity */}
        <div className="flex flex-col w-[80%] mt-5 gap-y-3">
          <h3 className="text-lg">Overview</h3>
          <hr />
        </div>
      </div>
    </div>
  );
}
