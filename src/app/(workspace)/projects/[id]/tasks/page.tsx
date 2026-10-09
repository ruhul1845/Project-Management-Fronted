import { ProjectTasksPage } from "@/components/task-management/tasks";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectTasksPage projectId={id} />;
}
