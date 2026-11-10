"use client";

import Icon from "../ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import NotificationBell from "./NotificationBell";

/** Opens the bottom-right Messenger (it listens for this event). */
export const OPEN_MESSENGER_EVENT = "collab:open-messenger";

const WHATS_NEW = [
  { title: "Notifications", text: "The bell tells you when you're assigned, reviewed or approved, and reminds you before things are due." },
  { title: "Project chat", text: "Every project has its own chatroom. Open it from Messages." },
  { title: "Notes", text: "Shared project notes that everyone edits together, live." },
  { title: "Tasks & timeline", text: "Board, list and a Gantt timeline. Drag bars; dependent tasks move automatically." },
  { title: "Sectioned documents", text: "Assign document sections, edit together live, and publish versions." },
  { title: "Version history", text: "See exactly what changed in each published version, and restore it." },
  { title: "Invite links", text: "Invite teammates by email or share a link. New people join when they sign up." },
];

const iconButton =
  "rounded-md p-1.5 opacity-80 hover:opacity-100 hover:bg-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function HeaderActions() {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label="What's new" title="What's new" className={iconButton}>
            <Icon icon="nrk:latest-news" fontSize={22} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <p className="text-sm font-semibold mb-2">What&apos;s new in Collab</p>
          <ul className="flex flex-col gap-y-2.5">
            {WHATS_NEW.map((item) => (
              <li key={item.title}>
                <p className="text-xs font-medium">{item.title}</p>
                <p className="text-xs text-muted-text">{item.text}</p>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        aria-label="Open messages"
        title="Messages"
        className={iconButton}
        onClick={() => window.dispatchEvent(new Event(OPEN_MESSENGER_EVENT))}
      >
        <Icon icon="lets-icons:message-alt-fill" fontSize={20} />
      </button>

      <NotificationBell />
    </>
  );
}
