"use client";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { api, json, messageOf, qs } from "@/lib/workline-api";
import type { Sprint } from "@/lib/workline-types";
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
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} /> New sprint
            </button>
          )
        }
      />
      {open && (
        <div className="panel mb-6 p-6">
          <h2 className="mb-5 text-lg font-semibold">Plan a sprint</h2>
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
                className="rounded-xl border px-5 py-2.5 text-sm"
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
        <div className="grid gap-4 md:grid-cols-2">
          {sprints.data.map((sprint) => (
            <div key={sprint.id} className="panel p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{sprint.name}</h2>
                <StatusPill status={sprint.status} />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {sprint.goal || "No goal added."}
              </p>
              <p className="mt-5 text-xs text-slate-500">
                {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)} ·{" "}
                {sprint._count?.tasks ?? 0} tasks
              </p>
              {canManage && (
                <div className="mt-5 border-t pt-4">
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
                      className="text-sm font-semibold text-blue-600"
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
                            api(`sprints/${sprint.id}/complete`, json("PATCH")),
                          "Sprint completed",
                          [["sprints", projectId]],
                        )
                      }
                      className="text-sm font-semibold text-blue-600"
                    >
                      Complete sprint
                    </button>
                  )}
                </div>
              )}
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
