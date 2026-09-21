import type { Metadata } from "next";

import { VisaForm } from "@/components/admin/visa/VisaForm";

export const metadata: Metadata = { title: "Add visa country" };

export default function NewVisaPage() {
  return <VisaForm />;
}
