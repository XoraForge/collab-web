import {
  LockKeyholeIcon,
  LockKeyholeOpen,
  LucideChevronRight,
  Rows3Icon,
} from "lucide-react";

export default function Section({
  isLocked,
  title,
}: {
  isLocked: boolean;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between border p-2">
      <div className="flex items-center gap-x-3">
        {isLocked ? (
          <LockKeyholeIcon className="size-3 text-red-400" />
        ) : (
          <LockKeyholeOpen className="size-3 text-green-400" />
        )}
        <p className="text-xs font-medium">{title}</p>
      </div>
      <div className="flex items-center gap-x-3">
        <Rows3Icon className="size-3 cursor-grab" />
        <LucideChevronRight className="size-3" />
      </div>
    </div>
  );
}
