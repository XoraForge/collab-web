import Image from "next/image";

export default function ActivityDetail() {
  return (
    <div className="flex gap-x-2">
      <div className="size-6 relative overflow-hidden ml-2.5">
        <Image src="/testimage.png" fill className="object-cover" alt="user" />
      </div>
      <p className="text-sm font-medium">Alex Hunter</p>
      <p className="text-sm">has initialized the project</p>
    </div>
  );
}
