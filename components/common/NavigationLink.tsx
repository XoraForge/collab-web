"use client";

import { usePathname } from "next/navigation";
import Icon from "../ui/icon";
import Link from "next/link";

export default function NavigationLink({
  icon,
  href,
  title,
  className,
}: {
  icon: string;
  href: string;
  title: string;
  className?: string;
}) {
  const pathname = usePathname();
  const isSelected = pathname == href ? "text-white bg-[#383838]" : "";
  return (
    <Link
      className={`flex items-center gap-x-3 text-[#ffffff70] hover:text-white hover:bg-[#383838] p-2 rounded-sm ${isSelected} ${className}`}
      href={href}
    >
      <Icon icon={icon} />
      <p className="text-sm font-medium">{title}</p>
    </Link>
  );
}
