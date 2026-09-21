"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { formatPrice } from "@/lib/format";
import type { Category, Package } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TopExperiences({
  categories,
  packages: allPackages,
}: {
  categories: readonly Category[];
  packages: readonly Package[];
}) {
  const withPackages = categories.filter((c) => allPackages.some((p) => p.category === c.slug));
  const [active, setActive] = useState<string>(withPackages[0]?.slug ?? "");
  const packages = allPackages.filter((p) => p.category === active).slice(0, 4);

  if (withPackages.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
          Our packages
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
          Popular holiday packages
        </h2>
        <p className="mt-4 text-text-muted">
          Browse our holiday packages by region.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {withPackages.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setActive(cat.slug)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
              active === cat.slug
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                : "text-text-muted hover:bg-bg-navy-light hover:text-text-ink",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {packages.map((pkg) => (
            <Link
              key={pkg.slug}
              href={`/holidays/${pkg.category}/${pkg.slug}`}
              className="group overflow-hidden rounded-2xl border border-line/10 bg-white shadow-sm shadow-brand-blue/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/15"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-text-ink backdrop-blur-sm">
                  {pkg.duration}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold text-text-ink">
                  {pkg.title}
                </h3>
                <p className="mt-1 text-sm text-text-muted">{pkg.country}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-text-muted">
                    {pkg.group_size && (
                      <>
                        <Users size={14} />
                        {pkg.group_size}
                      </>
                    )}
                  </div>
                  <p className="font-serif text-base font-semibold text-brand-blue">
                    {formatPrice(pkg)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
