"use client";
import Link from "next/link";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <span className="text-2xl font-bold text-rose-700">!</span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        {error.message || "Please try loading this page again."}
      </p>
      <div className="mt-7 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
