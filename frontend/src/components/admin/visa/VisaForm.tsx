"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { EMPTY_SEO, ImageField, Repeater, SeoEditor, pickSeo } from "@/components/admin/forms";
import { useConfirm, useToast } from "@/components/admin/overlays";
import {
  Btn,
  Card,
  ErrorState,
  Field,
  PageHeader,
  Spinner,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { slugPreview } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { SeoFields, VisaCountry, VisaType } from "@/lib/admin/types";

type FormState = {
  country_name: string;
  slug: string;
  flag_emoji: string;
  flag_image: string | null;
  group: string;
  description: string;
  visa_types: VisaType[];
  requirements: string;
  fee: string;
  processing_time: string;
  is_active: boolean;
  seo: SeoFields;
};

const BLANK: FormState = {
  country_name: "",
  slug: "",
  flag_emoji: "",
  flag_image: null,
  group: "Visa Assistance",
  description: "",
  visa_types: [{ name: "Visa assistance", description: null }],
  requirements: "",
  fee: "",
  processing_time: "",
  is_active: true,
  seo: EMPTY_SEO,
};

function fromCountry(c: VisaCountry): FormState {
  return {
    country_name: c.country_name,
    slug: c.slug,
    flag_emoji: c.flag_emoji ?? "",
    flag_image: c.flag_image,
    group: c.group,
    description: c.description ?? "",
    visa_types: c.visa_types?.length ? c.visa_types : [{ name: c.visa_type, description: null }],
    requirements: c.requirements ?? "",
    fee: c.fee && c.fee > 0 ? String(c.fee) : "",
    processing_time: c.processing_time && c.processing_time.toLowerCase() !== "on enquiry" ? c.processing_time : "",
    is_active: c.is_active,
    seo: pickSeo(c),
  };
}

export function VisaForm({ id }: { id?: string }) {
  const existing = useAdminQuery<VisaCountry>(id ? `/visa-countries/${id}` : null);
  const all = useAdminQuery<VisaCountry[]>("/visa-countries");
  const groups = [...new Set((all.data ?? []).map((c) => c.group))].sort();

  if (id && existing.loading) return <Spinner />;
  if (id && existing.error) return <ErrorState message={existing.error} onRetry={existing.reload} />;

  return (
    <VisaFormBody
      key={existing.data?.id ?? "new"}
      id={id}
      initial={existing.data ? fromCountry(existing.data) : BLANK}
      groups={groups}
    />
  );
}

function VisaFormBody({ id, initial, groups }: { id?: string; initial: FormState; groups: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAdmin();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!form.country_name.trim()) next.country_name = "Enter the country name.";
    if (!form.group.trim()) next.group = "Enter a group, for example “Visa Assistance”.";
    if (!form.visa_types.some((t) => t.name.trim())) next.visa_types = "Add at least one visa type.";
    const names = form.visa_types.map((t) => t.name.trim().toLowerCase()).filter(Boolean);
    if (new Set(names).size !== names.length) next.visa_types = "Each visa type must have a different name.";
    if (form.fee.trim() !== "" && !(Number(form.fee) >= 0)) next.fee = "Enter a number, or leave it empty.";
    return next;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const body = {
      country_name: form.country_name.trim(),
      slug: form.slug.trim() || null,
      flag_emoji: form.flag_emoji.trim() || null,
      flag_image: form.flag_image,
      group: form.group.trim(),
      description: form.description.trim() || null,
      visa_types: form.visa_types
        .filter((t) => t.name.trim())
        .map((t) => ({ name: t.name.trim(), description: t.description?.trim() || null })),
      requirements: form.requirements.trim() || null,
      fee: form.fee.trim() === "" ? null : Number(form.fee),
      processing_time: form.processing_time.trim() || null,
      is_active: form.is_active,
      ...form.seo,
    };
    setSaving(true);
    try {
      await adminApi(id ? `/visa-countries/${id}` : "/visa-countries", { method: id ? "PUT" : "POST", body });
      toast.success(id ? "Country updated" : "Country added");
      router.push("/admin/visa");
    } catch (err) {
      toast.error(errorText(err));
      setSaving(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `Delete ${form.country_name}?`,
      message: "It will disappear from the public Visa page. This cannot be undone.",
      confirmLabel: "Delete country",
      danger: true,
    });
    if (!ok || !id) return;
    setDeleting(true);
    try {
      await adminApi(`/visa-countries/${id}`, { method: "DELETE" });
      toast.success("Country deleted");
      router.push("/admin/visa");
    } catch (err) {
      toast.error(errorText(err));
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title={id ? `Edit ${initial.country_name || "country"}` : "Add visa country"}
        description="Only publish a fee or processing time once you have confirmed it. Empty values show “Contact us” on the site."
        actions={
          <>
            <Link
              href="/admin/visa"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <Btn type="submit" loading={saving}>
              {id ? "Save changes" : "Add country"}
            </Btn>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <Card title="Country">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Country name" required error={errors.country_name}>
              {(fid) => (
                <TextInput
                  id={fid}
                  value={form.country_name}
                  maxLength={120}
                  onChange={(e) => set({ country_name: e.target.value })}
                />
              )}
            </Field>
            <Field
              label="Web address (slug)"
              hint={`Optional. Leave empty to generate it${form.country_name ? `: ${slugPreview(form.country_name)}` : ""}.`}
            >
              {(fid) => <TextInput id={fid} value={form.slug} maxLength={140} onChange={(e) => set({ slug: e.target.value })} />}
            </Field>
            <Field label="Flag emoji" hint="For example 🇫🇷. Shown next to the country name.">
              {(fid) => <TextInput id={fid} value={form.flag_emoji} maxLength={10} onChange={(e) => set({ flag_emoji: e.target.value })} />}
            </Field>
            <Field label="Group" required error={errors.group} hint="Used to organise countries, for example “Visa Assistance”.">
              {(fid) => (
                <>
                  <TextInput
                    id={fid}
                    list="visa-groups"
                    value={form.group}
                    maxLength={60}
                    onChange={(e) => set({ group: e.target.value })}
                  />
                  <datalist id="visa-groups">
                    {groups.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
            <div className="md:col-span-2">
              <ImageField
                label="Flag image (optional)"
                value={form.flag_image}
                onChange={(url) => set({ flag_image: url })}
                hint="Shown instead of the emoji where supported."
              />
            </div>
            <Field label="Description" className="md:col-span-2" hint="A short introduction shown on the country card.">
              {(fid) => (
                <TextArea
                  id={fid}
                  rows={3}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                />
              )}
            </Field>
          </div>
        </Card>

        <Card title="Visa types">
          <Repeater<VisaType>
            label="Types offered"
            hint="The first type is the headline shown in lists."
            items={form.visa_types}
            onChange={(items) => set({ visa_types: items })}
            newItem={() => ({ name: "", description: null })}
            addLabel="Add visa type"
            itemLabel={(i) => `Type ${i + 1}`}
            render={(item, update) => (
              <div className="grid grid-cols-1 gap-3">
                <Field label="Name" required>
                  {(fid) => <TextInput id={fid} value={item.name} maxLength={120} onChange={(e) => update({ name: e.target.value })} />}
                </Field>
                <Field label="Description">
                  {(fid) => (
                    <TextArea
                      id={fid}
                      rows={2}
                      maxLength={600}
                      value={item.description ?? ""}
                      onChange={(e) => update({ description: e.target.value })}
                    />
                  )}
                </Field>
              </div>
            )}
          />
          {errors.visa_types && <p className="mt-2 text-xs text-red-600">{errors.visa_types}</p>}
        </Card>

        <Card title="Requirements, fee and timeline">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Requirements" className="md:col-span-2" hint="Documents or conditions. Leave empty if not confirmed.">
              {(fid) => (
                <TextArea
                  id={fid}
                  rows={4}
                  maxLength={5000}
                  value={form.requirements}
                  onChange={(e) => set({ requirements: e.target.value })}
                />
              )}
            </Field>
            <Field label="Fee (USD)" error={errors.fee} hint="Leave empty until verified. Empty shows “Contact us”.">
              {(fid) => (
                <TextInput
                  id={fid}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={form.fee}
                  onChange={(e) => set({ fee: e.target.value })}
                />
              )}
            </Field>
            <Field label="Processing time" hint="For example “5–7 working days”. Leave empty until verified.">
              {(fid) => (
                <TextInput
                  id={fid}
                  value={form.processing_time}
                  maxLength={80}
                  onChange={(e) => set({ processing_time: e.target.value })}
                />
              )}
            </Field>
          </div>
        </Card>

        <Card title="Visibility">
          <Toggle
            checked={form.is_active}
            onChange={(v) => set({ is_active: v })}
            label="Show on the public Visa page"
            description="Turn off to hide this country without deleting it."
          />
        </Card>

        <Card title="Search engine (SEO)">
          <SeoEditor value={form.seo} onChange={(seo) => set({ seo })} />
        </Card>

        {id && isAdmin && (
          <div>
            <Btn variant="ghost" className="text-red-600 hover:bg-red-50" icon={<Trash2 size={15} />} loading={deleting} onClick={remove}>
              Delete this country
            </Btn>
          </div>
        )}
      </div>
    </form>
  );
}
