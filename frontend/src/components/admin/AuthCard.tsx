import { FileText, Inbox, Package, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const BRAND_IMAGE =
  "https://images.unsplash.com/photo-1550779864-6ccb28702fdb?auto=format&fit=crop&w=1600&q=80";

// What the dashboard is for, in the business's own terms — no invented metrics.
const MANAGES = [
  { icon: Package, label: "Holiday packages & destinations" },
  { icon: Inbox, label: "Enquiries from every website form" },
  { icon: FileText, label: "Visa pages, blog & site settings" },
] as const;

function Wordmark({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG */}
      <img src="/logo-mark.svg" alt="" className="h-10 w-auto" />
      <div className="leading-none">
        <p className={light ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-900"}>
          Elite Escape
        </p>
        <p
          className={
            light
              ? "mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55"
              : "mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400"
          }
        >
          Admin console
        </p>
      </div>
    </div>
  );
}

/** Split-screen frame for sign-in, forgot-password and reset-password. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white font-sans! lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop) */}
      <aside className="relative isolate hidden overflow-hidden bg-[#081a2c] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src={BRAND_IMAGE} alt="" fill priority sizes="50vw" className="-z-20 object-cover object-[50%_70%]" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#081a2c] via-[#081a2c]/70 to-[#081a2c]/40"
        />
        <div
          aria-hidden
          className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.22),transparent_65%)]"
        />

        <Wordmark light />

        <div>
          <h2 className="max-w-md font-serif text-4xl font-medium leading-[1.1] tracking-tight text-white">
            Everything behind the website, <em className="font-normal text-[#8fd8f5]">in one place.</em>
          </h2>
          <ul className="mt-8 flex flex-col gap-3.5">
            {MANAGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-white/75">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-[#8fd8f5] backdrop-blur">
                  <Icon size={15} aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-2 text-xs text-white/45">
          <ShieldCheck size={14} aria-hidden />
          Private area · Elite Escape Tourism staff only
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-6 py-10 sm:px-12">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-sans! text-[1.75rem] font-bold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Elite Escape Tourism · Administration
        </p>
      </main>
    </div>
  );
}
