import { BookOpenText, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Icon from "../ui/icon";
import { Input } from "../ui/input";
import User from "./User";

export default function Header() {
  return (
    <div className="bg-[#353535] size-full h-[60px] w-full flex items-center justify-between px-6">
      <div className="w-full flex items-center gap-x-4">
        {/* Navigation */}
        <div className="flex gap-x-3 pr-5 border-r border-white">
          <ChevronLeft />
          <ChevronRight className="text-gray-600" />
        </div>
        {/* Tabs */}
        <div className="w-full flex gap-x-1">
          <div className="flex gap-x-5 items-center bg-[#161616] w-fit px-3 py-2 rounded-tl-lg rounded-br-lg">
            <div className="flex gap-x-2 items-center">
              <div className="p-1 border rounded-xs border-white">
                <BookOpenText size={15} />
              </div>
              <p className="text-xs font-medium">Business Analysis</p>
            </div>

            <X size={15} />
          </div>
          <div className="flex gap-x-5 items-center bg-[#1d1d1d] w-fit px-3 py-2 rounded-tl-lg rounded-br-lg">
            <div className="flex gap-x-2 items-center">
              <div className="p-1 border rounded-xs border-white">
                <BookOpenText size={15} />
              </div>
              <p className="text-xs font-medium">Artificial Intelligence</p>
            </div>

            <X size={15} />
          </div>
          <div className="flex items-center w-fit p-2">
            <Plus size={15} />
          </div>
        </div>
      </div>

      <div className="flex gap-x-5 items-center">
        <Icon icon="nrk:latest-news" fontSize={22} />
        <Icon icon="lets-icons:message-alt-fill" fontSize={20} />
        <Icon icon="ion:notifcations" fontSize={17} />
        <User />
      </div>
    </div>
  );
}
