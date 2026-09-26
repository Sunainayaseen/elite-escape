import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import type { Category, Package } from "@/lib/types";

export function Categories({
  categories,
  packages,
}: {
  categories: readonly Category[];
  packages: readonly Package[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          align="left"
          eyebrow="Destinations"
          title="Where would you like to go?"
          description="Three regions, each with itineraries we can tailor to your dates and budget."
          className="max-w-xl"
        />
        <Reveal delay={0.1} y={12}>
          <Link
            href="/holidays"
            className="link-underline group inline-flex items-center gap-2 text-sm font-semibold text-text-ink hover:text-brand-blue-strong"
          >
            All holidays
            <ArrowRight size={15} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => {
          const count = packages.filter((p) => p.category === category.slug).length;
          return (
            <Reveal
              key={category.slug}
              y={40}
              scale={0.97}
              delay={(i % 3) * 0.1}
              // With an odd count on the two-column tablet grid, the last card spans the full row.
              className={
                categories.length % 2 === 1 && i === categories.length - 1
                  ? "sm:col-span-2 lg:col-span-1"
                  : undefined
              }
            >
              <Link
                href={`/holidays/${category.slug}`}
                className="card-lift group relative block h-[300px] overflow-hidden rounded-3xl bg-bg-navy-light sm:h-[480px]"
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="card-media object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-navy-accent" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080f1c]/90 via-[#080f1c]/20 to-transparent" />

                {count > 0 && (
                  <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {count} {count === 1 ? "package" : "packages"}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7">
                  <div>
                    <h3 className="font-serif text-3xl font-medium tracking-tight text-white">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-text-ink transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-0.5">
                    <ArrowUpRight size={18} aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
