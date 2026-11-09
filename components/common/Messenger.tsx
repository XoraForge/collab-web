"use client";

import { useEffect, useState } from "react";
import Icon from "../ui/icon";
import { ChevronDown, ChevronLeft, ChevronUp, UserCircle2 } from "lucide-react";
import { useComingSoon } from "@/lib/ToastContext";
import ChatRoom from "./messenger/Chatroom";
import ChatList from "./messenger/ChatList";
import ChatWidget from "./messenger/ChatWidget";
import { OPEN_MESSENGER_EVENT } from "./HeaderActions";

const headerIcon = "rounded-md p-1 opacity-80 hover:opacity-100 hover:bg-border";

export default function Messenger() {
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [chatSelection, setChatSelection] = useState<string | undefined>();
  const [notificationCount] = useState(2);
  const comingSoon = useComingSoon();

  // The header's message icon opens the messenger.
  useEffect(() => {
    const open = () => setIsMessengerOpen(true);
    window.addEventListener(OPEN_MESSENGER_EVENT, open);
    return () => window.removeEventListener(OPEN_MESSENGER_EVENT, open);
  }, []);

  function toggle() {
    if (isMessengerOpen && chatSelection) return;
    setIsMessengerOpen((state) => !state);
  }

  return (
    <div className="fixed bottom-0 right-0 mr-2 w-[300px] rounded-t-2xl border z-40">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isMessengerOpen}
        aria-label={isMessengerOpen ? "Collapse messages" : "Open messages"}
        className="flex items-center justify-between gap-x-2 text-black dark:text-white bg-(--default-sidebar) border dark:border-0 py-3 px-4 rounded-t-2xl cursor-pointer relative"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {isMessengerOpen ? (
          chatSelection ? (
            <>
              <div className="flex items-center gap-x-3">
                <button
                  type="button"
                  aria-label="Back to chats"
                  className={headerIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatSelection(undefined);
                  }}
                >
                  <ChevronLeft size={15} />
                </button>
                <UserCircle2 />
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold">{chatSelection}</h1>
                  <p className="text-xs">3 online now</p>
                </div>
              </div>

              <div className="flex items-center gap-x-1">
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
                <UserCircle2 size={30} />
                <h1 className="font-semibold text-sm">
                  Chat Messages ({notificationCount})
                </h1>
              </div>
              <ChevronDown size={15} />
            </>
          )
        ) : (
          <>
            <div className="flex gap-x-2 items-center">
              <UserCircle2 size={30} />
              <h1 className="font-semibold text-sm">
                Chat Messages ({notificationCount})
              </h1>
            </div>

            <ChevronUp size={15} />
          </>
        )}
      </div>
      <div
        className={`overflow-hidden bg-background transition-all duration-300 ease-out flex flex-col justify-between ${
          isMessengerOpen
            ? "h-[500px] opacity-100 scale-y-100"
            : "h-0 opacity-0 scale-y-95"
        }`}
      >
        {chatSelection ? (
          <ChatRoom />
        ) : (
          <ChatList handleChatSelection={setChatSelection} />
        )}
        <ChatWidget />
      </div>
    </div>
  );
}
