"use client";

import { useMemo, useState } from "react";

import { PackageGrid } from "@/components/holidays/PackageGrid";
import type { Category, Package } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HolidaysBrowser({
  categories,
  packages,
  initialQuery = "",
}: {
  categories: readonly Category[];
  packages: readonly Package[];
  initialQuery?: string;
}) {
  const [active, setActive] = useState<string | "all">("all");
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter(
      (p) =>
        (active === "all" || p.category === active) &&
        (!q ||
          [p.title, p.country, p.summary, ...p.tour_types].some((field) => field.toLowerCase().includes(q))),
    );
  }, [packages, active, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search destinations, e.g. Japan"
        aria-label="Search packages"
        className="mb-5 w-full rounded-full border border-line/15 bg-white px-5 py-3 text-sm text-text-ink outline-none placeholder:text-text-muted focus:border-brand-blue sm:max-w-sm"
      />
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
            active === "all"
              ? "border-brand-blue-strong bg-brand-blue-strong text-white"
              : "border-line/15 bg-white text-text-muted hover:border-brand-blue/40 hover:text-text-ink",
          )}
        >
          All Packages
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setActive(cat.slug)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
              active === cat.slug
                ? "border-brand-blue-strong bg-brand-blue-strong text-white"
                : "border-line/15 bg-white text-text-muted hover:border-brand-blue/40 hover:text-text-ink",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <PackageGrid packages={filtered} />
      </div>
    </div>
  );
}
