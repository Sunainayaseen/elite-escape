import { Reveal } from "@/components/motion/Reveal";
import { PackageCard } from "@/components/holidays/PackageCard";
import type { Package } from "@/lib/types";

export function PackageGrid({ packages }: { packages: readonly Package[] }) {
  if (packages.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-text-muted">
        No packages found in this category yet — check back soon, or get in
        touch and we&apos;ll put one together for you.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg, i) => (
        <Reveal key={pkg.slug} delay={(i % 3) * 0.1} y={20}>
          <PackageCard pkg={pkg} />
        </Reveal>
      ))}
    </div>
  );
}
