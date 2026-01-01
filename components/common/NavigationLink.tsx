"use client";

import { usePathname } from "next/navigation";
import Icon from "../ui/icon";
import Link from "next/link";

export default function NavigationLink({
  icon,
  href,
  title,
  className,
  isExpanded = false,
  handleExpandedToggle,
}: {
  icon: string;
  href: string;
  title: string;
  className?: string;
  isExpanded?: boolean;
  handleExpandedToggle: () => void;
}) {
  const pathname = usePathname();

  const isSelected =
    pathname === href ? "text-white bg-neutral-700 dark:bg-neutral-800" : "";

  return (
    <Link
      href={href}
      onClick={handleExpandedToggle}
      className={`flex items-center gap-x-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 duration-200 ease-in-out p-2 rounded-sm ${isSelected} ${className}`}
    >
      <Icon icon={icon} className={isExpanded ? "size-5" : "size-4"} />
      {!isExpanded && <p className="text-sm font-medium">{title}</p>}
    </Link>
  );
}
