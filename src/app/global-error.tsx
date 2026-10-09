"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white p-6 text-slate-900">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">We hit a problem</h1>
          <p className="mt-3 text-sm text-slate-500">
            Please try again. Your work is still in your workspace.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Reload this page
          </button>
        </div>
      </body>
    </html>
  );
}
