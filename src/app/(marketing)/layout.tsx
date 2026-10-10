import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { MarketingNav } from "@/components/task-management/marketing-nav";
import { Brand } from "@/components/task-management/ui";
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supportEmail =
    process.env.SUPPORT_EMAIL || "support@projectmanagement.example";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-8">
          <Brand />
          <MarketingNav />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-700 hover:text-blue-600 sm:inline"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-100 bg-[#fbfcfe]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
          <div>
            <p className="max-w-xs text-sm leading-6 text-slate-500">
              A clearer way to plan, collaborate, and finish meaningful work.
            </p>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold">Explore</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-500">
              <Link href="/features">Features</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold">
              Let&apos;s work together
            </p>
            <div className="flex flex-col items-start gap-3 text-sm">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
              >
                Contact us <ArrowUpRight size={15} />
              </Link>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600"
              >
                <Mail size={16} aria-hidden="true" />
                {supportEmail}
              </a>
              <a
                href="tel:+8801834340813"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600"
              >
                <Phone size={16} aria-hidden="true" />
                01834340813
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t border-slate-200 px-5 py-5 text-xs text-slate-400 md:px-8">
          <span>© {new Date().getFullYear()} Project Management</span>
          <span>Built for focused teams.</span>
        </div>
      </footer>
    </div>
  );
}
