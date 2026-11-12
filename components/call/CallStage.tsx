"use client";

import Avatar from "@/components/common/Avatar";
import { CallMember, useCall } from "@/lib/CallContext";
import { cn } from "@/lib/utils";
import type { VideoTrack } from "livekit-client";
import { Maximize2, MicOff, Minimize2, MonitorUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function TrackView({ track, mirror, contain }: { track: VideoTrack; mirror?: boolean; contain?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className={cn("absolute inset-0 size-full", contain ? "object-contain" : "object-cover", mirror && "-scale-x-100")}
    />
  );
}

type Tile = { key: string; member: CallMember; track?: VideoTrack; isScreen: boolean };

function TileView({ tile, large }: { tile: Tile; large: boolean }) {
  const { member, track, isScreen } = tile;
  const label = isScreen ? `${member.isLocal ? "Your" : `${member.name}'s`} screen` : member.isLocal ? `${member.name} (you)` : member.name;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-neutral-800 aspect-video ring-2 transition-shadow",
        !isScreen && member.isSpeaking && member.micOn ? "ring-green-500" : "ring-transparent"
      )}
    >
      {track ? (
        <TrackView track={track} mirror={member.isLocal && !isScreen} contain={isScreen} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar src={member.imageUrl} name={member.name} size={large ? 72 : 40} className="text-sm" />
        </div>
      )}
      <span className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-x-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
        {isScreen && <MonitorUp size={11} className="shrink-0" />}
        {!isScreen && !member.micOn && <MicOff size={11} className="shrink-0 text-red-400" aria-label="Muted" />}
        <span className="truncate">{label}</span>
      </span>
    </div>
  );
}

/**
 * Video for the call: cameras, shared screens, and an avatar for anyone without video.
 * Compact above the messenger, or expanded to fill the screen.
 */
export default function CallStage({ onHide }: { onHide: () => void }) {
  const { members, status } = useCall();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  if (status === "idle") return null;

  // Shared screens first, then people.
  const tiles: Tile[] = [
    ...members.filter((m) => m.screen).map((m) => ({ key: `${m.identity}:screen`, member: m, track: m.screen, isScreen: true })),
    ...members.map((m) => ({ key: m.identity, member: m, track: m.camera, isScreen: false })),
  ];

  const toolbar = (
    <div className="flex items-center justify-between px-1">
      <span className="text-xs font-medium text-white/80">
        {members.length} in call
      </span>
      <div className="flex items-center gap-x-1">
        <button
          type="button"
          className="rounded-md p-1 text-white/80 hover:text-white hover:bg-white/10"
          aria-label={expanded ? "Exit full screen" : "Full screen"}
          title={expanded ? "Exit full screen (Esc)" : "Full screen"}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        {!expanded && (
          <button
            type="button"
            className="rounded-md px-1.5 py-0.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
            onClick={onHide}
          >
            Hide
          </button>
        )}
      </div>
    </div>
  );

  if (expanded) {
    const [first, ...rest] = tiles;
    const focus = first?.isScreen ? first : null;
    const grid = focus ? rest : tiles;
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-y-3 bg-neutral-950/95 p-4" role="dialog" aria-modal="true" aria-label="Call video">
        {toolbar}
        {focus ? (
          <div className="flex min-h-0 grow flex-col gap-3 lg:flex-row">
            <div className="min-h-0 grow flex items-center justify-center">
              <div className="w-full max-h-full">
                <TileView tile={focus} large />
              </div>
            </div>
            <div className="flex shrink-0 gap-3 overflow-auto lg:w-64 lg:flex-col">
              {grid.map((t) => (
                <div key={t.key} className="w-48 shrink-0 lg:w-full">
                  <TileView tile={t} large={false} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="grid min-h-0 grow content-center gap-3 overflow-auto"
            style={{ gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(grid.length)), 4)}, minmax(0, 1fr))` }}
          >
            {grid.map((t) => (
              <TileView key={t.key} tile={t} large />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2 bg-neutral-900 p-2 rounded-t-2xl">
      {toolbar}
      <div className="grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto small-scrollbar">
        {tiles.map((t) => (
          <div key={t.key} className={cn(t.isScreen && "col-span-2")}>
            <TileView tile={t} large={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
