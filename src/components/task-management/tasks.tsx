"use client";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Paperclip, Plus, Search, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import { api, json, messageOf, qs } from "@/lib/task-management-api";
import type {
  KanbanData,
  Label,
  Member,
  Priority,
  Task,
  TaskStatus,
} from "@/lib/task-management-types";
import { useAction, useUrlState } from "./hooks";
import { useWorkspace } from "./shell";
import {
  EmptyState,
  ErrorState,
  formatDate,
  initials,
  LoadingBlock,
  PageHeading,
  PriorityPill,
  StatusPill,
} from "./ui";

const statuses: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED",
];
const transitions: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["TODO", "IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["IN_PROGRESS", "DONE", "CANCELLED"],
  DONE: ["IN_PROGRESS"],
  CANCELLED: ["TODO"],
};
const labels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};
const taskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string(),
  assigneeId: z.string(),
});

export function TaskCreator({
  projectId,
  parentId,
  onClose,
}: {
  projectId: string;
  parentId?: string;
  onClose: () => void;
}) {
  const { organization, canManage } = useWorkspace();
  const act = useAction();
  const members = useQuery({
    queryKey: ["members", organization?.id, "assign"],
    queryFn: async () =>
      (
        await api<Member[]>(
          `organizations/${organization?.id}/members?limit=100`,
        )
      ).data,
    enabled: Boolean(organization && canManage),
  });
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM" as Priority,
      dueDate: "",
      assigneeId: "",
    },
    validators: { onSubmit: taskSchema },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () =>
          api(
            "tasks",
            json("POST", {
              projectId,
              parentId,
              title: value.title,
              description: value.description || undefined,
              priority: value.priority,
              dueDate: value.dueDate
                ? new Date(`${value.dueDate}T12:00:00`).toISOString()
                : undefined,
              assigneeId: value.assigneeId || undefined,
            }),
          ),
        parentId ? "Subtask created" : "Task created",
      );
      if (ok) onClose();
    },
  });
  return (
    <div className="panel mb-6 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {parentId ? "Add subtask" : "Create task"}
        </h2>
        <button
          type="button"
          className="text-sm text-slate-500"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="grid gap-4 md:grid-cols-2"
      >
        <form.Field name="title">
          {(field) => (
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="task-title">
                Task title
              </label>
              <input
                id="task-title"
                className="field"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="What needs to be done?"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-rose-600">
                  Enter a title between 2 and 200 characters.
                </p>
              )}
            </div>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                className="field h-24 py-3"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="priority">
          {(field) => (
            <div>
              <label className="field-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="field"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value as Priority)}
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>
        <form.Field name="dueDate">
          {(field) => (
            <div>
              <label className="field-label" htmlFor="task-due">
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                className="field"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
        {canManage && (
          <form.Field name="assigneeId">
            {(field) => (
              <div>
                <label className="field-label" htmlFor="task-assignee">
                  Assignee
                </label>
                <select
                  id="task-assignee"
                  className="field"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.data
                    ?.filter((member) => member.role !== "GUEST")
                    .map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </form.Field>
        )}
        <div className="flex items-end">
          <button
            type="submit"
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white"
          >
            Save task
          </button>
        </div>
      </form>
    </div>
  );
}
function TaskRow({ task }: { task: Task }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-blue-50/30"
    >
      <span className="size-4 shrink-0 rounded-full border-2 border-slate-300" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900">
          {task.title}
        </span>
        <span className="mt-1 block text-xs text-slate-500">
          {task.project?.name ?? task.assignee?.name ?? "Unassigned"} · Due{" "}
          {formatDate(task.dueDate)}
        </span>
      </span>
      <span className="hidden sm:block">
        <PriorityPill priority={task.priority} />
      </span>
      <StatusPill status={task.status} />
    </Link>
  );
}
export function ProjectTasks({ projectId }: { projectId: string }) {
  const url = useUrlState();
  const { role } = useWorkspace();
  const [search, setSearch] = useState(url.get("search"));
  const [createOpen, setCreateOpen] = useState(false);
  const page = Math.max(1, Number(url.get("page")) || 1);
  const tasks = useQuery({
    queryKey: [
      "tasks",
      projectId,
      page,
      url.get("status"),
      url.get("priority"),
      url.get("search"),
    ],
    queryFn: () =>
      api<Task[]>(
        `tasks?${qs({ projectId, page, limit: 15, status: url.get("status"), priority: url.get("priority"), search: url.get("search") })}`,
      ),
  });
  return (
    <>
      <Link
        href={`/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} /> Project overview
      </Link>
      <PageHeading
        eyebrow="Project work"
        title="Tasks"
        description="All the details, owners, and next steps in one view."
        action={
          role !== "GUEST" && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} /> Add task
            </button>
          )
        }
      />
      {createOpen && (
        <TaskCreator
          projectId={projectId}
          onClose={() => setCreateOpen(false)}
        />
      )}
      <div className="mb-5 flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            url.set({ search, page: 1 });
          }}
          className="relative flex-1 sm:max-w-xs"
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            aria-label="Search tasks"
            className="field field-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks"
          />
        </form>
        <select
          aria-label="Filter task status"
          className="field w-auto"
          value={url.get("status")}
          onChange={(e) => url.set({ status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {labels[value]}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter priority"
          className="field w-auto"
          value={url.get("priority")}
          onChange={(e) => url.set({ priority: e.target.value, page: 1 })}
        >
          <option value="">All priorities</option>
          {["LOW", "MEDIUM", "HIGH", "URGENT"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      {tasks.isPending ? (
        <LoadingBlock />
      ) : tasks.isError ? (
        <ErrorState
          message={messageOf(tasks.error)}
          retry={() => tasks.refetch()}
        />
      ) : tasks.data?.data.length ? (
        <>
          <div className="panel overflow-hidden">
            {tasks.data.data.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
          <div className="mt-5 flex justify-between text-sm text-slate-500">
            <span>{tasks.data.meta?.total ?? 0} tasks</span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => url.set({ page: page - 1 })}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-1 disabled:opacity-40"
                disabled={page >= (tasks.data.meta?.totalPages ?? 1)}
                onClick={() => url.set({ page: page + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No tasks found"
          detail="Try a different filter or create the first task."
        />
      )}
    </>
  );
}
export function MyTasks() {
  const url = useUrlState();
  const { organization } = useWorkspace();
  const page = Math.max(1, Number(url.get("page")) || 1);
  const status = url.get("status");
  const tasks = useQuery({
    queryKey: ["tasks", "mine", organization?.id, page, status],
    queryFn: async () => {
      if (!status)
        return api<Task[]>(
          `tasks/mine?${qs({ organizationId: organization?.id, page, limit: 20 })}`,
        );
      const first = await api<Task[]>(
        `tasks/mine?${qs({ organizationId: organization?.id, page: 1, limit: 100 })}`,
      );
      const pageCount = first.meta?.totalPages ?? 1;
      const remaining = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
          api<Task[]>(
            `tasks/mine?${qs({ organizationId: organization?.id, page: index + 2, limit: 100 })}`,
          ),
        ),
      );
      const filtered = [first, ...remaining]
        .flatMap((result) => result.data)
        .filter((task) => task.status === status);
      return {
        ...first,
        data: filtered.slice((page - 1) * 20, page * 20),
        meta: {
          page,
          limit: 20,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / 20),
        },
      };
    },
  });
  const filtered = tasks.data?.data;
  return (
    <>
      <PageHeading
        eyebrow="My work"
        title="My tasks"
        description="A focused view of the work assigned to you."
      />
      <div className="mb-5">
        <select
          aria-label="Filter status"
          className="field w-auto"
          value={url.get("status")}
          onChange={(e) => url.set({ status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {labels[value]}
            </option>
          ))}
        </select>
      </div>
      {tasks.isPending ? (
        <LoadingBlock />
      ) : tasks.isError ? (
        <ErrorState
          message={messageOf(tasks.error)}
          retry={() => tasks.refetch()}
        />
      ) : filtered?.length ? (
        <div className="panel overflow-hidden">
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your task list is clear"
          detail="Assigned work will appear here."
        />
      )}
      {tasks.data && (
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => url.set({ page: page - 1 })}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
            disabled={page >= (tasks.data.meta?.totalPages ?? 1)}
            onClick={() => url.set({ page: page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
export function Board({ projectId }: { projectId: string }) {
  const { role } = useWorkspace();
  const client = useQueryClient();
  const board = useQuery({
    queryKey: ["kanban", projectId],
    queryFn: async () =>
      (await api<KanbanData>(`tasks/kanban?${qs({ projectId })}`)).data,
  });
  const move = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api(`tasks/${id}/status`, json("PATCH", { status })),
    onMutate: async ({ id, status }) => {
      await client.cancelQueries({ queryKey: ["kanban", projectId] });
      const before = client.getQueryData<KanbanData>(["kanban", projectId]);
      if (before) {
        const columns = Object.fromEntries(
          Object.entries(before.columns).map(([key, tasks]) => [
            key,
            [...tasks],
          ]),
        ) as KanbanData["columns"];
        const task = Object.values(columns)
          .flat()
          .find((item) => item.id === id);
        if (task) {
          for (const key of statuses)
            columns[key] = columns[key].filter((item) => item.id !== id);
          columns[status].push({ ...task, status });
          client.setQueryData(["kanban", projectId], { ...before, columns });
        }
      }
      return { before };
    },
    onError: (error, _value, context) => {
      if (context?.before)
        client.setQueryData(["kanban", projectId], context.before);
      toast.add({
        title: "Could not move task",
        description: messageOf(error),
        type: "error",
      });
    },
    onSuccess: () => toast.add({ title: "Task moved", type: "success" }),
    onSettled: () => {
      client.invalidateQueries({ queryKey: ["kanban", projectId] });
      client.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
  return (
    <>
      <Link
        href={`/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} /> Project overview
      </Link>
      <PageHeading
        eyebrow="Visual workflow"
        title="Project board"
        description="See where work stands and move it forward."
      />
      {board.isPending ? (
        <LoadingBlock />
      ) : board.isError ? (
        <ErrorState
          message={messageOf(board.error)}
          retry={() => board.refetch()}
        />
      ) : (
        <div className="grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
          {statuses.map((status) => (
            <section
              key={status}
              className="min-w-60 rounded-2xl bg-[#f4f6fa] p-3"
            >
              <div className="mb-4 flex items-center justify-between px-2">
                <h2 className="text-sm font-semibold">{labels[status]}</h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                  {board.data?.columns[status]?.length ?? 0}
                </span>
              </div>
              <div className="space-y-3">
                {board.data?.columns[status]?.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-sm font-semibold hover:text-blue-600"
                    >
                      {task.title}
                    </Link>
                    <div className="mt-4 flex items-center justify-between">
                      <PriorityPill priority={task.priority} />
                      <span className="text-xs text-slate-400">
                        {task.assignee?.name ?? "Unassigned"}
                      </span>
                    </div>
                    {role !== "GUEST" && (
                      <select
                        aria-label={`Move ${task.title}`}
                        className="mt-4 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                        value=""
                        onChange={(e) =>
                          move.mutate({
                            id: task.id,
                            status: e.target.value as TaskStatus,
                          })
                        }
                      >
                        <option value="">Move to...</option>
                        {transitions[status].map((next) => (
                          <option key={next} value={next}>
                            {labels[next]}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
                {!board.data?.columns[status]?.length && (
                  <p className="px-2 py-8 text-center text-xs text-slate-400">
                    No tasks here
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
export function TaskDetail({ id }: { id: string }) {
  const { role, organization, canManage, user } = useWorkspace();
  const act = useAction();
  const [subtaskOpen, setSubtaskOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadName, setUploadName] = useState("");
  const client = useQueryClient();
  const task = useQuery({
    queryKey: ["task", id],
    queryFn: async () => (await api<Task>(`tasks/${id}`)).data,
  });
  const members = useQuery({
    queryKey: ["members", organization?.id, "assign"],
    queryFn: async () =>
      (
        await api<Member[]>(
          `organizations/${organization?.id}/members?limit=100`,
        )
      ).data,
    enabled: Boolean(organization && role !== "GUEST"),
  });
  const availableLabels = useQuery({
    queryKey: ["labels", organization?.id],
    queryFn: async () =>
      (await api<Label[]>(`labels?${qs({ organizationId: organization?.id })}`))
        .data,
    enabled: Boolean(organization),
  });
  const comment = useForm({
    defaultValues: { content: "", mentionedUserIds: [] as string[] },
    validators: {
      onSubmit: z.object({
        content: z.string().min(1).max(3000),
        mentionedUserIds: z.array(z.uuid()).max(20),
      }),
    },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () => api("comments", json("POST", { taskId: id, ...value })),
        "Comment added",
        [["task", id]],
      );
      if (ok) comment.reset();
    },
  });
  function upload(file?: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.add({
        title: "File is too large",
        description: "Choose a file under 10 MB.",
        type: "error",
      });
      return;
    }
    setUploadName(file.name);
    setUploadProgress(0);
    const body = new FormData();
    body.append("file", file);
    const request = new XMLHttpRequest();
    request.open("POST", `/api/backend/tasks/${id}/attachments`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      setUploadProgress(null);
      try {
        const result = JSON.parse(request.responseText);
        if (request.status < 200 || request.status >= 300 || !result.success)
          throw new Error(result.message ?? "Upload failed");
        client.invalidateQueries({ queryKey: ["task", id] });
        toast.add({ title: "File attached", type: "success" });
      } catch (error) {
        toast.add({
          title: "Upload failed",
          description: messageOf(error),
          type: "error",
        });
      }
    };
    request.onerror = () => {
      setUploadProgress(null);
      toast.add({
        title: "Upload failed",
        description: "Check your connection and try again.",
        type: "error",
      });
    };
    request.send(body);
  }
  if (task.isPending) return <LoadingBlock />;
  if (task.isError || !task.data)
    return (
      <ErrorState
        message={messageOf(task.error)}
        retry={() => task.refetch()}
      />
    );
  const item = task.data;
  return (
    <>
      <Link
        href={`/projects/${item.projectId}/tasks`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} /> Project tasks
      </Link>
      <PageHeading
        eyebrow="Task details"
        title={item.title}
        description={item.description || "No description added yet."}
        action={<StatusPill status={item.status} />}
      />
      <div className="grid gap-6 xl:grid-cols-[1.65fr_.8fr]">
        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="font-semibold">Subtasks</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {item.subtasks?.map((subtask) => (
                <Link
                  key={subtask.id}
                  href={`/tasks/${subtask.id}`}
                  className="flex items-center gap-3 py-3 text-sm hover:text-blue-600"
                >
                  <span className="size-4 rounded-full border border-slate-300" />
                  {subtask.title}
                  <span className="ml-auto">
                    <StatusPill status={subtask.status} />
                  </span>
                </Link>
              ))}
              {!item.subtasks?.length && (
                <p className="py-4 text-sm text-slate-500">No subtasks yet.</p>
              )}
            </div>
            {role !== "GUEST" && (
              <button
                type="button"
                onClick={() => setSubtaskOpen(!subtaskOpen)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
              >
                <Plus size={16} /> Add subtask
              </button>
            )}
            {subtaskOpen && (
              <div className="mt-5">
                <TaskCreator
                  projectId={item.projectId}
                  parentId={item.id}
                  onClose={() => {
                    setSubtaskOpen(false);
                    client.invalidateQueries({ queryKey: ["task", id] });
                  }}
                />
              </div>
            )}
          </section>
          <section className="panel p-6">
            <h2 className="font-semibold">Conversation</h2>
            <div className="mt-5 space-y-5">
              {item.comments?.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {initials(entry.author.name)}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {entry.author.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {entry.content}
                    </p>
                    {entry.mentions && entry.mentions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.mentions.map(({ user: mentioned }) => (
                          <span
                            key={mentioned.id}
                            className="text-xs font-semibold text-blue-600"
                          >
                            @{mentioned.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!item.comments?.length && (
                <p className="text-sm text-slate-500">
                  No comments yet. Start the conversation.
                </p>
              )}
            </div>
            {role !== "GUEST" && (
              <form
                className="mt-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  comment.handleSubmit();
                }}
              >
                <comment.Field name="content">
                  {(field) => (
                    <div>
                      <label className="field-label" htmlFor="comment">
                        Add a comment
                      </label>
                      <textarea
                        id="comment"
                        className="field h-24 py-3"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Share an update or ask a question..."
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-xs text-rose-600">
                          Enter a comment.
                        </p>
                      )}
                    </div>
                  )}
                </comment.Field>
                <comment.Field name="mentionedUserIds">
                  {(field) => (
                    <div className="mt-4">
                      <p className="field-label">Mention teammates</p>
                      <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                        {members.data
                          ?.filter((member) => member.user.id !== user.id)
                          .map((member) => {
                            const selected = field.state.value.includes(
                              member.user.id,
                            );
                            return (
                              <label
                                key={member.id}
                                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium ${selected ? "border-blue-300 text-blue-700" : "border-slate-200 text-slate-600"}`}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={selected}
                                  disabled={
                                    !selected && field.state.value.length >= 20
                                  }
                                  onChange={() =>
                                    field.handleChange(
                                      selected
                                        ? field.state.value.filter(
                                            (id) => id !== member.user.id,
                                          )
                                        : [
                                            ...field.state.value,
                                            member.user.id,
                                          ],
                                    )
                                  }
                                />
                                @{member.user.name}
                              </label>
                            );
                          })}
                        {members.isPending && (
                          <span className="text-xs text-slate-500">
                            Loading teammates…
                          </span>
                        )}
                        {members.isSuccess &&
                          !members.data?.some(
                            (member) => member.user.id !== user.id,
                          ) && (
                            <span className="text-xs text-slate-500">
                              No teammates available to mention.
                            </span>
                          )}
                        {members.isError && (
                          <span className="text-xs text-rose-600">
                            Teammates could not be loaded.
                          </span>
                        )}
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-xs text-rose-600">
                          Select up to 20 teammates.
                        </p>
                      )}
                    </div>
                  )}
                </comment.Field>
                <button
                  type="submit"
                  className="mt-3 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Post comment
                </button>
              </form>
            )}
          </section>
          <section className="panel p-6">
            <h2 className="font-semibold">Files</h2>
            <div className="mt-4 space-y-2">
              {item.attachments?.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 text-sm text-blue-600"
                >
                  <Paperclip size={16} />
                  {file.name}
                </a>
              ))}
              {!item.attachments?.length && (
                <p className="text-sm text-slate-500">No files attached.</p>
              )}
            </div>
            {role !== "GUEST" && (
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium">
                <UploadCloud size={16} /> Upload file
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
                  className="sr-only"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </label>
            )}
            {uploadProgress !== null && (
              <div className="mt-3 max-w-xs">
                <p className="mb-1 truncate text-xs text-slate-500">
                  Uploading {uploadName} · {uploadProgress}%
                </p>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
        <aside className="space-y-6">
          <section className="panel p-6">
            <h2 className="font-semibold">Details</h2>
            <dl className="mt-5 space-y-5 text-sm">
              <div>
                <dt className="text-slate-500">Priority</dt>
                <dd className="mt-1">
                  <PriorityPill priority={item.priority} />
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Due date</dt>
                <dd className="mt-1 font-medium">{formatDate(item.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Assignee</dt>
                <dd className="mt-1 font-medium">
                  {item.assignee?.name ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Reporter</dt>
                <dd className="mt-1 font-medium">
                  {item.reporter?.name ?? "—"}
                </dd>
              </div>
            </dl>
            {availableLabels.data && availableLabels.data.length > 0 && (
              <div className="mt-6 border-t pt-5">
                <p className="field-label">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {availableLabels.data.map((label) => {
                    const selected =
                      item.labels?.some(
                        (entry) => entry.label.id === label.id,
                      ) ?? false;
                    return (
                      <button
                        key={label.id}
                        type="button"
                        disabled={role === "GUEST"}
                        onClick={() =>
                          act(
                            () =>
                              api(
                                `labels/${label.id}/tasks/${id}`,
                                json(selected ? "DELETE" : "POST"),
                              ),
                            selected ? "Label removed" : "Label added",
                            [["task", id]],
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {role !== "GUEST" && (
              <div className="mt-6 border-t pt-5">
                <label className="field-label" htmlFor="task-status">
                  Move task
                </label>
                <select
                  id="task-status"
                  className="field"
                  value=""
                  onChange={(e) =>
                    act(
                      () =>
                        api(
                          `tasks/${id}/status`,
                          json("PATCH", { status: e.target.value }),
                        ),
                      "Task moved",
                      [
                        ["task", id],
                        ["kanban", item.projectId],
                      ],
                    )
                  }
                >
                  <option value="">Choose next status</option>
                  {transitions[item.status].map((next) => (
                    <option key={next} value={next}>
                      {labels[next]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {canManage && (
              <div className="mt-5">
                <label className="field-label" htmlFor="assign-task">
                  Assign to
                </label>
                <select
                  id="assign-task"
                  className="field"
                  value={item.assigneeId ?? ""}
                  onChange={(e) =>
                    act(
                      () =>
                        api(
                          `tasks/${id}/assign`,
                          json("PATCH", { assigneeId: e.target.value || null }),
                        ),
                      "Assignment updated",
                      [["task", id]],
                    )
                  }
                >
                  <option value="">Unassigned</option>
                  {members.data
                    ?.filter((member) => member.role !== "GUEST")
                    .map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </section>
          <section className="panel p-6">
            <h2 className="font-semibold">Activity</h2>
            <div className="mt-5 space-y-4">
              {item.activity?.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex gap-3 text-xs">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium text-slate-700">
                      {entry.action.replaceAll("_", " ").toLowerCase()}
                    </p>
                    <p className="mt-1 text-slate-400">
                      {entry.actor?.name ?? "System"} ·{" "}
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {!item.activity?.length && (
                <p className="text-sm text-slate-500">No activity yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
export function MyTasksPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <MyTasks />
    </Suspense>
  );
}
export function ProjectTasksPage({ projectId }: { projectId: string }) {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ProjectTasks projectId={projectId} />
    </Suspense>
  );
}
