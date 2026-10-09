import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Task Management.",
};
const answers = [
  {
    q: "How do I start a workspace?",
    a: "Create an account, sign in, and use the workspace setup screen to create your organization.",
  },
  {
    q: "Can I invite people to an organization?",
    a: "Yes. Owners and managers can add registered users by email from the Members page.",
  },
  {
    q: "Can teammates see every project?",
    a: "Access follows organization and team roles. Members see open projects and projects linked to their teams; guests see team-linked projects only.",
  },
  {
    q: "How does billing work?",
    a: "Organization owners can start Stripe Checkout from Billing. The backend confirms completed payment through its webhook.",
  },
];
export default function Faq() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-20 md:px-8">
      <p className="eyebrow">FAQ</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">
        Common questions, clear answers.
      </h1>
      <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
        {answers.map((item) => (
          <div key={item.q} className="py-7">
            <h2 className="text-lg font-semibold">{item.q}</h2>
            <p className="mt-3 leading-7 text-slate-500">{item.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
