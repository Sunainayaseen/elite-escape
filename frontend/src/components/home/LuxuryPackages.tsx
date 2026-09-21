import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import type { Package } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LuxuryPackages({ packages }: { packages: readonly Package[] }) {
  const featured = packages.filter((p) => p.is_featured).slice(0, 5);
  if (featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue-strong">
            Featured
          </p>
        </Reveal>
        <SplitText
          text="Featured packages"
          delay={0.05}
          className="order-3 mt-3 basis-full font-serif text-3xl font-semibold text-text-ink sm:text-4xl"
        />
        <Reveal delay={0.1}>
          <Button href="/holidays" variant="outline" className="px-5 py-2.5 text-sm">
            View all
          </Button>
        </Reveal>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:[grid-auto-rows:220px]">
        {featured.map((pkg, i) => {
          const item = { big: i === 0, caption: `${pkg.duration}${pkg.tour_types[0] ? ` · ${pkg.tour_types[0]}` : ""}` };
          return (
            <Reveal
              key={pkg.slug}
              delay={i * 0.08}
              y={36}
              scale={0.97}
              className={cn(
                item.big
                  ? "col-span-2 sm:col-span-2 sm:row-span-2"
                  : "col-span-1",
              )}
            >
              <Link
                href={`/holidays/${pkg.category}/${pkg.slug}`}
                className={cn(
                  "card-lift group relative block h-full overflow-hidden rounded-2xl shadow-lg shadow-brand-blue/10",
                  item.big ? "h-64 sm:h-full" : "h-56 sm:h-full",
                )}
              >
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  sizes={item.big ? "50vw" : "25vw"}
                  className="card-media object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />

                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 group-hover:bg-brand-blue">
                  <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-teal-light">
                    {item.caption}
                  </p>
                  <h3
                    className={cn(
                      "mt-1.5 font-serif font-semibold text-white",
                      item.big ? "text-2xl" : "text-base",
                    )}
                  >
                    {pkg.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {pkg.country} · {formatPrice(pkg)}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
