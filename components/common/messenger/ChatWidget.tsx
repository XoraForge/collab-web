import Icon from "@/components/ui/icon";
import { LucideCircle } from "lucide-react";

export default function ChatWidget() {
  return (
    <div className="p-2 bg-(--default-sidebar) flex items-center justify-between text-white">
      <div className="flex gap-x-2 items-center">
        <LucideCircle size={30} />
        <div className="flex flex-col">
          <h1 className="font-semibold text-sm">TeamCollab</h1>
          <p className="text-xs font-medium">05:43</p>
        </div>
      </div>

      <div className="flex items-center gap-x-2 text-lg">
        <Icon icon="mingcute:voice-fill" />
        <Icon icon="tdesign:earphone-filled" />
        <Icon icon="material-symbols:settings" />
      </div>
    </div>
  );
}
