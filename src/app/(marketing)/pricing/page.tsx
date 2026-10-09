import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore Task Management plans and start Stripe checkout from your workspace.",
};
export default function Pricing() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 text-center md:px-8">
      <p className="eyebrow">Pricing</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
        A plan that grows with your team.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">
        Start organizing your work. Workspace owners can upgrade securely
        through Stripe Checkout when ready.
      </p>
      <div className="mx-auto mt-14 grid max-w-4xl gap-5 text-left md:grid-cols-2">
        <div className="panel p-8">
          <p className="text-sm font-semibold text-slate-500">
            Getting started
          </p>
          <h2 className="mt-3 text-3xl font-semibold">Workspace</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Create your organization and begin planning projects with your team.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Organizations and teams",
              "Projects and tasks",
              "Calendar and collaboration",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <Check size={17} className="text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-9 inline-block rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
          >
            Get started
          </Link>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-[#f8faff] p-8">
          <p className="text-sm font-semibold text-blue-600">
            For growing teams
          </p>
          <h2 className="mt-3 text-3xl font-semibold">Pro</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Upgrade the selected organization through the backend&apos;s live
            Stripe test checkout.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Everything in Workspace",
              "Organization analytics",
              "Activity and administration tools",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <Check size={17} className="text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/billing"
            className="mt-9 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Open billing
          </Link>
        </div>
      </div>
    </main>
  );
}
