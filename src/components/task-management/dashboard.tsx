"use client";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  Plus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { api, json, qs } from "@/lib/task-management-api";
import type {
  Analytics,
  Organization,
  Project,
  Task,
} from "@/lib/task-management-types";
import { useAction } from "./hooks";
import { useWorkspace } from "./shell";
import {
  EmptyState,
  ErrorState,
  formatDate,
  LoadingBlock,
  PageHeading,
  PriorityPill,
  StatusPill,
} from "./ui";

export function CreateWorkspace() {
  const client = useQueryClient();
  const router = useRouter();
  const { organizations, setOrganizationId } = useWorkspace();
  const act = useAction();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const form = useForm({
    defaultValues: { name: "", description: "" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500),
      }),
    },
    onSubmit: async ({ value }) => {
      let createdId = "";
      const ok = await act(
        async () => {
          const created = (
            await api<Organization>("organizations", json("POST", value))
          ).data;
          createdId = created.id;
          const workspace: Organization = {
            ...created,
            memberships: [{ role: "OWNER" }],
          };
          client.setQueryData<Organization[]>(
            ["organizations", "mine"],
            (old) => [
              workspace,
              ...(old ?? []).filter((item) => item.id !== workspace.id),
            ],
          );
        },
        "Workspace created",
        [["organizations", "mine"]],
      );
      if (ok && createdId) {
        setOrganizationId(createdId);
        void client.invalidateQueries({ queryKey: ["me"] });
        router.replace("/workspace");
      }
    },
  });
  return (
    <div className="mx-auto max-w-2xl py-10">
      <p className="eyebrow">Getting started · Step {step} of 2</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        {organizations.length
          ? "Create a new workspace."
          : "Make a home for your work."}
      </h1>
      <p className="mt-4 text-slate-500">
        Create an organization to bring your projects and teammates together.
      </p>
      {organizations.length > 0 && (
        <Link
          href="/workspace"
          className="mt-4 inline-block text-sm font-semibold text-blue-600"
        >
          Back to overview
        </Link>
      )}
      <div className="panel mt-9 p-7 md:p-9">
        <div className="mb-8 flex gap-2">
          <span
            className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-slate-100"}`}
          />
          <span
            className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-slate-100"}`}
          />
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold">Name your workspace</h2>
              <p className="mt-2 text-sm text-slate-500">
                Use your company, team, or organization name.
              </p>
              <form.Field name="name">
                {(field) => (
                  <div className="mt-7">
                    <label className="field-label" htmlFor="workspace-name">
                      Workspace name
                    </label>
                    <input
                      id="workspace-name"
                      className="field"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g. Acme Studio"
                    />
                  </div>
                )}
              </form.Field>
              {message && (
                <p className="mt-2 text-xs text-rose-600">{message}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  if (form.state.values.name.trim().length < 2)
                    setMessage("Enter at least 2 characters");
                  else {
                    setMessage("");
                    setStep(2);
                  }
                }}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Continue <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">Describe what you do</h2>
              <p className="mt-2 text-sm text-slate-500">
                A short description helps everyone recognize the workspace.
              </p>
              <form.Field name="description">
                {(field) => (
                  <div className="mt-7">
                    <label
                      className="field-label"
                      htmlFor="workspace-description"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      id="workspace-description"
                      className="field h-28 py-3"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="What does your team work on?"
                    />
                  </div>
                )}
              </form.Field>
              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
                >
                  Back
                </button>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
                    >
                      {isSubmitting
                        ? "Creating workspace…"
                        : "Create workspace"}
                    </button>
                  )}
                </form.Subscribe>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
