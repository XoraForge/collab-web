import ProjectComingSoon from "@/components/dashboard/project/ProjectComingSoon";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProjectComingSoon
      projectId={id}
      title="Meetings & schedule"
      description="Scheduling meetings is coming soon. Your project's tasks and deadlines are already on the timeline."
      icon="grommet-icons:schedule-new"
      action={{ label: "Open the timeline", href: `/dashboard/project/${id}/assignments?view=timeline` }}
    />
  );
}
