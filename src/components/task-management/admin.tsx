"use client";
import { useQuery } from "@tanstack/react-query";
import { Building2, FolderKanban, Search, UsersRound } from "lucide-react";
import { Suspense, useState } from "react";
import { api, json, messageOf, qs } from "@/lib/task-management-api";
import type { Organization, User } from "@/lib/task-management-types";
import { useAction, useUrlState } from "./hooks";
import { useWorkspace } from "./shell";
import {
  EmptyState,
  ErrorState,
  initials,
  LoadingBlock,
  PageHeading,
  Pill,
} from "./ui";

interface AdminMetrics {
  users: number;
  blockedUsers: number;
  organizations: number;
  projects: number;
  tasks: number;
}
function AdminGate({ children }: { children: React.ReactNode }) {
  const { user } = useWorkspace();
  return user.role === "ADMIN" ? (
    children
  ) : (
    <ErrorState message="Only system administrators can open this page." />
  );
}
export function AdminOverview() {
  const data = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await api<AdminMetrics>("admin/dashboard")).data,
  });
  return (
    <AdminGate>
      <PageHeading
        eyebrow="System administration"
        title="Platform overview"
        description="A live view of users, organizations, and work across the platform."
      />
      {data.isPending ? (
        <LoadingBlock />
      ) : data.isError ? (
        <ErrorState
          message={messageOf(data.error)}
          retry={() => data.refetch()}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Users", value: data.data?.users, icon: UsersRound },
            {
              label: "Organizations",
              value: data.data?.organizations,
              icon: Building2,
            },
            {
              label: "Projects",
              value: data.data?.projects,
              icon: FolderKanban,
            },
            { label: "Tasks", value: data.data?.tasks, icon: FolderKanban },
            {
              label: "Blocked users",
              value: data.data?.blockedUsers,
              icon: UsersRound,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="panel p-6">
              <Icon className="text-blue-600" size={20} />
              <p className="mt-6 text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value ?? 0}</p>
            </div>
          ))}
        </div>
      )}
    </AdminGate>
  );
}
export function AdminUsers() {
  const url = useUrlState();
  const act = useAction();
  const [search, setSearch] = useState(url.get("search"));
  const page = Math.max(1, Number(url.get("page")) || 1);
  const data = useQuery({
    queryKey: ["admin", "users", page, url.get("search"), url.get("status")],
    queryFn: () =>
      api<User[]>(
        `admin/users?${qs({ page, limit: 15, search: url.get("search"), status: url.get("status") })}`,
      ),
  });
  return (
    <AdminGate>
      <PageHeading
        eyebrow="System administration"
        title="Users"
        description="Review account access and platform roles."
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            url.set({ search, page: 1 });
          }}
          className="relative flex-1 sm:max-w-sm"
        >
          <Search className="absolute left-3 top-3 size-4 text-slate-400" />
          <input
            className="field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
            placeholder="Search users"
          />
        </form>
        <select
          className="field w-auto"
          aria-label="Filter user status"
          value={url.get("status")}
          onChange={(e) => url.set({ status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>
      {data.isPending ? (
        <LoadingBlock />
      ) : data.isError ? (
        <ErrorState
          message={messageOf(data.error)}
          retry={() => data.refetch()}
        />
      ) : data.data?.data.length ? (
        <div className="panel divide-y divide-slate-100">
          {data.data.data.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center gap-3 p-5"
            >
              <span className="grid size-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {initials(user.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{user.name}</span>
                <span className="block text-xs text-slate-500">
                  {user.email}
                </span>
              </span>
              <Pill tone={user.status === "BLOCKED" ? "rose" : "green"}>
                {user.status ?? "ACTIVE"}
              </Pill>
              <select
                aria-label={`Role for ${user.name}`}
                value={user.role}
                onChange={(e) =>
                  act(
                    () =>
                      api(
                        `admin/users/${user.id}/role`,
                        json("PATCH", { role: e.target.value }),
                      ),
                    "Role updated",
                    [["admin", "users"]],
                  )
                }
                className="rounded-lg border px-2 py-1.5 text-xs"
              >
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
                {user.role !== "ADMIN" && user.role !== "MEMBER" && (
                  <option value={user.role}>{user.role}</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `${user.status === "BLOCKED" ? "Activate" : "Block"} ${user.name}?`,
                    )
                  )
                    act(
                      () =>
                        api(
                          `admin/users/${user.id}/status`,
                          json("PATCH", {
                            status:
                              user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED",
                          }),
                        ),
                      "Status updated",
                      [["admin", "users"]],
                    );
                }}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              >
                {user.status === "BLOCKED" ? "Activate" : "Block"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No users found"
          detail="Try another search or status."
        />
      )}
      {data.data && (
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => url.set({ page: page - 1 })}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= (data.data.meta?.totalPages ?? 1)}
            onClick={() => url.set({ page: page + 1 })}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </AdminGate>
  );
}
export function AdminOrganizations() {
  const url = useUrlState();
  const [search, setSearch] = useState(url.get("search"));
  const page = Math.max(1, Number(url.get("page")) || 1);
  const data = useQuery({
    queryKey: ["admin", "organizations", page, url.get("search")],
    queryFn: () =>
      api<Organization[]>(
        `admin/organizations?${qs({ page, limit: 12, search: url.get("search") })}`,
      ),
  });
  return (
    <AdminGate>
      <PageHeading
        eyebrow="System administration"
        title="Organizations"
        description="See the workspaces using your platform."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          url.set({ search, page: 1 });
        }}
        className="relative mb-5 max-w-sm"
      >
        <Search className="absolute left-3 top-3 size-4 text-slate-400" />
        <input
          className="field pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search organizations"
          placeholder="Search organizations"
        />
      </form>
      {data.isPending ? (
        <LoadingBlock />
      ) : data.isError ? (
        <ErrorState
          message={messageOf(data.error)}
          retry={() => data.refetch()}
        />
      ) : data.data?.data.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.data.data.map((org) => (
            <div key={org.id} className="panel p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 size={21} />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{org.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {org.owner?.name ?? "Owner"} · {org.owner?.email}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Pill tone="blue">{org._count?.projects ?? 0} projects</Pill>
                <Pill>{org._count?.memberships ?? 0} members</Pill>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No organizations found"
          detail="Try another search term."
        />
      )}
      {data.data && (
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => url.set({ page: page - 1 })}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= (data.data.meta?.totalPages ?? 1)}
            onClick={() => url.set({ page: page + 1 })}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </AdminGate>
  );
}
export function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <AdminUsers />
    </Suspense>
  );
}
export function AdminOrganizationsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <AdminOrganizations />
    </Suspense>
  );
}
