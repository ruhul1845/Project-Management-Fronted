"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  Shield,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/task-management-api";
import type { Organization, OrgRole, User } from "@/lib/task-management-types";
import { Brand, initials, LoadingBlock } from "./ui";

type WorkspaceContext = {
  user: User;
  organizations: Organization[];
  organization: Organization | null;
  role: OrgRole | null;
  setOrganizationId: (id: string) => void;
  canManage: boolean;
  isOwner: boolean;
  isPro: boolean;
};
const Context = createContext<WorkspaceContext | null>(null);
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("Workspace context unavailable");
  return value;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
    setSelectedId(localStorage.getItem("task-management-org"));
  }, []);
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () =>
      (await fetch("/api/auth/me", { cache: "no-store" }).then((r) =>
        r.json(),
      )) as { success: boolean; data: User },
    retry: false,
  });
  const orgs = useQuery({
    queryKey: ["organizations", "mine"],
    queryFn: async () => (await api<Organization[]>("organizations/mine")).data,
    enabled: Boolean(me.data?.success),
  });
  const unread = useQuery({
    queryKey: ["notifications", "count"],
    queryFn: async () =>
      (await api<{ count: number }>("notifications/unread-count")).data.count,
    enabled: Boolean(me.data?.success),
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: "always",
  });
  useEffect(() => {
    if (me.isSuccess && !me.data?.success) router.replace("/login");
  }, [me.isSuccess, me.data, router]);
  const user = me.data?.success ? me.data.data : null;
  const organizations = orgs.data ?? [];
  const organization =
    organizations.find((item) => item.id === selectedId) ??
    organizations[0] ??
    null;
  const role = organization?.memberships?.[0]?.role ?? null;
  const canManage = role === "OWNER" || role === "MANAGER";
  const isOwner = role === "OWNER";
  const isPro = organization?.subscriptionStatus === "ACTIVE";
  const value = useMemo(
    () => ({
      user: user as User,
      organizations,
      organization,
      role,
      canManage,
      isOwner,
      isPro,
      setOrganizationId: (id: string) => {
        localStorage.setItem("task-management-org", id);
        setSelectedId(id);
        queryClient.invalidateQueries();
      },
    }),
    [
      user,
      organizations,
      organization,
      role,
      canManage,
      isOwner,
      isPro,
      queryClient,
    ],
  );
  const nav =
    user?.role === "ADMIN"
      ? [
          { label: "Overview", href: "/admin", icon: LayoutDashboard },
          { label: "Users", href: "/admin/users", icon: Users },
          {
            label: "Organizations",
            href: "/admin/organizations",
            icon: FolderKanban,
          },
        ]
      : [
          { label: "Overview", href: "/workspace", icon: LayoutDashboard },
          { label: "My tasks", href: "/tasks/mine", icon: Activity },
          { label: "Projects", href: "/projects", icon: FolderKanban },
          { label: "Teams", href: "/teams", icon: UsersRound },
          ...(canManage
            ? [{ label: "Members", href: "/members", icon: Users }]
            : []),
          { label: "Calendar", href: "/calendar", icon: CalendarDays },
          ...(canManage
            ? [
                {
                  label: "Analytics",
                  href: "/analytics",
                  icon: BarChart3,
                  locked: !isPro,
                },
                {
                  label: "Activity log",
                  href: "/audit",
                  icon: Shield,
                  locked: !isPro,
                },
              ]
            : []),
          ...(isOwner
            ? [{ label: "Billing", href: "/billing", icon: CreditCard }]
            : []),
          { label: "Settings", href: "/settings", icon: Settings2 },
        ];
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }
  if (me.isPending || (me.data?.success && orgs.isPending))
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Brand />
        <div className="mt-12">
          <LoadingBlock />
        </div>
      </div>
    );
  if (!user) return null;
  return (
    <Context.Provider value={value}>
      <div className="min-h-screen bg-[#fbfcfe] lg:flex">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside
          className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}
        >
          <div className="flex items-center justify-between px-2">
            <Brand />
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          {user.role !== "ADMIN" && (
            <div className="mt-9">
              <p className="px-3 text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">
                Workspace
              </p>
              <div className="relative mt-2">
                <select
                  aria-label="Current workspace"
                  value={organization?.id ?? ""}
                  onChange={(event) =>
                    value.setOrganizationId(event.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm font-medium text-slate-800 outline-none"
                >
                  <option value="" disabled>
                    {organizations.length
                      ? "Select workspace"
                      : "No workspace yet"}
                  </option>
                  {organizations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-slate-400" />
              </div>
              <Link
                href="/workspaces/new"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} /> New workspace
              </Link>
            </div>
          )}
          <nav className="mt-8 flex-1 space-y-1" aria-label="Main navigation">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/workspace" &&
                  item.href !== "/admin" &&
                  pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition ${active ? "font-bold text-blue-700 underline decoration-2 underline-offset-4" : "text-slate-700 hover:text-blue-700"}`}
                >
                  <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                  {"locked" in item && item.locked && (
                    <LockKeyhole
                      size={14}
                      className="ml-auto text-slate-400"
                      aria-label="Pro feature"
                    />
                  )}
                  {item.href === "/notifications" &&
                    typeof unread.data === "number" &&
                    unread.data > 0 && (
                      <span className="ml-auto text-xs font-bold text-blue-800">
                        {unread.data}
                      </span>
                    )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-100 pt-4">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50"
            >
              <span className="w-5 shrink-0 text-center text-xs font-bold text-blue-800">
                {initials(user.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {user.email}
                </span>
                {role && organization && (
                  <span className="block truncate text-xs font-medium text-blue-600">
                    {role.charAt(0) + role.slice(1).toLowerCase()} in{" "}
                    {organization.name}
                  </span>
                )}
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-17 items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <span className="hidden text-sm text-slate-500 sm:inline">
                Workspace
              </span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="text-sm font-semibold text-slate-900">
                {pathname === "/notifications"
                  ? "Notifications"
                  : (nav.find(
                      (item) =>
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`),
                    )?.label ?? "Overview")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  router.push(`/projects?search=${encodeURIComponent(search)}`);
                }}
                className="relative hidden md:block"
              >
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search projects"
                  placeholder="Search projects..."
                  className="h-9 w-52 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-300"
                />
              </form>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600"
              >
                <Bell size={17} />
                {typeof unread.data === "number" && unread.data > 0 && (
                  <span className="absolute -right-2 -top-2 text-xs font-bold text-blue-800">
                    {unread.data > 99 ? "99+" : unread.data}
                  </span>
                )}
              </Link>
              <span className="w-5 text-center text-xs font-bold text-blue-800">
                {initials(user.name)}
              </span>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
            {children}
          </main>
        </div>
      </div>
    </Context.Provider>
  );
}
