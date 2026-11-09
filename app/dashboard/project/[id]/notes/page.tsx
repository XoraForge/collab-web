import ProjectComingSoon from "@/components/dashboard/project/ProjectComingSoon";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProjectComingSoon
      projectId={id}
      title="Project notes"
      description="Shared notes for the team are on the way."
      icon="fluent:notepad-edit-16-regular"
    />
  );
}
