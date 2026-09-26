import { Clock3, Mail, Phone, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { SVGProps } from "react";

import { GlobeSlot } from "@/components/globe/GlobeSlot";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getSiteSettings } from "@/lib/data";
import { IMG } from "@/lib/site-data";

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.84.5 3.56 1.38 5.03L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.92C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.13.11-1.83-.12-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.15-4.94-4.34-.15-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39.002.56.01.18.008.42-.07.66.5.24.58.83 2.02.9 2.17.08.15.13.32.03.51-.1.19-.15.31-.3.48-.15.17-.3.38-.44.5-.15.13-.3.28-.13.56.17.29.75 1.24 1.62 2.01 1.12.99 2.05 1.31 2.35 1.46.3.14.47.12.65-.05.18-.17.75-.87.95-1.17.2-.3.4-.24.68-.14.28.1 1.79.85 2.1 1 .31.15.51.23.59.36.08.14.08.78-.16 1.46Z" />
    </svg>
  );
}

type ContactItem = { icon: LucideIcon; label: string; href?: string };

/** Closing call to action, shared by the home page and most content pages. */
export async function CTASection() {
  // Real contact details from site settings (editable in the dashboard), never placeholder copy.
  const settings = await getSiteSettings();
  const phone = settings.offices.find((o) => o.phones.length > 0)?.phones[0];
  const hours = settings.working_hours.replace(/^working days:\s*/i, "");

  const contacts: ContactItem[] = [];
  if (phone) contacts.push({ icon: Phone, label: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` });
  if (settings.contact_email) {
    contacts.push({ icon: Mail, label: settings.contact_email, href: `mailto:${settings.contact_email}` });
  }
  if (hours) contacts.push({ icon: Clock3, label: hours });

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
      <Reveal y={36} scale={0.98}>
        <div className="relative isolate overflow-clip rounded-[2rem] bg-[#081a2c] shadow-[0_32px_80px_-32px_rgba(8,26,44,0.6)] ring-1 ring-white/10">
          {/* Depth: photograph (parallax) → navy wash → soft glow → content */}
          <Parallax range={36} className="-z-10">
            <Image
              src={IMG.planeWing}
              alt=""
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover opacity-30 mix-blend-luminosity"
            />
          </Parallax>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#081a2c] via-[#081a2c]/90 to-[#0a2238]/70" />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-96 w-96 rounded-full bg-brand-navy-accent opacity-35 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />

          <div className="grid grid-cols-1 items-center gap-10 px-6 py-14 text-center sm:px-12 sm:py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8 lg:px-16 lg:py-20 lg:text-left">
            <div>
              <Reveal y={16}>
                <h2 className="font-serif text-[clamp(2.1rem,4.6vw,3.4rem)] font-medium leading-[1.06] tracking-[-0.02em] text-white">
                  Let&apos;s plan your next <em className="font-normal text-[#8fd8f5]">escape.</em>
                </h2>
              </Reveal>
              <Reveal delay={0.1} y={16}>
                <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg lg:mx-0">
                  Tell us where and when you&apos;d like to go. We&apos;ll shape the itinerary,
                  arrange hotels and transfers, and guide you through the visa if you need one.
                </p>
              </Reveal>

              <Reveal delay={0.2} y={16}>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <MagneticButton className="w-full sm:w-auto">
                    <Button
                      href="/contact"
                      arrow
                      className="w-full bg-white px-7 py-3.5 text-[#080f1c] shadow-lg shadow-black/25 hover:bg-white hover:text-[#080f1c] hover:shadow-xl sm:w-auto"
                    >
                      Plan my trip
                    </Button>
                  </MagneticButton>
                  <WhatsAppLink
                    message="Hello Elite Escape Tourism, I'd like help planning a trip."
                    variant="ghost"
                    className="w-full border border-white/20 px-7 py-3.5 text-white hover:border-[#25D366]/60 hover:bg-[#25D366]/10 hover:text-white sm:w-auto"
                  >
                    <WhatsAppIcon className="h-[18px] w-[18px] text-[#25D366]" />
                    Chat on WhatsApp
                  </WhatsAppLink>
                </div>
              </Reveal>

              {contacts.length > 0 && (
                <Reveal delay={0.3} y={12}>
                  <ul className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-7 text-sm text-white/65 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 lg:justify-start">
                    {contacts.map(({ icon: Icon, label, href }) => (
                      <li key={label} className="flex items-center gap-2">
                        <Icon size={15} aria-hidden className="shrink-0 text-[#8fd8f5]" />
                        {href ? (
                          <a href={href} className="transition-colors hover:text-white">
                            {label}
                          </a>
                        ) : (
                          label
                        )}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>

            {/* Decorative globe: desktop only (hidden below lg, so it is never loaded there) */}
            <div aria-hidden className="pointer-events-none relative hidden justify-self-center lg:block">
              <div className="absolute inset-10 rounded-full bg-brand-teal/25 blur-3xl" />
              <div className="relative w-[340px] xl:w-[380px]">
                <GlobeSlot points={[]} decorative />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
