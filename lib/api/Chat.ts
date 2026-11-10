import { api } from "./client";
import { ChatChannel, ChatMessage } from "./types";

/** My chatrooms (one per project), most recently active first. */
export function listChannels() {
  return api<ChatChannel[]>("/chat/channels");
}

export function getProjectChannel(projectId: string) {
  return api<ChatChannel>(`/projects/${encodeURIComponent(projectId)}/chat`);
}

/** Oldest first. Pass `before` (the oldest createdAt you have) to load earlier messages. */
export function listMessages(channelId: string, before?: string, limit = 50) {
  const search = new URLSearchParams({ limit: String(limit) });
  if (before) search.set("before", before);
  return api<ChatMessage[]>(`/chat/channels/${encodeURIComponent(channelId)}/messages?${search}`);
}

export function sendMessage(channelId: string, body: string, replyToId?: string) {
  return api<ChatMessage>(`/chat/channels/${encodeURIComponent(channelId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ body, replyToId }),
  });
}

export function editMessage(messageId: string, body: string) {
  return api<ChatMessage>(`/chat/messages/${encodeURIComponent(messageId)}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
}

export function deleteMessage(messageId: string) {
  return api<ChatMessage>(`/chat/messages/${encodeURIComponent(messageId)}`, { method: "DELETE" });
}

export function markChannelRead(channelId: string) {
  return api<void>(`/chat/channels/${encodeURIComponent(channelId)}/read`, { method: "POST" });
}
