"use client";

/* eslint-disable @next/next/no-img-element -- previews of uploaded files */

import { Copy, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { uploadImage } from "@/components/admin/forms";
import { Modal, useConfirm, useToast } from "@/components/admin/overlays";
import { Btn, EmptyState, ErrorState, Field, PageHeader, SearchInput, Spinner, TextInput } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { formatBytes, formatDate } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { MediaItem } from "@/lib/admin/types";

export default function MediaPage() {
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Wait for a pause in typing before asking the server.
  useEffect(() => {
    const t = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const { data, error, loading, reload } = useAdminQuery<MediaItem[]>(`/media${query ? `?q=${encodeURIComponent(query)}` : ""}`);

  async function upload(files: FileList | File[] | null) {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;
    setUploading(true);
    let done = 0;
    for (const file of list) {
      try {
        await uploadImage(file);
        done += 1;
      } catch (err) {
        toast.error(`${file.name}: ${errorText(err)}`);
      }
    }
    if (done > 0) toast.success(done === 1 ? "Image uploaded and optimised" : `${done} images uploaded and optimised`);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    reload();
  }

  function open(item: MediaItem) {
    setSelected(item);
    setAlt(item.alt_text ?? "");
  }

  async function saveAlt() {
    if (!selected) return;
    setSavingAlt(true);
    try {
      const updated = await adminApi<MediaItem>(`/media/${selected.id}`, { method: "PATCH", body: { alt_text: alt.trim() || null } });
      setSelected(updated);
      toast.success("Description saved");
      reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setSavingAlt(false);
    }
  }

  async function remove() {
    if (!selected) return;
    const ok = await confirm({
      title: "Delete image",
      message: `Are you sure you want to delete “${selected.original_name}”? Images that are still used on a page cannot be deleted.`,
      confirmLabel: "Delete image",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi(`/media/${selected.id}`, { method: "DELETE" });
      toast.success("Image deleted");
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(errorText(err));
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy. Select the link and copy it manually.");
    }
  }

  return (
    <>
      <PageHeader
        title="Media"
        description="Upload images once and reuse them across packages, destinations, visas and blog posts. Files are checked, resized and converted to WebP automatically."
        actions={
          <>
            <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={(e) => upload(e.target.files)} />
            <Btn icon={<Upload size={15} />} loading={uploading} onClick={() => fileRef.current?.click()}>
              Upload images
            </Btn>
          </>
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-4 transition-colors ${dragging ? "border-brand-blue bg-brand-blue/5" : "border-slate-300 bg-white"}`}
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by file name or description…" className="w-full sm:w-80" />
          <p className="text-xs text-slate-500">Drag images here to upload · JPEG, PNG, WebP, GIF or AVIF · up to 8 MB each</p>
        </div>

        {loading && <Spinner />}
        {error && !data && <ErrorState message={error} onRetry={reload} />}
        {data && data.length === 0 && (
          <EmptyState title={query ? "No images match your search" : "No images uploaded yet"} description={query ? undefined : "Drop files here or use Upload images."} />
        )}
        {data && data.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {data.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => open(m)} className="group block w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left hover:border-brand-blue hover:shadow-md">
                  <img src={m.thumb_url} alt={m.alt_text ?? m.original_name} loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                  <span className="block truncate px-2.5 pt-1.5 text-xs font-medium text-slate-700">{m.original_name}</span>
                  <span className="block px-2.5 pb-1.5 text-[11px] text-slate-400">
                    {m.width}×{m.height} · {formatBytes(m.size_bytes)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.original_name ?? "Image"}
        size="lg"
        footer={
          <>
            {isAdmin && (
              <Btn variant="danger" icon={<Trash2 size={15} />} onClick={remove} className="mr-auto">
                Delete
              </Btn>
            )}
            <Btn variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Btn>
          </>
        }
      >
        {selected && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <img src={selected.url} alt={selected.alt_text ?? ""} className="max-h-80 w-full rounded-lg bg-slate-100 object-contain" />
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-slate-500">Size</dt>
                <dd>{selected.width}×{selected.height}px</dd>
                <dt className="text-slate-500">File size</dt>
                <dd>{formatBytes(selected.size_bytes)}</dd>
                <dt className="text-slate-500">Uploaded</dt>
                <dd>{formatDate(selected.created_at)}</dd>
                <dt className="text-slate-500">Format</dt>
                <dd>WebP{selected.variants.avif ? " + AVIF" : ""}</dd>
              </dl>
              <Field label="Description (alt text)" hint="Describes the picture for people using screen readers and helps SEO.">
                {(id) => (
                  <div className="flex gap-2">
                    <TextInput id={id} value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} />
                    <Btn variant="secondary" loading={savingAlt} onClick={saveAlt} disabled={alt.trim() === (selected.alt_text ?? "")}>
                      Save
                    </Btn>
                  </div>
                )}
              </Field>
              <Field label="Image link">
                {(id) => (
                  <div className="flex gap-2">
                    <TextInput id={id} readOnly value={selected.url} onFocus={(e) => e.currentTarget.select()} />
                    <Btn variant="secondary" icon={<Copy size={14} />} onClick={() => copy(selected.url)}>
                      Copy
                    </Btn>
                  </div>
                )}
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
