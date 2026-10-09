import { LogIn, Mail, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Contact",
  description: "Find help and contact options for Task Management.",
};
export default function Contact() {
  const supportEmail = process.env.SUPPORT_EMAIL;
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <p className="eyebrow">Help & contact</p>
      <h1 className="mt-4 max-w-2xl text-5xl font-semibold tracking-tight md:text-6xl">
        Find the right next step.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
        Explore answers to common questions, or sign in to manage your workspace
        and team.
      </p>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {supportEmail && (
          <a
            href={`mailto:${supportEmail}`}
            className="panel p-8 transition hover:border-blue-300"
          >
            <Mail className="text-blue-600" size={25} />
            <h2 className="mt-6 text-xl font-semibold">Email support</h2>
            <p className="mt-2 text-sm text-slate-500">{supportEmail}</p>
          </a>
        )}
        <Link
          href="/faq"
          className="panel p-8 transition hover:border-blue-300"
        >
          <MessageSquareText className="text-blue-600" size={25} />
          <h2 className="mt-6 text-xl font-semibold">Find an answer</h2>
          <p className="mt-2 text-sm text-slate-500">
            Explore frequently asked questions.
          </p>
        </Link>
        <Link
          href="/login"
          className="panel p-8 transition hover:border-blue-300"
        >
          <LogIn className="text-blue-600" size={25} />
          <h2 className="mt-6 text-xl font-semibold">Go to your workspace</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to see your projects and teammates.
          </p>
        </Link>
      </div>
    </main>
  );
}
