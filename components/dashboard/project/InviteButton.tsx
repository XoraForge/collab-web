"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ApiError } from "@/lib/api/client";
import {
  addMember,
  getInviteLink,
  listPendingInvites,
  resetInviteLink,
  revokeInvite,
} from "@/lib/api/Document";
import type { Invite } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { Check, Copy, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function absoluteUrl(path: string) {
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`;
}

function CopyField({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(path);
  return (
    <div className="flex items-center gap-x-1.5">
      <Input readOnly value={url} className="h-8 text-xs" onFocus={(e) => e.currentTarget.select()} />
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label="Copy link"
        onClick={async () => {
          await navigator.clipboard?.writeText(url).catch(() => undefined);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}

/**
 * Team leader invites people: by email (existing users join now, others get a
 * pending invite that completes when they sign up), or with a shareable link.
 */
export default function InviteButton({
  projectId,
  canInvite,
}: {
  projectId: string;
  canInvite: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [newInvite, setNewInvite] = useState<Invite | null>(null);
  const [link, setLink] = useState<Invite | null>(null);
  const [pending, setPending] = useState<Invite[]>([]);

  async function loadInvites() {
    const [linkInvite, pendingInvites] = await Promise.all([
      getInviteLink(projectId),
      listPendingInvites(projectId),
    ]).catch(() => [null, []] as const);
    setLink(linkInvite);
    setPending([...pendingInvites]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage(null);
    setNewInvite(null);
    try {
      const result = await addMember(projectId, email.trim());
      if (result.member) {
        setMessage({ text: `${result.member.user.name || result.member.user.email} joined the project.`, isError: false });
        router.refresh(); // update the contributor count
      } else if (result.invite) {
        setNewInvite(result.invite);
        setMessage({
          text: `${result.invite.email} doesn't have an account yet. They'll join automatically when they sign up. Send them this link:`,
          isError: false,
        });
        loadInvites();
      }
      setEmail("");
    } catch (err) {
      setMessage({ text: err instanceof ApiError ? err.message : "Couldn't invite them.", isError: true });
    } finally {
      setBusy(false);
    }
  }

  if (!canInvite) {
    return (
      <Button variant="outline" disabled title="Only the team leader can invite people">
        Invite
      </Button>
    );
  }

  return (
    <Popover
      onOpenChange={(open) => {
        setMessage(null);
        setNewInvite(null);
        if (open) loadInvites();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline">Invite</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 flex flex-col gap-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
          <div>
            <p className="text-sm font-semibold">Invite by email</p>
            <p className="text-xs text-muted-text">
              People with a Collab account join straight away. Anyone else joins when they sign up.
            </p>
          </div>
          <div className="flex gap-x-2">
            <Input
              type="email"
              autoFocus
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 text-sm"
            />
            <Button type="submit" size="sm" disabled={busy || !email.trim()}>
              {busy ? "Inviting…" : "Invite"}
            </Button>
          </div>
          {message && (
            <p className={`text-xs ${message.isError ? "text-destructive" : "text-green-500"}`}>{message.text}</p>
          )}
          {newInvite && <CopyField path={newInvite.path} />}
        </form>

        <div className="flex flex-col gap-y-2 border-t pt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Invite link</p>
            <button
              type="button"
              className="flex items-center gap-x-1 text-xs text-muted-text hover:text-text"
              title="Make a new link; the old one stops working"
              onClick={async () => setLink(await resetInviteLink(projectId))}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <p className="text-xs text-muted-text">
            Anyone with this link can join after signing in
            {link && ` · expires ${dayjs(link.expiresAt).format("D MMM")}`}.
          </p>
          {link ? <CopyField path={link.path} /> : <div className="h-8 rounded-md bg-border/60 animate-pulse" />}
        </div>

        {pending.length > 0 && (
          <div className="flex flex-col gap-y-1.5 border-t pt-3">
            <p className="text-sm font-semibold">Waiting to sign up</p>
            {pending.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-x-2 text-xs">
                <span className="truncate">{invite.email}</span>
                <button
                  type="button"
                  aria-label={`Cancel invite for ${invite.email}`}
                  title="Cancel invite"
                  className="opacity-60 hover:opacity-100"
                  onClick={async () => {
                    await revokeInvite(projectId, invite.id);
                    setPending((list) => list.filter((i) => i.id !== invite.id));
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
