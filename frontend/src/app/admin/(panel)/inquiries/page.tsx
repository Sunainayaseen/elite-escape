import type { Metadata } from "next";
import { Suspense } from "react";

import { InquiriesView } from "@/components/admin/inquiries/InquiriesView";
import { Spinner } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Inquiries" };

export default function InquiriesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <InquiriesView />
    </Suspense>
  );
}
