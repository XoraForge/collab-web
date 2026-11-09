import TeamMembersPage from "@/components/dashboard/project/TeamMembersPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamMembersPage projectId={id} />;
}
