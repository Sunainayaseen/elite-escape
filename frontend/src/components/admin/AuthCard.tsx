import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F1B2B] via-[#16273C] to-[#0A121D] px-4 py-10 font-sans!">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Elite Escape Tourism" className="h-12 w-auto rounded-lg bg-white px-3 py-1.5" />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="font-sans! text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">Elite Escape Tourism · Administration</p>
      </div>
    </div>
  );
}
