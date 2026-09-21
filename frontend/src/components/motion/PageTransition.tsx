"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A very short fade/slide (0.3s, see .page-enter in globals.css) replayed on each public-page
 * navigation. It never blocks navigation, and SiteChrome does not use it on /admin.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
