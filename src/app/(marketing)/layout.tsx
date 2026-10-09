import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/task-management/ui";
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/features" className="hover:text-blue-600">
              Features
            </Link>
            <Link href="/about" className="hover:text-blue-600">
              About
            </Link>
            <Link href="/pricing" className="hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </nav>
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
            <Brand />
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
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
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600"
            >
              Contact us <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t border-slate-200 px-5 py-5 text-xs text-slate-400 md:px-8">
          <span>© {new Date().getFullYear()} Task Management</span>
          <span>Built for focused teams.</span>
        </div>
      </footer>
    </div>
  );
}
