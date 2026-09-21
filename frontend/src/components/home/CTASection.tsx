import { MapPin } from "lucide-react";
import Image from "next/image";

import { FloatingElement } from "@/components/motion/FloatingElement";
import { GlobeSlot } from "@/components/globe/GlobeSlot";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { IMG } from "@/lib/site-data";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
      <Reveal y={36} scale={0.98}>
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#080f1c] px-8 py-16 text-center shadow-xl shadow-[#080f1c]/25 sm:px-16 lg:py-24 lg:text-left">
          {/* Depth layers: photograph (parallax) → gradient wash → globe + floating pins → content */}
          <Parallax range={36} className="-z-10">
            <Image
              src={IMG.planeWing}
              alt=""
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
          </Parallax>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080f1c]/95 via-[#080f1c]/80 to-[#080f1c]/40" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-teal opacity-25 blur-3xl"
          />

          {/* Decorative globe: desktop only (hidden below lg, so it is never even loaded there) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-1/2 hidden w-[440px] -translate-y-1/2 lg:block"
          >
            <GlobeSlot points={[]} decorative />
          </div>
          <FloatingElement className="absolute right-[36%] top-14 hidden text-brand-teal-light lg:block" duration={8}>
            <MapPin size={22} />
          </FloatingElement>
          <FloatingElement
            className="absolute bottom-16 right-[30%] hidden text-gold lg:block"
            duration={10}
            delay={1.5}
          >
            <MapPin size={18} />
          </FloatingElement>

          <div className="relative lg:max-w-xl">
            <SplitText
              text="Ready for your next escape?"
              className="font-serif text-3xl font-semibold text-white sm:text-4xl"
            />
            <Reveal delay={0.15} y={16}>
              <p className="mx-auto mt-4 max-w-lg text-white/75 lg:mx-0">
                Tell us where you want to go and we&apos;ll take it from there — itineraries,
                hotels, visas, and everything in between.
              </p>
            </Reveal>
            <Reveal delay={0.25} y={16}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <MagneticButton>
                  <Button href="/contact" arrow>
                    Plan My Trip
                  </Button>
                </MagneticButton>
                <Button
                  href="/holidays"
                  variant="outline"
                  className="border-white/40 text-white hover:border-white hover:bg-white/10 hover:text-white"
                >
                  Browse Holidays
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
