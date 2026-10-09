import { ProjectTasksPage } from "@/components/workline/tasks";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectTasksPage projectId={id} />;
}
