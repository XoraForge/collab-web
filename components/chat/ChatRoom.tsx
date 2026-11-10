"use client";

import Avatar from "@/components/common/Avatar";
import { dayHeading, personName } from "@/lib/activityText";
import { deleteMessage, editMessage, listMessages, markChannelRead, sendMessage } from "@/lib/api/Chat";
import { ApiError } from "@/lib/api/client";
import type { ChatChannel, ChatMessage } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { ProjectEvent, useProjectEvents } from "@/lib/realtime";
import { useSession } from "@/lib/SessionContext";
import { useComingSoon } from "@/lib/ToastContext";
import { cn } from "@/lib/utils";
import { CornerUpLeft, Paperclip, Pencil, SendHorizontal, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const PAGE = 50;
const TYPING_SIGNAL_MS = 2000;
const TYPING_SHOWN_MS = 4000;
/** Messages from the same person within this many minutes are grouped under one name. */
const GROUP_MINUTES = 5;

type Typer = { name: string; until: number };

/** One project chatroom: history, live messages, typing, replies, edit and delete. */
export default function ChatRoom({
  channel,
  onRead,
  className,
}: {
  channel: ChatChannel;
  /** Called after the room is marked read (so unread counts can refresh). */
  onRead?: () => void;
  className?: string;
}) {
  const { me, projects } = useSession();
  const comingSoon = useComingSoon();
  const myId = me?.user.id;
  const isLeader = projects.find((p) => p.id === channel.projectId)?.role === "PROJECT_MANAGER";

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [typers, setTypers] = useState<Record<string, Typer>>({});

  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const keepOffset = useRef<number | null>(null);
  const lastTypingSent = useRef(0);
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  const markRead = useCallback(() => {
    markChannelRead(channel.id)
      .then(() => onReadRef.current?.())
      .catch(() => undefined);
  }, [channel.id]);

  // Load the latest page, then mark the room read.
  useEffect(() => {
    let cancelled = false;
    setMessages(null);
    setError("");
    setReplyTo(null);
    setEditing(null);
    setDraft("");
    stickToBottom.current = true;
    listMessages(channel.id, undefined, PAGE)
      .then((list) => {
        if (cancelled) return;
        setMessages(list);
        setHasMore(list.length === PAGE);
        markRead();
      })
      .catch(() => !cancelled && setError("Couldn't load messages."));
    return () => {
      cancelled = true;
    };
  }, [channel.id, markRead]);

  const upsert = useCallback((message: ChatMessage) => {
    setMessages((list) => {
      if (!list) return list;
      const index = list.findIndex((m) => m.id === message.id);
      if (index === -1) return [...list, message];
      const next = [...list];
      next[index] = message;
      return next;
    });
  }, []);

  const { send } = useProjectEvents(
    channel.projectId,
    useCallback(
      (event: ProjectEvent) => {
        if (event.channelId !== channel.id) return;
        if (event.type === "CHAT_MESSAGE" && event.message) {
          const message = event.message;
          upsert(message);
          setTypers((t) => {
            if (!t[message.author.id]) return t;
            const next = { ...t };
            delete next[message.author.id];
            return next;
          });
          if (message.author.id !== myId && document.visibilityState === "visible") markRead();
        } else if (event.type === "CHAT_MESSAGE_UPDATED" && event.message) {
          // Keep the reply preview we already have if the event didn't include one.
          const message = event.message;
          setMessages((list) =>
            list?.map((m) => (m.id === message.id ? { ...message, replyTo: message.replyTo ?? m.replyTo } : m)) ?? list
          );
        } else if (event.type === "TYPING" && event.user && event.user.id !== myId) {
          const user = event.user;
          setTypers((t) => ({ ...t, [user.id]: { name: user.name || "Someone", until: Date.now() + TYPING_SHOWN_MS } }));
        }
      },
      [channel.id, myId, upsert, markRead]
    )
  );

  // Drop typing indicators that have expired.
  useEffect(() => {
    if (Object.keys(typers).length === 0) return;
    const timer = setInterval(() => {
      setTypers((t) => {
        const now = Date.now();
        const next = Object.fromEntries(Object.entries(t).filter(([, v]) => v.until > now));
        return Object.keys(next).length === Object.keys(t).length ? t : next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [typers]);

  // Scroll: stay at the bottom for new messages; keep position when older ones load above.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || !messages) return;
    if (keepOffset.current !== null) {
      el.scrollTop = el.scrollHeight - keepOffset.current;
      keepOffset.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  function onScroll() {
    const el = scroller.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function loadEarlier() {
    if (!messages?.length) return;
    setLoadingMore(true);
    try {
      const older = await listMessages(channel.id, messages[0].createdAt, PAGE);
      const el = scroller.current;
      if (el) keepOffset.current = el.scrollHeight - el.scrollTop;
      setMessages((list) => [...older.filter((o) => !list?.some((m) => m.id === o.id)), ...(list ?? [])]);
      setHasMore(older.length === PAGE);
    } catch {
      setError("Couldn't load earlier messages.");
    } finally {
      setLoadingMore(false);
    }
  }

  function onDraftChange(value: string) {
    setDraft(value);
    if (value.trim() && !editing && Date.now() - lastTypingSent.current > TYPING_SIGNAL_MS) {
      lastTypingSent.current = Date.now();
      send({ type: "TYPING", channelId: channel.id });
    }
  }

  async function submit() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      if (editing) {
        upsert(await editMessage(editing.id, body));
        setEditing(null);
      } else {
        stickToBottom.current = true;
        upsert(await sendMessage(channel.id, body, replyTo?.id));
        setReplyTo(null);
      }
      setDraft("");
      lastTypingSent.current = 0;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send. Try again.");
    } finally {
      setSending(false);
      input.current?.focus();
    }
  }

  async function remove(message: ChatMessage) {
    if (!window.confirm("Delete this message for everyone?")) return;
    try {
      upsert(await deleteMessage(message.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete the message.");
    }
  }

  function startEdit(message: ChatMessage) {
    setReplyTo(null);
    setEditing(message);
    setDraft(message.body ?? "");
    input.current?.focus();
  }

  function startReply(message: ChatMessage) {
    setEditing(null);
    setReplyTo(message);
    input.current?.focus();
  }

  function cancelComposerMode() {
    if (editing) setDraft("");
    setEditing(null);
    setReplyTo(null);
  }

  // Auto-grow the composer up to ~5 lines.
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  const typingNames = Object.values(typers).map((t) => t.name);

  return (
    <div className={cn("flex flex-col min-h-0 h-full", className)}>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="grow min-h-0 overflow-y-auto small-scrollbar px-2 py-3 flex flex-col"
        role="log"
        aria-live="polite"
        aria-label={`${channel.projectName} chat`}
      >
        {!messages && !error && <p className="m-auto text-sm text-muted-text">Loading…</p>}
        {messages && hasMore && (
          <button
            type="button"
            onClick={loadEarlier}
            disabled={loadingMore}
            className="self-center mb-3 rounded-full border px-3 py-1 text-xs text-muted-text hover:bg-hover disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load earlier messages"}
          </button>
        )}
        {messages && messages.length === 0 && (
          <div className="m-auto text-center px-4">
            <p className="text-sm font-medium">This is the start of {channel.projectName}</p>
            <p className="text-xs text-muted-text">Everyone in the project can read and post here.</p>
          </div>
        )}
        {messages?.map((m, i) => {
          const prev = messages[i - 1];
          const newDay = !prev || !dayjs(prev.createdAt).isSame(m.createdAt, "day");
          const grouped =
            !newDay &&
            prev &&
            prev.author.id === m.author.id &&
            !m.replyTo &&
            dayjs(m.createdAt).diff(prev.createdAt, "minute") < GROUP_MINUTES;
          return (
            <div key={m.id} className="flex flex-col">
              {newDay && (
                <div className="flex items-center gap-x-2 my-2 text-[11px] text-muted-text" suppressHydrationWarning>
                  <span className="h-px grow bg-border" />
                  {dayHeading(m.createdAt)}
                  <span className="h-px grow bg-border" />
                </div>
              )}
              <MessageRow
                message={m}
                mine={m.author.id === myId}
                grouped={!!grouped}
                canDelete={!m.deleted && (m.author.id === myId || isLeader)}
                onReply={() => startReply(m)}
                onEdit={() => startEdit(m)}
                onDelete={() => remove(m)}
              />
            </div>
          );
        })}
      </div>

      <div className="h-5 px-3 text-[11px] text-muted-text truncate" aria-live="polite">
        {typingNames.length === 1
          ? `${typingNames[0]} is typing…`
          : typingNames.length > 1
            ? `${typingNames.slice(0, 2).join(" and ")}${typingNames.length > 2 ? " and others" : ""} are typing…`
            : ""}
      </div>

      {(replyTo || editing) && (
        <div className="mx-2 mb-1 flex items-start justify-between gap-x-2 rounded-md border-l-2 border-blue-500 bg-hover px-2 py-1.5 text-xs">
          <span className="min-w-0">
            <span className="font-semibold">
              {editing ? "Editing your message" : `Replying to ${personName(replyTo!.author)}`}
            </span>
            {replyTo && <span className="block truncate text-muted-text">{replyTo.body ?? "Message deleted"}</span>}
          </span>
          <button type="button" aria-label="Cancel" onClick={cancelComposerMode} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}
      {error && <p className="px-3 pb-1 text-xs text-red-400" role="alert">{error}</p>}

      <form
        className="p-2 border-t flex items-end gap-x-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <button
          type="button"
          aria-label="Attach a file"
          title="Attach a file"
          className="shrink-0 opacity-70 hover:opacity-100 pb-2"
          onClick={() => comingSoon("Sharing files in chat")}
        >
          <Paperclip size={18} />
        </button>
        <textarea
          ref={input}
          rows={1}
          value={draft}
          maxLength={4000}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape" && (replyTo || editing)) {
              e.preventDefault();
              cancelComposerMode();
            }
          }}
          placeholder={editing ? "Edit your message…" : `Message ${channel.projectName}`}
          aria-label="Message"
          className="grow resize-none rounded-md border bg-transparent px-2.5 py-1.5 text-sm leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring small-scrollbar"
        />
        <button
          type="submit"
          aria-label={editing ? "Save edit" : "Send message"}
          title={editing ? "Save" : "Send (Enter)"}
          disabled={!draft.trim() || sending}
          className="shrink-0 opacity-80 hover:opacity-100 disabled:opacity-30 pb-2"
        >
          <SendHorizontal size={18} />
        </button>
      </form>
    </div>
  );
}

function MessageRow({
  message: m,
  mine,
  grouped,
  canDelete,
  onReply,
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  mine: boolean;
  grouped: boolean;
  canDelete: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const name = personName(m.author);
  const time = dayjs(m.createdAt);

  return (
    <div className={cn("group flex gap-x-2", mine ? "flex-row-reverse" : "", grouped ? "mt-0.5" : "mt-3 first:mt-0")}>
      {!mine && (
        <span className="w-7 shrink-0">
          {!grouped && <Avatar src={m.author.imageUrl ?? undefined} name={name} size={28} />}
        </span>
      )}
      <div className={cn("flex flex-col max-w-[80%] min-w-0", mine && "items-end")}>
        {!grouped && (
          <p className="text-[11px] text-muted-text mb-0.5" suppressHydrationWarning>
            {!mine && <span className="font-semibold text-text mr-1.5">{name}</span>}
            <time dateTime={m.createdAt} title={time.format("D MMMM YYYY, h:mmA")}>
              {time.format("h:mmA")}
            </time>
          </p>
        )}
        <div className={cn("flex items-center gap-x-1", mine && "flex-row-reverse")}>
          <div
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-[13px] leading-snug break-words min-w-0",
              m.deleted
                ? "italic text-muted-text border border-dashed"
                : mine
                  ? "bg-blue-600 text-white"
                  : "bg-(--default-sidebar) border border-border"
            )}
          >
            {m.replyTo && !m.deleted && (
              <div className={cn("mb-1 border-l-2 pl-2 text-[11px] opacity-80", mine ? "border-white/60" : "border-blue-500")}>
                <span className="font-semibold">{m.replyTo.authorName ?? "Someone"}</span>
                <span className="block truncate">{m.replyTo.deleted ? "Message deleted" : m.replyTo.body}</span>
              </div>
            )}
            {m.deleted ? (
              "Message deleted"
            ) : (
              <div className="[&_p]:m-0 [&_p+p]:mt-1 [&_a]:underline [&_code]:rounded [&_code]:bg-black/20 [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
                <ReactMarkdown
                  components={{
                    a: ({ children, href }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    img: ({ alt }) => <span>[{alt || "image"}]</span>,
                  }}
                >
                  {m.body ?? ""}
                </ReactMarkdown>
              </div>
            )}
            {m.editedAt && !m.deleted && <span className="ml-1 text-[10px] opacity-70">(edited)</span>}
          </div>
          {!m.deleted && (
            <div className="flex items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
              <button type="button" aria-label="Reply" title="Reply" onClick={onReply} className="p-1 rounded hover:bg-hover">
                <CornerUpLeft size={13} />
              </button>
              {mine && (
                <button type="button" aria-label="Edit message" title="Edit" onClick={onEdit} className="p-1 rounded hover:bg-hover">
                  <Pencil size={13} />
                </button>
              )}
              {canDelete && (
                <button type="button" aria-label="Delete message" title="Delete" onClick={onDelete} className="p-1 rounded hover:bg-hover">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
