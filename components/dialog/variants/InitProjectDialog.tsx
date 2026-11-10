"use client";

import Fieldset from "@/components/common/Fieldset";
import ImageCropper from "@/components/image/ImageCropper";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { createProject } from "@/lib/api/Project";
import { dataUrlToBlob, uploadImage } from "@/lib/api/Files";
import { ProjectVisibility } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";
import { useSession } from "@/lib/SessionContext";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

type VisibilityOption = {
  title: "Public" | "Private" | "Organization";
  value: ProjectVisibility;
  icon: string;
  hint: string;
};

const VISIBILITY: VisibilityOption[] = [
  {
    title: "Public",
    value: "PUBLIC",
    icon: "material-symbols:public",
    hint: "Anyone can view the project.",
  },
  {
    title: "Private",
    value: "PRIVATE",
    icon: "material-symbols:public-off",
    hint: "Only project team members can view the project.",
  },
  {
    title: "Organization",
    value: "ORGANIZATION",
    icon: "gg:organisation",
    hint: "All organization members can view the project.",
  },
];

const DEFAULT_DUE_DATE = (() => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
})();

function daysFrom(date: Date, from: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((date.getTime() - from.getTime()) / msPerDay);
}

export default function InitProjectDialog({
  handleCloseDialog,
}: {
  handleCloseDialog: () => void;
}) {
  const router = useRouter();
  const { me, refresh } = useSession();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<VisibilityOption>(VISIBILITY[0]);
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [date, setDate] = useState<Date>(DEFAULT_DUE_DATE);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAtLimit =
    me !== null && me.projectLimit !== null && me.ownedProjects >= me.projectLimit;
  const dueIn = daysFrom(date, new Date());
  const datesInvalid = dayjs(date).isBefore(dayjs(startDate), "day");
  const canSubmit = projectName.trim().length > 0 && !isSubmitting && !isAtLimit && !datesInvalid;

  async function handleDataSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError("");
    try {
      // Upload the cropped image first, so the project stores a short URL rather than the image itself.
      const uploadedImage = imageUrl
        ? (await uploadImage(await dataUrlToBlob(imageUrl), { filename: "project.jpg" })).url
        : undefined;
      const project = await createProject({
        name: projectName.trim(),
        description: description.trim() || undefined,
        visibility: visibility.value,
        startDate: dayjs(startDate).format("YYYY-MM-DD"),
        dueDate: dayjs(date).format("YYYY-MM-DD"),
        imageUrl: uploadedImage,
      });
      await refresh();
      handleCloseDialog();
      router.push(`/dashboard/project/${project.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't create the project. Please try again."
      );
      if (err instanceof ApiError && err.code === "PROJECT_LIMIT_REACHED") refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col px-4 py-2 gap-y-2 flex-1">
      <DialogTitle className="text-2xl font-semibold">
        Create a project
      </DialogTitle>
      <p className="text-xs">
        You can create a project or join an existing project with an invitation
        link.
      </p>

      {isAtLimit && (
        <div
          role="status"
          className="mt-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs"
        >
          You&apos;ve used all {me?.projectLimit} projects on the Free plan.
          Upgrade to Premium for unlimited projects.
        </div>
      )}

      <div className="flex flex-col gap-y-4 grow mt-1.5">
        <ImageCropper onChange={setImageUrl} />
        <Fieldset
          label="Project Name"
          type="input"
          value={projectName}
          setValue={setProjectName}
        />
        <div className="flex flex-col gap-y-1.5 w-full">
          <label htmlFor="project-description" className="text-xs font-medium">
            Description <span className="text-muted-text">(optional)</span>
          </label>
          <textarea
            id="project-description"
            rows={3}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about? Markdown is supported."
            className="w-full min-w-0 resize-none rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
        <Fieldset
          label="Visibility"
          type="dropdown"
          selectItems={VISIBILITY}
          setItems={(title) => {
            const option = VISIBILITY.find((v) => v.title === title);
            if (option) setVisibility(option);
          }}
        />
        <div className="flex gap-x-3">
          <Fieldset
            label="Start Date"
            type="datepicker"
            date={startDate}
            setDate={setStartDate}
          />
          <Fieldset
            label="Due Date"
            type="datepicker"
            date={date}
            setDate={setDate}
          />
        </div>
        <div className="flex flex-col gap-y-0.5">
          <p className="text-xs">{visibility.hint}</p>
          {datesInvalid && (
            <p className="text-xs text-destructive">The due date can&apos;t be before the start date.</p>
          )}
          <p className="text-xs">
            {dueIn > 0
              ? `Project is due ${dueIn} day${dueIn === 1 ? "" : "s"} from now.`
              : dueIn === 0
              ? "Project is due today."
              : "Due date is in the past."}
          </p>
          {error && (
            <p role="alert" className="text-xs text-destructive mt-1">
              {error}
            </p>
          )}
        </div>
      </div>

      <hr />
      <div className="flex self-end gap-x-3">
        <Button variant="outline" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={handleDataSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? "Creating…" : "Create Project"}
        </Button>
      </div>
    </div>
  );
}
