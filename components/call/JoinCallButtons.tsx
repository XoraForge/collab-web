"use client";

import { useCall } from "@/lib/CallContext";
import { cn } from "@/lib/utils";
import { Phone, Video } from "lucide-react";

/** Voice and video call buttons for a project (start, join, or "you're in it"). */
export default function JoinCallButtons({ projectId, className }: { projectId: string; className?: string }) {
  const call = useCall();
  const inThisCall = call.status !== "idle" && call.projectId === projectId;
  const count = call.activeCalls[projectId] ?? 0;
  const live = inThisCall || count > 0;
  const button = "inline-flex items-center gap-x-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-hover transition-colors";

  return (
    <div className={cn("flex items-center gap-x-2", className)}>
      {count > 0 && !inThisCall && (
        <span className="text-xs font-medium text-green-700 dark:text-green-400">{count} in call</span>
      )}
      <button
        type="button"
        className={cn(button, live && "border-green-600/40 text-green-700 dark:text-green-400", "disabled:opacity-60 disabled:hover:bg-transparent")}
        disabled={inThisCall}
        onClick={() => void call.join(projectId)}
      >
        <Phone size={14} />
        {inThisCall ? "In call" : count > 0 ? "Join call" : "Call"}
      </button>
      <button
        type="button"
        className={button}
        aria-label={inThisCall ? "Turn on camera" : "Video call"}
        title={inThisCall ? "Turn on camera" : count > 0 ? "Join with video" : "Video call"}
        onClick={() => void call.join(projectId, { camera: true })}
      >
        <Video size={14} />
      </button>
    </div>
  );
}
