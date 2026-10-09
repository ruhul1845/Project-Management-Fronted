import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendBase, refreshSession } from "@/lib/backend-session";
import type { ApiResponse, User } from "@/lib/task-management-types";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let token = (await cookies()).get("wl_access")?.value;
  let response = token
    ? await fetch(`${backendBase}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).catch(() => null)
    : null;
  if (!response?.ok) {
    token = (await refreshSession())?.accessToken;
    response = token
      ? await fetch(`${backendBase}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }).catch(() => null)
      : null;
  }
  if (!response?.ok) redirect("/login");
  const payload = (await response.json()) as ApiResponse<User>;
  if (payload.data.role !== "ADMIN") redirect("/workspace");
  return children;
}
