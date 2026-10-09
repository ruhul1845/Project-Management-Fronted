import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Pill, PrimaryLink } from "@/components/task-management/ui";

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
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="pointer-events-none absolute -right-48 -top-60 size-[700px] rounded-full bg-blue-50/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-22 pt-20 md:px-8 lg:grid-cols-[.88fr_1.12fr] lg:pb-28 lg:pt-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <Sparkles size={14} /> A calmer way to get things done
            </div>
            <h1 className="max-w-xl text-[clamp(3.1rem,5vw,5.5rem)] font-semibold leading-[1.07] tracking-[-.065em] text-slate-950">
              Great work starts with{" "}
              <span className="text-blue-600">clear focus.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-500">
              Give every project a home, every task a next step, and every
              teammate the context to move forward.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <PrimaryLink href="/register">Start your workspace</PrimaryLink>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
              >
                Explore features <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-emerald-600" /> Clear
                priorities
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-emerald-600" /> Connected teams
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-emerald-600" /> Less noise
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-8 -top-8 size-52 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="soft-shadow relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    Project overview
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    Product launch
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  On track
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#f5f8ff] p-4">
                  <p className="text-xs text-slate-500">Projects</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    08
                  </p>
                  <div className="mt-5 h-1.5 rounded-full bg-blue-100">
                    <div className="h-full w-2/3 rounded-full bg-blue-600" />
                  </div>
                </div>
                <div className="rounded-2xl bg-[#f6faf8] p-4">
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    68%
                  </p>
                  <div className="mt-5 h-1.5 rounded-full bg-emerald-100">
                    <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="rounded-2xl bg-[#faf8f5] p-4">
                  <p className="text-xs text-slate-500">This week</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    12
                  </p>
                  <div className="mt-5 h-1.5 rounded-full bg-amber-100">
                    <div className="h-full w-1/2 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Focus for today</h3>
                  <Pill tone="blue">3 priorities</Pill>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    "Review final designs",
                    "Align launch checklist",
                    "Share stakeholder update",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-full border ${index === 0 ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}
                      >
                        {index === 0 && <Check size={13} />}
                      </span>
                      <span
                        className={`flex-1 text-sm ${index === 0 ? "text-slate-400 line-through" : "text-slate-700"}`}
                      >
                        {item}
                      </span>
                      <span className="text-xs text-slate-400">Today</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-blue-600 p-4 text-white">
                <Bell size={20} className="shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Everyone&apos;s on the same page
                  </p>
                  <p className="text-xs text-blue-100">
                    Updates where your work happens.
                  </p>
                </div>
                <ArrowRight className="ml-auto" size={17} />
              </div>
            </div>
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
