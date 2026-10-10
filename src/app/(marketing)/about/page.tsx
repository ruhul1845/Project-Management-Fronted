import { Compass, Focus, HeartHandshake } from "lucide-react";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "About",
  description: "Why Project Management makes room for focused, connected work.",
};
export default function About() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <p className="eyebrow">About Project Management</p>
      <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
        Make space for the work that matters.
      </h1>
      <p className="mt-7 max-w-2xl text-xl leading-8 text-slate-500">
        Projects move best when people know what matters, who owns it, and what
        comes next. Project Management brings that clarity into one calm
        workspace.
      </p>
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Focus,
            title: "Clarity first",
            text: "See priorities and progress without digging through scattered updates.",
          },
          {
            icon: HeartHandshake,
            title: "Built around people",
            text: "Give teammates the context and access they need to contribute.",
          },
          {
            icon: Compass,
            title: "Momentum every day",
            text: "Turn big plans into small steps that keep moving.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel p-7">
            <Icon className="text-blue-600" size={26} />
            <h2 className="mt-6 text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
