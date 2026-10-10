"use client";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Flag, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { api, json, messageOf, qs } from "@/lib/task-management-api";
import type { Sprint } from "@/lib/task-management-types";
import { useAction } from "./hooks";
import { useWorkspace } from "./shell";
import {
  EmptyState,
  ErrorState,
  formatDate,
  LoadingBlock,
  PageHeading,
  StatusPill,
} from "./ui";
export default function Sprints({ projectId }: { projectId: string }) {
  const { canManage } = useWorkspace();
  const act = useAction();
  const [open, setOpen] = useState(false);
  const sprints = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: async () =>
      (await api<Sprint[]>(`sprints?${qs({ projectId })}`)).data,
  });
  const form = useForm({
    defaultValues: { name: "", goal: "", startDate: "", endDate: "" },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2).max(120),
          goal: z.string().max(1000),
          startDate: z.string().min(1),
          endDate: z.string().min(1),
        })
        .refine((value) => value.endDate > value.startDate, {
          message: "End date must follow start date",
        }),
    },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () =>
          api(
            "sprints",
            json("POST", {
              projectId,
              name: value.name,
              goal: value.goal || undefined,
              startDate: new Date(`${value.startDate}T00:00:00`).toISOString(),
              endDate: new Date(`${value.endDate}T23:59:59`).toISOString(),
            }),
          ),
        "Sprint created",
        [["sprints", projectId]],
      );
      if (ok) setOpen(false);
    },
  });
  return (
    <>
      <Link
        href={`/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700"
      >
        <ArrowLeft size={16} /> Project overview
      </Link>
      <PageHeading
        eyebrow="Focused delivery"
        title="Sprints"
        description="Plan a cycle, set a goal, and keep progress visible."
        action={
          canManage && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} /> New sprint
            </button>
          )
        }
      />
      {open && (
        <div className="panel mb-6 border-blue-200 p-6 shadow-lg shadow-slate-900/5">
          <h2 className="mb-5 text-xl font-bold text-slate-950">
            Plan a sprint
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            {(["name", "goal", "startDate", "endDate"] as const).map((name) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <div>
                    <label className="field-label" htmlFor={`sprint-${name}`}>
                      {name === "name"
                        ? "Sprint name"
                        : name === "goal"
                          ? "Goal"
                          : name === "startDate"
                            ? "Start date"
                            : "End date"}
                    </label>
                    <input
                      id={`sprint-${name}`}
                      type={name.endsWith("Date") ? "date" : "text"}
                      className="field"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-rose-600">
                        This field is required.
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            ))}
            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Create sprint
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {sprints.isPending ? (
        <LoadingBlock />
      ) : sprints.isError ? (
        <ErrorState
          message={messageOf(sprints.error)}
          retry={() => sprints.refetch()}
        />
      ) : sprints.data?.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {sprints.data.map((sprint) => (
            <div
              key={sprint.id}
              className="panel overflow-hidden border-slate-200 shadow-sm shadow-slate-900/5"
            >
              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-700">
                      <Flag size={20} />
                    </span>
                    <h2 className="text-xl font-bold text-slate-950">
                      {sprint.name}
                    </h2>
                  </div>
                  <StatusPill status={sprint.status} />
                </div>
                <p className="mt-5 min-h-10 text-sm leading-6 text-slate-700">
                  {sprint.goal ||
                    "Add a goal to give this sprint a clear outcome."}
                </p>
                <div className="mt-5 flex flex-wrap gap-3 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={15} className="text-blue-700" />
                    {formatDate(sprint.startDate)} –{" "}
                    {formatDate(sprint.endDate)}
                  </span>
                  <span className="ml-auto">
                    {sprint._count?.tasks ?? 0} tasks
                  </span>
                </div>
                {canManage && (
                  <div className="mt-5 border-t border-slate-200 pt-4">
                    {sprint.status === "PLANNED" && (
                      <button
                        type="button"
                        onClick={() =>
                          act(
                            () =>
                              api(`sprints/${sprint.id}/start`, json("PATCH")),
                            "Sprint started",
                            [["sprints", projectId]],
                          )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Start sprint
                      </button>
                    )}
                    {sprint.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() =>
                          act(
                            () =>
                              api(
                                `sprints/${sprint.id}/complete`,
                                json("PATCH"),
                              ),
                            "Sprint completed",
                            [["sprints", projectId]],
                          )
                        }
                        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                      >
                        Complete sprint
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No sprints planned"
          detail="Create a sprint to focus your next delivery cycle."
        />
      )}
    </>
  );
}
