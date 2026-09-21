"use client";

import { PackageForm } from "@/components/admin/packages/PackageForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewPackagePage() {
  return (
    <>
      <PageHeader title="New package" description="Add a holiday package. Set the status to Published when you are ready for it to appear on the website." />
      <PackageForm />
    </>
  );
}
