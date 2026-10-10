"use client";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Search, Trash2, UsersRound } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { z } from "zod";
import { api, json, messageOf, qs } from "@/lib/task-management-api";
import type { Member, Team } from "@/lib/task-management-types";
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

export function Teams() {
  const { organization, canManage } = useWorkspace();
  const act = useAction();
  const url = useUrlState();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(url.get("search"));
  const teams = useQuery({
    queryKey: ["teams", organization?.id, url.get("search")],
    queryFn: async () =>
      (
        await api<Team[]>(
          `teams?${qs({ organizationId: organization?.id, search: url.get("search") })}`,
        )
      ).data,
    enabled: Boolean(organization),
  });
  const form = useForm({
    defaultValues: { name: "", description: "" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500),
      }),
    },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () =>
          api(
            "teams",
            json("POST", { organizationId: organization?.id, ...value }),
          ),
        "Team created",
        [["teams"]],
      );
      if (ok) {
        setOpen(false);
        form.reset();
      }
    },
  });
  return (
    <>
      <PageHeading
        eyebrow={organization?.name ?? "Workspace"}
        title="Teams"
        description="Keep the right people connected to the right projects."
        action={
          canManage && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} /> New team
            </button>
          )
        }
      />
      {open && (
        <div className="panel mb-6 p-6">
          <h2 className="mb-5 text-lg font-semibold">Create a team</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <form.Field name="name">
              {(field) => (
                <div>
                  <label className="field-label" htmlFor="team-name">
                    Team name
                  </label>
                  <input
                    id="team-name"
                    className="field"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-rose-600">
                      Enter at least 2 characters.
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <div>
                  <label className="field-label" htmlFor="team-description">
                    Description
                  </label>
                  <input
                    id="team-description"
                    className="field"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <div className="flex gap-2">
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
                  >
                    {isSubmitting ? "Creating team…" : "Create team"}
                  </button>
                )}
              </form.Subscribe>
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
      <form
        onSubmit={(event) => {
          event.preventDefault();
          url.set({ search });
        }}
        className="relative mb-5 max-w-sm"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field field-search"
          aria-label="Search teams"
          placeholder="Search teams"
        />
      </form>
      {!organization ? (
        <EmptyState
          title="No workspace selected"
          detail="Create or select a workspace to see teams."
        />
      ) : teams.isPending ? (
        <LoadingBlock />
      ) : teams.isError ? (
        <ErrorState
          message={messageOf(teams.error)}
          retry={() => teams.refetch()}
        />
      ) : teams.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.data.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="panel p-6 hover:border-blue-200"
            >
              <UsersRound size={24} className="text-blue-600" />
              <h2 className="mt-5 text-lg font-semibold">{team.name}</h2>
              <p className="mt-2 min-h-10 text-sm text-slate-500">
                {team.description ||
                  "Open the team to see members and projects."}
              </p>
              <p className="mt-5 border-t pt-4 text-xs text-slate-500">
                {team._count?.members ?? 0} members ·{" "}
                {team._count?.projects ?? 0} projects
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No teams yet"
          detail="Create a team to organize members and their projects."
        />
      )}
    </>
  );
}
export function TeamDetail({ id }: { id: string }) {
  const { canManage, user } = useWorkspace();
  const act = useAction();
  const memberForm = useForm({
    defaultValues: { email: "", role: "MEMBER" },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        role: z.enum(["LEAD", "MEMBER", "VIEWER"]),
      }),
    },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () => api(`teams/${id}/members`, json("POST", value)),
        "Member added",
        [["team", id]],
      );
      if (ok) memberForm.reset();
    },
  });
  const team = useQuery({
    queryKey: ["team", id],
    queryFn: async () => (await api<Team>(`teams/${id}`)).data,
  });
  if (team.isPending) return <LoadingBlock />;
  if (team.isError || !team.data)
    return (
      <ErrorState
        message={messageOf(team.error)}
        retry={() => team.refetch()}
      />
    );
  const item = team.data;
  const canEdit =
    canManage ||
    item.members?.some(
      (member) => member.user?.id === user.id && member.role === "LEAD",
    );
  return (
    <>
      <Link
        href="/teams"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} /> All teams
      </Link>
      <PageHeading
        eyebrow="Team workspace"
        title={item.name}
        description={
          item.description || "People and projects connected to this team."
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Team members</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {item.members?.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-4">
                <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {initials(member.user?.name ?? "User")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {member.user?.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {member.user?.email}
                  </span>
                </span>
                <Pill tone={member.role === "LEAD" ? "blue" : "slate"}>
                  {member.role}
                </Pill>
                {canEdit && (
                  <button
                    type="button"
                    aria-label={`Remove ${member.user?.name}`}
                    onClick={() => {
                      if (confirm("Remove this team member?"))
                        act(
                          () =>
                            api(
                              `teams/${id}/members/${member.id}`,
                              json("DELETE"),
                            ),
                          "Member removed",
                          [["team", id]],
                        );
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {!item.members?.length && (
              <p className="py-4 text-sm text-slate-500">No members yet.</p>
            )}
          </div>
          {canEdit && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                memberForm.handleSubmit();
              }}
              className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-[1fr_auto_auto]"
            >
              <memberForm.Field name="email">
                {(field) => (
                  <div>
                    <input
                      className="field"
                      aria-label="Member email"
                      type="email"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Registered user's email"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-rose-600">
                        Enter a valid email.
                      </p>
                    )}
                  </div>
                )}
              </memberForm.Field>
              <memberForm.Field name="role">
                {(field) => (
                  <select
                    className="field w-auto"
                    aria-label="Team role"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="LEAD">Lead</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                )}
              </memberForm.Field>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"
              >
                Add member
              </button>
            </form>
          )}
        </section>
        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Linked projects</h2>
          <div className="mt-5 space-y-2">
            {item.projects?.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-xl border border-slate-100 p-4 text-sm font-medium hover:border-blue-200"
              >
                {project.name}
              </Link>
            ))}
            {!item.projects?.length && (
              <p className="text-sm text-slate-500">
                No projects linked to this team.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
export function Members() {
  const { organization, canManage, isOwner } = useWorkspace();
  const url = useUrlState();
  const act = useAction();
  const [search, setSearch] = useState(url.get("search"));
  const [open, setOpen] = useState(false);
  const memberForm = useForm({
    defaultValues: { email: "", role: "MEMBER" },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        role: z.enum(["MANAGER", "MEMBER", "GUEST"]),
      }),
    },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () =>
          api(`organizations/${organization?.id}/members`, json("POST", value)),
        "Member added",
        [["members", organization?.id ?? ""]],
      );
      if (ok) {
        memberForm.reset();
        setOpen(false);
      }
    },
  });
  const page = Math.max(1, Number(url.get("page")) || 1);
  const members = useQuery({
    queryKey: ["members", organization?.id, page, url.get("search")],
    queryFn: () =>
      api<Member[]>(
        `organizations/${organization?.id}/members?${qs({ page, limit: 15, search: url.get("search") })}`,
      ),
    enabled: Boolean(organization && canManage),
  });
  if (!canManage)
    return (
      <ErrorState message="Only workspace owners and managers can manage members." />
    );
  return (
    <>
      <PageHeading
        eyebrow={organization?.name}
        title="Members"
        description="Bring the right people into the workspace."
        action={
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Add member
          </button>
        }
      />
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            memberForm.handleSubmit();
          }}
          className="panel mb-6 grid gap-4 p-6 sm:grid-cols-[1fr_auto_auto]"
        >
          <div>
            <label className="field-label" htmlFor="member-email">
              Registered user email
            </label>
            <memberForm.Field name="email">
              {(field) => (
                <>
                  <input
                    id="member-email"
                    type="email"
                    required
                    className="field"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-rose-600">
                      Enter a valid email.
                    </p>
                  )}
                </>
              )}
            </memberForm.Field>
          </div>
          <div>
            <label className="field-label" htmlFor="member-role">
              Role
            </label>
            <memberForm.Field name="role">
              {(field) => (
                <select
                  id="member-role"
                  className="field"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="MANAGER">Manager</option>
                  <option value="MEMBER">Member</option>
                  <option value="GUEST">Guest</option>
                </select>
              )}
            </memberForm.Field>
          </div>
          <button
            type="submit"
            className="self-end rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Add
          </button>
        </form>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          url.set({ search, page: 1 });
        }}
        className="relative mb-5 max-w-sm"
      >
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field field-search"
          aria-label="Search members"
          placeholder="Search members"
        />
      </form>
      {members.isPending ? (
        <LoadingBlock />
      ) : members.isError ? (
        <ErrorState
          message={messageOf(members.error)}
          retry={() => members.refetch()}
        />
      ) : members.data?.data.length ? (
        <div className="panel overflow-hidden">
          <div className="divide-y divide-slate-100">
            {members.data.data.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <span className="grid size-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {initials(member.user.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {member.user.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {member.user.email}
                  </span>
                </span>
                {isOwner && member.role !== "OWNER" ? (
                  <select
                    aria-label={`Role for ${member.user.name}`}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    value={member.role}
                    onChange={(e) =>
                      act(
                        () =>
                          api(
                            `organizations/${organization?.id}/members/${member.id}`,
                            json("PATCH", { role: e.target.value }),
                          ),
                        "Role updated",
                        [["members", organization?.id ?? ""]],
                      )
                    }
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="MEMBER">Member</option>
                    <option value="GUEST">Guest</option>
                  </select>
                ) : (
                  <Pill tone={member.role === "OWNER" ? "blue" : "slate"}>
                    {member.role}
                  </Pill>
                )}
                {member.role !== "OWNER" && (
                  <button
                    type="button"
                    aria-label={`Remove ${member.user.name}`}
                    onClick={() => {
                      if (confirm("Remove this member from the workspace?"))
                        act(
                          () =>
                            api(
                              `organizations/${organization?.id}/members/${member.id}`,
                              json("DELETE"),
                            ),
                          "Member removed",
                          [["members", organization?.id ?? ""]],
                        );
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No members found"
          detail="Add a registered user or try a different search."
        />
      )}
      {members.data && (
        <div className="mt-5 flex justify-between text-sm text-slate-500">
          <span>{members.data.meta?.total ?? 0} members</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => url.set({ page: page - 1 })}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= (members.data.meta?.totalPages ?? 1)}
              onClick={() => url.set({ page: page + 1 })}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
export function MembersPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Members />
    </Suspense>
  );
}
export function TeamsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Teams />
    </Suspense>
  );
}
