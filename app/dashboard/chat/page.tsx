"use client";

import ChannelList from "@/components/chat/ChannelList";
import ChatRoom from "@/components/chat/ChatRoom";
import { useChatChannels } from "@/components/chat/useChatChannels";
import { useSession } from "@/lib/SessionContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ChatPage() {
  const { channels, error, refresh } = useChatChannels();
  const { projects } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const channelId = params.get("channel");
  const projectId = params.get("project");

  // ?project=<id> links resolve to that project's room.
  useEffect(() => {
    if (!projectId || !channels) return;
    const channel = channels.find((c) => c.projectId === projectId);
    if (channel) router.replace(`?channel=${channel.id}`, { scroll: false });
  }, [projectId, channels, router]);

  const selected = channels?.find((c) => c.id === channelId) ?? null;
  const project = selected ? projects.find((p) => p.id === selected.projectId) : undefined;

  return (
    <div className="flex grow min-h-0 text-text">
      <aside
        className={cn(
          "w-full md:w-80 md:shrink-0 border-r flex flex-col min-h-0",
          selected && "hidden md:flex"
        )}
      >
        <h1 className="px-4 py-3 border-b text-lg font-semibold">Chats</h1>
        <div className="grow min-h-0 overflow-y-auto small-scrollbar">
          <ChannelList
            channels={channels}
            error={error}
            selectedId={channelId}
            onSelect={(c) => router.replace(`?channel=${c.id}`, { scroll: false })}
          />
        </div>
      </aside>

      <section className={cn("grow min-w-0 flex flex-col min-h-0", !selected && "hidden md:flex")}>
        {selected ? (
          <>
            <header className="flex items-center gap-x-3 px-4 py-3 border-b">
              <button
                type="button"
                aria-label="Back to chats"
                className="md:hidden rounded-md p-1 hover:bg-hover"
                onClick={() => router.replace("?", { scroll: false })}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="min-w-0">
                <Link href={`/dashboard/project/${selected.projectId}`} className="font-semibold hover:underline truncate block">
                  {selected.projectName}
                </Link>
                {project && (
                  <p className="text-xs text-muted-text">
                    {project.memberCount} {project.memberCount === 1 ? "member" : "members"} · # {selected.name}
                  </p>
                )}
              </div>
            </header>
            <ChatRoom key={selected.id} channel={selected} onRead={refresh} className="max-w-4xl w-full self-center" />
          </>
        ) : (
          <div className="m-auto flex flex-col items-center gap-y-2 text-center p-6">
            <MessagesSquare size={28} className="opacity-50" />
            <p className="font-medium">Pick a chat</p>
            <p className="text-sm text-muted-text max-w-xs">Each project has its own chatroom for the whole team.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}
