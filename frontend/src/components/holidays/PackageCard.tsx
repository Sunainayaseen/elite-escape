import { Clock3, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import type { Package } from "@/lib/types";

const MAX_TAGS = 3;

export function PackageCard({ pkg }: { pkg: Package }) {
  const href = `/holidays/${pkg.category}/${pkg.slug}`;
  const tags = pkg.tour_types.slice(0, MAX_TAGS);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/10 bg-white shadow-sm shadow-brand-blue/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-blue/10">
      {/* The title link below is the accessible one; this image link is a mouse/touch convenience. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <Image
          src={pkg.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue-strong">
          {pkg.country}
        </p>
        <h3 className="mt-1.5 font-serif text-xl font-semibold text-text-ink">
          <Link
            href={href}
            className="hover:text-brand-blue-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
          >
            {pkg.title}
          </Link>
        </h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Clock3 size={13} aria-hidden="true" />
            {pkg.duration}
          </span>
          {pkg.group_size && (
            <span className="flex items-center gap-1.5">
              <Users size={13} aria-hidden="true" />
              {pkg.group_size}
            </span>
          )}
        </p>

        {tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tour types">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full bg-bg-navy-light px-2.5 py-1 text-[11px] font-medium text-text-ink"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-muted">{pkg.summary}</p>

        <div className="mt-auto pt-5">
          <div className="border-t border-line/10 pt-4">
            <p className="text-[11px] text-text-muted">Per person</p>
            <p className="font-serif text-lg font-semibold text-text-ink">{formatPrice(pkg)}</p>
            <div className="mt-4 flex gap-2">
              <Button href={href} className="flex-1 px-4 py-2.5">
                View Package
              </Button>
              <Button
                href={`/contact?topic=${encodeURIComponent(pkg.title)}`}
                variant="outline"
                className="flex-1 px-4 py-2.5"
              >
                Enquire Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
