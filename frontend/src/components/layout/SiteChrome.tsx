"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PageTransition } from "@/components/motion/PageTransition";

// The public header, footer and floating buttons are hidden on /admin so the dashboard gets its own shell.
export function SiteChrome({
  header,
  footer,
  floating,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  floating: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <main className="flex-1 overflow-x-clip">{children}</main>;
  }

  return (
    <>
      {/* First tab stop: lets keyboard and screen-reader users jump past the navigation. */}
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#081a2c] shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
      >
        Skip to content
      </a>
      {header}
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-x-clip focus:outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      {footer}
      {floating}
    </>
  );
}
