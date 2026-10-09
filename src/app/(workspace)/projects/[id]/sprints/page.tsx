import Sprints from "@/components/task-management/sprints";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Sprints projectId={id} />;
}
