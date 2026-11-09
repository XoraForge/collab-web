import FilesPage from "@/components/dashboard/project/FilesPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FilesPage projectId={id} />;
}
