"use client";

import Avatar from "@/components/common/Avatar";
import ImageCropper from "@/components/image/ImageCropper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, updateProfile } from "@/lib/api/Auth";
import { ApiError } from "@/lib/api/client";
import { dataUrlToBlob, uploadImage } from "@/lib/api/Files";
import { useSession } from "@/lib/SessionContext";
import { useToast } from "@/lib/ToastContext";
import { useEffect, useState } from "react";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border bg-card dark:bg-(--default-sidebar) p-5 flex flex-col gap-y-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-text">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Page() {
  return (
    <div className="flex flex-col gap-y-5 px-4 sm:px-8 py-6 text-text max-w-2xl w-full">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-text">Your profile and sign-in.</p>
      </div>
      <ProfileCard />
      <PasswordCard />
      <PlanCard />
    </div>
  );
}

function ProfileCard() {
  const { me, refresh } = useSession();
  const toast = useToast();
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<string | null>(null); // new cropped data URL, "" = remove
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cropperKey, setCropperKey] = useState(0);

  useEffect(() => {
    if (me) setName(me.user.name ?? "");
  }, [me]);

  if (!me) return <Card title="Profile"><p className="text-sm text-muted-text">Loading…</p></Card>;

  const current = me.user.imageUrl;
  const changed = name.trim() !== (me.user.name ?? "") || picture !== null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your name.");
    setSaving(true);
    setError("");
    try {
      let imageUrl: string | null = null;
      if (picture === "") imageUrl = "";
      else if (picture) imageUrl = (await uploadImage(await dataUrlToBlob(picture), { filename: "profile.jpg" })).url;
      await updateProfile(name.trim(), imageUrl);
      await refresh();
      setPicture(null);
      setCropperKey((k) => k + 1);
      toast("Profile saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Profile" description="How teammates see you in projects, chat and activity.">
      <form onSubmit={save} className="flex flex-col gap-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar
            src={picture ? picture : picture === "" ? undefined : current ?? undefined}
            name={name || me.user.email}
            size={64}
            className="text-lg"
          />
          <div className="grow min-w-[220px]">
            <ImageCropper
              key={cropperKey}
              onChange={(url) => setPicture(url || null)}
              prompt="Upload a profile picture"
              doneLabel="New picture ready, save to apply"
            />
          </div>
          {current && picture === null && (
            <Button type="button" variant="outline" size="sm" onClick={() => setPicture("")}>
              Remove picture
            </Button>
          )}
          {picture === "" && <p className="text-xs text-muted-text">Picture will be removed when you save.</p>}
        </div>

        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="settings-name">Name</Label>
          <Input id="settings-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="settings-email">Email</Label>
          <Input id="settings-email" value={me.user.email} readOnly disabled />
          <p className="text-xs text-muted-text">You sign in with this email. It can&apos;t be changed yet.</p>
        </div>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        <div>
          <Button type="submit" disabled={!changed || saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next.length < 8) return setError("Use at least 8 characters for your new password.");
    if (next !== confirm) return setError("The new passwords don't match.");
    setSaving(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("Password changed.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Password">
      <form onSubmit={save} className="flex flex-col gap-y-3">
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="pw-current">Current password</Label>
          <Input id="pw-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="pw-new">New password</Label>
            <Input id="pw-new" type="password" value={next} maxLength={72} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input id="pw-confirm" type="password" value={confirm} maxLength={72} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          </div>
        </div>
        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        <div>
          <Button type="submit" disabled={saving || !current || !next || !confirm}>
            {saving ? "Changing…" : "Change password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PlanCard() {
  const { me } = useSession();
  return (
    <Card title="Plan">
      <p className="text-sm">
        <span className="font-semibold">{me?.plan === "PREMIUM" ? "Premium" : "Basic"}</span>
        {me?.plan === "PREMIUM" && <span className="text-muted-text"> · every feature is open while Collab is in early access.</span>}
      </p>
    </Card>
  );
}
