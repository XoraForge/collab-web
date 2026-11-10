import ProjectNotesPage from "@/components/notes/ProjectNotesPage";
import { Suspense } from "react";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    // useSearchParams (?note=) needs a Suspense boundary in the App Router.
    <Suspense>
      <ProjectNotesPage projectId={id} />
    </Suspense>
  );
}
