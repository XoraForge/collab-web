"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Icon from "../ui/icon";
import { X } from "lucide-react";

function ChatPreview({ team, message }: { team: string; message: string }) {
  return (
    <div className="flex border px-2 py-4 border-[#00000025] text-black justify-between cursor-pointer">
      <div className="flex gap-x-2">
        {/* Profile */}
        <div className="size-10 rounded-full bg-gray-400"></div>
        {/* Name and messages */}
        <div className="flex flex-col justify-between">
          <h1 className="text-sm font-semibold">{team}</h1>
          <p className="text-xs font-medium">{message}</p>
        </div>
      </div>
      {/* DateTime */}
      <p className="text-[10px]">10:09AM</p>
    </div>
  );
}

function ChatList({
  setIsMessengerOpen,
}: {
  setIsMessengerOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col w-[350px]">
      {/* Header */}
      <div className="py-3 px-4 bg-black text-white flex justify-between items-center">
        <h1 className="text-sm font-medium">Messenger</h1>
        <X size={15} onClick={() => setIsMessengerOpen(false)} />
      </div>
      <div className="flex flex-col bg-white h-[400px] overflow-y-auto small-scrollbar">
        <ChatPreview
          team="Business Analytics"
          message="You are so smart I wished you were my..."
        />
        <ChatPreview team="Artifical Intelligence" message="Wtf is this bs?" />
        <ChatPreview
          team="TeamCollab"
          message="Welcome to Collab. I am Jian Wei..."
        />
      </div>
    </div>
  );
}

export default function Messenger() {
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  return (
    <div className="absolute bottom-0 right-0">
      {!isMessengerOpen ? (
        <div
          className="flex items-center gap-x-2 bg-black p-3 rounded-full cursor-pointer relative mb-2 mr-2"
          onClick={() => setIsMessengerOpen(true)}
        >
          <Icon icon="token:chat" fontSize={40} />
          {/* Alerts */}
          {notificationCount > 0 && (
            <div className="bg-red-500 text-white absolute top-2 right-2 px-1.5 rounded-full text-sm">
              {notificationCount}
            </div>
          )}
        </div>
      ) : (
        <ChatList setIsMessengerOpen={setIsMessengerOpen} />
      )}
    </div>
  );
}
