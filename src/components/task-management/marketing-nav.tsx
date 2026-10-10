"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 py-2 transition-colors hover:text-blue-600 ${active ? "border-blue-600 text-blue-600" : "border-transparent"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
