import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { PrimaryLink } from "@/components/task-management/ui";

const features = [
  {
    icon: Layers3,
    title: "Every project in one place",
    text: "Bring plans, deadlines, teams, and updates together without losing the details.",
  },
  {
    icon: CheckCircle2,
    title: "Make progress visible",
    text: "Move tasks from idea to done with clear ownership and simple status views.",
  },
  {
    icon: UsersRound,
    title: "Built for how teams work",
    text: "Keep your people connected across projects with roles that match their work.",
  },
  {
    icon: CalendarDays,
    title: "See what comes next",
    text: "Turn due dates and sprints into a shared view of the road ahead.",
  },
  {
    icon: MessageSquareText,
    title: "Keep context close",
    text: "Comments, files, and activity stay beside the work they belong to.",
  },
  {
    icon: ShieldCheck,
    title: "Control with confidence",
    text: "Manage workspace access and understand changes as your team grows.",
  },
];
export default function Home() {
  return (
    <main>
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-24 pt-24 text-center md:px-8 lg:pb-32 lg:pt-32">
          <h1 className="max-w-4xl text-[clamp(3.1rem,6vw,5.5rem)] font-semibold leading-[1.07] tracking-[-.065em] text-slate-950">
            Great work starts with{" "}
            <span className="text-blue-600">clear focus.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-500">
            Give every project a home, every task a next step, and every
            teammate the context to move forward.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <PrimaryLink href="/register">Start your workspace</PrimaryLink>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              Explore features <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-emerald-600" /> Clear priorities
            </span>
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-emerald-600" /> Connected teams
            </span>
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-emerald-600" /> Less noise
            </span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-22 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow">Everything in sync</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            One thoughtful space for all your work.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-500">
            From the first idea to the final update, your team has a clear place
            to plan and move together.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/40"
            >
              <Icon size={25} className="text-blue-600" />
              <h3 className="mt-6 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#f6f8fc] px-5 py-20 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-[30px] border border-blue-100 bg-white px-8 py-14 text-center soft-shadow md:flex-row md:px-14 md:text-left">
          <div>
            <p className="eyebrow">Move forward, together</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Ready for a clearer workday?
            </h2>
            <p className="mt-3 text-slate-500">
              Create your workspace and bring your team&apos;s projects into
              focus.
            </p>
          </div>
          <PrimaryLink href="/register">Create an account</PrimaryLink>
        </div>
      </section>
    </main>
  );
}
