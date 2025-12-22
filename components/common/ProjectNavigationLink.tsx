import Link from "next/link";

export default function ProjectNavigationLink({
  href,
  title,
  className,
  isExpanded = false,
}: {
  href: string;
  title: string;
  className?: string;
  isExpanded?: boolean;
}) {
  return (
    <Link
      className={`flex items-center gap-x-2 text-[#ffffff70] hover:text-white hover:bg-[#383838] duration-200 ease-in-out px-1 py-1 rounded-sm ${
        isExpanded && "py-2.5 px-3.5 rounded-sm border text-xs cursor-pointer"
      } ${className}`}
      href={href}
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
