"use client";

import Icon from "@/components/ui/icon";
import { useComingSoon } from "@/lib/ToastContext";
import { LucideCircle } from "lucide-react";

const button = "rounded-md p-1 opacity-80 hover:opacity-100 hover:bg-white/10";

/** Voice channel bar. Calls are planned with LiveKit (see docs/PLAN.md 10.4). */
export default function ChatWidget() {
  const comingSoon = useComingSoon();
  return (
    <div className="p-2 bg-(--default-sidebar) flex items-center justify-between text-white">
      <div className="flex gap-x-2 items-center">
        <LucideCircle size={30} />
        <div className="flex flex-col">
          <h1 className="font-semibold text-sm">TeamCollab</h1>
          <p className="text-xs font-medium">05:43</p>
        </div>
      </div>

      <div className="flex items-center gap-x-1 text-lg">
        <button type="button" aria-label="Mute microphone" title="Microphone" className={button} onClick={() => comingSoon("Voice calls")}>
          <Icon icon="mingcute:voice-fill" />
        </button>
        <button type="button" aria-label="Deafen" title="Headphones" className={button} onClick={() => comingSoon("Voice calls")}>
          <Icon icon="tdesign:earphone-filled" />
        </button>
        <button type="button" aria-label="Call settings" title="Settings" className={button} onClick={() => comingSoon("Call settings")}>
          <Icon icon="material-symbols:settings" />
        </button>
      </div>
    </div>
  );
}
