"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { useConfirm, useToast } from "@/components/admin/overlays";
import {
  Badge,
  Btn,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Select,
  Spinner,
  tdCls,
  thCls,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { VisaCountry } from "@/lib/admin/types";

export function publishedFee(country: Pick<VisaCountry, "fee">): string | null {
  return country.fee && country.fee > 0 ? `From ${country.fee.toLocaleString("en-US")} USD` : null;
}

export function VisaList() {
  const { data, error, loading, reload } = useAdminQuery<VisaCountry[]>("/visa-countries");
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [visibility, setVisibility] = useState<"all" | "active" | "hidden">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const groups = useMemo(() => [...new Set((data ?? []).map((c) => c.group))].sort(), [data]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (c) =>
        (!q || c.country_name.toLowerCase().includes(q)) &&
        (!group || c.group === group) &&
        (visibility === "all" || (visibility === "active") === c.is_active),
    );
  }, [data, search, group, visibility]);

  async function remove(country: VisaCountry) {
    const ok = await confirm({
      title: `Delete ${country.country_name}?`,
      message: "It will disappear from the public Visa page. This cannot be undone.",
      confirmLabel: "Delete country",
      danger: true,
    });
    if (!ok) return;
    setBusyId(country.id);
    try {
      await adminApi(`/visa-countries/${country.id}`, { method: "DELETE" });
      toast.success(`${country.country_name} deleted`);
      reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Visa Assistance"
        description="Destinations shown on the public Visa page. Fees and processing times stay hidden until you fill them in."
        actions={
          <Link
            href="/admin/visa/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#081a2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-colors hover:bg-[#12314d]"
          >
            <Plus size={16} />
            Add country
          </Link>
        }
      />

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search countries…" />
              <Select aria-label="Filter by group" value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="">All groups</option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Filter by visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              >
                <option value="all">Shown and hidden</option>
                <option value="active">Shown on site</option>
                <option value="hidden">Hidden</option>
              </Select>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                title={data && data.length > 0 ? "No countries match your filters" : "No visa countries yet"}
                description={data && data.length > 0 ? undefined : "Add the destinations you offer visa assistance for."}
              />
            ) : (
              <DataTable>
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className={thCls}>Country</th>
                    <th className={thCls}>Group</th>
                    <th className={thCls}>Visa types</th>
                    <th className={thCls}>Fee / timeline</th>
                    <th className={thCls}>Status</th>
                    <th className={thCls} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((c) => {
                    const fee = publishedFee(c);
                    const time = c.processing_time && c.processing_time.toLowerCase() !== "on enquiry" ? c.processing_time : null;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className={tdCls}>
                          <Link href={`/admin/visa/${c.id}`} className="flex items-center gap-2 font-medium text-slate-900 hover:text-brand-blue">
                            <span aria-hidden="true" className="text-lg">
                              {c.flag_emoji}
                            </span>
                            {c.country_name}
                          </Link>
                        </td>
                        <td className={tdCls}>{c.group}</td>
                        <td className={`${tdCls} max-w-xs truncate`}>
                          {(c.visa_types?.length ? c.visa_types.map((t) => t.name) : [c.visa_type]).join(", ")}
                        </td>
                        <td className={tdCls}>
                          {fee || time ? (
                            [fee, time].filter(Boolean).join(" · ")
                          ) : (
                            <span className="text-slate-400">Not published</span>
                          )}
                        </td>
                        <td className={tdCls}>
                          <Badge tone={c.is_active ? "green" : "slate"}>{c.is_active ? "Shown" : "Hidden"}</Badge>
                        </td>
                        <td className={`${tdCls} text-right`}>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/admin/visa/${c.id}`}
                              aria-label={`Edit ${c.country_name}`}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                              <Pencil size={15} />
                            </Link>
                            {isAdmin && (
                              <Btn
                                variant="ghost"
                                size="sm"
                                aria-label={`Delete ${c.country_name}`}
                                loading={busyId === c.id}
                                icon={<Trash2 size={15} />}
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => remove(c)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </DataTable>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
