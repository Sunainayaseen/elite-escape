import { Check, Clock3, MapPin, Users, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PackageInquiryForm } from "@/components/holidays/PackageInquiryForm";
import { Reveal } from "@/components/motion/Reveal";
import { getPackage as fetchPackage, getPackages } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export async function generateStaticParams() {
  const packages = await getPackages();
  return packages.map((pkg) => ({ category: pkg.category, slug: pkg.slug }));
}

async function getPackage(category: string, slug: string) {
  const pkg = await fetchPackage(slug);
  return pkg && pkg.category === category ? pkg : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const pkg = await getPackage(category, slug);
  if (!pkg) return {};
  return {
    title: `${pkg.title} | Elite Escape Tourism`,
    description: pkg.summary,
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const pkg = await getPackage(category, slug);
  if (!pkg) notFound();

  return (
    <>
      <section className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f1c] via-[#080f1c]/40 to-[#080f1c]/20" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080f1c]/75 to-transparent" />

        <div className="relative flex h-full max-w-7xl flex-col justify-end px-6 pb-10 mx-auto">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-white/70">
              <li>
                <Link href="/holidays" className="hover:text-white">
                  Holidays
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/holidays/${pkg.category}`} className="hover:text-white">
                  {pkg.category_name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {pkg.title}
              </li>
            </ol>
          </nav>
          <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <MapPin size={15} />
            {pkg.country}
          </div>
          <h1 className="mt-2 max-w-2xl font-serif text-3xl font-semibold text-white sm:text-5xl">
            {pkg.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Clock3 size={15} />
              {pkg.duration}
            </span>
            {pkg.group_size && (
              <span className="flex items-center gap-1.5">
                <Users size={15} />
                {pkg.group_size}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            {pkg.gallery.length > 1 && (
            <Reveal className="mb-10">
              <div className="grid grid-cols-3 gap-3">
                {pkg.gallery.map((img, i) => (
                  <div key={i} className="relative h-28 overflow-hidden rounded-xl sm:h-40">
                    <Image
                      src={img}
                      alt={`${pkg.title} photo ${i + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
            )}

            <Reveal delay={0.05}>
              <p className="text-sm leading-relaxed text-text-muted">{pkg.summary}</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-8">
              <h2 className="font-serif text-xl font-semibold text-text-ink">
                Highlights
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pkg.highlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-center gap-2.5 rounded-xl border border-line/10 bg-bg-navy px-4 py-3 text-sm text-text-ink"
                  >
                    <Check size={16} className="shrink-0 text-brand-blue" />
                    {h}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15} className="mt-10">
              <h2 className="font-serif text-xl font-semibold text-text-ink">
                Day-by-day itinerary
              </h2>
              <div className="mt-5 flex flex-col gap-5">
                {pkg.itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-navy-accent text-xs font-bold text-white">
                        {day.day}
                      </span>
                      {day.day !== pkg.itinerary.length && (
                        <span className="mt-1 w-px flex-1 bg-line/15" />
                      )}
                    </div>
                    <div className="pb-5">
                      <h3 className="font-serif text-base font-semibold text-text-ink">
                        {day.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2} className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {pkg.inclusions.length > 0 && (
              <div>
                <h2 className="font-serif text-lg font-semibold text-text-ink">
                  Inclusions
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {pkg.inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                      <Check size={15} className="mt-0.5 shrink-0 text-brand-blue" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              )}
              {pkg.exclusions.length > 0 && (
              <div>
                <h2 className="font-serif text-lg font-semibold text-text-ink">
                  Exclusions
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {pkg.exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                      <X size={15} className="mt-0.5 shrink-0 text-text-muted" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              )}
            </Reveal>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-line/10 bg-white p-6 shadow-lg shadow-brand-blue/5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-text-muted">Per person</span>
                    <p className="font-serif text-2xl font-bold text-text-ink">
                      {formatPrice(pkg)}
                    </p>
                  </div>
                </div>

                <div className="my-5 h-px bg-line/10" />

                <PackageInquiryForm packageTitle={pkg.title} packageSlug={pkg.slug} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
