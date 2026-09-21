import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { TiltCard } from "@/components/motion/TiltCard";
import { categoryIcon } from "@/lib/category-icons";
import type { Category } from "@/lib/types";

export function Categories({ categories }: { categories: readonly Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <SectionHeader
        eyebrow="Where to next"
        title="Browse holidays by category"
        description="Curated collections, built around how you actually like to travel."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => {
          const Icon = categoryIcon(category.icon);
          return (
            <Reveal key={category.slug} y={40} scale={0.97} delay={(i % 3) * 0.1}>
              <TiltCard className="rounded-2xl">
                <Link
                  href={`/holidays/${category.slug}`}
                  className="card-lift group relative block h-80 overflow-hidden rounded-2xl shadow-lg shadow-brand-blue/10"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5 transition-opacity duration-300 group-hover:from-black/90" />

                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md">
                        <Icon size={20} />
                      </span>
                      <span className="flex h-9 w-9 translate-x-2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-white transition-transform duration-500 ease-out group-hover:-translate-y-1">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
