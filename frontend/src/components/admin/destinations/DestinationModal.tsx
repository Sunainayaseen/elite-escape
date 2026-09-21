"use client";

import { useMemo, useState } from "react";

import { EMPTY_SEO, ImageField, SeoEditor, pickSeo } from "@/components/admin/forms";
import { Modal, useToast } from "@/components/admin/overlays";
import { Btn, Field, SearchInput, Tabs, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { AdminPackage, Destination, SeoFields } from "@/lib/admin/types";

type Draft = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string | null;
  is_published: boolean;
  sort_order: string;
  package_ids: string[];
  seo: SeoFields;
};

const BLANK: Draft = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  image: null,
  is_published: false,
  sort_order: "0",
  package_ids: [],
  seo: EMPTY_SEO,
};

const nz = (v: string) => (v.trim() === "" ? null : v.trim());

function fromDestination(d: Destination): Draft {
  return {
    name: d.name,
    slug: d.slug,
    tagline: d.tagline ?? "",
    description: d.description ?? "",
    image: d.image,
    is_published: d.is_published,
    sort_order: String(d.sort_order),
    package_ids: d.package_ids,
    seo: pickSeo(d),
  };
}

type Tab = "details" | "packages" | "seo";

type Props = {
  destination: Destination | null;
  onClose: () => void;
  onSaved: () => void;
};

/** Mounted only while open, so every opening starts from a fresh draft of the chosen destination. */
export function DestinationModal({ open, ...props }: Props & { open: boolean }) {
  return open ? <DestinationModalBody key={props.destination?.id ?? "new"} {...props} /> : null;
}

function DestinationModalBody({ destination, onClose, onSaved }: Props) {
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(() => (destination ? fromDestination(destination) : BLANK));
  const [tab, setTab] = useState<Tab>("details");
  const [pkgSearch, setPkgSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const packages = useAdminQuery<AdminPackage[]>("/packages");

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const visiblePackages = useMemo(() => {
    const q = pkgSearch.trim().toLowerCase();
    return (packages.data ?? []).filter((p) => !q || `${p.title} ${p.country}`.toLowerCase().includes(q));
  }, [packages.data, pkgSearch]);

  async function save() {
    if (!draft.name.trim()) {
      setNameError("Enter the destination name");
      setTab("details");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: draft.name.trim(),
        slug: nz(draft.slug),
        tagline: nz(draft.tagline),
        description: nz(draft.description),
        image: draft.image,
        is_published: draft.is_published,
        sort_order: Math.max(0, Math.round(Number(draft.sort_order) || 0)),
        // On create there is nothing to compare with; on edit we always send the current selection.
        package_ids: draft.package_ids,
        ...draft.seo,
      };
      if (destination) await adminApi(`/destinations/${destination.id}`, { method: "PUT", body });
      else await adminApi("/destinations", { method: "POST", body });
      toast.success(destination ? "Destination saved" : "Destination created");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  const otherDestinationName = (p: AdminPackage) => {
    const linked = p.destination_id && p.destination_id !== destination?.id;
    return linked ? p.country : null;
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={destination ? `Edit ${destination.name}` : "New destination"}
      size="lg"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>
            Cancel
          </Btn>
          <Btn loading={saving} onClick={save}>
            {destination ? "Save changes" : "Create destination"}
          </Btn>
        </>
      }
    >
      <div className="mb-5">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "details", label: "Details" },
            { value: "packages", label: "Packages", count: draft.package_ids.length },
            { value: "seo", label: "SEO" },
          ]}
        />
      </div>

      {tab === "details" && (
        <div className="flex flex-col gap-5">
          <Field label="Name" required error={nameError}>
            {(id) => (
              <TextInput
                id={id}
                value={draft.name}
                maxLength={120}
                placeholder="e.g. Japan"
                onChange={(e) => {
                  set("name", e.target.value);
                  setNameError(null);
                }}
              />
            )}
          </Field>
          <Field label="Tagline" hint="A short line under the name (optional).">
            {(id) => <TextInput id={id} value={draft.tagline} maxLength={200} onChange={(e) => set("tagline", e.target.value)} />}
          </Field>
          <Field label="Description">
            {(id) => <TextArea id={id} rows={5} value={draft.description} onChange={(e) => set("description", e.target.value)} />}
          </Field>
          <ImageField label="Destination image" value={draft.image} onChange={(v) => set("image", v)} />
          <Toggle
            checked={draft.is_published}
            onChange={(v) => set("is_published", v)}
            label="Published"
            description="Unpublished destinations stay hidden from the website."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Position" hint="Lower numbers appear first.">
              {(id) => <TextInput id={id} type="number" min={0} value={draft.sort_order} onChange={(e) => set("sort_order", e.target.value)} />}
            </Field>
            <Field label="Web address (slug)" hint="Leave empty to create it from the name.">
              {(id) => <TextInput id={id} value={draft.slug} maxLength={140} onChange={(e) => set("slug", e.target.value)} />}
            </Field>
          </div>
        </div>
      )}

      {tab === "packages" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-500">
            Tick the packages that belong to this destination. A package can belong to one destination, so ticking one that is
            linked elsewhere moves it here, and the place name on its card follows this destination.
          </p>
          <SearchInput value={pkgSearch} onChange={setPkgSearch} placeholder="Search packages…" />
          {packages.loading && <p className="py-6 text-center text-sm text-slate-500">Loading packages…</p>}
          {packages.data && visiblePackages.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No packages found.</p>}
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {visiblePackages.map((p) => {
              const checked = draft.package_ids.includes(p.id);
              const elsewhere = otherDestinationName(p);
              return (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      className="h-4 w-4 rounded border-slate-300 accent-[#2890BD]"
                      onChange={() =>
                        set("package_ids", checked ? draft.package_ids.filter((x) => x !== p.id) : [...draft.package_ids, p.id])
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">{p.title}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {p.country} · {p.status}
                        {elsewhere ? ` · currently linked to ${elsewhere}` : ""}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {tab === "seo" && <SeoEditor value={draft.seo} onChange={(v) => set("seo", v)} />}
    </Modal>
  );
}
