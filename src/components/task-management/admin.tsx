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
type CreationPeriod = "day" | "week" | "month" | "year";
type CreationMetric = "users" | "organizations" | "projects" | "tasks";
interface CreationBucket {
  start: string;
  users: number;
  organizations: number;
  projects: number;
  tasks: number;
}
interface CreationStatistics {
  period: CreationPeriod;
  timezone: "UTC";
  from: string;
  to: string;
  buckets: CreationBucket[];
}
const creationMetrics: { label: string; key: CreationMetric; color: string }[] =
  [
    { label: "Users", key: "users", color: "bg-blue-600" },
    { label: "Organizations", key: "organizations", color: "bg-indigo-500" },
    { label: "Projects", key: "projects", color: "bg-sky-500" },
    { label: "Tasks", key: "tasks", color: "bg-cyan-500" },
  ];
const creationPeriods: { label: string; key: CreationPeriod }[] = [
  { label: "Day", key: "day" },
  { label: "Week", key: "week" },
  { label: "Month", key: "month" },
  { label: "Year", key: "year" },
];
function bucketLabel(
  start: string,
  period: CreationPeriod,
  index: number,
  count: number,
) {
  const date = new Date(start);
  if (period === "day")
    return index % 4 === 0 || index === count - 1
      ? new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          hourCycle: "h23",
          timeZone: "UTC",
        }).format(date)
      : "";
  if (period === "week")
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "UTC",
    }).format(date);
  if (period === "month")
    return index % 5 === 0 || index === count - 1
      ? String(date.getUTCDate())
      : "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
