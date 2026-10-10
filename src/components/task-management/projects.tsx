"use client";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDashed,
  FolderKanban,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { z } from "zod";
import { api, json, qs } from "@/lib/task-management-api";
import type { Project, ProjectStatus, Team } from "@/lib/task-management-types";
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

const projectSchema = z.object({
  name: z.string().min(2).max(120),
  key: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Z][A-Z0-9]*$/, "Use 2–10 uppercase letters and numbers"),
  description: z.string().max(2000),
  teamId: z.string(),
});
function ProjectCreator({ onClose }: { onClose: () => void }) {
  const { organization } = useWorkspace();
  const act = useAction();
  const teams = useQuery({
    queryKey: ["teams", organization?.id],
    queryFn: async () =>
      (await api<Team[]>(`teams?${qs({ organizationId: organization?.id })}`))
        .data,
    enabled: Boolean(organization),
  });
  const form = useForm({
    defaultValues: { name: "", key: "", description: "", teamId: "" },
    validators: { onSubmit: projectSchema },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () =>
          api(
            "projects",
            json("POST", {
              organizationId: organization?.id,
              name: value.name,
              key: value.key,
              description: value.description || undefined,
              teamId: value.teamId || undefined,
            }),
          ),
        "Project created",
        [["projects"], ["teams"], ["organizations", "mine"], ["analytics"]],
      );
      if (ok) onClose();
    },
  });
  return (
    <div className="panel mb-7 border-blue-200 p-6 shadow-lg shadow-slate-900/5 md:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="eyebrow">New project</p>
          <h2 className="mt-2 text-xl font-semibold">Give the work a home</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-slate-700 hover:text-blue-700"
        >
          Close
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
        className="grid gap-5 md:grid-cols-2"
      >
        <form.Field name="name">
          {(field) => (
            <div>
              <label htmlFor="project-name" className="field-label">
                Project name
              </label>
              <input
                id="project-name"
                className="field"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Website launch"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-rose-600">
                  Name must be 2–120 characters.
                </p>
              )}
            </div>
          )}
        </form.Field>
        <form.Field name="key">
          {(field) => (
            <div>
              <label htmlFor="project-key" className="field-label">
                Project key
              </label>
              <input
                id="project-key"
                className="field uppercase"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value.toUpperCase())
                }
                placeholder="WEB"
                maxLength={10}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-rose-600">
                  Use 2–10 uppercase letters and numbers.
                </p>
              )}
            </div>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <div className="md:col-span-2">
              <label htmlFor="project-description" className="field-label">
                Description
              </label>
              <textarea
                id="project-description"
                className="field h-24 py-3"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="What is this project about?"
              />
            </div>
          )}
        </form.Field>
        <form.Field name="teamId">
          {(field) => (
            <div>
              <label htmlFor="project-team" className="field-label">
                Team (optional)
              </label>
              <select
                id="project-team"
                className="field"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              >
                <option value="">Open to organization</option>
                {teams.data?.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>
        <div className="flex items-end">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? "Creating project…" : "Create project"}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
export function ProjectsContent() {
  const { organization, canManage } = useWorkspace();
  const url = useUrlState();
  const [search, setSearch] = useState(url.get("search"));
  const [createOpen, setCreateOpen] = useState(url.get("create") === "1");
  const page = Math.max(1, Number(url.get("page")) || 1);
  const status = url.get("status");
  const list = useQuery({
    queryKey: [
      "projects",
      organization?.id,
      page,
      status,
      url.get("search"),
      url.get("sortBy"),
    ],
    queryFn: () =>
      api<Project[]>(
        `projects?${qs({ organizationId: organization?.id, page, limit: 9, search: url.get("search"), status, sortBy: url.get("sortBy") || "createdAt" })}`,
      ),
    enabled: Boolean(organization),
  });
  if (!organization)
    return (
      <EmptyState
        title="Create a workspace first"
        detail="Projects belong to an organization."
        action={
          <Link
            href="/workspace"
            className="text-sm font-semibold text-blue-600"
          >
            Set up workspace
          </Link>
        }
      />
    );
  return (
    <>
      <PageHeading
        eyebrow={organization.name}
        title="Projects"
        description="A clear view of everything your team is moving forward."
        action={
          canManage && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} /> New project
            </button>
          )
        }
      />
      {createOpen && canManage && (
        <ProjectCreator onClose={() => setCreateOpen(false)} />
      )}
      <div className="panel mb-5 flex flex-wrap gap-3 p-4 shadow-sm shadow-slate-900/5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            url.set({ search, page: 1 });
          }}
          className="relative min-w-52 flex-1 sm:max-w-xs"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
          <input
            className="field field-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search projects"
            placeholder="Search projects"
          />
        </form>
        <select
          aria-label="Filter project status"
          className="field w-auto min-w-42"
          value={status}
          onChange={(e) => url.set({ status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          {["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"].map(
            (item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ),
          )}
        </select>
        <select
          aria-label="Sort projects"
          className="field w-auto min-w-40"
          value={url.get("sortBy") || "createdAt"}
          onChange={(e) => url.set({ sortBy: e.target.value, page: 1 })}
        >
          <option value="createdAt">Newest first</option>
          <option value="name">Name</option>
          <option value="dueDate">Due date</option>
        </select>
      </div>
      {list.isPending ? (
        <LoadingBlock />
      ) : list.isError ? (
        <ErrorState
          message="Projects could not be loaded"
          retry={() => list.refetch()}
        />
      ) : !list.data?.data.length ? (
        <EmptyState
          title="No projects found"
          detail={
            status || url.get("search")
              ? "Try another search or filter."
              : "Create the first project to start planning together."
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.data.data.map((project) => (
              <Link
                href={`/projects/${project.id}`}
                key={project.id}
                className="panel group border-slate-200 p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold tracking-wide text-blue-800">
                    {project.key}
                  </span>
                  <StatusPill status={project.status} />
                </div>
                <h2 className="mt-6 truncate text-xl font-bold text-slate-950 group-hover:text-blue-700">
                  {project.name}
                </h2>
                <p className="mt-2 line-clamp-2 h-10 text-sm leading-5 text-slate-700">
                  {project.description ||
                    "Open the project to see its tasks and progress."}
                </p>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs font-medium text-slate-700">
                  <span>
                    {project._count?.tasks ?? 0} tasks ·{" "}
                    {project.team?.name ?? "Organization"}
                  </span>
                  <span>{formatDate(project.dueDate)}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-slate-700">
            <span>
              {list.data.meta?.total ?? list.data.data.length} projects
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => url.set({ page: page - 1 })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= (list.data.meta?.totalPages ?? 1)}
                onClick={() => url.set({ page: page + 1 })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export function ProjectOverview({ id }: { id: string }) {
  const { canManage } = useWorkspace();
  const act = useAction();
  const project = useQuery({
    queryKey: ["project", id],
    queryFn: async () => (await api<Project>(`projects/${id}`)).data,
  });
  const [status, setStatus] = useState<ProjectStatus | "">("");
  if (project.isPending) return <LoadingBlock />;
  if (project.isError || !project.data)
    return (
      <ErrorState
        message="Project could not be loaded"
        retry={() => project.refetch()}
      />
    );
  const item = project.data;
  return (
    <>
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> All projects
      </Link>
      <PageHeading
        eyebrow={`${item.key} · Project`}
        title={item.name}
        description={
          item.description || "Keep all project work connected in one place."
        }
        action={<StatusPill status={item.status} />}
      />
      <div className="grid gap-5 md:grid-cols-3">
        <Link
          href={`/projects/${id}/board`}
          className="panel group border-slate-200 p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
        >
          <span className="inline-flex p-1 text-blue-700">
            <FolderKanban size={22} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-slate-950">Board</h2>
          <p className="mt-2 text-sm text-slate-700">
            Follow work across every stage.
          </p>
          <ArrowRight
            className="mt-5 text-blue-700 transition group-hover:translate-x-1"
            size={18}
          />
        </Link>
        <Link
          href={`/projects/${id}/tasks`}
          className="panel group border-slate-200 p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
        >
          <span className="inline-flex p-1 text-indigo-700">
            <CircleDashed size={22} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-slate-950">Tasks</h2>
          <p className="mt-2 text-sm text-slate-700">
            {item._count?.tasks ?? 0} tasks in this project.
          </p>
          <ArrowRight
            className="mt-5 text-blue-700 transition group-hover:translate-x-1"
            size={18}
          />
        </Link>
        <Link
          href={`/projects/${id}/sprints`}
          className="panel group border-slate-200 p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
        >
          <span className="inline-flex p-1 text-cyan-800">
            <CalendarDays size={22} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-slate-950">Sprints</h2>
          <p className="mt-2 text-sm text-slate-700">
            Plan focused delivery cycles.
          </p>
          <ArrowRight
            className="mt-5 text-blue-700 transition group-hover:translate-x-1"
            size={18}
          />
        </Link>
      </div>
      <div className="panel mt-6 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-bold text-slate-950">Project details</h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-700">Status</dt>
            <dd className="mt-1 font-medium">
              {item.status.replaceAll("_", " ")}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Team</dt>
            <dd className="mt-1 font-medium">
              {item.team?.name ?? "Organization-wide"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Start date</dt>
            <dd className="mt-1 font-medium">{formatDate(item.startDate)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Due date</dt>
            <dd className="mt-1 font-medium">{formatDate(item.dueDate)}</dd>
          </div>
        </dl>
        {canManage && (
          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <select
              aria-label="New status"
              className="field w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              <option value="">Change status</option>
              {["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"].map(
                (value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ),
              )}
            </select>
            <button
              type="button"
              disabled={!status}
              onClick={() =>
                act(
                  () => api(`projects/${id}`, json("PATCH", { status })),
                  "Project updated",
                  [["project", id], ["projects"]],
                )
              }
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Save status
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${item.name}? This will archive its work.`))
                  act(
                    () => api(`projects/${id}`, json("DELETE")),
                    "Project deleted",
                    [["projects"]],
                  ).then((ok) => {
                    if (ok) location.href = "/projects";
                  });
              }}
              className="ml-auto inline-flex items-center gap-2 text-sm text-rose-600"
            >
              <Trash2 size={15} /> Delete project
            </button>
          </div>
        )}
      </div>
    </>
  );
}
export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ProjectsContent />
    </Suspense>
  );
}
