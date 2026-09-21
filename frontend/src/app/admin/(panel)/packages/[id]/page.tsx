"use client";

import { useParams } from "next/navigation";

import { PackageForm } from "@/components/admin/packages/PackageForm";
import { ErrorState, PageHeader, Spinner } from "@/components/admin/ui";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { AdminPackage } from "@/lib/admin/types";

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useAdminQuery<AdminPackage>(`/packages/${id}`);

  return (
    <>
      <PageHeader title={data ? data.title : "Edit package"} description="Changes appear on the website as soon as you save." />
      {loading && <Spinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && <PackageForm key={data.updated_at} pkg={data} onSaved={reload} />}
    </>
  );
}
