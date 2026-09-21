import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";

// Every page inside this group sits behind the session check in <AdminShell>.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
