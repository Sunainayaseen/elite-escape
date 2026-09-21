"use client";

import { Download, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import type { Subscriber } from "@/components/admin/inquiries/types";
import { useConfirm, useToast } from "@/components/admin/overlays";
import {
  Btn,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  SearchInput,
  Spinner,
  tdCls,
  thCls,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { formatDateTime } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";

// A spreadsheet treats cells starting with = + - @ as formulas; prefix them so an email can never run as one.
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: Subscriber[]) {
  const lines = ["email,subscribed_at", ...rows.map((r) => `${csvCell(r.email)},${csvCell(r.created_at)}`)];
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "newsletter-subscribers.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function NewsletterTab() {
  const { data, error, loading, reload } = useAdminQuery<Subscriber[]>("/subscribers");
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((s) => !q || s.email.toLowerCase().includes(q));
  }, [data, search]);

  async function remove(sub: Subscriber) {
    const ok = await confirm({
      title: "Remove subscriber?",
      message: `${sub.email} will be removed from the newsletter list.`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    setBusyId(sub.id);
    try {
      await adminApi(`/subscribers/${sub.id}`, { method: "DELETE" });
      toast.success("Subscriber removed");
      reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card
      title={`Newsletter subscribers${data ? ` (${data.length})` : ""}`}
      description="People who signed up on the website. Export the list to use it in your email tool."
      actions={
        <Btn
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          disabled={!data || data.length === 0}
          onClick={() => data && downloadCsv(data)}
        >
          Export CSV
        </Btn>
      }
    >
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="flex flex-col gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search email…" className="max-w-sm" />
          {rows.length === 0 ? (
            <EmptyState
              title={data && data.length > 0 ? "No subscribers match your search" : "No subscribers yet"}
              description={data && data.length > 0 ? undefined : "Sign-ups from the newsletter form on the home page will appear here."}
            />
          ) : (
            <DataTable>
              <thead className="border-b border-slate-200">
                <tr>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Subscribed</th>
                  {isAdmin && <th className={thCls} />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className={tdCls}>{s.email}</td>
                    <td className={tdCls}>{formatDateTime(s.created_at)}</td>
                    {isAdmin && (
                      <td className={`${tdCls} text-right`}>
                        <Btn
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove ${s.email}`}
                          loading={busyId === s.id}
                          icon={<Trash2 size={14} />}
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => remove(s)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </div>
      )}
    </Card>
  );
}
