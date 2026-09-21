"use client";

/* eslint-disable @next/next/no-img-element -- table thumbnails come from uploads and remote hosts */

import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { DestinationModal } from "@/components/admin/destinations/DestinationModal";
import { IconBtn } from "@/components/admin/forms";
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
  Spinner,
  tdCls,
  thCls,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { Destination } from "@/lib/admin/types";

export default function DestinationsPage() {
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, loading, reload } = useAdminQuery<Destination[]>("/destinations");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Destination | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((d) => !q || `${d.name} ${d.tagline ?? ""}`.toLowerCase().includes(q));
  }, [data, search]);

  function openModal(destination: Destination | null) {
    setEditing(destination);
    setModalOpen(true);
  }

  async function togglePublished(d: Destination) {
    setBusyId(d.id);
    try {
      await adminApi(`/destinations/${d.id}`, {
        method: "PUT",
        body: {
          name: d.name,
          slug: d.slug,
          tagline: d.tagline,
          description: d.description,
          image: d.image,
          is_published: !d.is_published,
          sort_order: d.sort_order,
          seo_title: d.seo_title,
          meta_description: d.meta_description,
          og_title: d.og_title,
          og_description: d.og_description,
          canonical_url: d.canonical_url,
          focus_keyword: d.focus_keyword,
        },
      });
      toast.success(d.is_published ? `${d.name} is now hidden` : `${d.name} is now published`);
      reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(d: Destination) {
    const ok = await confirm({
      title: "Delete destination",
      message: (
        <>
          <p className="font-semibold text-slate-800">Are you sure you want to delete “{d.name}”?</p>
          <p className="mt-2">
            {d.package_count > 0
              ? `Its ${d.package_count} package${d.package_count === 1 ? "" : "s"} will stay on the website but will no longer be linked to a destination.`
              : "This destination has no packages."}
          </p>
        </>
      ),
      confirmLabel: "Delete destination",
      danger: true,
    });
    if (!ok) return;
    setBusyId(d.id);
    try {
      await adminApi(`/destinations/${d.id}`, { method: "DELETE" });
      toast.success(`${d.name} was deleted`);
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
        title="Destinations"
        description="The places you sell. Only destinations listed here (and published) are shown on the website."
        actions={
          <Btn icon={<Plus size={15} />} onClick={() => openModal(null)}>
            New destination
          </Btn>
        }
      />

      <Card className="[&>div]:p-0">
        <div className="border-b border-slate-100 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search destinations…" className="w-full sm:w-72" />
        </div>
        {loading && <Spinner />}
        {error && !data && <ErrorState message={error} onRetry={reload} />}
        {data && visible.length === 0 && (
          <EmptyState
            title={search ? "No destinations match your search" : "No destinations yet"}
            description={search ? undefined : "Add a destination such as Japan or Bali, then assign packages to it."}
            action={
              !search ? (
                <Btn variant="secondary" onClick={() => openModal(null)}>
                  Add the first destination
                </Btn>
              ) : undefined
            }
          />
        )}
        {data && visible.length > 0 && (
          <DataTable>
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className={thCls}>Destination</th>
                <th className={thCls}>Packages</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Position</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((d) => (
                <tr key={d.id} className={busyId === d.id ? "opacity-60" : "hover:bg-slate-50/60"}>
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      {d.image ? (
                        <img src={d.image} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="h-12 w-16 shrink-0 rounded-md bg-slate-200" />
                      )}
                      <div className="min-w-0">
                        <button type="button" onClick={() => openModal(d)} className="block truncate text-left font-semibold text-slate-900 hover:text-brand-blue">
                          {d.name}
                        </button>
                        <p className="truncate text-xs text-slate-500">{d.tagline ?? `/${d.slug}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}>{d.package_count}</td>
                  <td className={tdCls}>
                    <Badge tone={d.is_published ? "green" : "slate"}>{d.is_published ? "Published" : "Hidden"}</Badge>
                  </td>
                  <td className={tdCls}>{d.sort_order}</td>
                  <td className={tdCls}>
                    <div className="flex justify-end">
                      <IconBtn label={d.is_published ? "Unpublish" : "Publish"} disabled={busyId === d.id} onClick={() => togglePublished(d)}>
                        {d.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconBtn>
                      <IconBtn label="Edit" onClick={() => openModal(d)}>
                        <Pencil size={16} />
                      </IconBtn>
                      {isAdmin && (
                        <IconBtn label="Delete" danger disabled={busyId === d.id} onClick={() => remove(d)}>
                          <Trash2 size={16} />
                        </IconBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>

      <DestinationModal open={modalOpen} destination={editing} onClose={() => setModalOpen(false)} onSaved={reload} />
    </>
  );
}
