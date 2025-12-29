"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectNavigationLink({
  href,
  title,
  className,
  isExpanded = false,
  handleExpandedToggle,
}: {
  href: string;
  title: string;
  className?: string;
  isExpanded?: boolean;
  handleExpandedToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <Link
      className={`flex items-center gap-x-2 text-[#ffffff70] hover:text-white hover:bg-[#383838] duration-200 ease-in-out px-1 py-1 rounded-sm ${
        isExpanded && "py-2.5 px-3.5 rounded-sm border text-xs cursor-pointer"
      } ${pathname.includes(href) && "text-white bg-[#383838]"} ${className}`}
      href={href}
      onClick={handleExpandedToggle}
    >
      <div
        className={` text-xs ${!isExpanded && "py-1 px-2 rounded-sm border"}`}
      >
        {title[0]}
      </div>
      {!isExpanded && <p className="text-xs font-medium">{title}</p>}
    </Link>
  );
}
