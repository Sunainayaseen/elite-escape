"use client";

import { Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { Modal, useConfirm, useToast } from "@/components/admin/overlays";
import {
  Btn,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  Field,
  Spinner,
  TextArea,
  TextInput,
  tdCls,
  thCls,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { Category } from "@/lib/admin/types";

export function BlogCategories() {
  const { data, error, loading, reload } = useAdminQuery<Category[]>("/blog-categories");
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(category: Category) {
    const ok = await confirm({
      title: `Delete “${category.name}”?`,
      message: "Categories that still have posts cannot be deleted.",
      confirmLabel: "Delete category",
      danger: true,
    });
    if (!ok) return;
    setBusyId(category.id);
    try {
      await adminApi(`/blog-categories/${category.id}`, { method: "DELETE" });
      toast.success("Category deleted");
      reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card
      title="Blog categories"
      description="Group articles so visitors can find related guides."
      actions={
        <Btn size="sm" onClick={() => setEditing("new")}>
          Add category
        </Btn>
      }
    >
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No categories yet" description="Add one to start organising your articles." />
      ) : (
        <DataTable>
          <thead className="border-b border-slate-200">
            <tr>
              <th className={thCls}>Name</th>
              <th className={thCls}>Description</th>
              <th className={thCls} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((c) => (
              <tr key={c.id}>
                <td className={`${tdCls} font-medium text-slate-900`}>{c.name}</td>
                <td className={`${tdCls} max-w-md truncate text-slate-500`}>{c.description ?? "—"}</td>
                <td className={`${tdCls} text-right`}>
                  <div className="flex justify-end gap-1">
                    <Btn
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${c.name}`}
                      icon={<Pencil size={15} />}
                      onClick={() => setEditing(c)}
                    />
                    {isAdmin && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${c.name}`}
                        loading={busyId === c.id}
                        icon={<Trash2 size={15} />}
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => remove(c)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <CategoryModal
        target={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
    </Card>
  );
}

function CategoryModal({
  target,
  onClose,
  onSaved,
}: {
  target: Category | "new" | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Modal open={target !== null} onClose={onClose} title={target === "new" ? "Add category" : "Edit category"} size="md">
      {target !== null && (
        <CategoryForm key={target === "new" ? "new" : target.id} target={target} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  );
}

function CategoryForm({
  target,
  onClose,
  onSaved,
}: {
  target: Category | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(target === "new" ? "" : target.name);
  const [description, setDescription] = useState(target === "new" ? "" : (target.description ?? ""));
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Enter a name.");
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      const body = { name: name.trim(), description: description.trim() || null };
      if (target === "new") await adminApi("/blog-categories", { method: "POST", body });
      else await adminApi(`/blog-categories/${target.id}`, { method: "PUT", body });
      toast.success(target === "new" ? "Category added" : "Category updated");
      onSaved();
    } catch (err) {
      toast.error(errorText(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Name" required error={nameError}>
        {(id) => <TextInput id={id} value={name} maxLength={120} autoFocus onChange={(e) => setName(e.target.value)} />}
      </Field>
      <Field label="Description">
        {(id) => (
          <TextArea id={id} rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
        )}
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn type="submit" loading={saving}>
          {target === "new" ? "Add category" : "Save"}
        </Btn>
      </div>
    </form>
  );
}
