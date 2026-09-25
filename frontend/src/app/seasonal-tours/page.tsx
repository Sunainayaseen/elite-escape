import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { CTASection } from "@/components/home/CTASection";
import { PageHero } from "@/components/layout/PageHero";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { SEASONAL_TOURS } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";
import { seasonalWhatsAppMessage } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Seasonal Tours",
  description:
    "Seasonal holidays timed for the best time to go, from Eid in the Maldives and winter in the Swiss Alps to summer in Bali and cherry blossom season in Japan. Enquire and we'll tailor it to you.",
  path: "/seasonal-tours",
});

// Enquiry-only tours (no package page yet) open WhatsApp directly; the rest link to their package.
function TourLink({
  tour,
  className,
  children,
}: {
  tour: (typeof SEASONAL_TOURS)[number];
  className: string;
  children: ReactNode;
}) {
  if (tour.href === "/contact") {
    return (
      <WhatsAppLink
        message={seasonalWhatsAppMessage(tour.name)}
        fallbackHref={`/contact?topic=${encodeURIComponent(tour.name)}`}
        className={className}
      >
        {children}
      </WhatsAppLink>
    );
  }
  return (
    <Link href={tour.href} className={className}>
      {children}
    </Link>
  );
}

export default function SeasonalToursPage() {
  return (
    <>
      <PageHero
        eyebrow="Seasonal Tours"
        title="Book the season, not just the destination"
        description="Some trips only make sense at a certain time of year. Enquire about any of these and we'll tailor it to your dates."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SEASONAL_TOURS.map((tour, i) => (
            <Reveal key={tour.name} delay={(i % 3) * 0.1} y={20}>
              <TiltCard className="rounded-2xl">
                <TourLink
                  tour={tour}
                  className="group relative block h-72 overflow-hidden rounded-2xl shadow-lg shadow-brand-blue/10"
                >
                  <Image
                    src={tour.image}
                    alt={tour.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5 transition-opacity duration-300 group-hover:from-black/90" />

                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                        {tour.window}
                      </span>
                      <span className="flex h-9 w-9 translate-x-2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-white">
                        {tour.name}
                      </h3>
                      <span className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-brand-teal-light">
                        {tour.href === "/contact" ? "Enquire" : "View package"}
                      </span>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {tour.description}
                      </p>
                    </div>
                  </div>
                </TourLink>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
