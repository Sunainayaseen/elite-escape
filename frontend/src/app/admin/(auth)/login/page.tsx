"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthCard } from "@/components/admin/AuthCard";
import { Btn, Field, FormAlert, TextInput } from "@/components/admin/ui";
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
  const [capsLock, setCapsLock] = useState(false);
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
    <AuthCard title="Welcome back" subtitle="Sign in to manage packages, enquiries and website content.">
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        {error && <FormAlert>{error}</FormAlert>}
        <Field label="Email" required>
          {(id) => (
            <div className="relative">
              <Mail
                size={16}
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <TextInput
                id={id}
                type="email"
                autoComplete="username"
                autoFocus
                required
                placeholder="you@eliteescapetourism.com"
                className="py-3 pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
        </Field>
        <Field
          label="Password"
          required
          hint={capsLock ? <span className="font-medium text-amber-600">Caps Lock is on</span> : undefined}
        >
          {(id) => (
            <div className="relative">
              <Lock
                size={16}
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <TextInput
                id={id}
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                className="py-3 pl-10 pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}
        </Field>
        <div className="-mt-1 flex justify-end">
          <Link
            href="/admin/forgot-password"
            className="text-sm font-medium text-brand-blue-strong hover:text-[#081a2c] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Btn
          type="submit"
          loading={busy}
          disabled={!email || !password}
          className="w-full py-3"
          icon={busy ? undefined : <ArrowRight size={16} aria-hidden className="order-last" />}
        >
          {busy ? "Signing in…" : "Sign in"}
        </Btn>
      </form>
    </AuthCard>
  );
}
