import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CONTACT_EMAIL } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description:
    "How the Elite Escape Tourism website uses cookies and similar technologies.",
  path: "/cookie-policy",
});

// Describes only what the site actually does today: no analytics, advertising or tracking cookies on
// the public pages. If analytics or a chat widget is added later, update this page first.
const SECTIONS = [
  {
    title: "What cookies are",
    body: "Cookies are small text files that a website can store in your browser. They are commonly used to keep a site working, remember a session, or measure how a site is used.",
  },
  {
    title: "Cookies on this website",
    body: "The public pages of this website do not set advertising, analytics or third-party tracking cookies. Browsing destinations, holiday packages and visa information does not require you to accept any cookies.",
  },
  {
    title: "Staff sign-in",
    body: "Our team signs in to a private dashboard to manage packages and enquiries. That area uses a strictly necessary session cookie to keep staff signed in securely. It is not used on the public pages and is not used to track visitors.",
  },
  {
    title: "Third-party content",
    body: "Some content is loaded from other services, for example images from content delivery networks and reviews from Google where they are shown. Links to WhatsApp, social networks and maps take you to those services, which have their own cookie and privacy policies. Those providers may process standard technical data such as your IP address when their content is loaded.",
  },
  {
    title: "Managing cookies",
    body: "You can block or delete cookies in your browser settings. Doing so will not stop you from using the public pages of this website.",
  },
  {
    title: "Changes to this policy",
    body: "If we add analytics or other tools that use cookies, we will update this page and, where required, ask for your consent first.",
  },
  {
    title: "Contact",
    body: `Questions about this policy can be sent to ${CONTACT_EMAIL}.`,
  },
] as const;

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie Policy"
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
