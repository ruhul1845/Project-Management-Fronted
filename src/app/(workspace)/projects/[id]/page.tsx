import { ProjectOverview } from "@/components/task-management/projects";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectOverview id={id} />;
}
