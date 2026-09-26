"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { PackageCard } from "@/components/holidays/PackageCard";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Button } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";
import type { Category, Package } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "all";
const LIMIT = 6;
const MOBILE_LIMIT = 3;

/** Featured packages first, filterable by region. Replaces the old tabs + bento sections. */
export function PackageShowcase({
  categories,
  packages,
}: {
  categories: readonly Category[];
  packages: readonly Package[];
}) {
  const [active, setActive] = useState<string>(ALL);
  if (packages.length === 0) return null;

  const tabs = [
    { slug: ALL, name: "All" },
    ...categories.filter((c) => packages.some((p) => p.category === c.slug)),
  ];
  const ordered = [...packages].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  const visible = ordered.filter((p) => active === ALL || p.category === active).slice(0, LIMIT);

  return (
    <section className="bg-bg-navy py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            align="left"
            eyebrow="Holiday packages"
            title="Hand-picked trips, ready to tailor"
            description="Per-person prices in AED. Every itinerary can be adjusted to your dates and pace."
            className="max-w-xl"
          />

          {tabs.length > 2 && (
            <div
              role="group"
              aria-label="Filter packages by region"
              className="flex w-full gap-1 overflow-x-auto rounded-full border border-line/10 bg-white p-1 shadow-sm sm:w-auto"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => setActive(tab.slug)}
                  aria-pressed={active === tab.slug}
                  className={cn(
                    "shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200",
                    active === tab.slug
                      ? "bg-text-ink text-white"
                      : "text-text-muted hover:text-text-ink",
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((pkg, i) => (
              // Phones get the first three; "View all holidays" below leads to the rest.
              <li key={pkg.slug} className={i >= MOBILE_LIMIT ? "hidden sm:block" : undefined}>
                <PackageCard pkg={pkg} />
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>

        <div className="mt-12 flex justify-center">
          <Button href="/holidays" variant="outline" arrow className="bg-white">
            View all holidays
          </Button>
        </div>
      </div>
    </section>
  );
}
