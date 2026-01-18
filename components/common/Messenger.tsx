"use client";

import { useState } from "react";
import Icon from "../ui/icon";
import { ChevronDown, ChevronLeft, ChevronUp, UserCircle2 } from "lucide-react";
import ChatRoom from "./messenger/Chatroom";
import ChatList from "./messenger/ChatList";
import ChatWidget from "./messenger/ChatWidget";

export default function Messenger() {
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [chatSelection, setChatSelection] = useState<string | undefined>();
  const [notificationCount, setNotificationCount] = useState(2);

  function handleChatSelection(selection: string) {
    setChatSelection(selection);
  }

  return (
    <div className="fixed bottom-0 right-0 mr-2 w-[300px] rounded-t-2xl border">
      <div
        className="flex items-center justify-between gap-x-2 text-black dark:text-white bg-(--default-sidebar) border dark:border-0 py-3 px-4 rounded-t-2xl cursor-pointer relative"
        onClick={() => {
          if (isMessengerOpen && chatSelection) return;
          setIsMessengerOpen((state) => !state);
        }}
      >
        {isMessengerOpen ? (
          chatSelection ? (
            <>
              <div className="flex items-center gap-x-3">
                <ChevronLeft
                  size={15}
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatSelection(undefined);
                  }}
                />
                <UserCircle2 />
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold">Team</h1>
                  <p className="text-xs">3 online now</p>
                </div>
              </div>

              <div className="flex items-center gap-x-3">
                <Icon icon="material-symbols:video-call" />
                <Icon icon="mingcute:phone-call-fill" />
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
          <ChatList handleChatSelection={handleChatSelection} />
        )}
        <ChatWidget />
      </div>
    </div>
  );
}
