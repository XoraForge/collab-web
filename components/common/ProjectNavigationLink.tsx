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
  const isActive = pathname.includes(href);

  return (
    <Link
      href={href}
      onClick={handleExpandedToggle}
      className={`
        flex items-center gap-x-2
        text-muted-text
        hover:text-black dark:hover:text-white
        hover:bg-hover
        duration-200 ease-in-out
        px-1 py-1 rounded-sm

        ${
          isExpanded &&
          "py-2.5 px-3.5 rounded-sm border border-divider text-xs cursor-pointer"
        }

        ${
          isActive &&
          "text-black dark:text-white bg-hover"
        }

        ${className}
      `}
    >
      <div
        className={`
          text-xs
          ${
            !isExpanded &&
            "py-1 px-2 rounded-sm border border-divider"
          }
        `}
      >
        {title[0]}
      </div>

      {!isExpanded && <p className="text-xs font-medium">{title}</p>}
    </Link>
  );
}
