"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ApiError } from "@/lib/api/client";
import { publishSection } from "@/lib/api/Document";
import type { Section } from "@/lib/api/types";
import { fetchRealtimeToken, REALTIME_URL } from "@/lib/realtime";
import { useSession } from "@/lib/SessionContext";
import { HocuspocusProvider, WebSocketStatus } from "@hocuspocus/provider";
import { Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { colorForUser, createDocumentExtensions } from "../editor/extensions";
import MainHeader from "../header/MainHeader";
import Document from "../layout/Document";
import A4, { PresenceUser } from "../paper/A4";
import SectionBar from "./SectionBar";
import { isWithinTarget, wordTargetLabel } from "./sectionMeta";


type Props = {
  section: Section;
  /** Latest published content (JSON string) to detect unpublished changes. */
  latestPublished: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
  /** After publishing, so the parent can refresh the section and history. */
  onPublished: () => void;
  /** The server closed the session: e.g. the section was approved or unassigned. */
  onAccessLost: () => void;
  /** Lets the History panel restore an old version into this draft. */
  onEditorChange: (editor: Editor | null) => void;
  /** Tells the panel whether there are unpublished draft changes. */
  onUnpublishedChange: (hasUnpublished: boolean) => void;
};

type Collab = { doc: Y.Doc; provider: HocuspocusProvider };

/**
 * Connects to the section's live draft room on collab-realtime. One room per
 * section, so nothing done here can affect other sections.
 */
export default function LiveSectionEditor(props: Props) {
  const { section, onAccessLost } = props;
  const [collab, setCollab] = useState<Collab | null>(null);
  const onAccessLostRef = useRef(onAccessLost);
  useEffect(() => {
    onAccessLostRef.current = onAccessLost;
  }, [onAccessLost]);

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: REALTIME_URL,
      name: `section:${section.id}`,
      document: doc,
      token: fetchRealtimeToken,
      onAuthenticationFailed: () => onAccessLostRef.current(),
      // collab-realtime closes the session with these reasons. Hocuspocus 4 delivers a
      // per-document close as code 1000 + reason, so check both.
      onClose: ({ event }) => {
        if (event.code === 4401 || event.reason === "session-expired") {
          window.location.href = "/api/auth/logout";
        } else if (event.code === 4403 || event.reason === "permission-denied") {
          onAccessLostRef.current();
        }
      },
    });
    setCollab({ doc, provider });
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [section.id]);

  if (!collab) return <EditorSkeleton {...props} />;
  return <CollabEditor key={section.id} {...props} collab={collab} />;
}

function EditorSkeleton({ section }: Props) {
  return (
    <>
      <SectionBar section={section} note="Connecting…" />
      <div className="w-full h-[45px] border-b" />
      <div className="flex-1 bg-canvas" />
    </>
  );
}

