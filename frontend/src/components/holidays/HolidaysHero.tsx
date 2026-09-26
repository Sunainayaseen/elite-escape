import { ArrowDown, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { buttonClasses } from "@/components/ui/Button";
import type { Category, Package } from "@/lib/types";
import { cn } from "@/lib/utils";

// CSS-only entrance (.fade-up in globals.css): the copy is visible without JavaScript.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const packageHref = (p: Package) => `/holidays/${p.category}/${p.slug}`;

// The same slow bob as <FloatingElement> (.float-el in globals.css, off under reduced motion), but
// without its aria-hidden: these cards are real links.
const float = (duration: number, delaySeconds = 0) =>
  ({ "--float-d": `${duration}s`, "--float-delay": `${delaySeconds}s`, "--float-y": "8px" }) as CSSProperties;

function PhotoCard({
  pkg,
  className,
  priority,
  sizes,
  large,
}: {
  pkg: Package;
  className?: string;
  priority?: boolean;
  sizes: string;
  large?: boolean;
}) {
  return (
    <Link
      href={packageHref(pkg)}
      className={cn(
        "group relative block overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/40 ring-1 ring-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal-light",
        className,
      )}
    >
      <Image
        src={pkg.image}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#081a2c]/90 via-[#081a2c]/20 to-transparent" />
      <div className={cn("absolute inset-x-0 bottom-0", large ? "p-6" : "p-4")}>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-teal-light">
          <MapPin size={12} aria-hidden />
          {pkg.country}
        </p>
        <p
          className={cn(
            "mt-1 font-serif font-semibold leading-tight text-white",
            large ? "text-2xl" : "text-base",
          )}
        >
          {pkg.title}
        </p>
        {large && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur-md ring-1 ring-white/20">
            From <span className="font-semibold">{`${pkg.currency} ${number.format(pkg.price_from)}`}</span>
            <span className="text-white/60">per person</span>
          </p>
        )}
      </div>
      <span
        aria-hidden
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100"
      >
        <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}

export function HolidaysHero({
  packages,
  categories,
}: {
  packages: readonly Package[];
  categories: readonly Category[];
}) {
  // Featured packages lead the collage; everything shown is live package data.
  const collage = [...packages].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, 3);
  const cheapest = packages.reduce<Package | null>(
    (min, p) => (!min || p.price_from < min.price_from ? p : min),
    null,
  );
  const regions = categories
    .map((c) => ({ ...c, count: packages.filter((p) => p.category === c.slug).length }))
    .filter((c) => c.count > 0);

  const stats = [
    { value: String(packages.length), label: packages.length === 1 ? "Curated package" : "Curated packages" },
    { value: String(regions.length), label: regions.length === 1 ? "Region" : "Regions" },
    ...(cheapest
      ? [{ value: `${cheapest.currency} ${number.format(cheapest.price_from)}`, label: "Starting per person" }]
      : []),
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#081a2c] pb-20 pt-32 sm:pb-24 sm:pt-40">
      {/* Background: dot grid, brand glows, a faint horizon line */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_30%_40%,black_20%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute -left-40 -top-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-brand-teal opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-48 right-[-10%] -z-10 h-[34rem] w-[34rem] rounded-full bg-brand-navy-accent opacity-35 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-teal-light/40 to-transparent"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p
            style={delay(0.05)}
            className="fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal-light backdrop-blur"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-teal-light" />
            Holiday packages
          </p>

          <h1
            style={delay(0.12)}
            className="fade-up mt-6 font-serif text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Holiday packages for{" "}
            <span className="bg-gradient-to-r from-[#5CC3EF] via-brand-teal to-[#E8C07D] bg-clip-text italic text-transparent">
              every kind of traveler
            </span>
          </h1>

          <p
            style={delay(0.22)}
            className="fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg lg:mx-0"
          >
            Hotels, transfers and guided tours — curated into packages you can book as-is, or tell us
            what to change.
          </p>

          <div
            style={delay(0.3)}
            className="fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <a
              href="#packages"
              className={buttonClasses(
                "primary",
                "w-full bg-brand-teal-light font-bold text-[#081a2c] shadow-brand-teal/30 hover:bg-white hover:text-[#081a2c] sm:w-auto",
              )}
            >
              Browse packages
              <ArrowDown size={16} aria-hidden className="transition-transform group-hover:translate-y-0.5" />
            </a>
            <Link
              href="/contact?topic=Custom%20holiday"
              className={buttonClasses(
                "outline",
                "w-full border-white/25 text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto",
              )}
            >
              Plan a custom trip
              <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Live numbers from the package list */}
          <dl
            style={delay(0.38)}
            className="fade-up mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] py-4 backdrop-blur lg:mx-0"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse justify-end px-2 text-center sm:px-5">
                <dt className="mt-1 text-[11px] leading-tight text-white/55 sm:text-xs">{s.label}</dt>
                <dd className="whitespace-nowrap font-serif text-base font-semibold text-white sm:text-2xl">{s.value}</dd>
              </div>
            ))}
          </dl>

          {regions.length > 0 && (
            <ul
              style={delay(0.46)}
              aria-label="Browse by region"
              className="fade-up mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/holidays/${r.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 py-1.5 pl-3.5 pr-1.5 text-sm text-white/85 transition-colors hover:border-brand-teal-light/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
                  >
                    {r.name}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-brand-teal-light">
                      {r.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Collage of real packages (desktop) */}
        {collage.length >= 3 && (
          <div style={delay(0.25)} className="fade-up relative hidden h-[34rem] lg:block">
            <PhotoCard
              pkg={collage[0]}
              large
              priority
              sizes="(min-width: 1280px) 360px, 30vw"
              className="absolute left-0 top-4 h-[29rem] w-[62%]"
            />
            <div style={float(11)} className="float-el absolute right-0 top-0 w-[42%]">
              <PhotoCard pkg={collage[1]} sizes="240px" className="h-56 w-full" />
            </div>
            <div style={float(13, 1.5)} className="float-el absolute bottom-0 right-[6%] w-[40%]">
              <PhotoCard pkg={collage[2]} sizes="240px" className="h-52 w-full" />
            </div>
            <div
              aria-hidden
              className="absolute -bottom-2 left-[8%] -z-10 h-24 w-3/4 rounded-full bg-brand-teal/25 blur-3xl"
            />
          </div>
        )}
      </div>
    </section>
  );
}
