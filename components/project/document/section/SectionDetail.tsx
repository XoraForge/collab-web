import Icon from "@/components/ui/icon";

export default function SectionDetail({
  icon,
  title,
  children,
  className,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex justify-between text-xs items-center pb-2 text-[#00000095] dark:text-[#ffffff95] ${className}`}
    >
      <div className="flex gap-x-2 items-center">
        <Icon icon={icon} />
        <p className="font-medium">{title}</p>
      </div>
      {children}
    </div>
  );
}
