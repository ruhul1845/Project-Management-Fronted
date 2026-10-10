import {
  ArrowUpRight,
  CalendarDays,
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
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div
          className="absolute inset-0 bg-cover bg-right"
          style={{ backgroundImage: "url('/img/bg.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/10" />
        <div className="relative mx-auto flex min-h-[640px] max-w-7xl items-center px-5 py-20 md:px-8">
          <div className="w-full max-w-[600px]">
            <h1 className="text-[clamp(3.1rem,5vw,5.5rem)] font-semibold leading-[1.07] tracking-[-.065em] text-slate-950">
              Great work starts with{" "}
              <span className="text-blue-600">clear focus.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">
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
    </main>
  );
}
