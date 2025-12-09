import { ChevronDown } from "lucide-react";
import Image from "next/image";

export default function User() {
  return (
    <div className="border p-2 flex items-center justify-between rounded-full w-[150px]">
      <div className="flex gap-x-2 items-center">
        <div className="size-6 relative overflow-hidden">
          <Image
            src="/testimage.png"
            fill
            className="object-cover"
            alt="user"
          />
        </div>
        <p className="text-sm">Alex Hunter</p>
      </div>
      <div className="flex items-center gap-x-1">
        <div className="size-1.5 rounded-full bg-green-500"></div>
        <ChevronDown size={10} />
      </div>
    </div>
  );
}
