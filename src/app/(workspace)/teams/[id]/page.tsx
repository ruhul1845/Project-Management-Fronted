import { TeamDetail } from "@/components/workline/teams";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeamDetail id={id} />;
}
