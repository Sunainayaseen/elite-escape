"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  ImagePlus,
  Inbox,
  MapPin,
  Newspaper,
  Plus,
  Stamp,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { useAdmin } from "@/components/admin/AdminShell";
import {
  Card,
  EmptyState,
  ErrorState,
  InquiryStatusBadge,
  INQUIRY_STATUSES,
  Spinner,
} from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { DashboardStats } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

// Bar colours per inquiry status, matching the badge tones in ui.tsx.
const STATUS_BAR: Record<(typeof INQUIRY_STATUSES)[number]["value"], string> = {
  new: "bg-sky-500",
  contacted: "bg-violet-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  closed: "bg-slate-300",
};

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/packages/new", label: "New package", icon: Briefcase },
  { href: "/admin/visa/new", label: "Visa country", icon: Stamp },
  { href: "/admin/blog/new", label: "Blog post", icon: Newspaper },
  { href: "/admin/media", label: "Upload media", icon: ImagePlus },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

function StatCard({
  href,
  label,
  value,
  icon: Icon,
  tint,
  footer,
}: {
  href: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tint: string;
  footer?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tint)}>
          <Icon size={19} aria-hidden />
        </span>
        <ArrowUpRight
          size={16}
          aria-hidden
          className="text-slate-300 transition-colors group-hover:text-slate-600"
        />
      </div>
      <p className="mt-5 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
      {footer && <div className="mt-4">{footer}</div>}
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAdmin();
  const { data, error, loading, reload } = useAdminQuery<DashboardStats>("/stats");
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{today}</p>
          <h1 className="mt-1 font-sans! text-[1.75rem] font-bold tracking-tight text-slate-900">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Inbox size={15} aria-hidden /> Inquiries
          </Link>
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#081a2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-colors hover:bg-[#12314d]"
          >
            <Plus size={15} aria-hidden /> New package
          </Link>
        </div>
      </div>

      {loading && <Spinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="flex flex-col gap-6">
          {/* Attention strip: the one thing staff should act on first */}
          <Link
            href={data.new_inquiries > 0 ? "/admin/inquiries?status=new" : "/admin/inquiries"}
            className="group relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl bg-[#081a2c] p-6 text-white shadow-lg shadow-slate-900/10 sm:flex-row sm:items-center sm:justify-between sm:p-7"
          >
            <div
              aria-hidden
              className="absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.25),transparent_65%)]"
            />
            <div className="flex items-center gap-4">
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-[#67e8f9]">
                <Inbox size={22} aria-hidden />
                {data.new_inquiries > 0 && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#67e8f9] shadow-[0_0_10px_2px_rgba(103,232,249,0.7)]" />
                )}
              </span>
              <div>
                <p className="text-lg font-semibold">
                  {data.new_inquiries > 0
                    ? `${data.new_inquiries} new ${data.new_inquiries === 1 ? "inquiry" : "inquiries"} waiting`
                    : "You're all caught up"}
                </p>
                <p className="mt-0.5 text-sm text-white/60">
                  {data.total_inquiries} {data.total_inquiries === 1 ? "inquiry" : "inquiries"} in total ·{" "}
                  {data.subscribers} newsletter {data.subscribers === 1 ? "subscriber" : "subscribers"}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#081a2c] transition-colors group-hover:bg-[#67e8f9] sm:self-auto">
              {data.new_inquiries > 0 ? "Review now" : "Open inquiries"}
              <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Content at a glance */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              href="/admin/packages"
              label="Holiday packages"
              value={data.total_packages}
              icon={Briefcase}
              tint="bg-sky-50 text-sky-600"
              footer={
                <div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{data.published_packages} published</span>
                    <span>{data.total_packages - data.published_packages} not live</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{
                        width: `${data.total_packages ? (data.published_packages / data.total_packages) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              }
            />
            <StatCard
              href="/admin/destinations"
              label="Destinations"
              value={data.total_destinations}
              icon={MapPin}
              tint="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              href="/admin/visa"
              label="Visa countries"
              value={data.total_visa_countries}
              icon={Stamp}
              tint="bg-violet-50 text-violet-600"
            />
            <StatCard
              href="/admin/blog"
              label="Published blog posts"
              value={data.published_posts}
              icon={Newspaper}
              tint="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              title="Latest inquiries"
              description="The most recent messages from the website"
              className="lg:col-span-2"
              actions={
                <Link
                  href="/admin/inquiries"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue-strong hover:text-[#081a2c]"
                >
                  View all <ArrowRight size={14} aria-hidden />
                </Link>
              }
            >
              {data.recent_inquiries.length === 0 ? (
                <EmptyState title="No inquiries yet" description="Enquiries from the website forms will appear here." />
              ) : (
                <ul className="-mx-5 -my-5 divide-y divide-slate-100">
                  {data.recent_inquiries.map((q) => (
                    <li key={q.id}>
                      <Link
                        href="/admin/inquiries"
                        className="flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-slate-50/80"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {initialsOf(q.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-slate-900">{q.name}</p>
                            <InquiryStatusBadge status={q.status} />
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {q.package_title ?? q.destination ?? q.source_page} · {formatDateTime(q.created_at)}
                          </p>
                          <p className="mt-1.5 line-clamp-1 text-sm text-slate-600">{q.message}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="flex flex-col gap-6">
              <Card title="Inquiry pipeline" description="Where every enquiry stands">
                {/* One stacked bar, then a clickable legend that opens the filtered list */}
                <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                  {INQUIRY_STATUSES.map((s) => {
                    const count = data.inquiries_by_status[s.value];
                    return count > 0 && data.total_inquiries > 0 ? (
                      <div
                        key={s.value}
                        className={STATUS_BAR[s.value]}
                        style={{ width: `${(count / data.total_inquiries) * 100}%` }}
                        title={`${s.label}: ${count}`}
                      />
                    ) : null;
                  })}
                </div>
                <ul className="mt-5 flex flex-col gap-1">
                  {INQUIRY_STATUSES.map((s) => (
                    <li key={s.value}>
                      <Link
                        href={`/admin/inquiries?status=${s.value}`}
                        className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-50"
                      >
                        <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", STATUS_BAR[s.value])} />
                        <span className="flex-1 text-slate-600">{s.label}</span>
                        <span className="font-semibold tabular-nums text-slate-900">
                          {data.inquiries_by_status[s.value]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <Users size={14} aria-hidden />
                  {data.subscribers} newsletter {data.subscribers === 1 ? "subscriber" : "subscribers"}
                </p>
              </Card>

              <Card title="Quick actions">
                <div className="grid grid-cols-2 gap-2.5">
                  {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200/80 p-3.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#081a2c] text-[#67e8f9]">
                        <Icon size={15} aria-hidden />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
