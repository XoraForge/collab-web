"use client";

import Icon from "../ui/icon";
import ActiveTeammates from "./ActiveTeammates";
import NotificationBell from "./NotificationBell";

/** Opens the bottom-right Messenger (it listens for this event). */
export const OPEN_MESSENGER_EVENT = "collab:open-messenger";

const iconButton =
  "rounded-md p-1.5 opacity-80 hover:opacity-100 hover:bg-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function HeaderActions() {
  return (
    <>
      <ActiveTeammates buttonClassName={iconButton} />

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
