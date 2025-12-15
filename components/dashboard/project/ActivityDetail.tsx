import Image from "next/image";

export default function ActivityDetail({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2">
        <div className="size-6 relative overflow-hidden inline-block">
          <Image
            src="/testimage.png"
            fill
            className="object-cover"
            alt="user"
          />
        </div>
        <p className="text-sm font-medium">Alex Hunter</p>
      </div>
      <p className="text-sm">{children}</p>
    </div>
  );
}
