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

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/packages", label: "Holiday Packages", icon: Briefcase },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/visa", label: "Visa Assistance", icon: Stamp },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: true },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
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
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV.map((item) => {
        const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon size={18} className={active ? "text-brand-teal" : "text-slate-400"} />
            <span className="flex-1">{item.label}</span>
            {"badge" in item && item.badge && newCount > 0 && (
              <span className="rounded-full bg-brand-teal px-2 py-0.5 text-[11px] font-bold leading-none text-slate-900">
                {newCount}
              </span>
            )}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut size={18} className="text-slate-400" />
        Logout
      </button>
    </nav>
  );

  const brand = (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Elite Escape" className="h-8 w-auto rounded bg-white px-1.5 py-0.5" />
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Admin</span>
    </div>
  );

  return (
    <AdminContext.Provider
      value={{ user, isAdmin: user.role === "admin", logout, refreshBadge: () => setBadgeNonce((n) => n + 1) }}
    >
      <div className="min-h-screen bg-slate-100 font-sans! text-slate-900">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0F1B2B] lg:flex">
          {brand}
          {nav}
        </aside>

        {/* Mobile / tablet drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMenuOpen(false)} aria-hidden />
            <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#0F1B2B]">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
              >
                <X size={18} />
              </button>
              {brand}
              {nav}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex"
            >
              View website <ExternalLink size={14} />
            </a>
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
