import { TeamDetail } from "@/components/task-management/teams";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeamDetail id={id} />;
}
