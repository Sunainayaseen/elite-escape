"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
      {header}
      <main className="flex-1 overflow-x-clip">{children}</main>
      {footer}
      {floating}
    </>
  );
}
