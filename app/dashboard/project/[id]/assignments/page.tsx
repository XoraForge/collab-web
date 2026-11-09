import TasksPage from "@/components/tasks/TasksPage";
import { Suspense } from "react";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <TasksPage projectId={id} />
    </Suspense>
  );
}
