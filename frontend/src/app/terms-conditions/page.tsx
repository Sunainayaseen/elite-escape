import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CONTACT_EMAIL } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "Booking terms, pricing, cancellations, and visa disclaimers for Elite Escape Tourism.",
  path: "/terms-conditions",
});

const SECTIONS = [
  {
    title: "Bookings & enquiries",
    body: "Submitting an enquiry through this website does not constitute a confirmed booking. A booking is confirmed only once our team has issued written confirmation and any required deposit or payment has been received.",
  },
  {
    title: "Pricing",
    body: "Prices shown on package pages are indicative, per person, and subject to availability, travel dates, and currency fluctuations. Final pricing is confirmed at the time of booking.",
  },
  {
    title: "Visa assistance",
    body: "Visa assistance is provided on a best-effort basis. Final approval of any visa application rests solely with the relevant embassy or consulate — Elite Escape Tourism cannot guarantee approval and is not liable for a rejected application.",
  },
  {
    title: "Cancellations & changes",
    body: "Cancellation and amendment policies vary by supplier (airline, hotel, tour operator) and will be shared with you at the time of booking, alongside any applicable fees.",
  },
  {
    title: "Travel insurance",
    body: "We strongly recommend all travelers take out comprehensive travel insurance covering medical emergencies, trip cancellation, and lost baggage for the duration of their trip.",
  },
  {
    title: "Liability",
    body: "Elite Escape Tourism acts as an agent for third-party suppliers (airlines, hotels, tour operators) and is not liable for their acts, omissions, or service failures beyond what is required by applicable law.",
  },
  {
    title: "Contact",
    body: `Questions about these terms can be sent to ${CONTACT_EMAIL}.`,
  },
] as const;

export default function TermsConditionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Last updated September 2026."
      />

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-10">
          {SECTIONS.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.05} y={16}>
              <h2 className="font-serif text-xl font-semibold text-text-ink">
                {section.title}
              </h2>
              <p className="mt-3 leading-relaxed text-text-muted">{section.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
