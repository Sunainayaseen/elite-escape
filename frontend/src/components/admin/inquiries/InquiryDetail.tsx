"use client";

import { Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { inquiryTypeLabel } from "@/components/admin/inquiries/types";
import { Modal, useConfirm, useToast } from "@/components/admin/overlays";
import { Btn, Field, INQUIRY_STATUSES, InquiryStatusBadge, Select, TextArea } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import type { Inquiry, InquiryStatus } from "@/lib/admin/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 text-sm sm:grid-cols-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="col-span-2 break-words text-slate-900 sm:col-span-3">{children}</dd>
    </div>
  );
}

export function InquiryDetail({
  inquiry,
  onClose,
  onChanged,
}: {
  inquiry: Inquiry | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  return (
    <Modal open={inquiry !== null} onClose={onClose} title="Inquiry details" size="lg">
      {inquiry && <DetailBody key={inquiry.id} inquiry={inquiry} onClose={onClose} onChanged={onChanged} />}
    </Modal>
  );
}

function DetailBody({
  inquiry,
  onClose,
  onChanged,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin, refreshBadge } = useAdmin();
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = status !== inquiry.status || notes.trim() !== (inquiry.admin_notes ?? "");

  async function save() {
    setSaving(true);
    try {
      await adminApi(`/inquiries/${inquiry.id}`, {
        method: "PUT",
        body: { status, admin_notes: notes.trim() === "" ? null : notes },
      });
      toast.success("Inquiry updated");
      refreshBadge();
      onChanged();
      onClose();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Delete this inquiry?",
      message: `The inquiry from ${inquiry.name} will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete inquiry",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await adminApi(`/inquiries/${inquiry.id}`, { method: "DELETE" });
      toast.success("Inquiry deleted");
      refreshBadge();
      onChanged();
      onClose();
    } catch (err) {
      toast.error(errorText(err));
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">{inquiry.name}</p>
          <p className="text-xs text-slate-500">Received {formatDateTime(inquiry.created_at)}</p>
        </div>
        <InquiryStatusBadge status={inquiry.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`mailto:${inquiry.email}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Mail size={14} />
          {inquiry.email}
        </a>
        {inquiry.phone && (
          <a
            href={`tel:${inquiry.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Phone size={14} />
            {inquiry.phone}
          </a>
        )}
      </div>

      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 px-4">
        <Row label="Type">{inquiryTypeLabel(inquiry.inquiry_type)}</Row>
        {inquiry.package_title && <Row label="Package">{inquiry.package_title}</Row>}
        {inquiry.destination && !inquiry.package_title && <Row label="Destination">{inquiry.destination}</Row>}
        {(inquiry.travel_start || inquiry.travel_end) && (
          <Row label="Travel dates">
            {formatDate(inquiry.travel_start)}
            {inquiry.travel_end ? ` to ${formatDate(inquiry.travel_end)}` : ""}
          </Row>
        )}
        {inquiry.travelers && <Row label="Travelers">{inquiry.travelers}</Row>}
        <Row label="Sent from">{inquiry.source_page}</Row>
      </dl>

      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700">Message</p>
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
          {inquiry.message}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Status">
          {(id) => (
            <Select id={id} value={status} onChange={(e) => setStatus(e.target.value as InquiryStatus)}>
              {INQUIRY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Internal notes" className="sm:col-span-2" hint="Only visible to your team. Never shown to the customer.">
          {(id) => (
            <TextArea
              id={id}
              rows={3}
              maxLength={4000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Who called, what was agreed, next steps…"
            />
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        {isAdmin ? (
          <Btn variant="ghost" className="text-red-600 hover:bg-red-50" icon={<Trash2 size={15} />} loading={deleting} onClick={remove}>
            Delete
          </Btn>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={onClose}>
            Close
          </Btn>
          <Btn onClick={save} loading={saving} disabled={!dirty}>
            Save changes
          </Btn>
        </div>
      </div>
    </div>
  );
}
