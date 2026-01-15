import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Send, Upload, UserCircle } from "lucide-react";
import { useState } from "react";

type Message = {
  user: string;
  isMe: boolean;
  text: string;
};

const TEST_MESSAGES = [
  {
    user: "Kelvin",
    isMe: false,
    text: "Yo!",
  },
  {
    user: "Jian Wei",
    isMe: false,
    text: "Sup!",
  },
  {
    user: "Alex",
    isMe: true,
    text: "WTF!",
  },
];

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>(TEST_MESSAGES);
  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col gap-y-3 py-3 px-2">
        {messages.map((message) => {
          if (message.isMe) {
            return (
              <div className="self-end" key={message.user}>
                <div className="text-[12px] bg-(--default-sidebar) px-1.5 py-2 rounded-md">
                  {message.text}
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-x-2" key={message.user}>
              <UserCircle />
              <div className="flex flex-col">
                <h1 className="text-xs font-semibold">{message.user}</h1>
                <div className="text-[12px] bg-(--default-sidebar) px-1.5 py-2 rounded-md">
                  {message.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t flex items-center justify-between gap-x-3">
        <Icon icon="tdesign:attach" fontSize={25} />
        <Input placeholder="Type here..." />
        <Icon icon="material-symbols:send" fontSize={25} />
      </div>
    </div>
  );
}
