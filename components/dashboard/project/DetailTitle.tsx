import Icon from "@/components/ui/icon";

export default function DetailTitle({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="flex gap-x-2 items-center">
      <Icon icon={icon} />
      <p className="font-medium">{title}</p>
    </div>
  );
}
