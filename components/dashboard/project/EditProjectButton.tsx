"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionalDate } from "@/components/ui/optional-date";
import { ApiError } from "@/lib/api/client";
import { updateProject } from "@/lib/api/Task";
import { dataUrlToBlob, uploadImage } from "@/lib/api/Files";
import ImageCropper from "@/components/image/ImageCropper";
import type { Project } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { useSession } from "@/lib/SessionContext";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const iso = (d: Date | null) => (d ? dayjs(d).format("YYYY-MM-DD") : undefined);

/** Team leader edits the project's name, description, image and dates. */
export default function EditProjectButton({ project }: { project: Project }) {
  const router = useRouter();
  const { refresh } = useSession();
  const [open, setOpen] = useState(false);
  const canEdit = project.role === "PROJECT_MANAGER";

  if (!canEdit) {
    return (
      <Button disabled title="Only the team leader can edit the project">
        Edit
      </Button>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>Edit</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-dialog w-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100svh-2rem)] overflow-y-auto rounded-md border p-5 focus:outline-none"
        >
          <EditForm
            project={project}
            onDone={() => {
              setOpen(false);
              refresh();
              router.refresh();
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditForm({ project, onDone }: { project: Project; onDone: () => void }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [start, setStart] = useState<Date | null>(project.startDate ? dayjs(project.startDate).toDate() : null);
  const [due, setDue] = useState<Date | null>(project.dueDate ? dayjs(project.dueDate).toDate() : null);
  const [image, setImage] = useState<string | null>(null); // new cropped data URL, "" = remove
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dateError = start && due && due < start ? "The due date can't be before the start date." : "";
  const labelClass = "text-xs font-medium";

  async function save() {
    if (!name.trim() || dateError) return;
    setBusy(true);
    setError("");
    try {
      const imageUrl =
        image === null
          ? undefined
          : image === ""
            ? ""
            : (await uploadImage(await dataUrlToBlob(image), { projectId: project.id, filename: "project.jpg" })).url;
      await updateProject(project.id, {
        name: name.trim(),
        description,
        startDate: iso(start),
        dueDate: iso(due),
        imageUrl,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="flex items-center justify-between">
        <Dialog.Title className="text-xl font-semibold">Edit project</Dialog.Title>
        <Dialog.Close aria-label="Close" className="opacity-70 hover:opacity-100">
          <X size={16} />
        </Dialog.Close>
      </div>
      <label className="flex flex-col gap-y-1.5">
        <span className={labelClass}>Project name</span>
        <Input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="flex flex-col gap-y-1.5">
        <span className={labelClass}>Project image</span>
        <div className="flex items-center gap-x-3">
          {project.imageUrl && image === null && (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded image served by the API
            <img src={project.imageUrl} alt="Current project image" className="size-14 rounded-md object-cover border border-border" />
          )}
          <div className="grow">
            <ImageCropper onChange={(url) => setImage(url || null)} prompt="Upload a new image" doneLabel="New image ready" />
          </div>
        </div>
        {project.imageUrl && image === null && (
          <button type="button" className="self-start text-xs text-muted-text hover:text-text hover:underline" onClick={() => setImage("")}>
            Remove image
          </button>
        )}
        {image === "" && <p className="text-xs text-muted-text">The image will be removed when you save.</p>}
      </div>
      <label className="flex flex-col gap-y-1.5">
        <span className={labelClass}>Description (Markdown supported)</span>
        <textarea
          rows={6}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-y rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-y-1.5">
          <span className={labelClass}>Start date</span>
          <OptionalDate label="Start date" value={start} onChange={setStart} />
        </div>
        <div className="flex flex-col gap-y-1.5">
          <span className={labelClass}>Due date</span>
          <OptionalDate label="Due date" value={due} onChange={setDue} />
        </div>
      </div>
      {(dateError || error) && <p role="alert" className="text-xs text-destructive">{dateError || error}</p>}
      <div className="flex justify-end gap-x-2 border-t pt-3">
        <Dialog.Close asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </Dialog.Close>
        <Button type="submit" disabled={busy || !name.trim() || !!dateError}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
