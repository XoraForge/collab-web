import SideNav from "@/components/common/SideNav";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <div className="flex h-screen">
      {/* Side Navigation */}
      <SideNav />
      <div className="flex flex-col size-full">
        {/* Header */}
        <div className="bg-[#353535] size-full h-[65px] w-full flex items-center justify-between px-6">
          <div className="w-[300px]">
            <Input placeholder="Search Anything..." className="text-white" />
          </div>

          <div className="flex gap-x-5 items-center">
            <Icon icon="nrk:latest-news" fontSize={22} />
            <Icon icon="lets-icons:message-alt-fill" fontSize={20} />
            <Icon icon="ion:notifcations" fontSize={17} />
            <div className="ml-4">
              <div className="border rounded-md px-3 py-1">Join Voicecall</div>
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="size-full flex flex-col">
          {/* Options (Create / Join Existing) */}
          <div className="flex gap-x-2"></div>
          {/* Deadlines */}
          {/* Projects */}
        </div>
      </div>
    </div>
  );
}
