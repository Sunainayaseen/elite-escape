import type { Metadata } from "next";

import { VisaList } from "@/components/admin/visa/VisaList";

export const metadata: Metadata = { title: "Visa Assistance" };

export default function VisaPage() {
  return <VisaList />;
}
