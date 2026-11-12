"use client";

import {
  ConnectionState,
  DisconnectReason,
  Participant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
  VideoTrack,
} from "livekit-client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getCallToken, listActiveCalls } from "./api/Call";
import { ApiError } from "./api/client";
import { useSession } from "./SessionContext";
import { useToast } from "./ToastContext";
import { useUserEvent } from "./UserEventsContext";

/** One person in the call, as the UI shows them. */
export type CallMember = {
  identity: string;
  name: string;
  imageUrl?: string;
  isLocal: boolean;
  isSpeaking: boolean;
  micOn: boolean;
  camera?: VideoTrack;
  screen?: VideoTrack;
};

export type CallStatus = "idle" | "connecting" | "connected" | "reconnecting";

type CallContextType = {
  status: CallStatus;
  /** The project whose call I'm in (or joining). */
  projectId: string | null;
  projectName: string | null;
  /** When I joined, for the timer. */
  joinedAt: number | null;
  members: CallMember[];
  micOn: boolean;
  deafened: boolean;
  cameraOn: boolean;
  screenOn: boolean;
  /** Calls going on in my projects: projectId → number of people. */
  activeCalls: Record<string, number>;
  join: (projectId: string, options?: { camera?: boolean }) => Promise<void>;
  leave: () => void;
  toggleMic: () => void;
  toggleDeafen: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
};

const CallContext = createContext<CallContextType | null>(null);

export function useCall() {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within a CallProvider");
  return context;
}

function imageFromMetadata(metadata?: string) {
  if (!metadata) return undefined;
  try {
    const url = (JSON.parse(metadata) as { imageUrl?: string }).imageUrl;
    return url || undefined;
  } catch {
    return undefined;
  }
}

function toMember(p: Participant, isLocal: boolean): CallMember {
  const camera = p.getTrackPublication(Track.Source.Camera);
  const screen = p.getTrackPublication(Track.Source.ScreenShare);
  return {
    identity: p.identity,
    name: p.name || "Someone",
    imageUrl: imageFromMetadata(p.metadata),
    isLocal,
    isSpeaking: p.isSpeaking,
    micOn: p.isMicrophoneEnabled,
    camera: camera && !camera.isMuted ? (camera.videoTrack as VideoTrack | undefined) : undefined,
    screen: screen && !screen.isMuted ? (screen.videoTrack as VideoTrack | undefined) : undefined,
  };
}

/** Is this an error from the person cancelling a browser prompt (e.g. the screen picker)? */
function isCancelled(err: unknown) {
  return err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "AbortError");
}

/**
 * The project call I'm in. Lives in the dashboard layout, so the call carries on
 * while I move between pages and edit documents. One call at a time.
 */