function CreationTrends() {
  const [period, setPeriod] = useState<CreationPeriod>("week");
  const [metric, setMetric] = useState<CreationMetric>("users");
  const data = useQuery({
    queryKey: ["admin", "creation-statistics", period],
    queryFn: async () =>
      (
        await api<CreationStatistics>(
          `admin/creation-statistics?period=${period}`,
        )
      ).data,
    retry: false,
    refetchInterval: 60000,
  });
  const selected =
    creationMetrics.find((item) => item.key === metric) ?? creationMetrics[0];
  const buckets = data.data?.buckets ?? [];
  const values = buckets.map((bucket) => bucket[metric]);
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartMax = Math.max(
    5,
    Math.ceil((Math.max(...values, 0) * 1.2) / 5) * 5,
  );
  return (
    <section className="panel p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Creation trends
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            New records this {period}, grouped in UTC.
          </p>
        </div>
        <fieldset className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <legend className="sr-only">Statistics period</legend>
          {creationPeriods.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={period === item.key}
              onClick={() => setPeriod(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${period === item.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {item.label}
            </button>
          ))}
        </fieldset>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {creationMetrics.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={metric === item.key}
            onClick={() => setMetric(item.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${metric === item.key ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {data.isPending ? (
        <div className="mt-8 h-72 animate-pulse rounded-xl bg-slate-50" />
      ) : data.isError ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
          Creation history is temporarily unavailable.
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">
            <span className="text-2xl font-semibold text-slate-950">
              {total}
            </span>{" "}
            {selected.label.toLowerCase()} created this {period}
          </p>
          <div className="mt-7 overflow-x-auto pb-2">
            <div
              style={{
                minWidth:
                  period === "day" || period === "month"
                    ? 900
                    : period === "year"
                      ? 700
                      : 520,
              }}
              role="img"
              aria-label={`${selected.label} created this ${period}: ${total}. ${values.map((value, index) => `Bucket ${index + 1}: ${value}`).join(", ")}`}
            >
              <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <div className="flex h-64 flex-col justify-between text-right text-xs text-slate-400">
                  <span>{chartMax}</span>
                  <span>{chartMax / 2}</span>
                  <span>0</span>
                </div>
                <div className="relative h-64 border-b border-slate-200">
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    <span className="border-t border-dashed border-slate-200" />
                    <span className="border-t border-dashed border-slate-200" />
                    <span />
                  </div>
                  <div
                    className="absolute inset-0 grid items-end gap-1 px-2 sm:gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {buckets.map((bucket, index) => (
                      <div
                        key={bucket.start}
                        className="flex h-full items-end justify-center"
                      >
                        <div
                          className={`relative w-full rounded-t-md ${selected.color}`}
                          style={{
                            height: values[index]
                              ? `${(values[index] / chartMax) * 100}%`
                              : 3,
                          }}
                          title={`${bucket.start}: ${values[index]} ${selected.label.toLowerCase()}`}
                        >
                          {values[index] > 0 && (
                            <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-[10px] font-semibold text-slate-700">
                              {values[index]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className="ml-11 grid gap-1 px-2 pt-3 text-center text-[10px] text-slate-500 sm:gap-2"
                style={{
                  gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
                }}
              >
                {buckets.map((bucket, index) => (
                  <span key={bucket.start}>
                    {bucketLabel(bucket.start, period, index, buckets.length)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {total === 0 && (
            <p className="mt-2 text-center text-xs text-slate-500">
              No new {selected.label.toLowerCase()} in this period.
            </p>
          )}
        </>
      )}
    </section>
  );
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
    refetchInterval: 60000,
  });
  const figures = [
    {
      label: "Users",
      value: data.data?.users ?? 0,
      icon: UsersRound,
      color: "bg-blue-600",
    },
    {
      label: "Organizations",
      value: data.data?.organizations ?? 0,
      icon: Building2,
      color: "bg-indigo-500",
    },
    {
      label: "Projects",
      value: data.data?.projects ?? 0,
      icon: FolderKanban,
      color: "bg-sky-500",
    },
    {
      label: "Tasks",
      value: data.data?.tasks ?? 0,
      icon: FolderKanban,
      color: "bg-cyan-500",
    },
    {
      label: "Blocked users",
      value: data.data?.blockedUsers ?? 0,
      icon: UsersRound,
      color: "bg-slate-500",
    },
  ];
  const chartMax = Math.max(
    5,
    Math.ceil((Math.max(...figures.map((item) => item.value)) * 1.2) / 5) * 5,
  );
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
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {figures.map(({ label, value, icon: Icon }) => (
              <div key={label} className="panel p-6">
                <Icon className="text-blue-600" size={20} />
                <p className="mt-6 text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <CreationTrends />
          <section className="panel p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-slate-950">
              Platform metrics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current totals across the platform.
            </p>
            <div
              className="mt-8"
              role="img"
              aria-label={figures
                .map(({ label, value }) => `${label}: ${value}`)
                .join(", ")}
            >
              <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <div className="flex h-64 flex-col justify-between text-right text-xs text-slate-400">
                  <span>{chartMax}</span>
                  <span>{chartMax / 2}</span>
                  <span>0</span>
                </div>
                <div className="relative h-64 border-b border-slate-200">
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    <span className="border-t border-dashed border-slate-200" />
                    <span className="border-t border-dashed border-slate-200" />
                    <span />
                  </div>
                  <div className="absolute inset-0 grid grid-cols-5 items-end gap-2 px-2 sm:gap-5 sm:px-5">
                    {figures.map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="flex h-full items-end justify-center"
                      >
                        <div
                          className={`relative w-full max-w-24 rounded-t-lg ${color}`}
                          style={{
                            height: value ? `${(value / chartMax) * 100}%` : 3,
                          }}
                        >
                          <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 text-xs font-semibold text-slate-700">
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ml-11 grid grid-cols-5 gap-2 px-2 pt-3 text-center text-[11px] text-slate-500 sm:gap-5 sm:px-5 sm:text-xs">
                {figures.map(({ label }) => (
                  <span key={label} className="min-w-0 break-words">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>
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
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="field field-search"
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
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="field field-search"
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
              <Building2 size={25} className="text-blue-600" />
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
