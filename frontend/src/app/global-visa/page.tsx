import type { Metadata } from "next";

import { CTASection } from "@/components/home/CTASection";
import { FAQ } from "@/components/home/FAQ";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { TiltCard } from "@/components/motion/TiltCard";
import { Button } from "@/components/ui/Button";
import { VisaExplorer } from "@/components/visa/VisaExplorer";
import { VisaStamps } from "@/components/visa/VisaStamps";
import { getVisaCountries } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Visa Assistance",
  description:
    "Visa assistance for travelers, arranged alongside your holiday booking or as a standalone service. Tell us your destination and we'll guide you through the process.",
  path: "/global-visa",
});

const STEPS = [
  {
    step: "01",
    title: "Initial Consultation",
    description:
      "Share your destination and travel dates so we can understand your travel requirements.",
  },
  {
    step: "02",
    title: "Document Preparation",
    description:
      "We guide you through the forms, appointments and the document checklist for your case.",
  },
  {
    step: "03",
    title: "Application Submission",
    description:
      "We assist with the application process where applicable, so your file is complete and accurate.",
  },
  {
    step: "04",
    title: "Application Tracking",
    description:
      "We keep you updated as your application progresses. The decision rests with the embassy or consulate.",
  },
] as const;

// UAE visa services listed on the live eliteescapetourism.com visa page. No fees or timelines are
// published, so none are shown; they are confirmed with each applicant.
const UAE_SERVICES = [
  { name: "Tourist Visa", detail: "30-day and 90-day options" },
  { name: "Business & Investor Visa", detail: "For business travel and investment" },
  { name: "Transit Visa", detail: "48-hour and 96-hour options" },
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
        eyebrow="Visa Assistance"
        title="Visa Assistance Made Simpler"
        description="From document preparation to application guidance, our team helps make your visa journey clearer and more organized."
        decor={<VisaStamps />}
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                  <p className="relative text-xs font-semibold tracking-[0.2em] text-brand-blue">
                    STEP {item.step}
                  </p>
                  <h3 className="relative mt-2 font-serif text-lg font-semibold text-text-ink">
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
        <SectionHeader
          eyebrow="UAE visas"
          title="UAE visa services"
          description="Assistance with UAE visas, for visitors and for those doing business in the country."
        />
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {UAE_SERVICES.map((service, i) => (
            <li key={service.name}>
              <Reveal delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-line/10 bg-white p-7 shadow-sm shadow-brand-blue/5">
                  <h3 className="font-serif text-lg font-semibold text-text-ink">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{service.detail}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center">
          <Button href="/contact?topic=Visa%20assistance">Get Visa Assistance</Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <SectionHeader
          eyebrow="Destinations"
          title="Where we can help"
          description="Choose your destination to start an enquiry. Fees and timelines are confirmed with you directly, because they depend on your passport and circumstances."
        />

        <div className="mt-12">
          <VisaExplorer countries={countries} />
        </div>
      </section>

      <FAQ eyebrow="Visa FAQ" title="Visa questions, answered" items={VISA_FAQS} />

      <CTASection />
    </>
  );
}
