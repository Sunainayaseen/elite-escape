"use client";

import {
  Briefcase,
  ExternalLink,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Newspaper,
  Settings,
  Stamp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

import { useToast } from "@/components/admin/overlays";
import { Btn, Spinner } from "@/components/admin/ui";
import { AdminApiError, adminApi, errorText, onUnauthorized, setCsrfToken } from "@/lib/admin/client";
import type { AdminSessionInfo, AdminUser, InquiryPage } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type AdminContextValue = {
  user: AdminUser;
  isAdmin: boolean;
  logout: () => Promise<void>;
  /** Re-reads the "new inquiries" count shown in the sidebar. */
  refreshBadge: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminShell>");
  return ctx;
}

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: boolean;
};

// Grouped the way staff think about the work: day-to-day enquiries, website content, then setup.
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: true },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/packages", label: "Holiday Packages", icon: Briefcase },
      { href: "/admin/destinations", label: "Destinations", icon: MapPin },
      { href: "/admin/visa", label: "Visa Assistance", icon: Stamp },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
    ],
  },
  { title: "System", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

const NAV = NAV_GROUPS.flatMap((group) => group.items);

const isActive = (item: NavItem, pathname: string) =>
  item.exact ? pathname === item.href : pathname.startsWith(item.href);

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [badgeNonce, setBadgeNonce] = useState(0);

  const goToLogin = useCallback(() => {
    const next = window.location.pathname + window.location.search;
    router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
  }, [router]);

  // Who am I? A 401 here (or on any later call) sends the visitor to the login page.
  useEffect(() => {
    let cancelled = false;
    adminApi<AdminSessionInfo>("/me", { quiet401: true })
      .then((session) => {
        if (cancelled) return;
        setCsrfToken(session.csrf_token);
        setUser(session.user);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AdminApiError && err.status === 401) goToLogin();
        else setLoadError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, [goToLogin]);

  useEffect(
    () =>
      onUnauthorized(() => {
        setCsrfToken(null);
        setUser(null);
        toast.info("Your session has ended. Please sign in again.");
        goToLogin();
      }),
    [goToLogin, toast],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    adminApi<InquiryPage>("/inquiries?status=new&limit=1")
      .then((page) => !cancelled && setNewCount(page.counts.new))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user, pathname, badgeNonce]);

  const logout = useCallback(async () => {
    try {
      await adminApi("/logout", { method: "POST", quiet401: true });
    } catch {
      // The cookie may already be gone; either way we leave.
    }
    setCsrfToken(null);
    setUser(null);
    router.replace("/admin/login");
  }, [router]);

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f5f7fa] px-6 text-center font-sans!">
        <p className="text-sm font-semibold text-red-700">Could not reach the server</p>
        <p className="max-w-md text-sm text-slate-500">{loadError}</p>
        <Btn variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Btn>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] font-sans!">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  const current = NAV.find((item) => isActive(item, pathname));
  const initials = initialsOf(user.name);

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item, pathname);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    {/* Neon rail marks the current page */}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#67e8f9] shadow-[0_0_12px_rgba(103,232,249,0.7)]"
                      />
                    )}
                    <Icon
                      size={18}
                      aria-hidden
                      className={active ? "text-[#67e8f9]" : "text-slate-500 group-hover:text-slate-300"}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && newCount > 0 && (
                      <span className="rounded-full bg-[#67e8f9] px-2 py-0.5 text-[11px] font-bold leading-none text-[#04121f]">
                        {newCount}
                        <span className="sr-only"> new</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const sidebar = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 px-6">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG */}
        <img src="/logo-mark.svg" alt="" className="h-8 w-auto" />
        <div className="leading-none">
          <p className="text-sm font-semibold text-white">Elite Escape</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
        </div>
      </div>
      {nav}
      <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#67e8f9] to-brand-blue text-xs font-bold text-[#04121f]">
          {initials}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} aria-hidden />
        </button>
      </div>
    </>
  );

  return (
    <AdminContext.Provider
      value={{ user, isAdmin: user.role === "admin", logout, refreshBadge: () => setBadgeNonce((n) => n + 1) }}
    >
      <div className="min-h-screen bg-[#f5f7fa] font-sans! text-slate-900">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.04] bg-[#081a2c] lg:flex">
          {sidebar}
        </aside>

        {/* Mobile / tablet drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#081a2c]">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
              >
                <X size={18} />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-[#f5f7fa]/85 px-4 backdrop-blur-md sm:px-8">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-white lg:hidden"
            >
              <Menu size={20} />
            </button>
            <p className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
              <span className="hidden sm:inline">Admin</span>
              <span aria-hidden className="hidden text-slate-300 sm:inline">
                /
              </span>
              <span className="truncate font-semibold text-slate-900">{current?.label ?? "Dashboard"}</span>
            </p>
            <div className="flex-1" />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-900/5 transition-colors hover:border-slate-300 sm:flex"
            >
              View website <ExternalLink size={14} aria-hidden />
            </a>
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#67e8f9] to-brand-blue text-xs font-bold text-[#04121f] lg:hidden"
            >
              {initials}
            </span>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-9">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
