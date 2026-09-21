import type { Metadata } from "next";
import Image from "next/image";

import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { CTASection } from "@/components/home/CTASection";
import { ATTRACTIONS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "UAE Attractions & Activities | Elite Escape Tourism",
  description:
    "A guide to the UAE's must-see attractions and activities, from Burj Khalifa and the Museum of the Future to Sheikh Zayed Grand Mosque and desert safaris.",
};

export default function AttractionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Attractions"
        title="UAE's must-see attractions & activities"
        description="Whether it's your first trip to the UAE or your fifth, these are the experiences worth building your itinerary around."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ATTRACTIONS.map((attraction, i) => (
            <Reveal key={attraction.name} delay={(i % 3) * 0.1} y={20}>
              <TiltCard className="rounded-2xl">
                <div className="group relative block h-72 overflow-hidden rounded-2xl shadow-lg shadow-brand-blue/10">
                  {attraction.image ? (
                    <Image
                      src={attraction.image}
                      alt={attraction.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-navy-accent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5 transition-opacity duration-300 group-hover:from-black/90" />
                  <div className="relative flex h-full flex-col justify-end p-6">
                    <h3 className="font-serif text-xl font-semibold text-white">
                      {attraction.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      {attraction.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
