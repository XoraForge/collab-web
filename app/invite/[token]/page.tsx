"use client";

import { Button } from "@/components/ui/button";
import { acceptInvite, getInvite } from "@/lib/api/Document";
import { ApiError, request } from "@/lib/api/client";
import type { CurrentUser, InvitePreview } from "@/lib/api/types";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATE_MESSAGE: Record<Exclude<InvitePreview["state"], "VALID">, string> = {
  EXPIRED: "This invite has expired. Ask the team leader for a new one.",
  REVOKED: "This invite is no longer valid. Ask the team leader for a new one.",
  USED: "This invite has already been used.",
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    Promise.all([
      getInvite(token).catch((err) => {
        setError(err instanceof ApiError && err.status === 404 ? "This invite link doesn't exist." : "Couldn't load this invite.");
        return null;
      }),
      // Signed out is fine here: don't redirect to login.
      request<CurrentUser>("/api/backend/auth/me").catch(() => null),
    ]).then(([inv, user]) => {
      setInvite(inv);
      setMe(user);
      setIsLoading(false);
      // Already in (e.g. their email invite was accepted when they signed up): go straight in.
      if (inv?.alreadyMember) router.replace(`/dashboard/project/${inv.projectId}`);
    });
  }, [token, router]);

  async function join() {
    setIsJoining(true);
    setError("");
    try {
      const result = await acceptInvite(token);
      router.push(`/dashboard/project/${result.projectId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't join the project.");
      setIsJoining(false);
    }
  }

  const next = encodeURIComponent(`/invite/${token}`);

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4">
      <div className="w-[600px] max-w-full bg-black flex flex-col gap-y-10 border-2 border-[#525252] rounded-md p-7">
        <div className="flex items-center gap-x-3">
          <div className="size-6 relative">
            <Image src="/logo.png" alt="logo" fill sizes="24px" className="object-contain" />
          </div>
          <h1 className="font-semibold">Collab</h1>
        </div>

        <div className="flex flex-col gap-y-5 self-center w-full sm:w-[70%] pb-6">
          {isLoading ? (
            <p className="text-sm opacity-70">Loading invite…</p>
          ) : invite?.alreadyMember ? (
            <>
              <h1 className="text-2xl font-semibold">You&apos;re in!</h1>
              <p className="text-sm">Opening {invite.projectName}…</p>
            </>
          ) : !invite ? (
            <>
              <h1 className="text-2xl font-semibold">Invite not found</h1>
              <p className="text-sm">{error}</p>
              <Button asChild variant="outline" style={{ height: 45 }}>
                <Link href="/dashboard">Go to Collab</Link>
              </Button>
            </>
          ) : invite.state !== "VALID" ? (
            <>
              <h1 className="text-2xl font-semibold">{invite.projectName}</h1>
              <p className="text-sm">{STATE_MESSAGE[invite.state]}</p>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-y-2">
                <p className="text-sm opacity-80">
                  {invite.invitedBy ? `${invite.invitedBy} invited you to join` : "You're invited to join"}
                </p>
                <h1 className="text-3xl font-semibold">{invite.projectName}</h1>
                {invite.email && (
                  <p className="text-xs opacity-70">This invite is for {invite.email}.</p>
                )}
              </div>

              {me ? (
                <>
                  <p className="text-sm">
                    Signed in as <span className="font-semibold">{me.user.email}</span>
                  </p>
                  <Button style={{ height: 45 }} onClick={join} disabled={isJoining}>
                    {isJoining ? "Joining…" : "Join project"}
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild style={{ height: 45 }}>
                    <Link href={`/login?next=${next}`}>Log in or sign up to join</Link>
                  </Button>
                  <p className="text-xs opacity-70">
                    New to Collab? Enter your email on the next page and we&apos;ll create your account.
                  </p>
                </>
              )}
              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
