"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";

import { AuthCard } from "@/components/admin/AuthCard";
import { Btn, Field, TextInput } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm !== "" && confirm !== password;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi("/reset-password", { method: "POST", body: { token, new_password: password }, quiet401: true });
      setDone(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthCard title="Reset link missing">
        <p className="text-sm text-slate-600">This page needs the link from your reset email.</p>
        <Link href="/admin/forgot-password" className="mt-4 inline-block text-sm font-medium text-brand-blue hover:underline">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 size={40} className="text-emerald-500" />
          <p className="text-sm text-slate-600">Your password has been changed and all other sessions were signed out.</p>
          <Btn onClick={() => router.push("/admin/login")} className="mt-2 w-full">
            Sign in
          </Btn>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="At least 10 characters, with a letter and a number.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}{" "}
            {/expired|invalid/i.test(error) && (
              <Link href="/admin/forgot-password" className="font-medium underline">
                Request a new link
              </Link>
            )}
          </div>
        )}
        <Field label="New password" required>
          {(id) => (
            <TextInput id={id} type="password" autoComplete="new-password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
        </Field>
        <Field label="Repeat new password" required error={mismatch ? "Passwords do not match" : null}>
          {(id) => (
            <TextInput id={id} type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          )}
        </Field>
        <Btn type="submit" loading={busy} disabled={!password || password !== confirm} className="w-full">
          Update password
        </Btn>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
