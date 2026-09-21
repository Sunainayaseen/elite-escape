import { ArrowUpRight, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TiltCard } from "@/components/motion/TiltCard";
import { formatPrice } from "@/lib/format";
import type { Package } from "@/lib/types";

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <TiltCard className="rounded-2xl">
      <Link
        href={`/holidays/${pkg.category}/${pkg.slug}`}
        className="group relative block h-96 overflow-hidden rounded-2xl shadow-lg shadow-brand-blue/10"
      >
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/95" />

        <div className="relative flex h-full flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {pkg.duration}
            </span>
            {pkg.group_size && (
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <Users size={12} />
                {pkg.group_size}
              </span>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">
              {pkg.country}
            </p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-white">
              {pkg.title}
            </h3>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-[11px] text-white/60">Per person</span>
                <p className="font-serif text-xl font-bold text-white">
                  {formatPrice(pkg)}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors duration-300 group-hover:bg-brand-blue">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
