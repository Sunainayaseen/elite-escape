import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact/ContactForm";
import { OfficeMap } from "@/components/contact/OfficeMap";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { getSiteSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Elite Escape Tourism — Dubai and Lahore offices, phone, WhatsApp, and email support for your next trip.",
  path: "/contact",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const [{ topic }, settings] = await Promise.all([searchParams, getSiteSettings()]);
  const OFFICES = settings.offices;
  const CONTACT_EMAIL = settings.contact_email;
  const WORKING_HOURS = settings.working_hours;
  const defaultMessage = topic ? `I'd like to enquire about: ${topic.slice(0, 200)}.

` : "";

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Let's plan your next trip"
        description="Tell us where you want to go — a real person on our team will get back to you, not a chatbot."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <Reveal x={-30} y={0}>
            <ContactForm defaultMessage={defaultMessage} />
          </Reveal>

          <Reveal delay={0.1} x={30} y={0} className="flex flex-col gap-5">
            {OFFICES.map((office) => (
              <div
                key={office.city}
                className="rounded-2xl border border-line/10 bg-white p-6 shadow-sm shadow-brand-blue/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-blue/10"
              >
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-blue" />
                  <div>
                    <p className="font-serif text-lg font-semibold text-text-ink">
                      {office.city}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                      {office.address}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 pl-[26px]">
                  {office.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-brand-blue-strong"
                    >
                      <Phone size={13} className="text-brand-blue" />
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 rounded-2xl border border-line/10 bg-bg-navy-light p-6">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2.5 text-sm text-text-ink transition-colors hover:text-brand-blue-strong"
              >
                <Mail size={16} className="text-brand-blue" />
                {CONTACT_EMAIL}
              </a>
              <div className="flex items-center gap-2.5 text-sm text-text-muted">
                <Clock size={16} className="text-brand-blue" />
                {WORKING_HOURS}
              </div>
              <WhatsAppLink
                message="Hello Elite Escape Tourism, I'd like some help planning a trip."
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#07361c] transition-colors hover:bg-[#1fbe5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
              >
                <MessageCircle size={16} aria-hidden />
                Chat on WhatsApp
              </WhatsAppLink>
            </div>
          </Reveal>
        </div>
      </section>

      {OFFICES.length > 0 && (
        <section aria-labelledby="visit-title" className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue-strong">
            Visit us
          </p>
          <h2 id="visit-title" className="mt-2 font-serif text-2xl font-semibold text-text-ink sm:text-3xl">
            Our offices
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {OFFICES.map((office, i) => (
              <Reveal key={office.city} delay={i * 0.08} y={20}>
                <OfficeMap city={office.city} address={office.address} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
