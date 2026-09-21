import type { Metadata } from "next";
import type { ReactNode } from "react";

import { OverlayProvider } from "@/components/admin/overlays";

// The dashboard is private: keep it out of search results and never index or cache it.
export const metadata: Metadata = {
  title: { default: "Admin | Elite Escape Tourism", template: "%s | Elite Escape Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <OverlayProvider>{children}</OverlayProvider>;
}
