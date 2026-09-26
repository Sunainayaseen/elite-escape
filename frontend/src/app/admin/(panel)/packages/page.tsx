"use client";

/* eslint-disable @next/next/no-img-element -- table thumbnails come from uploads and remote hosts */

import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Star,
  Tags,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { CategoriesModal } from "@/components/admin/packages/CategoriesModal";
import { IconBtn } from "@/components/admin/forms";
import { useConfirm, useToast } from "@/components/admin/overlays";
import {
  Btn,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PackageStatusBadge,
  PageHeader,
  SearchInput,
  Spinner,
  Tabs,
  tdCls,
  thCls,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { formatDate, formatPrice } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { AdminPackage, PackageStatus } from "@/lib/admin/types";

type Tab = "all" | PackageStatus | "archived";

export default function PackagesPage() {
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const active = useAdminQuery<AdminPackage[]>("/packages");
  const archived = useAdminQuery<AdminPackage[]>("/packages?archived=true");
  const source = tab === "archived" ? archived : active;

  const packages = source.data;
  const counts = useMemo(() => {
    const list = active.data ?? [];
    return {
      all: list.length,
      published: list.filter((p) => p.status === "published").length,
      draft: list.filter((p) => p.status === "draft").length,
      unpublished: list.filter((p) => p.status === "unpublished").length,
      archived: archived.data?.length ?? 0,
    };
  }, [active.data, archived.data]);

  const visible = useMemo(() => {
    let list = packages ?? [];
    if (tab !== "all" && tab !== "archived") list = list.filter((p) => p.status === tab);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => `${p.title} ${p.country} ${p.category_name}`.toLowerCase().includes(q));
    return list;
  }, [packages, tab, search]);

  // Arrows only make sense when the whole list is on screen in its real order.
  const canReorder = tab === "all" && search.trim() === "";

  async function run(id: string, action: () => Promise<unknown>, success: string) {
    setBusyId(id);
    try {
      await action();
      toast.success(success);
      active.reload();
      archived.reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  }

  const setStatus = (p: AdminPackage, status: PackageStatus) =>
    run(
      p.id,
      () => adminApi(`/packages/${p.id}`, { method: "PATCH", body: { status } }),
      status === "published" ? `“${p.title}” is now live on the website` : `“${p.title}” was removed from the website`,
    );

  const toggleFeatured = (p: AdminPackage) =>
    run(p.id, () => adminApi(`/packages/${p.id}`, { method: "PATCH", body: { is_featured: !p.is_featured } }), p.is_featured ? "No longer featured" : "Marked as featured");

  async function move(index: number, direction: -1 | 1) {
    const list = active.data ?? [];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const ids = list.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusyId(list[index].id);
    try {
      await adminApi("/packages/reorder", { method: "POST", body: { ids } });
      active.reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  }

  async function archive(p: AdminPackage) {
    const ok = await confirm({
      title: "Delete package",
      message: (
        <>
          <p className="font-semibold text-slate-800">Are you sure you want to delete this package?</p>
          <p className="mt-2">
            “{p.title}” will be removed from the website and moved to the Archived tab, where you can restore it later.
          </p>
        </>
      ),
      confirmLabel: "Delete package",
      danger: true,
    });
    if (ok) await run(p.id, () => adminApi(`/packages/${p.id}`, { method: "DELETE" }), `“${p.title}” was archived`);
  }

  async function erase(p: AdminPackage) {
    const ok = await confirm({
      title: "Delete permanently",
      message: (
        <>
          <p className="font-semibold text-slate-800">Are you sure you want to permanently delete this package?</p>
          <p className="mt-2">“{p.title}” and its itinerary will be erased for good. This cannot be undone.</p>
        </>
      ),
      confirmLabel: "Delete permanently",
      danger: true,
    });
    if (ok) await run(p.id, () => adminApi(`/packages/${p.id}?permanent=true`, { method: "DELETE" }), `“${p.title}” was deleted permanently`);
  }

  const restore = (p: AdminPackage) =>
    run(p.id, () => adminApi(`/packages/${p.id}/restore`, { method: "POST" }), `“${p.title}” was restored as unpublished`);

  return (
    <>
      <PageHeader
        title="Holiday Packages"
        description="Create and edit the packages shown on the website. Changes appear on the public site as soon as you save."
        actions={
          <>
            <Btn variant="secondary" icon={<Tags size={15} />} onClick={() => setCategoriesOpen(true)}>
              Categories
            </Btn>
            <Link
              href="/admin/packages/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#081a2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-colors hover:bg-[#12314d]"
            >
              <Plus size={15} /> New package
            </Link>
          </>
        }
      />

      <Card className="[&>div]:p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "all", label: "All", count: counts.all },
              { value: "published", label: "Published", count: counts.published },
              { value: "draft", label: "Draft", count: counts.draft },
              { value: "unpublished", label: "Unpublished", count: counts.unpublished },
              { value: "archived", label: "Archived", count: counts.archived },
            ]}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search packages…" className="w-full lg:w-72" />
        </div>

        {source.loading && <Spinner />}
        {source.error && !packages && <ErrorState message={source.error} onRetry={source.reload} />}
        {packages && visible.length === 0 && (
          <EmptyState
            title={search ? "No packages match your search" : tab === "archived" ? "The archive is empty" : "No packages here yet"}
            description={
              search || tab === "archived" ? undefined : "Create your first package and it will appear on the website once published."
            }
            action={
              !search && tab !== "archived" ? (
                <Link href="/admin/packages/new" className="text-sm font-semibold text-brand-blue hover:underline">
                  Create a package
                </Link>
              ) : undefined
            }
          />
        )}
        {packages && visible.length > 0 && (
          <DataTable>
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {canReorder && <th className={thCls}>Order</th>}
                <th className={thCls}>Package</th>
                <th className={thCls}>Price</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Updated</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((p, index) => {
                const busy = busyId === p.id;
                return (
                  <tr key={p.id} className={busy ? "opacity-60" : "hover:bg-slate-50/60"}>
                    {canReorder && (
                      <td className={`${tdCls} w-24`}>
                        <div className="flex">
                          <IconBtn label="Move up" disabled={busy || index === 0} onClick={() => move(index, -1)}>
                            <ArrowUp size={15} />
                          </IconBtn>
                          <IconBtn label="Move down" disabled={busy || index === visible.length - 1} onClick={() => move(index, 1)}>
                            <ArrowDown size={15} />
                          </IconBtn>
                        </div>
                      </td>
                    )}
                    <td className={tdCls}>
                      <div className="flex items-center gap-3">
                        {p.main_image ? (
                          <img src={p.main_image} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                        ) : (
                          <span className="h-12 w-16 shrink-0 rounded-md bg-slate-200" />
                        )}
                        <div className="min-w-0">
                          <Link href={`/admin/packages/${p.id}`} className="block truncate font-semibold text-slate-900 hover:text-brand-blue">
                            {p.title}
                          </Link>
                          <p className="truncate text-xs text-slate-500">
                            {p.country} · {p.category_name} · {p.duration}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap`}>{formatPrice(p.currency, p.price_from, p.price_to)}</td>
                    <td className={tdCls}>
                      <div className="flex items-center gap-2">
                        <PackageStatusBadge status={p.status} archived={!!p.deleted_at} />
                        {p.is_featured && !p.deleted_at && (
                          <Star size={14} className="fill-amber-400 text-amber-400" aria-label="Featured" />
                        )}
                      </div>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-xs text-slate-500`}>{formatDate(p.updated_at)}</td>
                    <td className={tdCls}>
                      <div className="flex justify-end">
                        {p.deleted_at ? (
                          <>
                            <IconBtn label="Restore" disabled={busy} onClick={() => restore(p)}>
                              <ArchiveRestore size={16} />
                            </IconBtn>
                            {isAdmin && (
                              <IconBtn label="Delete permanently" danger disabled={busy} onClick={() => erase(p)}>
                                <Trash2 size={16} />
                              </IconBtn>
                            )}
                          </>
                        ) : (
                          <>
                            <IconBtn label={p.is_featured ? "Remove from featured" : "Mark as featured"} disabled={busy} onClick={() => toggleFeatured(p)}>
                              <Star size={16} className={p.is_featured ? "fill-amber-400 text-amber-400" : ""} />
                            </IconBtn>
                            {p.status === "published" ? (
                              <>
                                <a
                                  href={`/holidays/${p.category}/${p.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View on website"
                                  aria-label="View on website"
                                  className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                >
                                  <ExternalLink size={16} />
                                </a>
                                <IconBtn label="Unpublish" disabled={busy} onClick={() => setStatus(p, "unpublished")}>
                                  <EyeOff size={16} />
                                </IconBtn>
                              </>
                            ) : (
                              <IconBtn label="Publish" disabled={busy} onClick={() => setStatus(p, "published")}>
                                <Eye size={16} />
                              </IconBtn>
                            )}
                            <Link
                              href={`/admin/packages/${p.id}`}
                              title="Edit"
                              aria-label="Edit"
                              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                              <Pencil size={16} />
                            </Link>
                            {isAdmin && (
                              <IconBtn label="Delete (archive)" danger disabled={busy} onClick={() => archive(p)}>
                                <Archive size={16} />
                              </IconBtn>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        )}
      </Card>

      <CategoriesModal open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </>
  );
}
