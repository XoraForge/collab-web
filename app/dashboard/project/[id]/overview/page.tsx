import { redirect } from "next/navigation";

/** The project overview lives on the project's main page. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/project/${id}`);
}
