"use client";

import { useParams } from "next/navigation";

import { VisaForm } from "@/components/admin/visa/VisaForm";

export default function EditVisaPage() {
  const { id } = useParams<{ id: string }>();
  return <VisaForm id={id} />;
}
