import Link from "next/link";

export default function ProjectNavigationLink({
  href,
  title,
  className,
}: {
  href: string;
  title: string;
  className?: string;
}) {
  return (
    <Link
      className={`flex items-center gap-x-2 text-[#ffffff70] hover:text-white hover:bg-[#383838] duration-200 ease-in-out px-1 py-1 rounded-sm ${className}`}
      href={href}
    >
      <div className="py-1 px-2 rounded-sm border text-xs">{title[0]}</div>
      <p className="text-xs font-medium">{title}</p>
    </Link>
  );
}
