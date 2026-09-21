"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BookingsTab } from "@/components/admin/inquiries/BookingsTab";
import { InquiryDetail } from "@/components/admin/inquiries/InquiryDetail";
import { NewsletterTab } from "@/components/admin/inquiries/NewsletterTab";
import { INQUIRY_TYPES, inquiryTypeLabel, type LegacyBooking } from "@/components/admin/inquiries/types";
import {
  Btn,
  DataTable,
  EmptyState,
  ErrorState,
  INQUIRY_STATUSES,
  InquiryStatusBadge,
  PageHeader,
  SearchInput,
  Select,
  Spinner,
  Tabs,
  TextInput,
  tdCls,
  thCls,
} from "@/components/admin/ui";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { Inquiry, InquiryPage, InquiryStatus } from "@/lib/admin/types";

const PAGE_SIZE = 25;

type View = "inquiries" | "newsletter" | "bookings";
type StatusFilter = "all" | InquiryStatus;

function isStatus(value: string | null): value is InquiryStatus {
  return INQUIRY_STATUSES.some((s) => s.value === value);
}

export function InquiriesView() {
  const params = useSearchParams();
  const initialStatus = params.get("status");

  const [view, setView] = useState<View>("inquiries");
  const [status, setStatus] = useState<StatusFilter>(isStatus(initialStatus) ? initialStatus : "all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  // Wait for a pause in typing before asking the server to search.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setOffset(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
  if (status !== "all") qs.set("status", status);
  if (query) qs.set("q", query);
  if (type) qs.set("type", type);
  if (dateFrom) qs.set("date_from", dateFrom);
  if (dateTo) qs.set("date_to", dateTo);

  const { data, error, loading, reload } = useAdminQuery<InquiryPage>(
    view === "inquiries" ? `/inquiries?${qs.toString()}` : null,
  );
  const legacy = useAdminQuery<LegacyBooking[]>("/bookings?limit=1");
  const hasLegacy = (legacy.data?.length ?? 0) > 0;

  const counts = data?.counts;
  const totalAll = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined;
  const filtersActive = Boolean(query || type || dateFrom || dateTo);

  function resetFilters() {
    setSearch("");
    setQuery("");
    setType("");
    setDateFrom("");
    setDateTo("");
    setOffset(0);
  }

  const viewTabs: { value: View; label: string }[] = [
    { value: "inquiries", label: "Inquiries" },
    { value: "newsletter", label: "Newsletter" },
    ...(hasLegacy ? [{ value: "bookings" as const, label: "Legacy bookings" }] : []),
  ];

  const from = data && data.total > 0 ? offset + 1 : 0;
  const to = data ? Math.min(offset + PAGE_SIZE, data.total) : 0;

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Every contact, package and visa request from the website in one inbox."
      />

      <div className="mb-5">
        <Tabs value={view} onChange={setView} tabs={viewTabs} />
      </div>

      {view === "newsletter" && <NewsletterTab />}
      {view === "bookings" && <BookingsTab />}

      {view === "inquiries" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div>
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5">
              <Tabs
                value={status}
                onChange={(next) => {
                  setStatus(next);
                  setOffset(0);
                }}
                tabs={[
                  { value: "all" as StatusFilter, label: "All", count: totalAll },
                  ...INQUIRY_STATUSES.map((s) => ({
                    value: s.value as StatusFilter,
                    label: s.label,
                    count: counts?.[s.value],
                  })),
                ]}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone, message…" />
                <Select
                  aria-label="Filter by type"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setOffset(0);
                  }}
                >
                  <option value="">All types</option>
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <TextInput
                  type="date"
                  aria-label="Received from"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setOffset(0);
                  }}
                />
                <TextInput
                  type="date"
                  aria-label="Received until"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setOffset(0);
                  }}
                />
                <Btn variant="ghost" onClick={resetFilters} disabled={!filtersActive}>
                  Clear
                </Btn>
              </div>
            </div>

            {loading ? (
              <Spinner />
            ) : error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                title={filtersActive || status !== "all" ? "No inquiries match these filters" : "No inquiries yet"}
                description={
                  filtersActive || status !== "all"
                    ? "Try a different status or clear the filters."
                    : "Messages sent from the contact form and package pages will appear here."
                }
              />
            ) : (
              <DataTable>
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className={thCls}>Contact</th>
                    <th className={thCls}>Type</th>
                    <th className={thCls}>About</th>
                    <th className={thCls}>Received</th>
                    <th className={thCls}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer hover:bg-slate-50"
                      tabIndex={0}
                      onClick={() => setSelected(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(item);
                        }
                      }}
                    >
                      <td className={tdCls}>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </td>
                      <td className={tdCls}>{inquiryTypeLabel(item.inquiry_type)}</td>
                      <td className={`${tdCls} max-w-xs`}>
                        <p className="truncate text-slate-800">{item.package_title ?? item.destination ?? "—"}</p>
                        {item.travel_start && (
                          <p className="text-xs text-slate-500">Travel {formatDate(item.travel_start)}</p>
                        )}
                      </td>
                      <td className={tdCls}>{formatDateTime(item.created_at)}</td>
                      <td className={tdCls}>
                        <InquiryStatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}

            {data && data.total > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
                <span>
                  Showing {from}–{to} of {data.total}
                </span>
                <div className="flex gap-2">
                  <Btn
                    variant="secondary"
                    size="sm"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  >
                    Previous
                  </Btn>
                  <Btn
                    variant="secondary"
                    size="sm"
                    disabled={offset + PAGE_SIZE >= data.total}
                    onClick={() => setOffset(offset + PAGE_SIZE)}
                  >
                    Next
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <InquiryDetail inquiry={selected} onClose={() => setSelected(null)} onChanged={reload} />
    </>
  );
}
