import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  Columns3,
  FileText,
  MessagesSquare,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Features",
  description:
    "Projects, tasks, teams, calendar, and collaboration in one workspace.",
};
const items = [
  {
    icon: Columns3,
    title: "Kanban boards",
    text: "Follow work across clear stages and open any card for its full context.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & sprints",
    text: "See deadlines, plan focused cycles, and coordinate what comes next.",
  },
  {
    icon: UsersRound,
    title: "Teams & permissions",
    text: "Organize people by team and protect the right work with role-based access.",
  },
  {
    icon: MessagesSquare,
    title: "Comments & mentions",
    text: "Keep conversations beside the tasks they move forward.",
  },
  {
    icon: Bell,
    title: "Timely notifications",
    text: "Catch assignments and updates without watching every project.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Pro analytics",
    text: "Understand progress and workload across your organization.",
  },
  {
    icon: FileText,
    title: "Attachments & labels",
    text: "Give tasks the details and files people need to finish.",
  },
  {
    icon: ShieldCheck,
    title: "Pro activity history",
    text: "See the important changes in your workspace.",
  },
];
export default function Features() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <p className="eyebrow">Features</p>
      <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
        Everything your team needs to move together.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
        A connected system for planning work, tracking progress, and staying
        aligned.
      </p>
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel p-7">
            <Icon size={25} className="text-blue-600" />
            <h2 className="mt-6 text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
      <Link
        href="/register"
        className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
      >
        Start a workspace <ArrowRight size={16} />
      </Link>
    </main>
  );
}
