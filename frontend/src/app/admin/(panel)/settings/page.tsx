"use client";

import { KeyRound, Save } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { Repeater, StringListEditor } from "@/components/admin/forms";
import { useToast } from "@/components/admin/overlays";
import { Btn, Card, ErrorState, Field, PageHeader, Spinner, TextArea, TextInput } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { Office, SiteSettings } from "@/lib/admin/types";

const SOCIAL_FIELDS = [
  { key: "instagram_url", label: "Instagram" },
  { key: "facebook_url", label: "Facebook" },
  { key: "x_url", label: "X (Twitter)" },
  { key: "youtube_url", label: "YouTube" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "tiktok_url", label: "TikTok" },
] as const;

const TEXT_KEYS = ["company_name", "contact_email", "phone", "whatsapp_number", "working_hours", ...SOCIAL_FIELDS.map((f) => f.key)] as const;

function parseOffices(raw: string | undefined): Office[] {
  try {
    const list = JSON.parse(raw ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function SettingsForm({ initial, canEdit, onSaved }: { initial: SiteSettings; canEdit: boolean; onSaved: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState<SiteSettings>(() => Object.fromEntries(TEXT_KEYS.map((k) => [k, initial[k] ?? ""])));
  const [offices, setOffices] = useState<Office[]>(() => parseOffices(initial.offices));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const dirty = useMemo(
    () =>
      TEXT_KEYS.some((k) => (values[k] ?? "") !== (initial[k] ?? "")) ||
      JSON.stringify(offices) !== JSON.stringify(parseOffices(initial.offices)),
    [values, offices, initial],
  );

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await adminApi("/settings", {
        method: "PUT",
        body: {
          values: {
            ...values,
            offices: JSON.stringify(
              offices.map((o) => ({
                city: o.city.trim(),
                address: o.address.trim(),
                phones: o.phones.map((p) => p.trim()).filter(Boolean),
                note: o.note?.trim() || null,
              })),
            ),
          },
        },
      });
      toast.success("Settings saved. The website footer and contact page are updated.");
      onSaved();
    } catch (err) {
      const message = errorText(err);
      const byKey: Record<string, string> = {};
      for (const line of message.split("\n")) {
        const [key, ...rest] = line.split(": ");
        if (rest.length) byKey[key] = rest.join(": ");
      }
      setErrors(byKey);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      {!canEdit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Only administrators can change business settings. You can view them here.
        </div>
      )}
      <fieldset disabled={!canEdit || saving} className="flex flex-col gap-6">
        <Card title="Business details" description="Shown across the website and in emails.">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Company name" required error={errors.company_name} className="md:col-span-2">
              {(id) => <TextInput id={id} value={values.company_name} maxLength={120} onChange={(e) => set("company_name", e.target.value)} />}
            </Field>
            <Field label="Email" required error={errors.contact_email}>
              {(id) => <TextInput id={id} type="email" value={values.contact_email} onChange={(e) => set("contact_email", e.target.value)} />}
            </Field>
            <Field label="Phone" error={errors.phone}>
              {(id) => <TextInput id={id} value={values.phone} maxLength={40} onChange={(e) => set("phone", e.target.value)} />}
            </Field>
            <Field label="WhatsApp number" error={errors.whatsapp_number} hint="Full international number, digits only (no + or spaces).">
              {(id) => <TextInput id={id} inputMode="numeric" value={values.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} />}
            </Field>
            <Field label="Business hours" error={errors.working_hours}>
              {(id) => <TextArea id={id} rows={2} value={values.working_hours} maxLength={200} onChange={(e) => set("working_hours", e.target.value)} />}
            </Field>
          </div>
        </Card>

        <Card title="Social media" description="Leave a link empty to hide that icon on the website. Links must start with https://">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {SOCIAL_FIELDS.map((f) => (
              <Field key={f.key} label={f.label} error={errors[f.key]}>
                {(id) => <TextInput id={id} type="url" placeholder="https://" value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />}
              </Field>
            ))}
          </div>
        </Card>

        <Card
          title="Offices & addresses"
          description="These are the verified addresses shown in the website footer, contact page and about page. Only change them if the business address really changes."
        >
          {errors.offices && <p className="mb-3 text-sm text-red-600">{errors.offices}</p>}
          <Repeater<Office>
            label="Offices"
            items={offices}
            onChange={setOffices}
            newItem={() => ({ city: "", address: "", phones: [], note: null })}
            addLabel="Add office"
            itemLabel={(i) => `Office ${i + 1}`}
            render={(office, update) => (
              <div className="flex flex-col gap-3">
                <TextInput aria-label="Office name" placeholder="Office name, e.g. Dubai Office" value={office.city} maxLength={80} onChange={(e) => update({ city: e.target.value })} />
                <TextArea aria-label="Address" rows={2} placeholder="Full address" value={office.address} maxLength={300} onChange={(e) => update({ address: e.target.value })} />
                <StringListEditor label="Phone numbers" items={office.phones} onChange={(phones) => update({ phones })} placeholder="+971 …" addLabel="Add" />
                <TextInput aria-label="Note" placeholder="Optional note shown under the address" value={office.note ?? ""} maxLength={200} onChange={(e) => update({ note: e.target.value })} />
              </div>
            )}
          />
        </Card>
      </fieldset>

      {canEdit && (
        <div className="flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-slate-500">You have unsaved changes.</span>}
          <Btn type="submit" loading={saving} disabled={!dirty} icon={<Save size={15} />}>
            Save settings
          </Btn>
        </div>
      )}
    </form>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = repeat !== "" && repeat !== next;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== repeat) return;
    setSaving(true);
    try {
      await adminApi("/change-password", { method: "POST", body: { current_password: current, new_password: next } });
      toast.success("Password changed. Other devices have been signed out.");
      setCurrent("");
      setNext("");
      setRepeat("");
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Change your password" description="At least 10 characters with a letter and a number. Changing it signs you out of every other device.">
      <form onSubmit={submit} className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Field label="Current password" required>
          {(id) => <TextInput id={id} type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />}
        </Field>
        <Field label="New password" required>
          {(id) => <TextInput id={id} type="password" autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} />}
        </Field>
        <Field label="Repeat new password" required error={mismatch ? "Passwords do not match" : null}>
          {(id) => <TextInput id={id} type="password" autoComplete="new-password" required value={repeat} onChange={(e) => setRepeat(e.target.value)} />}
        </Field>
        <div className="md:col-span-3">
          <Btn type="submit" variant="secondary" icon={<KeyRound size={15} />} loading={saving} disabled={!current || !next || next !== repeat}>
            Change password
          </Btn>
        </div>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  const { isAdmin, user } = useAdmin();
  const { data, error, loading, reload } = useAdminQuery<SiteSettings>("/settings");

  return (
    <>
      <PageHeader title="Settings" description="Business information shown on the website, and your own account." />
      <div className="flex flex-col gap-6">
        {loading && <Spinner />}
        {error && !data && <ErrorState message={error} onRetry={reload} />}
        {data && <SettingsForm key={JSON.stringify(data)} initial={data} canEdit={isAdmin} onSaved={reload} />}
        <PasswordCard />
        <p className="text-xs text-slate-500">
          Signed in as {user.email} ({user.role}).
        </p>
      </div>
    </>
  );
}
