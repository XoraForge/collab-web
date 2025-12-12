import Icon from "../ui/icon";

export default function HelperIcon({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-x-0.5 group border p-0.5 overflow-hidden w-fit duration-300 ease-out rounded-md cursor-pointer">
      <div className="p-0.5 shrink-0">
        <Icon icon={icon} />
      </div>

      <p className="text-xs opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[200px] overflow-hidden transition-all duration-300 whitespace-nowrap">
        {title}
      </p>
    </div>
  );
}
