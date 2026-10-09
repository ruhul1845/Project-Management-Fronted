"use client";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api, json, messageOf, qs } from "@/lib/task-management-api";
import type {
  Label,
  Organization,
  Team,
  User,
} from "@/lib/task-management-types";
import { useAction } from "./hooks";
import { useWorkspace } from "./shell";
import { EmptyState, ErrorState, LoadingBlock, PageHeading, Pill } from "./ui";

export function Billing() {
  const { organization, isOwner } = useWorkspace();
  const act = useAction();
  const [pending, setPending] = useState(false);
  const details = useQuery({
    queryKey: ["organization", organization?.id],
    queryFn: async () =>
      (await api<Organization>(`organizations/${organization?.id}`)).data,
    enabled: Boolean(organization),
  });
  async function checkout() {
    if (!organization) return;
    setPending(true);
    try {
      const result = await api<{ checkoutUrl?: string }>(
        "payments/checkout",
        json("POST", { organizationId: organization.id }),
      );
      if (!result.data.checkoutUrl)
        throw new Error("Stripe did not return a checkout link");
      window.location.assign(result.data.checkoutUrl);
    } catch (error) {
      await act(() => Promise.reject(error), "");
      setPending(false);
    }
  }
  if (!organization)
    return (
      <EmptyState
        title="No workspace selected"
        detail="Create a workspace before opening billing."
      />
    );
  if (!isOwner)
    return (
      <ErrorState message="Only the workspace owner can manage billing." />
    );
  return (
    <>
      <PageHeading
        eyebrow={organization.name}
        title="Billing"
        description="Manage the plan for your organization through secure Stripe Checkout."
      />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="panel p-7">
          <CreditCard size={28} className="text-blue-600" />
          <h2 className="mt-6 text-2xl font-semibold">
            Project Management Pro
          </h2>
          <p className="mt-3 leading-7 text-slate-500">
            Upgrade your selected organization using the backend&apos;s Stripe
            test checkout. You&apos;ll return here after payment.
          </p>
          <div className="mt-7 flex items-center gap-2 text-sm">
            <span className="text-slate-500">Subscription status</span>
            {details.isPending ? (
              <span className="skeleton h-5 w-20" />
            ) : (
              <Pill
                tone={
                  details.data?.subscriptionStatus === "ACTIVE"
                    ? "green"
                    : "slate"
                }
              >
                {details.data?.subscriptionStatus ?? "Inactive"}
              </Pill>
            )}
          </div>
          <button
            type="button"
            disabled={pending || details.data?.subscriptionStatus === "ACTIVE"}
            onClick={checkout}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {pending
              ? "Opening Stripe..."
              : details.data?.subscriptionStatus === "ACTIVE"
                ? "Plan active"
                : "Continue to Stripe"}
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="panel p-7">
          <ShieldCheck className="text-emerald-600" size={26} />
          <h2 className="mt-6 text-xl font-semibold">Secure payment flow</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Checkout is hosted by Stripe. The backend confirms payment using its
            signed webhook before activating the plan.
          </p>
          <p className="mt-6 text-xs text-slate-400">
            The final amount is shown in Stripe Checkout before payment.
          </p>
        </div>
      </div>
    </>
  );
}
export function PaymentReturn({ cancelled = false }: { cancelled?: boolean }) {
  const { organization } = useWorkspace();
  const details = useQuery({
    queryKey: ["organization", organization?.id, "payment-return"],
    queryFn: async () =>
      (await api<Organization>(`organizations/${organization?.id}`)).data,
    enabled: Boolean(organization && !cancelled),
    refetchInterval: (query) =>
      query.state.data?.subscriptionStatus === "ACTIVE" ? false : 5000,
  });
  const active = details.data?.subscriptionStatus === "ACTIVE";
  return (
    <div className="mx-auto max-w-xl py-14 text-center">
      <span
        className={`mx-auto inline-flex ${cancelled ? "text-amber-600" : active ? "text-emerald-600" : "text-blue-600"}`}
      >
        {cancelled ? <XCircle size={32} /> : <CheckCircle2 size={32} />}
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {cancelled
          ? "Checkout cancelled"
          : active
            ? "Your plan is active"
            : "Payment is being confirmed"}
      </h1>
      <p className="mt-3 text-slate-500">
        {cancelled
          ? "No plan change was confirmed. You can return to billing when you're ready."
          : active
            ? "Stripe confirmed your payment and your workspace plan is now active."
            : "Stripe returned you to Project Management. Your workspace will update after the payment webhook is confirmed."}
      </p>
      <Link
        href="/billing"
        className="mt-7 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Back to billing
      </Link>
    </div>
  );
}
export function Settings() {
  const { user, organization, role, isOwner } = useWorkspace();
  const act = useAction();
  const teams = useQuery({
    queryKey: ["profile-team-roles", organization?.id],
    queryFn: async () =>
      (await api<Team[]>(`teams?${qs({ organizationId: organization?.id })}`))
        .data,
    enabled: Boolean(organization),
  });
  const myTeams = teams.data?.filter((team) => team.members?.[0]?.role) ?? [];
  const profile = useForm({
    defaultValues: { name: user.name, avatarUrl: user.avatarUrl ?? "" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2).max(80),
        avatarUrl: z.union([z.url(), z.literal("")]),
      }),
    },
    onSubmit: async ({ value }) => {
      await act(
        () =>
          api<User>(
            "users/me",
            json("PATCH", {
              name: value.name,
              avatarUrl: value.avatarUrl || null,
            }),
          ),
        "Profile updated",
        [["me"]],
      );
    },
  });
  const orgForm = useForm({
    defaultValues: {
      name: organization?.name ?? "",
      description: organization?.description ?? "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500),
      }),
    },
    onSubmit: async ({ value }) => {
      await act(
        () => api(`organizations/${organization?.id}`, json("PATCH", value)),
        "Workspace updated",
        [["organizations"], ["organization"]],
      );
    },
  });
  useEffect(() => {
    profile.reset({ name: user.name, avatarUrl: user.avatarUrl ?? "" });
  }, [profile, user.name, user.avatarUrl]);
  useEffect(() => {
    orgForm.reset({
      name: organization?.name ?? "",
      description: organization?.description ?? "",
    });
  }, [orgForm, organization?.name, organization?.description]);
  const labels = useQuery({
    queryKey: ["labels", organization?.id],
    queryFn: async () =>
      (await api<Label[]>(`labels?organizationId=${organization?.id}`)).data,
    enabled: Boolean(organization),
  });
  const labelForm = useForm({
    defaultValues: { name: "", color: "#345ce6" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1).max(40),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      }),
    },
    onSubmit: async ({ value }) => {
      const ok = await act(
        () =>
          api(
            "labels",
            json("POST", { organizationId: organization?.id, ...value }),
          ),
        "Label created",
        [["labels", organization?.id ?? ""]],
      );
      if (ok) labelForm.reset();
    },
  });
  return (
    <>
      <PageHeading
        eyebrow="Preferences"
        title="Settings"
        description="Keep your profile and workspace details up to date."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-7">
          <h2 className="text-lg font-semibold">Your profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            The details teammates see across Project Management.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              profile.handleSubmit();
            }}
            className="mt-6 space-y-4"
          >
            <profile.Field name="name">
              {(field) => (
                <div>
                  <label className="field-label" htmlFor="profile-name">
                    Name
                  </label>
                  <input
                    id="profile-name"
                    className="field"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </profile.Field>
            <div>
              <span className="field-label">Email</span>
              <div className="field flex items-center bg-slate-50 text-slate-500">
                {user.email}
              </div>
            </div>
            <profile.Field name="avatarUrl">
              {(field) => (
                <div>
                  <label className="field-label" htmlFor="profile-avatar">
                    Avatar URL (optional)
                  </label>
                  <input
                    id="profile-avatar"
                    className="field"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
            </profile.Field>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Save profile
            </button>
          </form>
          <div className="mt-7 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold">Your roles</h3>
            <p className="mt-1 text-xs text-slate-500">
              Roles depend on the workspace and team you are working in.
            </p>
            {organization ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">
                      Workspace
                    </span>
                    <span className="block truncate text-sm font-medium">
                      {organization.name}
                    </span>
                  </span>
                  <Pill
                    tone={
                      role === "OWNER" || role === "MANAGER" ? "blue" : "slate"
                    }
                  >
                    {role ?? "No role"}
                  </Pill>
                </div>
                {teams.isPending ? (
                  <p className="text-xs text-slate-500">Loading team roles…</p>
                ) : teams.isError ? (
                  <p className="text-xs text-rose-600">
                    Could not load your team roles.
                  </p>
                ) : myTeams.length ? (
                  <ul className="space-y-2">
                    {myTeams.map((team) => (
                      <li
                        key={team.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                      >
                        <span className="min-w-0 truncate text-sm font-medium">
                          {team.name}
                        </span>
                        <Pill
                          tone={
                            team.members?.[0]?.role === "LEAD"
                              ? "blue"
                              : "slate"
                          }
                        >
                          {team.members?.[0]?.role ?? "MEMBER"}
                        </Pill>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">
                    You do not belong to a team in this workspace.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">
                Join or create a workspace to see your roles.
              </p>
            )}
          </div>
        </section>
        {isOwner && organization && (
          <section className="panel p-7">
            <h2 className="text-lg font-semibold">Workspace details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Give everyone a clear description of the organization.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                orgForm.handleSubmit();
              }}
              className="mt-6 space-y-4"
            >
              <orgForm.Field name="name">
                {(field) => (
                  <div>
                    <label className="field-label" htmlFor="org-name">
                      Name
                    </label>
                    <input
                      id="org-name"
                      className="field"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </orgForm.Field>
              <orgForm.Field name="description">
                {(field) => (
                  <div>
                    <label className="field-label" htmlFor="org-description">
                      Description
                    </label>
                    <textarea
                      id="org-description"
                      className="field h-24 py-3"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </orgForm.Field>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Save workspace
              </button>
            </form>
          </section>
        )}
      </div>
      {organization && (
        <section className="panel mt-6 p-7">
          <h2 className="text-lg font-semibold">Labels</h2>
          <p className="mt-1 text-sm text-slate-500">
            A simple visual language for organizing tasks.
          </p>
          {labels.isPending ? (
            <div className="mt-5">
              <LoadingBlock rows={2} />
            </div>
          ) : labels.isError ? (
            <ErrorState message={messageOf(labels.error)} />
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              {labels.data?.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                  {isOwner && (
                    <button
                      type="button"
                      aria-label={`Delete ${label.name}`}
                      onClick={() => {
                        if (confirm(`Delete label ${label.name}?`))
                          act(
                            () => api(`labels/${label.id}`, json("DELETE")),
                            "Label deleted",
                            [["labels", organization.id]],
                          );
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              {!labels.data?.length && (
                <p className="text-sm text-slate-500">No labels yet.</p>
              )}
            </div>
          )}
          {isOwner && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                labelForm.handleSubmit();
              }}
              className="mt-6 flex flex-wrap items-end gap-3 border-t pt-5"
            >
              <labelForm.Field name="name">
                {(field) => (
                  <div>
                    <label className="field-label" htmlFor="label-name">
                      New label
                    </label>
                    <input
                      id="label-name"
                      className="field"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Design"
                    />
                  </div>
                )}
              </labelForm.Field>
              <labelForm.Field name="color">
                {(field) => (
                  <div>
                    <label className="field-label" htmlFor="label-color">
                      Color
                    </label>
                    <input
                      id="label-color"
                      type="color"
                      className="field w-16 p-1.5"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </labelForm.Field>
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Add label
              </button>
            </form>
          )}
        </section>
      )}
    </>
  );
}
