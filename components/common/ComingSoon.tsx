import Icon from "../ui/icon";

/** Placeholder for screens that aren't built yet. */
export default function ComingSoon({
  title,
  description = "This page is still being built. Check back soon.",
  icon = "material-symbols:construction-rounded",
}: {
  title: string;
  description?: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-y-3 p-8 text-center text-text">
      <div className="size-14 border border-border rounded-md flex items-center justify-center">
        <Icon icon={icon} fontSize={26} />
      </div>
      <div className="flex flex-col gap-y-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-text max-w-sm">{description}</p>
      </div>
    </div>
  );
}
