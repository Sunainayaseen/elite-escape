"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { IconBtn, ImageField } from "@/components/admin/forms";
import { Modal, useConfirm, useToast } from "@/components/admin/overlays";
import { Btn, EmptyState, Field, Spinner, TextArea, TextInput } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { Category } from "@/lib/admin/types";

type Draft = { id: string | null; name: string; description: string; image: string | null };
const BLANK: Draft = { id: null, name: "", description: "", image: null };

/** Package categories are the groups on the Holidays page (e.g. Asia, Europe). */
export function CategoriesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, reload } = useAdminQuery<Category[]>(open ? "/categories?section=holidays" : null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!draft || !draft.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        image: draft.image,
        section: "holidays",
        sort_order: data?.find((c) => c.id === draft.id)?.sort_order ?? data?.length ?? 0,
      };
      if (draft.id) await adminApi(`/categories/${draft.id}`, { method: "PUT", body });
      else await adminApi("/categories", { method: "POST", body });
      toast.success(draft.id ? "Category updated" : "Category added");
      setDraft(null);
      reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Category) {
    const ok = await confirm({
      title: "Delete category",
      message: `Are you sure you want to delete “${c.name}”? A category that still has packages cannot be deleted.`,
      confirmLabel: "Delete category",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi(`/categories/${c.id}`, { method: "DELETE" });
      toast.success("Category deleted");
      reload();
    } catch (err) {
      toast.error(errorText(err));
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setDraft(null);
        onClose();
      }}
      title="Package categories"
      size="lg"
    >
      <p className="mb-4 text-sm text-slate-500">
        Categories group packages on the Holidays page. A package must belong to one category.
      </p>

      {draft ? (
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <Field label="Name" required>
            {(id) => <TextInput id={id} value={draft.name} maxLength={120} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />}
          </Field>
          <Field label="Description">
            {(id) => <TextArea id={id} rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />}
          </Field>
          <ImageField label="Image" value={draft.image} onChange={(image) => setDraft({ ...draft, image })} />
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Btn>
            <Btn loading={saving} disabled={!draft.name.trim()} onClick={save}>
              {draft.id ? "Save category" : "Add category"}
            </Btn>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Btn variant="secondary" icon={<Plus size={15} />} onClick={() => setDraft(BLANK)}>
              Add category
            </Btn>
          </div>
          {loading && <Spinner />}
          {data && data.length === 0 && <EmptyState title="No categories yet" />}
          {data && data.length > 0 && (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {data.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      /holidays/{c.slug}
                      {c.description ? ` · ${c.description}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <IconBtn
                      label={`Edit ${c.name}`}
                      onClick={() => setDraft({ id: c.id, name: c.name, description: c.description ?? "", image: c.image })}
                    >
                      <Pencil size={15} />
                    </IconBtn>
                    {isAdmin && (
                      <IconBtn label={`Delete ${c.name}`} danger onClick={() => remove(c)}>
                        <Trash2 size={15} />
                      </IconBtn>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
