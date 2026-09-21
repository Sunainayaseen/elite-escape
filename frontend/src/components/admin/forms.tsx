"use client";

/* eslint-disable @next/next/no-img-element -- admin previews show arbitrary uploaded/remote images */

import { ArrowDown, ArrowUp, ImageIcon, Link2, Plus, Trash2, Upload, X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { Modal, useToast } from "@/components/admin/overlays";
import { Btn, Field, Spinner, TextArea, TextInput, inputCls } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import type { MediaItem, SeoFields } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

// ---- Simple list of strings (highlights, inclusions, …) -------------------------------------

export function StringListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder,
  addLabel = "Add item",
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <TextInput
                value={item}
                aria-label={`${label} ${i + 1}`}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <IconBtn label="Move up" disabled={i === 0} onClick={() => onChange(swap(items, i, i - 1))}>
                <ArrowUp size={15} />
              </IconBtn>
              <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => onChange(swap(items, i, i + 1))}>
                <ArrowDown size={15} />
              </IconBtn>
              <IconBtn label="Remove" danger onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 size={15} />
              </IconBtn>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <TextInput
          value={draft}
          placeholder={placeholder ?? "Type and press Enter"}
          aria-label={`New ${label.toLowerCase()} item`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <Btn variant="secondary" icon={<Plus size={15} />} onClick={commit} disabled={!draft.trim()}>
          {addLabel}
        </Btn>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function swap<T>(list: T[], a: number, b: number): T[] {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

export function IconBtn({
  label,
  children,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent",
        danger && "hover:bg-red-50 hover:text-red-600",
      )}
    >
      {children}
    </button>
  );
}

// ---- Repeater of structured items (itinerary days, FAQ, …) ----------------------------------

export function Repeater<T>({
  label,
  hint,
  items,
  onChange,
  newItem,
  addLabel,
  itemLabel,
  render,
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: (index: number) => T;
  addLabel: string;
  itemLabel: (index: number) => string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{itemLabel(i)}</span>
            <div className="flex">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => onChange(swap(items, i, i - 1))}>
                <ArrowUp size={15} />
              </IconBtn>
              <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => onChange(swap(items, i, i + 1))}>
                <ArrowDown size={15} />
              </IconBtn>
              <IconBtn label="Remove" danger onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 size={15} />
              </IconBtn>
            </div>
          </div>
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      <div>
        <Btn variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => onChange([...items, newItem(items.length)])}>
          {addLabel}
        </Btn>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// ---- Media library / uploads ------------------------------------------------------------------

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_MB = 8;

