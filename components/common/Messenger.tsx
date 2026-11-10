"use client";

import ChannelList from "@/components/chat/ChannelList";
import ChatRoom from "@/components/chat/ChatRoom";
import { useChatChannels } from "@/components/chat/useChatChannels";
import { useSession } from "@/lib/SessionContext";
import { useComingSoon } from "@/lib/ToastContext";
import { BookOpenText, ChevronDown, ChevronLeft, ChevronUp, Maximize2, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "../ui/icon";
import { OPEN_MESSENGER_EVENT } from "./HeaderActions";
import ChatWidget from "./messenger/ChatWidget";

const headerIcon = "rounded-md p-1 opacity-80 hover:opacity-100 hover:bg-border";

/** Detail of OPEN_MESSENGER_EVENT: open a specific project's chat. */
export type OpenMessengerDetail = { projectId?: string };

export default function Messenger() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wantedProject, setWantedProject] = useState<string | null>(null);
  const { channels, error, refresh, totalUnread } = useChatChannels();
  const { projects } = useSession();
  const comingSoon = useComingSoon();
  const pathname = usePathname();
  // An "Open chat" request picks that project's room once the list knows about it.
  const selected =
    channels?.find((c) => c.id === selectedId) ??
    (wantedProject ? channels?.find((c) => c.projectId === wantedProject) : undefined) ??
    null;
  const memberCount = selected ? projects.find((p) => p.id === selected.projectId)?.memberCount : undefined;

  // The header's message icon (and "Open chat" buttons) open the messenger.
  useEffect(() => {
    const open = (e: Event) => {
      setIsOpen(true);
      const projectId = (e as CustomEvent<OpenMessengerDetail | undefined>).detail?.projectId;
      if (projectId) {
        setSelectedId(null);
        setWantedProject(projectId);
        refresh(); // a brand-new project's room may not be in the list yet
      }
    };
    window.addEventListener(OPEN_MESSENGER_EVENT, open);
    return () => window.removeEventListener(OPEN_MESSENGER_EVENT, open);
  }, [refresh]);

  // The full chat page already shows chats.
  if (pathname?.startsWith("/dashboard/chat")) return null;

  function toggle() {
    if (isOpen && selected) return;
    setIsOpen((state) => !state);
  }

  return (
    <div className="fixed bottom-0 right-0 mr-2 w-[min(340px,calc(100vw-1rem))] rounded-t-2xl border z-40 bg-background">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Collapse chat" : totalUnread ? `Expand chat, ${totalUnread} unread` : "Expand chat"}
        className="flex items-center justify-between gap-x-2 text-black dark:text-white bg-(--default-sidebar) border dark:border-0 py-3 px-4 rounded-t-2xl cursor-pointer relative"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {isOpen && selected ? (
          <>
            <div className="flex items-center gap-x-3 min-w-0">
              <button
                type="button"
                aria-label="Back to chats"
                className={headerIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(null);
                  setWantedProject(null);
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <span className="size-8 shrink-0 rounded-full border border-border overflow-hidden flex items-center justify-center">
                {selected.projectImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded image served by the API
                  <img src={selected.projectImageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <BookOpenText size={14} />
                )}
              </span>
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm font-semibold truncate">{selected.projectName}</h1>
                {memberCount !== undefined && (
                  <p className="text-xs opacity-70">
                    {memberCount} {memberCount === 1 ? "member" : "members"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-x-1 shrink-0">
              <Link
                href={`/dashboard/chat?channel=${selected.id}`}
                aria-label="Open in full page"
                title="Open in full page"
                className={headerIcon}
                onClick={(e) => e.stopPropagation()}
              >
                <Maximize2 size={14} />
              </Link>
              <button
                type="button"
                aria-label="Start video call"
                title="Video call"
                className={headerIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  comingSoon("Video calls");
                }}
              >
                <Icon icon="material-symbols:video-call" />
              </button>
              <button
                type="button"
                aria-label="Start voice call"
                title="Voice call"
                className={headerIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  comingSoon("Voice calls");
                }}
              >
                <Icon icon="mingcute:phone-call-fill" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-x-2 items-center">
              <MessagesSquare size={22} />
              <h1 className="font-semibold text-sm">
                Chat Messages
                {totalUnread > 0 && (
                  <span className="ml-2 inline-block min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] leading-5 text-center align-middle">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </h1>
            </div>
            {isOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </>
        )}
      </div>
      <div
        className={`overflow-hidden bg-background transition-all duration-300 ease-out flex flex-col justify-between ${
          isOpen ? "h-[min(500px,70vh)] opacity-100 scale-y-100" : "h-0 opacity-0 scale-y-95"
        }`}
      >
        {isOpen &&
          (selected ? (
            <ChatRoom channel={selected} onRead={refresh} />
          ) : (
            <div className="flex flex-col min-h-0 h-full">
              <div className="grow min-h-0 overflow-y-auto small-scrollbar">
                <ChannelList channels={channels} error={error} onSelect={(c) => {
                    setWantedProject(null);
                    setSelectedId(c.id);
                  }} />
              </div>
              <Link href="/dashboard/chat" className="border-t px-3 py-2 text-xs text-muted-text hover:text-text hover:bg-hover">
                Open all chats
              </Link>
            </div>
          ))}
        <ChatWidget />
      </div>
    </div>
  );
}
