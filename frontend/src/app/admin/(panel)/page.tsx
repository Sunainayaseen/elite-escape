"use client";

import { Briefcase, Inbox, MapPin, Newspaper, Plus, Stamp } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import {
  Card,
  EmptyState,
  ErrorState,
  InquiryStatusBadge,
  INQUIRY_STATUSES,
  PageHeader,
  Spinner,
} from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { DashboardStats } from "@/lib/admin/types";

function StatCard({
  href,
  label,
  value,
  note,
  icon,
  accent,
}: {
  href: string;
  label: string;
  value: number;
  note?: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      </div>
      <span
        className={
          accent
            ? "flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white"
            : "flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-brand-blue/10 group-hover:text-brand-blue"
        }
      >
        {icon}
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAdmin();
  const { data, error, loading, reload } = useAdminQuery<DashboardStats>("/stats");

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="A live summary of the website content and enquiries. Every number comes straight from the database."
        actions={
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2280a8]"
          >
            <Plus size={15} /> New package
          </Link>
        }
      />

      {loading && <Spinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              href="/admin/packages"
              label="Total Packages"
              value={data.total_packages}
              note={`${data.published_packages} published`}
              icon={<Briefcase size={20} />}
            />
            <StatCard href="/admin/destinations" label="Total Destinations" value={data.total_destinations} icon={<MapPin size={20} />} />
            <StatCard href="/admin/visa" label="Visa Countries" value={data.total_visa_countries} icon={<Stamp size={20} />} />
            <StatCard
              href="/admin/inquiries"
              label="New Inquiries"
              value={data.new_inquiries}
              note={`${data.total_inquiries} in total`}
              icon={<Inbox size={20} />}
              accent={data.new_inquiries > 0}
            />
            <StatCard href="/admin/blog" label="Published Blog Posts" value={data.published_posts} icon={<Newspaper size={20} />} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              title="Latest inquiries"
              className="lg:col-span-2"
              actions={
                <Link href="/admin/inquiries" className="text-sm font-medium text-brand-blue hover:underline">
                  View all
                </Link>
              }
            >
              {data.recent_inquiries.length === 0 ? (
                <EmptyState title="No inquiries yet" description="Enquiries from the website forms will appear here." />
              ) : (
                <ul className="-my-2 divide-y divide-slate-100">
                  {data.recent_inquiries.map((q) => (
                    <li key={q.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{q.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {q.package_title ?? q.destination ?? q.source_page} · {formatDateTime(q.created_at)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-600">{q.message}</p>
                      </div>
                      <InquiryStatusBadge status={q.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Inquiries by status">
              <ul className="flex flex-col gap-3">
                {INQUIRY_STATUSES.map((s) => (
                  <li key={s.value} className="flex items-center justify-between text-sm">
                    <InquiryStatusBadge status={s.value} />
                    <span className="font-semibold text-slate-800">{data.inquiries_by_status[s.value]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                {data.subscribers} newsletter {data.subscribers === 1 ? "subscriber" : "subscribers"}
              </p>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
