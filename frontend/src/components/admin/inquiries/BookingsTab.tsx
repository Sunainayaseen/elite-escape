"use client";

import type { LegacyBooking } from "@/components/admin/inquiries/types";
import { Badge, Card, DataTable, EmptyState, ErrorState, Spinner, tdCls, thCls } from "@/components/admin/ui";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";

const TONES = { pending: "amber", confirmed: "green", cancelled: "red", completed: "slate" } as const;

export function BookingsTab() {
  const { data, error, loading, reload } = useAdminQuery<LegacyBooking[]>("/bookings?limit=500");

  return (
    <Card
      title="Legacy bookings"
      description="Older booking requests, kept for reference. New package requests arrive as inquiries."
    >
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No legacy bookings" />
      ) : (
        <DataTable>
          <thead className="border-b border-slate-200">
            <tr>
              <th className={thCls}>Customer</th>
              <th className={thCls}>Package</th>
              <th className={thCls}>Travel date</th>
              <th className={thCls}>Guests</th>
              <th className={thCls}>Status</th>
              <th className={thCls}>Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((b) => (
              <tr key={b.id}>
                <td className={tdCls}>
                  <p className="font-medium text-slate-900">{b.customer_name}</p>
                  <p className="text-xs text-slate-500">
                    {b.email} · {b.phone}
                  </p>
                </td>
                <td className={tdCls}>{b.package_title}</td>
                <td className={tdCls}>{formatDate(b.travel_date)}</td>
                <td className={tdCls}>{b.travelers}</td>
                <td className={tdCls}>
                  <Badge tone={TONES[b.status]}>{b.status}</Badge>
                </td>
                <td className={tdCls}>{formatDateTime(b.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  );
}
