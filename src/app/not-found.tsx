import Link from "next/link";
import { Brand } from "@/components/task-management/ui";
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <Brand />
      <p className="eyebrow mt-12">404 · Page not found</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        This page wandered off.
      </h1>
      <p className="mt-4 text-slate-500">
        The link may have changed or the page may no longer be here.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
