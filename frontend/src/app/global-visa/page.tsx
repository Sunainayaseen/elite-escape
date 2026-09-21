import type { Metadata } from "next";

import { CTASection } from "@/components/home/CTASection";
import { FAQ } from "@/components/home/FAQ";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { VisaExplorer } from "@/components/visa/VisaExplorer";
import { getVisaCountries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Global Visa Assistance | Elite Escape Tourism",
  description:
    "Visa assistance for travelers, arranged alongside your holiday booking or as a standalone service. Tell us your destination and we'll guide you through the process.",
};

const STEPS = [
  {
    step: "01",
    title: "Tell us where you're headed",
    description:
      "Share your destination and travel dates and we'll confirm what your passport needs.",
  },
  {
    step: "02",
    title: "We help prepare your documents",
    description:
      "Our visa team guides you through the forms, appointments and document checklist.",
  },
  {
    step: "03",
    title: "Submit and follow up",
    description:
      "We help you submit a complete application and keep you updated. The decision rests with the embassy or consulate.",
  },
] as const;

const VISA_FAQS = [
  {
    question: "How long does visa processing take?",
    answer:
      "It depends on the destination, your nationality and the embassy or consulate involved. Contact us with where you're headed and we'll tell you what to expect.",
  },
  {
    question: "What documents do I need to apply?",
    answer:
      "Requirements differ by country and passport. Once we know your destination we'll send you the exact document checklist for your case.",
  },
  {
    question: "Can you guarantee my visa will be approved?",
    answer:
      "No. Approval is always the decision of the relevant embassy or consulate. We help you prepare a complete, accurate application.",
  },
  {
    question: "Can I get visa assistance without booking a holiday package?",
    answer:
      "Yes. Visa assistance is available on its own, whether or not you book your trip through us.",
  },
] as const;

export default async function GlobalVisaPage() {
  const countries = await getVisaCountries();

  return (
    <>
      <PageHero
        eyebrow="Global Visa"
        title="Visa assistance, handled end to end"
        description="Documents, appointments, and follow-up — with a real visa team guiding you, not a form you fill out alone."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.1}>
              <TiltCard className="h-full rounded-2xl">
                <div className="relative h-full overflow-hidden rounded-2xl border border-line/10 bg-white p-7 shadow-sm shadow-brand-blue/5">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-1 -top-3 select-none font-serif text-6xl font-bold text-bg-navy-light/70"
                  >
                    {item.step}
                  </span>
                  <h3 className="relative font-serif text-lg font-semibold text-text-ink">
                    {item.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-text-muted">
                    {item.description}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            Destinations
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
            Where we can help
          </h2>
          <p className="mt-4 text-text-muted">
            Choose your destination to start an enquiry. Fees and timelines are confirmed
            with you directly, because they depend on your passport and circumstances.
          </p>
        </Reveal>

        <div className="mt-12">
          <VisaExplorer countries={countries} />
        </div>
      </section>

      <FAQ eyebrow="Visa FAQ" title="Visa questions, answered" items={VISA_FAQS} />

      <CTASection />
    </>
  );
}
