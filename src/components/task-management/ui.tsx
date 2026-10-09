import { ArrowRight, Inbox, LoaderCircle } from "lucide-react";
import Link from "next/link";
import type { Priority, TaskStatus } from "@/lib/task-management-types";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-slate-900"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="size-10 shrink-0 text-slate-900"
        aria-hidden="true"
      >
        <path
          d="M15 8H9a5 5 0 0 0-5 5v27a5 5 0 0 0 5 5h30a5 5 0 0 0 5-5V13a5 5 0 0 0-5-5h-6"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <path
          d="M18 4h12a3 3 0 0 1 3 3v5H15V7a3 3 0 0 1 3-3Z"
          fill="white"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="8" r="1.6" fill="currentColor" />
        {[19, 28, 37].map((y) => (
          <g key={y}>
            <rect
              x="10"
              y={y - 3}
              width="6"
              height="6"
              rx="1.1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d={`m11.4 ${y} 2 2 4-4`}
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M22 ${y}h15`}
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
      {!compact && (
        <span className="text-lg">
          Task Management<span className="text-blue-600">.</span>
        </span>
      )}
    </Link>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox size={22} />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="panel p-8 text-center">
      <p className="font-medium text-slate-900">
        We couldn&apos;t load this view
      </p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}
export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  const ids = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
  return (
    <div className="panel space-y-5 p-6">
      {ids.slice(0, rows).map((key) => (
        <div key={key} className="flex items-center gap-4">
          <div className="skeleton size-10 shrink-0" />
          <div className="w-full space-y-2">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "blue" | "green" | "amber" | "rose";
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors[tone]}`}
    >
      {children}
    </span>
  );
}
export function StatusPill({ status }: { status: TaskStatus | string }) {
  const label = status.replaceAll("_", " ").toLowerCase();
  const tone =
    status === "DONE" || status === "COMPLETED" || status === "ACTIVE"
      ? "green"
      : status === "IN_PROGRESS" || status === "IN_REVIEW"
        ? "blue"
        : status === "ON_HOLD" || status === "CANCELLED"
          ? "rose"
          : "slate";
  return (
    <Pill tone={tone}>{label.replace(/\b\w/g, (c) => c.toUpperCase())}</Pill>
  );
}
export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <Pill
      tone={
        priority === "URGENT"
          ? "rose"
          : priority === "HIGH"
            ? "amber"
            : priority === "MEDIUM"
              ? "blue"
              : "slate"
      }
    >
      {priority.toLowerCase()}
    </Pill>
  );
}
export function Spinner() {
  return <LoaderCircle className="size-4 animate-spin" />;
}
export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
export function formatDate(value?: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
