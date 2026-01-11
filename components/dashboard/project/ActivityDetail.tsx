import Image from "next/image";

export default function ActivityDetail({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm leading-normal">
      <span className="inline-block size-6 relative overflow-hidden align-middle mr-2">
        <Image src="/testimage.png" fill className="object-cover" alt="user" />
      </span>

      <span className="font-medium">Alex Hunter </span>
      {children}
    </p>
  );
}