function CollabEditor({
  section,
  latestPublished,
  zoom,
  onZoomChange,
  onExport,
  onPublished,
  onEditorChange,
  onUnpublishedChange,
  collab,
}: Props & { collab: Collab }) {
  const { me } = useSession();
  const { provider, doc } = collab;

  const user = useMemo(
    () => ({
      name: me?.user.name || me?.user.email || "Teammate",
      color: colorForUser(me?.user.id ?? "anonymous"),
    }),
    [me]
  );

  const editor = useEditor(
    {
      extensions: createDocumentExtensions({
        collaboration: { document: doc, provider, user },
        placeholder: `Write the ${section.title} section…`,
      }),
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "tiptap-document",
          spellcheck: "true",
          "aria-label": `${section.title} section editor`,
        },
      },
    },
    [doc, provider]
  );

  useEffect(() => {
    onEditorChange(editor);
    return () => onEditorChange(null);
  }, [editor, onEditorChange]);

  const connection = useConnectionState(provider);
  const people = usePresence(provider);

  // Unpublished changes: compare the draft with the latest published version.
  const [hasUnpublished, setHasUnpublished] = useState(false);
  useEffect(() => {
    if (!editor) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const current = JSON.stringify(editor.getJSON());
        const isEmpty = editor.isEmpty;
        setHasUnpublished(latestPublished === null ? !isEmpty : current !== latestPublished);
      }, 400);
    };
    check();
    editor.on("update", check);
    return () => {
      clearTimeout(timer);
      editor.off("update", check);
    };
  }, [editor, latestPublished]);

  useEffect(() => {
    onUnpublishedChange(hasUnpublished);
  }, [hasUnpublished, onUnpublishedChange]);

  const words = useEditorState({
    editor,
    selector: ({ editor }) => (editor?.storage.characterCount.words() as number | undefined) ?? 0,
  });

  const target = wordTargetLabel(section);
  const note = !connection.connected
    ? "Offline · changes will sync when you reconnect"
    : hasUnpublished
    ? "Draft · unpublished changes"
    : section.publishedVersion > 0
    ? "Up to date with the published version"
    : "Draft · not published yet";

  return (
    <>
      <SectionBar
        section={section}
        note={note}
        actions={
          editor && (
            <PublishButton
              editor={editor}
              section={section}
              disabled={!hasUnpublished}
              onPublished={onPublished}
            />
          )
        }
      />
      <MainHeader editor={editor} zoom={zoom} onZoomChange={onZoomChange} onExport={onExport} />
      <Document zoom={zoom}>
        <A4 people={people} onMarginClick={() => editor?.commands.focus("end")}>
          <EditorContent editor={editor} className="w-full" />
        </A4>
      </Document>
      <div className="flex items-center border-t px-3 py-1 text-xs text-muted-text">
        <p>
          <span className={target && !isWithinTarget(words ?? 0, section) ? "text-amber-500" : undefined}>
            {(words ?? 0).toLocaleString()}
            {target ? ` / ${target}` : ""} words
          </span>
          <span className="mx-2">·</span>
          {connection.label}
          <span className="mx-2">·</span>
          {connection.saving ? "Saving draft…" : "Draft saved"}
          <span className="mx-2">·</span>
          Drafts are only visible to this section&apos;s editors
        </p>
      </div>
    </>
  );
}

function PublishButton({
  editor,
  section,
  disabled,
  onPublished,
}: {
  editor: Editor;
  section: Section;
  disabled: boolean;
  onPublished: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function publish() {
    setBusy(true);
    setError("");
    try {
      await publishSection(section.id, {
        message: message.trim() || undefined,
        contentJson: JSON.stringify(editor.getJSON()),
        wordCount: editor.storage.characterCount.words() as number,
      });
      setMessage("");
      setOpen(false);
      onPublished();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't publish. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" disabled={disabled} title={disabled ? "No unpublished changes" : undefined}>
          Publish
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <form
          className="flex flex-col gap-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            publish();
          }}
        >
          <div>
            <p className="text-sm font-semibold">Publish v{section.publishedVersion + 1}</p>
            <p className="text-xs text-muted-text">
              Your team will see this version in the document. You can always view or restore earlier versions.
            </p>
          </div>
          <Input
            autoFocus
            placeholder="What changed? (optional)"
            value={message}
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Publishing…" : "Publish version"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** Connection + autosave state from the provider. */
export function useConnectionState(provider: HocuspocusProvider) {
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.Connecting);
  const [unsynced, setUnsynced] = useState(0);

  useEffect(() => {
    const onStatus = ({ status }: { status: WebSocketStatus }) => setStatus(status);
    const onUnsynced = ({ number }: { number: number }) => setUnsynced(number);
    provider.on("status", onStatus);
    provider.on("unsyncedChanges", onUnsynced);
    return () => {
      provider.off("status", onStatus);
      provider.off("unsyncedChanges", onUnsynced);
    };
  }, [provider]);

  const connected = status === WebSocketStatus.Connected;
  return {
    connected,
    saving: unsynced > 0,
    label: connected ? "Connected" : status === WebSocketStatus.Connecting ? "Connecting…" : "Offline",
  };
}

/** People currently in this section (from Yjs awareness). */
export function usePresence(provider: HocuspocusProvider): PresenceUser[] {
  const [people, setPeople] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const awareness = provider.awareness;
    if (!awareness) return;
    const update = () => {
      const seen = new Set<string>();
      const list: PresenceUser[] = [];
      awareness.getStates().forEach((state: Record<string, unknown>) => {
        const user = state.user as PresenceUser | undefined;
        if (user?.name && !seen.has(user.name + user.color)) {
          seen.add(user.name + user.color);
          list.push(user);
        }
      });
      setPeople(list);
    };
    update();
    awareness.on("change", update);
    return () => awareness.off("change", update);
  }, [provider]);

  return people;
}
