import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { UserCircle } from "lucide-react";
import { useState } from "react";
import { useComingSoon } from "@/lib/ToastContext";

type Message = {
  user: string;
  isMe: boolean;
  text: string;
};

const TEST_MESSAGES = [
  {
    user: "Kelvin",
    isMe: false,
    text: "Hey team, the research draft is up.",
  },
  {
    user: "Jian Wei",
    isMe: false,
    text: "Nice! I'll review it tonight.",
  },
  {
    user: "Alex",
    isMe: true,
    text: "Thanks both, I'll start on the conclusion.",
  },
];

export default function ChatRoom() {
  const [messages] = useState<Message[]>(TEST_MESSAGES);
  const [draft, setDraft] = useState("");
  const comingSoon = useComingSoon();
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
      <form
        className="p-2 border-t flex items-center justify-between gap-x-3"
        onSubmit={(e) => {
          e.preventDefault();
          comingSoon("Project chat");
        }}
      >
        <button type="button" aria-label="Attach a file" className="opacity-80 hover:opacity-100" onClick={() => comingSoon("File sharing")}>
          <Icon icon="tdesign:attach" fontSize={25} />
        </button>
        <Input placeholder="Type here..." value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Message" />
        <button type="submit" aria-label="Send message" className="opacity-80 hover:opacity-100">
          <Icon icon="material-symbols:send" fontSize={25} />
        </button>
      </form>
    </div>
  );
}
