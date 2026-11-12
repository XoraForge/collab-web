"use client";

import Avatar from "@/components/common/Avatar";
import { useCall } from "@/lib/CallContext";
import { cn } from "@/lib/utils";
import {
  Headphones,
  HeadphoneOff,
  Mic,
  MicOff,
  MonitorUp,
  PanelTopClose,
  PanelTopOpen,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useState } from "react";

function elapsed(since: number, now: number) {
  const total = Math.max(0, Math.floor((now - since) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

function Timer({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{elapsed(since, now)}</span>;
}

const control =
  "inline-flex size-8 items-center justify-center rounded-md text-text/80 hover:text-text hover:bg-hover transition-colors disabled:opacity-40";
const off = "text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400";
const on = "bg-hover text-text";

/**
 * The persistent call bar: which call I'm in, for how long, who's talking,
 * and my controls. Shown at the bottom of the messenger whenever I'm in a call.
 */
export default function CallBar({
  showStage,
  onToggleStage,
}: {
  showStage: boolean;
  onToggleStage: () => void;
}) {
  const call = useCall();
  if (call.status === "idle") return null;

  const connecting = call.status === "connecting";
  const shown = call.members.slice(0, 5);
  const more = call.members.length - shown.length;

  return (
    <div className="border-t bg-(--default-sidebar) text-text px-3 py-2 flex flex-col gap-y-2" role="region" aria-label="Call">
      <div className="flex items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-2 min-w-0">
          <span
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              call.status === "connected" ? "bg-green-500" : "bg-amber-500 animate-pulse"
            )}
            aria-hidden
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              {connecting ? "Connecting…" : call.status === "reconnecting" ? "Reconnecting…" : "Voice connected"}
            </span>
            <span className="text-xs text-muted-text truncate">
              {call.projectName ?? "Project call"}
              {call.joinedAt && (
                <>
                  {" · "}
                  <Timer since={call.joinedAt} />
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center -space-x-1.5 shrink-0" aria-label={`${call.members.length} in call`}>
          {shown.map((m) => (
            <span
              key={m.identity}
              className={cn(
                "rounded-full ring-2 transition-shadow",
                m.isSpeaking && m.micOn ? "ring-green-500" : "ring-(--default-sidebar)"
              )}
              title={`${m.isLocal ? `${m.name} (you)` : m.name}${m.micOn ? "" : ", muted"}`}
            >
              <Avatar src={m.imageUrl} name={m.name} size={24} />
            </span>
          ))}
          {more > 0 && (
            <span className="relative inline-flex size-6 items-center justify-center rounded-full bg-border text-[10px] font-semibold ring-2 ring-(--default-sidebar)">
              +{more}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          <button
            type="button"
            className={cn(control, !call.micOn && off)}
            aria-pressed={!call.micOn}
            aria-label={call.micOn ? "Mute microphone" : "Unmute microphone"}
            title={call.micOn ? "Mute" : "Unmute"}
            disabled={connecting}
            onClick={call.toggleMic}
          >
            {call.micOn ? <Mic size={17} /> : <MicOff size={17} />}
          </button>
          <button
            type="button"
            className={cn(control, call.deafened && off)}
            aria-pressed={call.deafened}
            aria-label={call.deafened ? "Undeafen" : "Deafen"}
            title={call.deafened ? "Undeafen" : "Deafen (mute everyone for you)"}
            disabled={connecting}
            onClick={call.toggleDeafen}
          >
            {call.deafened ? <HeadphoneOff size={17} /> : <Headphones size={17} />}
          </button>
          <button
            type="button"
            className={cn(control, call.cameraOn && on)}
            aria-pressed={call.cameraOn}
            aria-label={call.cameraOn ? "Turn off camera" : "Turn on camera"}
            title={call.cameraOn ? "Turn off camera" : "Turn on camera"}
            disabled={connecting}
            onClick={call.toggleCamera}
          >
            {call.cameraOn ? <Video size={17} /> : <VideoOff size={17} />}
          </button>
          <button
            type="button"
            className={cn(control, call.screenOn && "bg-green-600/15 text-green-700 hover:text-green-700 dark:text-green-400")}
            aria-pressed={call.screenOn}
            aria-label={call.screenOn ? "Stop sharing your screen" : "Share your screen"}
            title={call.screenOn ? "Stop sharing" : "Share screen"}
            disabled={connecting}
            onClick={call.toggleScreenShare}
          >
            <MonitorUp size={17} />
          </button>
          <button
            type="button"
            className={cn(control, showStage && on)}
            aria-pressed={showStage}
            aria-label={showStage ? "Hide call video" : "Show call video"}
            title={showStage ? "Hide video" : "Show video"}
            onClick={onToggleStage}
          >
            {showStage ? <PanelTopClose size={17} /> : <PanelTopOpen size={17} />}
          </button>
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-x-1.5 rounded-md bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          aria-label="Leave call"
          title="Leave call"
          onClick={call.leave}
        >
          <PhoneOff size={15} />
          Leave
        </button>
      </div>
    </div>
  );
}
