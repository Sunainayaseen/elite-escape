"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { AuthCard } from "@/components/admin/AuthCard";
import { Btn, Field, TextInput } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi("/forgot-password", { method: "POST", body: { email: email.trim() }, quiet401: true });
      setSent(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck size={40} className="text-brand-blue" />
          <p className="text-sm text-slate-600">
            If an administrator account exists for <strong>{email}</strong>, we have sent a link to choose a new
            password. It expires in one hour.
          </p>
          <Link href="/admin/login" className="mt-2 text-sm font-medium text-brand-blue hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="Enter your account email and we will send you a reset link.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <Field label="Email" required>
          {(id) => (
            <TextInput id={id} type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
        </Field>
        <Btn type="submit" loading={busy} disabled={!email} className="w-full">
          Send reset link
        </Btn>
        <Link href="/admin/login" className="text-center text-sm font-medium text-brand-blue hover:underline">
          Back to sign in
        </Link>
      </form>
    </AuthCard>
  );
}