export default function Dashboard() {
  const { organization, user, canManage, isPro } = useWorkspace();
  const orgId = organization?.id;
  const analytics = useQuery({
    queryKey: ["analytics", orgId],
    queryFn: async () =>
      (
        await api<Analytics>(
          `analytics/dashboard?${qs({ organizationId: orgId })}`,
        )
      ).data,
    enabled: Boolean(orgId && canManage && isPro),
  });
  const projects = useQuery({
    queryKey: ["projects", orgId, "recent"],
    queryFn: async () =>
      (
        await api<Project[]>(
          `projects?${qs({ organizationId: orgId, limit: 5 })}`,
        )
      ).data,
    enabled: Boolean(orgId),
  });
  const tasks = useQuery({
    queryKey: ["tasks", "mine", orgId],
    queryFn: async () =>
      (
        await api<Task[]>(
          `tasks/mine?${qs({ organizationId: orgId, limit: 5 })}`,
        )
      ).data,
    enabled: Boolean(orgId),
  });
  if (user.role === "ADMIN")
    return (
      <div>
        <PageHeading
          eyebrow="System administration"
          title="Administrator account"
          description="Manage platform users and organizations from the admin dashboard."
        />
        <Link
          href="/admin"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Open admin dashboard
        </Link>
      </div>
    );
  if (!organization) return <CreateWorkspace />;
  const stats =
    canManage && isPro && analytics.data
      ? [
          {
            label: "Total projects",
            value: analytics.data.projects,
            icon: FolderKanban,
          },
          {
            label: "Total tasks",
            value: analytics.data.tasks,
            icon: CircleDashed,
          },
          {
            label: "Team members",
            value: analytics.data.members,
            icon: UsersRound,
          },
          {
            label: "Completed tasks",
            value: analytics.data.tasksByStatus.DONE ?? 0,
            icon: CheckCircle2,
          },
        ]
      : [
          {
            label: "Projects",
            value: projects.data?.length ?? 0,
            icon: FolderKanban,
          },
          {
            label: "My tasks",
            value: tasks.data?.length ?? 0,
            icon: CircleDashed,
          },
          {
            label: "Completed",
            value:
              tasks.data?.filter((task) => task.status === "DONE").length ?? 0,
            icon: CheckCircle2,
          },
        ];
  return (
    <>
      <PageHeading
        eyebrow="Your workspace"
        title={`Good to see you, ${user.name.split(" ")[0]}.`}
        description={`Here’s what is moving across ${organization.name} today.`}
        action={
          canManage && (
            <Link
              href="/projects?create=1"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} /> New project
            </Link>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="panel p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon size={21} className="text-blue-600" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent projects</h2>
            <Link
              href="/projects"
              className="text-sm font-semibold text-blue-600"
            >
              View all
            </Link>
          </div>
          {projects.isPending ? (
            <LoadingBlock rows={3} />
          ) : projects.isError ? (
            <ErrorState
              message="Projects could not be loaded"
              retry={() => projects.refetch()}
            />
          ) : !projects.data?.length ? (
            <EmptyState
              title="No projects yet"
              detail="Create a project to give your team a clear place to work."
              action={
                canManage && (
                  <Link
                    href="/projects?create=1"
                    className="text-sm font-semibold text-blue-600"
                  >
                    Create project
                  </Link>
                )
              }
            />
          ) : (
            <div className="space-y-2">
              {projects.data.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <span className="text-xs font-bold tracking-wide text-blue-600">
                    {project.key.slice(0, 3)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {project.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {project._count?.tasks ?? 0} tasks
                    </span>
                  </span>
                  <StatusPill status={project.status} />
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My next tasks</h2>
            <Link
              href="/tasks/mine"
              className="text-sm font-semibold text-blue-600"
            >
              View all
            </Link>
          </div>
          {tasks.isPending ? (
            <LoadingBlock rows={3} />
          ) : tasks.isError ? (
            <ErrorState
              message="Tasks could not be loaded"
              retry={() => tasks.refetch()}
            />
          ) : !tasks.data?.length ? (
            <EmptyState
              title="Nothing assigned"
              detail="Tasks assigned to you will show up here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.data.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <span className="size-4 rounded-full border-2 border-slate-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {task.project?.name} · {formatDate(task.dueDate)}
                    </span>
                  </span>
                  <PriorityPill priority={task.priority} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