export async function uploadImage(file: File): Promise<MediaItem> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Please choose a JPEG, PNG, WebP, GIF or AVIF image.");
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Images must be ${MAX_MB} MB or smaller.`);
  const form = new FormData();
  form.append("file", file);
  return adminApi<MediaItem>("/media", { method: "POST", form });
}

export function MediaPicker({
  open,
  onClose,
  onPick,
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    adminApi<MediaItem[]>("/media")
      .then((list) => !cancelled && setItems(list))
      .catch((err) => {
        if (!cancelled) {
          setItems([]);
          toast.error(errorText(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, toast]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const media = await uploadImage(file);
        setItems((prev) => [media, ...(prev ?? [])]);
        setSelected((prev) => (multiple ? [...prev, media.url] : [media.url]));
      }
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function toggle(url: string) {
    setSelected((prev) => (multiple ? (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]) : [url]));
  }

  function close() {
    setSelected([]);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={multiple ? "Choose images" : "Choose an image"}
      size="xl"
      footer={
        <>
          <Btn variant="secondary" onClick={close}>
            Cancel
          </Btn>
          <Btn
            disabled={selected.length === 0}
            onClick={() => {
              onPick(selected);
              setSelected([]);
            }}
          >
            {multiple ? `Use ${selected.length || ""} selected`.trim() : "Use this image"}
          </Btn>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">Pick an existing image or upload a new one (JPEG, PNG, WebP, GIF, AVIF · up to {MAX_MB} MB).</p>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Btn icon={<Upload size={15} />} loading={uploading} onClick={() => fileRef.current?.click()}>
            Upload
          </Btn>
        </div>
      </div>
      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">No images yet. Upload your first one.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((m) => {
            const active = selected.includes(m.url);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => toggle(m.url)}
                  aria-pressed={active}
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-lg border-2 bg-slate-100 text-left",
                    active ? "border-brand-blue ring-2 ring-brand-blue/30" : "border-transparent hover:border-slate-300",
                  )}
                >
                  <img src={m.thumb_url} alt={m.alt_text ?? m.original_name} className="aspect-[4/3] w-full object-cover" />
                  <span className="block truncate bg-white px-2 py-1 text-xs text-slate-600">{m.original_name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

// ---- Single image ----------------------------------------------------------------------------

export function ImageField({
  label,
  value,
  onChange,
  hint,
  required,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
  required?: boolean;
}) {
  const toast = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onChange((await uploadImage(file)).url);
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-3 sm:flex-row sm:items-center">
        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200 sm:w-44">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={28} className="text-slate-400" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={(e) => upload(e.target.files)} />
            <Btn size="sm" icon={<Upload size={14} />} loading={uploading} onClick={() => fileRef.current?.click()}>
              Upload
            </Btn>
            <Btn size="sm" variant="secondary" icon={<ImageIcon size={14} />} onClick={() => setPickerOpen(true)}>
              Media library
            </Btn>
            <Btn size="sm" variant="ghost" icon={<Link2 size={14} />} onClick={() => setLinkMode((v) => !v)}>
              Use a link
            </Btn>
            {value && (
              <Btn size="sm" variant="ghost" icon={<X size={14} />} onClick={() => onChange(null)}>
                Remove
              </Btn>
            )}
          </div>
          {linkMode && (
            <div className="flex gap-2">
              <TextInput value={link} placeholder="https://…" aria-label="Image link" onChange={(e) => setLink(e.target.value)} />
              <Btn
                size="sm"
                variant="secondary"
                disabled={!link.trim()}
                onClick={() => {
                  onChange(link.trim());
                  setLink("");
                  setLinkMode(false);
                }}
              >
                Apply
              </Btn>
            </div>
          )}
          {value && <p className="truncate text-xs text-slate-500" title={value}>{value}</p>}
        </div>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(urls) => {
          onChange(urls[0] ?? null);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

// ---- Gallery ---------------------------------------------------------------------------------

export function GalleryField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [link, setLink] = useState("");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, i) => (
            <li key={`${url}-${i}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="flex justify-between border-t border-slate-100 px-1 py-0.5">
                <div className="flex">
                  <IconBtn label="Move earlier" disabled={i === 0} onClick={() => onChange(swap(value, i, i - 1))}>
                    <ArrowUp size={14} className="-rotate-90" />
                  </IconBtn>
                  <IconBtn label="Move later" disabled={i === value.length - 1} onClick={() => onChange(swap(value, i, i + 1))}>
                    <ArrowDown size={14} className="-rotate-90" />
                  </IconBtn>
                </div>
                <IconBtn label="Remove image" danger onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Btn variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setPickerOpen(true)}>
          Add images
        </Btn>
        <div className="flex min-w-56 flex-1 gap-2">
          <TextInput value={link} placeholder="…or paste an https:// image link" aria-label="Gallery image link" onChange={(e) => setLink(e.target.value)} />
          <Btn
            size="sm"
            variant="ghost"
            disabled={!link.trim()}
            onClick={() => {
              onChange([...value, link.trim()]);
              setLink("");
            }}
          >
            Add
          </Btn>
        </div>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <MediaPicker
        multiple
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(urls) => {
          onChange([...value, ...urls.filter((u) => !value.includes(u))]);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

// ---- SEO -------------------------------------------------------------------------------------

export const EMPTY_SEO: SeoFields = {
  seo_title: null,
  meta_description: null,
  og_title: null,
  og_description: null,
  canonical_url: null,
  focus_keyword: null,
};

export function pickSeo(source: Partial<SeoFields>): SeoFields {
  return {
    seo_title: source.seo_title ?? null,
    meta_description: source.meta_description ?? null,
    og_title: source.og_title ?? null,
    og_description: source.og_description ?? null,
    canonical_url: source.canonical_url ?? null,
    focus_keyword: source.focus_keyword ?? null,
  };
}

function Counter({ value, max }: { value: string | null; max: number }) {
  const n = value?.length ?? 0;
  return (
    <span className={cn("text-xs", n > max ? "text-red-600" : "text-slate-400")}>
      {n}/{max}
    </span>
  );
}

export function SeoEditor({ value, onChange }: { value: SeoFields; onChange: (next: SeoFields) => void }) {
  const set = useCallback((patch: Partial<SeoFields>) => onChange({ ...value, ...patch }), [value, onChange]);
  const v = (key: keyof SeoFields) => value[key] ?? "";
  const n = (s: string) => (s.trim() === "" ? null : s);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <p className="text-xs text-slate-500 md:col-span-2">
        Optional. Leave a field empty and the page keeps its normal title and description; nothing is generated for you.
      </p>
      <Field label="SEO title" className="md:col-span-2" hint="Shown in Google results. About 50–60 characters works well.">
        {(id) => (
          <div>
            <TextInput id={id} value={v("seo_title")} maxLength={160} onChange={(e) => set({ seo_title: n(e.target.value) })} />
            <Counter value={value.seo_title} max={160} />
          </div>
        )}
      </Field>
      <Field label="Meta description" className="md:col-span-2" hint="The summary under the title in search results. About 150–160 characters.">
        {(id) => (
          <div>
            <TextArea id={id} rows={2} value={v("meta_description")} maxLength={320} onChange={(e) => set({ meta_description: n(e.target.value) })} />
            <Counter value={value.meta_description} max={320} />
          </div>
        )}
      </Field>
      <Field label="Social share title (Open Graph)">
        {(id) => <TextInput id={id} value={v("og_title")} maxLength={160} onChange={(e) => set({ og_title: n(e.target.value) })} />}
      </Field>
      <Field label="Focus keyword">
        {(id) => <TextInput id={id} value={v("focus_keyword")} maxLength={120} onChange={(e) => set({ focus_keyword: n(e.target.value) })} />}
      </Field>
      <Field label="Social share description (Open Graph)" className="md:col-span-2">
        {(id) => (
          <TextArea id={id} rows={2} value={v("og_description")} maxLength={320} onChange={(e) => set({ og_description: n(e.target.value) })} />
        )}
      </Field>
      <Field label="Canonical URL" className="md:col-span-2" hint="Only set this if the page has a preferred address elsewhere. Must start with https://">
        {(id) => (
          <input
            id={id}
            className={inputCls}
            type="url"
            placeholder="https://"
            value={v("canonical_url")}
            onChange={(e) => set({ canonical_url: n(e.target.value) })}
          />
        )}
      </Field>
    </div>
  );
}
