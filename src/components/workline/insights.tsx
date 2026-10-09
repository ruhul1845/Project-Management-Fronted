"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Bell, CheckCheck, Clock3 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { api, json, messageOf, qs } from "@/lib/workline-api";
import type {
  Analytics,
  AuditLog,
  CalendarData,
  Notification,
  TaskStatus,
} from "@/lib/workline-types";
import { useAction, useUrlState } from "./hooks";
import { useWorkspace } from "./shell";
import {
  EmptyState,
  ErrorState,
  formatDate,
  LoadingBlock,
  PageHeading,
  StatusPill,
} from "./ui";

const statusNames: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};
export function CalendarView() {
  const { organization } = useWorkspace();
  const url = useUrlState();
  const monthParam = url.get("month");
  const parsed = /^\d{4}-\d{2}$/.test(monthParam)
    ? new Date(`${monthParam}-01T00:00:00`)
    : new Date();
  const month = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const from = new Date(year, monthIndex, 1);
  const to = new Date(year, monthIndex + 1, 0, 23, 59, 59);
  const days = to.getDate();
  const offset = from.getDay();
  const calendar = useQuery({
    queryKey: ["calendar", organization?.id, year, monthIndex],
    queryFn: async () =>
      (
        await api<CalendarData>(
          `calendar?${qs({ organizationId: organization?.id, from: from.toISOString(), to: to.toISOString() })}`,
        )
      ).data,
    enabled: Boolean(organization),
  });
  function change(delta: number) {
    const value = new Date(year, monthIndex + delta, 1);
    url.set({
      month: `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  const dateKey = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("en-CA") : "";
  return (
    <>
      <PageHeading
        eyebrow={organization?.name}
        title="Calendar"
        description="See deadlines and delivery cycles in one place."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => change(-1)}
              aria-label="Previous month"
              className="rounded-lg border p-2"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="min-w-30 text-center text-sm font-semibold">
              {from.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => change(1)}
              aria-label="Next month"
              className="rounded-lg border p-2"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        }
      />
      {calendar.isPending ? (
        <LoadingBlock />
      ) : calendar.isError ? (
        <ErrorState
          message={messageOf(calendar.error)}
          retry={() => calendar.refetch()}
        />
      ) : (
        <>
          <div className="panel overflow-hidden">
            <div className="grid grid-cols-7 border-b bg-slate-50 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-3">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ]
                .slice(0, offset)
                .map((weekday) => (
                  <div
                    key={weekday}
                    className="min-h-24 border-b border-r border-slate-100 bg-slate-50/40"
                  />
                ))}
              {Array.from({ length: days }, (_, index) => {
                const day = index + 1;
                const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const tasks =
                  calendar.data?.tasks.filter(
                    (task) => dateKey(task.dueDate) === key,
                  ) ?? [];
                return (
                  <div
                    key={key}
                    className="min-h-24 border-b border-r border-slate-100 p-2 md:min-h-32"
                  >
                    <span className="text-xs font-semibold text-slate-500">
                      {day}
                    </span>
                    <div className="mt-2 space-y-1">
                      {tasks.slice(0, 3).map((task) => (
                        <Link
                          key={task.id}
                          href={`/tasks/${task.id}`}
                          title={task.title}
                          className="block truncate rounded-md bg-blue-50 px-1.5 py-1 text-[10px] font-medium text-blue-700 md:text-xs"
                        >
                          {task.title}
                        </Link>
                      ))}
                      {tasks.length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{tasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <section className="panel p-6">
              <h2 className="font-semibold">Upcoming tasks</h2>
              <div className="mt-4 divide-y">
                {calendar.data?.tasks.slice(0, 6).map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="truncate">{task.title}</span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {formatDate(task.dueDate)}
                    </span>
                  </Link>
                ))}
                {!calendar.data?.tasks.length && (
                  <p className="py-5 text-sm text-slate-500">
                    No due tasks this month.
                  </p>
                )}
              </div>
            </section>
            <section className="panel p-6">
              <h2 className="font-semibold">Sprints this month</h2>
              <div className="mt-4 divide-y">
                {calendar.data?.sprints.slice(0, 6).map((sprint) => (
                  <div
                    key={sprint.id}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="truncate">{sprint.name}</span>
                    <StatusPill status={sprint.status} />
                  </div>
                ))}
                {!calendar.data?.sprints.length && (
                  <p className="py-5 text-sm text-slate-500">
                    No sprints in this range.
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}
export function Notifications() {
  const url = useUrlState();
  const act = useAction();
  const page = Math.max(1, Number(url.get("page")) || 1);
  const unread = url.get("unread") === "true";
  const list = useQuery({
    queryKey: ["notifications", page, unread],
    queryFn: () =>
      api<Notification[]>(
        `notifications?${qs({ page, limit: 20, unread: unread ? "true" : undefined })}`,
      ),
  });
  return (
    <>
      <PageHeading
        eyebrow="Your updates"
        title="Notifications"
        description="Important changes, assignments, and mentions in one place."
        action={
          <button
            type="button"
            onClick={() =>
              act(
                () => api("notifications/read-all", json("PATCH")),
                "All notifications marked read",
                [["notifications"]],
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        }
      />
      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => url.set({ unread: null, page: 1 })}
          className={`rounded-xl px-4 py-2 text-sm ${!unread ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => url.set({ unread: "true", page: 1 })}
          className={`rounded-xl px-4 py-2 text-sm ${unread ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
        >
          Unread
        </button>
      </div>
      {list.isPending ? (
        <LoadingBlock />
      ) : list.isError ? (
        <ErrorState
          message={messageOf(list.error)}
          retry={() => list.refetch()}
        />
      ) : list.data?.data.length ? (
        <div className="panel divide-y divide-slate-100">
          {list.data.data.map((note) => (
            <div key={note.id} className="flex gap-4 p-5">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${note.readAt ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600"}`}
              >
                <Bell size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold">{note.title}</h2>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{note.message}</p>
                {!note.readAt && (
                  <button
                    type="button"
                    onClick={() =>
                      act(
                        () =>
                          api(`notifications/${note.id}/read`, json("PATCH")),
                        "Marked read",
                        [["notifications"]],
                      )
                    }
                    className="mt-2 text-xs font-semibold text-blue-600"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="All caught up"
          detail="New updates will show up here."
        />
      )}
      {list.data && (
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
            disabled={page >= (list.data.meta?.totalPages ?? 1)}
            onClick={() => url.set({ page: page + 1 })}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
export function AnalyticsView() {
  const { organization, canManage } = useWorkspace();
  const data = useQuery({
    queryKey: ["analytics", organization?.id],
    queryFn: async () =>
      (
        await api<Analytics>(
          `analytics/dashboard?${qs({ organizationId: organization?.id })}`,
        )
      ).data,
    enabled: Boolean(organization && canManage),
  });
  if (!canManage)
    return (
      <ErrorState message="Only owners and managers can view analytics." />
    );
  const counts = data.data?.tasksByStatus ?? {};
  const max = Math.max(1, ...Object.values(counts));
  return (
    <>
      <PageHeading
        eyebrow={organization?.name}
        title="Analytics"
        description="See how your team is progressing across the workspace."
      />
      {data.isPending ? (
        <LoadingBlock />
      ) : data.isError ? (
        <ErrorState
          message={messageOf(data.error)}
          retry={() => data.refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Projects", value: data.data?.projects ?? 0 },
              { label: "Tasks", value: data.data?.tasks ?? 0 },
              { label: "Members", value: data.data?.members ?? 0 },
            ].map((item) => (
              <div key={item.label} className="panel p-6">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="panel mt-6 p-7">
            <h2 className="text-lg font-semibold">Tasks by status</h2>
            <p className="mt-1 text-sm text-slate-500">
              A live view of work across your projects.
            </p>
            <div className="mt-8 space-y-5">
              {(Object.keys(statusNames) as TaskStatus[]).map((status) => (
                <div
                  key={status}
                  className="grid grid-cols-[100px_1fr_30px] items-center gap-4 text-sm"
                >
                  <span className="text-slate-600">{statusNames[status]}</span>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${((counts[status] ?? 0) / max) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-right font-semibold">
                    {counts[status] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
export function AuditView() {
  const { organization, canManage } = useWorkspace();
  const url = useUrlState();
  const page = Math.max(1, Number(url.get("page")) || 1);
  const data = useQuery({
    queryKey: ["audit", organization?.id, page],
    queryFn: () =>
      api<AuditLog[]>(
        `analytics/audit-logs?${qs({ organizationId: organization?.id, page, limit: 20 })}`,
      ),
    enabled: Boolean(organization && canManage),
  });
  if (!canManage)
    return (
      <ErrorState message="Only owners and managers can view the activity log." />
    );
  return (
    <>
      <PageHeading
        eyebrow={organization?.name}
        title="Activity log"
        description="A clear record of important workspace changes."
      />
      {data.isPending ? (
        <LoadingBlock />
      ) : data.isError ? (
        <ErrorState
          message={messageOf(data.error)}
          retry={() => data.refetch()}
        />
      ) : data.data?.data.length ? (
        <div className="panel divide-y divide-slate-100">
          {data.data.data.map((log) => (
            <div key={log.id} className="flex gap-4 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <Clock3 size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold capitalize">
                  {log.action.replaceAll("_", " ").toLowerCase()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {log.actor?.name ?? "System"} · {log.entity} ·{" "}
                  {formatDate(log.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activity yet"
          detail="Workspace changes will appear here."
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
    </>
  );
}
export function CalendarPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <CalendarView />
    </Suspense>
  );
}
export function NotificationsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Notifications />
    </Suspense>
  );
}
export function AuditPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <AuditView />
    </Suspense>
  );
}
