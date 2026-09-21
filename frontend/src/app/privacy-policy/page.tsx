import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CONTACT_EMAIL } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Elite Escape Tourism collects, uses, and protects your information.",
  path: "/privacy-policy",
});

const SECTIONS = [
  {
    title: "Information we collect",
    body: "When you make an enquiry, request a quote, or contact us, we collect the details you provide directly — name, email, phone number, travel dates, and any preferences you share with us. We do not collect payment information through this website; payment is handled directly with our team once a booking is confirmed.",
  },
  {
    title: "How we use your information",
    body: "We use the information you provide to respond to enquiries, prepare quotes and itineraries, process visa assistance requests, and communicate with you about a booking in progress. We do not sell or rent your personal information to third parties.",
  },
  {
    title: "Third-party services",
    body: "Some parts of this site display reviews sourced from Google, and images served through third-party content delivery networks. These providers may process standard technical data (such as IP address) as part of delivering that content.",
  },
  {
    title: "Cookies",
    body: "This site may use essential cookies required for basic functionality. We do not currently use advertising or third-party tracking cookies.",
  },
  {
    title: "Your rights",
    body: "You can request a copy of the information we hold about you, ask us to correct it, or ask us to delete it, by contacting us using the details below.",
  },
  {
    title: "Contact",
    body: `Questions about this policy can be sent to ${CONTACT_EMAIL}.`,
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
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