export default function CallProvider({ children }: { children: React.ReactNode }) {
  const { projects } = useSession();
  const toast = useToast();
  const roomRef = useRef<Room | null>(null);
  const deafenedRef = useRef(false);
  const micBeforeDeafen = useRef(true);

  const [status, setStatus] = useState<CallStatus>("idle");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const [members, setMembers] = useState<CallMember[]>([]);
  const [deafened, setDeafened] = useState(false);
  const [activeCalls, setActiveCalls] = useState<Record<string, number>>({});

  const me = members.find((m) => m.isLocal);
  const projectName = projects.find((p) => p.id === projectId)?.name ?? null;

  /** Rebuild what the UI shows from the room. */
  const sync = useCallback(() => {
    const room = roomRef.current;
    if (!room) return setMembers([]);
    setMembers([
      toMember(room.localParticipant, true),
      ...Array.from(room.remoteParticipants.values()).map((p) => toMember(p, false)),
    ]);
  }, []);

  /** Mute or unmute everyone else's audio on this device. */
  const applyDeafen = useCallback((room: Room, value: boolean) => {
    room.remoteParticipants.forEach((p) =>
      p.audioTrackPublications.forEach((pub) => pub.track?.attachedElements.forEach((el) => (el.muted = value)))
    );
  }, []);

  const refreshActiveCalls = useCallback(() => {
    listActiveCalls()
      .then((list) => setActiveCalls(Object.fromEntries(list.map((c) => [c.projectId, c.participantCount]))))
      .catch(() => undefined);
  }, []);

  const reset = useCallback(() => {
    roomRef.current = null;
    deafenedRef.current = false;
    setStatus("idle");
    setProjectId(null);
    setJoinedAt(null);
    setMembers([]);
    setDeafened(false);
  }, []);

  const leave = useCallback(() => {
    const room = roomRef.current;
    reset();
    room?.disconnect();
    refreshActiveCalls();
  }, [reset, refreshActiveCalls]);

  const join = useCallback<CallContextType["join"]>(
    async (targetId, options) => {
      const current = roomRef.current;
      if (current && projectId === targetId) {
        // Already here: "video call" just turns the camera on.
        if (options?.camera && !current.localParticipant.isCameraEnabled) {
          await current.localParticipant.setCameraEnabled(true).catch(() => toast("Couldn't turn on your camera."));
          sync();
        }
        return;
      }
      if (current) leave();

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      roomRef.current = room;
      setProjectId(targetId);
      setStatus("connecting");

      const audioBox = document.getElementById("call-audio") ?? document.body;
      room
        .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach();
            el.muted = deafenedRef.current;
            audioBox.appendChild(el);
          }
          sync();
        })
        .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          track.detach().forEach((el) => el.remove());
          sync();
        })
        .on(RoomEvent.ParticipantConnected, sync)
        .on(RoomEvent.ParticipantDisconnected, sync)
        .on(RoomEvent.ParticipantNameChanged, sync)
        .on(RoomEvent.ActiveSpeakersChanged, sync)
        .on(RoomEvent.TrackMuted, sync)
        .on(RoomEvent.TrackUnmuted, sync)
        .on(RoomEvent.TrackPublished, sync)
        .on(RoomEvent.TrackUnpublished, sync)
        .on(RoomEvent.LocalTrackPublished, sync)
        .on(RoomEvent.LocalTrackUnpublished, sync)
        .on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
          if (roomRef.current !== room) return;
          if (state === ConnectionState.Reconnecting || state === ConnectionState.SignalReconnecting) {
            setStatus("reconnecting");
          } else if (state === ConnectionState.Connected) {
            setStatus("connected");
          }
        })
        .on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
          if (roomRef.current !== room) return; // we left on purpose
          reset();
          refreshActiveCalls();
          toast(reason === DisconnectReason.DUPLICATE_IDENTITY ? "You joined this call somewhere else." : "You were disconnected from the call.");
        });

      try {
        const { url, token } = await getCallToken(targetId);
        if (roomRef.current !== room) return; // left while waiting
        await room.connect(url, token);
        if (roomRef.current !== room) {
          void room.disconnect();
          return;
        }
        setJoinedAt(Date.now());
        setStatus("connected");
        await room.startAudio().catch(() => undefined);
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
        } catch {
          toast("Microphone is blocked, so you joined muted. Allow it in your browser to talk.");
        }
        if (options?.camera) {
          await room.localParticipant.setCameraEnabled(true).catch(() => toast("Couldn't turn on your camera."));
        }
        sync();
      } catch (err) {
        if (roomRef.current !== room) return;
        reset();
        room.disconnect();
        toast(err instanceof ApiError ? err.message : "Couldn't connect to the call. Please try again.");
      }
    },
    [projectId, leave, reset, refreshActiveCalls, sync, toast]
  );

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const turnOn = !room.localParticipant.isMicrophoneEnabled;
    if (turnOn && deafenedRef.current) {
      // Talking again means hearing again.
      deafenedRef.current = false;
      setDeafened(false);
      applyDeafen(room, false);
    }
    room.localParticipant
      .setMicrophoneEnabled(turnOn)
      .catch(() => toast("Microphone is blocked. Allow it in your browser to talk."))
      .finally(sync);
  }, [applyDeafen, sync, toast]);

  const toggleDeafen = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const value = !deafenedRef.current;
    deafenedRef.current = value;
    setDeafened(value);
    applyDeafen(room, value);
    // Deafening also mutes me; undeafening puts my mic back how it was.
    if (value) {
      micBeforeDeafen.current = room.localParticipant.isMicrophoneEnabled;
      room.localParticipant.setMicrophoneEnabled(false).finally(sync);
    } else if (micBeforeDeafen.current) {
      room.localParticipant.setMicrophoneEnabled(true).catch(() => undefined).finally(sync);
    }
  }, [applyDeafen, sync]);

  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    room.localParticipant
      .setCameraEnabled(!room.localParticipant.isCameraEnabled)
      .catch(() => toast("Couldn't turn on your camera. Check that your browser is allowed to use it."))
      .finally(sync);
  }, [sync, toast]);

  const toggleScreenShare = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const turnOn = !room.localParticipant.isScreenShareEnabled;
    if (turnOn && !navigator.mediaDevices?.getDisplayMedia) {
      toast("Screen sharing isn't supported in this browser.");
      return;
    }
    room.localParticipant
      .setScreenShareEnabled(turnOn, { audio: true })
      .catch((err) => !isCancelled(err) && toast("Couldn't share your screen."))
      .finally(sync);
  }, [sync, toast]);

  // Calls going on in my projects: on load, on focus, and whenever one changes.
  useEffect(() => {
    refreshActiveCalls();
    window.addEventListener("focus", refreshActiveCalls);
    return () => window.removeEventListener("focus", refreshActiveCalls);
  }, [refreshActiveCalls]);
  useUserEvent("CALL", (event) => {
    const { projectId: changed, participantCount } = event;
    if (!changed || participantCount === undefined) return refreshActiveCalls();
    setActiveCalls((calls) => {
      const next = { ...calls };
      if (participantCount > 0) next[changed] = participantCount;
      else delete next[changed];
      return next;
    });
  });

  // Someone started a call in one of my projects.
  useUserEvent("CALL_STARTED", (event) => {
    refreshActiveCalls();
    if (!event.projectId || event.projectId === projectId) return;
    const target = event.projectId;
    toast(`${event.startedBy?.name || "Someone"} started a call in ${event.projectName ?? "a project"}.`, {
      action: { label: "Join", onClick: () => void join(target) },
    });
  });

  // Leaving the page ends the call cleanly.
  useEffect(
    () => () => {
      void roomRef.current?.disconnect();
    },
    []
  );

  const value = useMemo<CallContextType>(
    () => ({
      status,
      projectId,
      projectName,
      joinedAt,
      members,
      micOn: me?.micOn ?? false,
      deafened,
      cameraOn: !!me?.camera,
      screenOn: !!me?.screen,
      activeCalls,
      join,
      leave,
      toggleMic,
      toggleDeafen,
      toggleCamera,
      toggleScreenShare,
    }),
    [status, projectId, projectName, joinedAt, members, me, deafened, activeCalls, join, leave, toggleMic, toggleDeafen, toggleCamera, toggleScreenShare]
  );

  return (
    <CallContext.Provider value={value}>
      {children}
      {/* Other people's voices play from here. */}
      <div id="call-audio" hidden />
    </CallContext.Provider>
  );
}
