import Image from "next/image";
import Link from "next/link";

export default function Logo({ noText = false }: { noText?: boolean }) {
  return (
    <Link
      className={`flex gap-x-2 items-center ${noText && "justify-center"}`}
      href="/dashboard"
    >
      <div className="size-6 relative">
        <Image src="/logo.png" alt="logo" fill className="object-contain" />
      </div>
      {!noText && <h1 className="font-semibold">Collab</h1>}
    </Link>
  );
}
