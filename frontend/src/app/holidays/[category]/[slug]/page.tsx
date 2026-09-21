import { Check, Clock3, MapPin, Users, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { GalleryLightbox } from "@/components/holidays/GalleryLightbox";
import { ItineraryAccordion } from "@/components/holidays/ItineraryAccordion";
import { MobileEnquireBar } from "@/components/holidays/MobileEnquireBar";
import { PackageInquiryForm } from "@/components/holidays/PackageInquiryForm";
import { TimelineProgress } from "@/components/holidays/TimelineProgress";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { getPackage as fetchPackage, getPackages, getSiteSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { packageWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { breadcrumbSchema, packageSchema, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

// CSS-only entrance for the hero copy (.fade-up in globals.css); visible without JavaScript.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

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
  return pageMetadata({
    title: pkg.title,
    description: pkg.summary,
    path: `/holidays/${pkg.category}/${pkg.slug}`,
    image: pkg.image,
  });
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const [pkg, settings] = await Promise.all([getPackage(category, slug), getSiteSettings()]);
  if (!pkg) notFound();

  const price = formatPrice(pkg);
  const whatsapp = whatsappUrl(settings.whatsapp_number, packageWhatsAppMessage(pkg.title));

  return (
    <>
      <JsonLd data={packageSchema(pkg)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Holidays", path: "/holidays" },
          { name: pkg.category_name, path: `/holidays/${pkg.category}` },
          { name: pkg.title, path: `/holidays/${pkg.category}/${pkg.slug}` },
        ])}
      />
      <section className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <Parallax range={48}>
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f1c] via-[#080f1c]/40 to-[#080f1c]/20" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080f1c]/75 to-transparent" />

        <div className="relative flex h-full max-w-7xl flex-col justify-end px-6 pb-10 mx-auto">
          <nav aria-label="Breadcrumb" style={delay(0.05)} className="fade-up">
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
          <div style={delay(0.12)} className="fade-up mt-3 flex items-center gap-2 text-sm text-white/70">
            <MapPin size={15} />
            {pkg.country}
          </div>
          <h1
            style={delay(0.2)}
            className="fade-up mt-2 max-w-2xl font-serif text-3xl font-semibold text-white sm:text-5xl"
          >
            {pkg.title}
          </h1>
          <div style={delay(0.3)} className="fade-up mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
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
          {pkg.tour_types.length > 0 && (
            <ul style={delay(0.4)} className="fade-up mt-4 flex flex-wrap gap-2" aria-label="Tour types">
              {pkg.tour_types.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white/90"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            {pkg.gallery.length > 1 && (
            <div className="mb-10">
              <GalleryLightbox images={pkg.gallery} title={pkg.title} />
            </div>
            )}

            <Reveal delay={0.05}>
              <h2 className="font-serif text-xl font-semibold text-text-ink">Overview</h2>
              <p className="mt-3 leading-relaxed text-text-muted">{pkg.summary}</p>
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
              <div className="mt-5">
                <TimelineProgress>
                  <ItineraryAccordion days={pkg.itinerary} />
                </TimelineProgress>
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

          <div id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:h-fit">
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-line/10 bg-white p-6 shadow-lg shadow-brand-blue/5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {pkg.title}
                </p>
                <p className="mt-2 text-xs text-text-muted">Per person</p>
                <p className="font-serif text-2xl font-bold text-text-ink">{price}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                  <Clock3 size={14} aria-hidden="true" />
                  {pkg.duration}
                </p>

                <div className="my-5 h-px bg-line/10" />

                <PackageInquiryForm packageTitle={pkg.title} packageSlug={pkg.slug} />

                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#1a9c4b] px-5 py-3 text-sm font-semibold text-[#14803c] transition-colors duration-300 hover:bg-[#25D366]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                  >
                    Chat on WhatsApp
                    <span className="sr-only"> about {pkg.title} (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <MobileEnquireBar price={price} />
    </>
  );
}
