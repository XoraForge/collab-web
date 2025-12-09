import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link className="flex gap-x-2 items-center" href="/dashboard">
      <div className="size-6 relative">
        <Image src="/logo.png" alt="logo" fill className="object-contain" />
      </div>
      <h1 className="font-semibold">Collab</h1>
    </Link>
  );
}
