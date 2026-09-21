"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthCard } from "@/components/admin/AuthCard";
import { Btn, Field, TextInput } from "@/components/admin/ui";
import { adminApi, errorText, setCsrfToken } from "@/lib/admin/client";
import type { AdminSessionInfo } from "@/lib/admin/types";

// Only ever send people back to another admin page; anything else could be used to bounce them elsewhere.
function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get("next") ?? "";
  return /^\/admin(\/[\w\-./?=&%]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await adminApi<AdminSessionInfo>("/login", {
        method: "POST",
        body: { email: email.trim(), password },
        quiet401: true,
      });
      setCsrfToken(session.csrf_token);
      router.replace(safeNext());
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="Manage packages, enquiries and website content.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <Field label="Email" required>
          {(id) => (
            <TextInput
              id={id}
              type="email"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>
        <Field label="Password" required>
          {(id) => (
            <div className="relative">
              <TextInput
                id={id}
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}
        </Field>
        <Btn type="submit" loading={busy} disabled={!email || !password} className="w-full">
          Sign in
        </Btn>
        <Link href="/admin/forgot-password" className="text-center text-sm font-medium text-brand-blue hover:underline">
          Forgot your password?
        </Link>
      </form>
    </AuthCard>
  );
}
