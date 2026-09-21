import { Compass, Headset, Route, Users } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";

// Claims here are limited to what the business actually does; no numbers, response times or awards.
const HIGHLIGHTS = [
  {
    icon: Compass,
    title: "Tailor-Made Journeys",
    text: "Personalized travel experiences designed around your needs.",
  },
  {
    icon: Users,
    title: "Expert Assistance",
    text: "Guidance throughout your travel planning process.",
  },
  {
    icon: Route,
    title: "Seamless Travel",
    text: "Support with carefully coordinated travel arrangements.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    text: "Assistance when you need it.",
  },
] as const;

export function ServiceHighlights() {
  return (
    <section aria-labelledby="service-highlights-title" className="mx-auto max-w-6xl px-6 pb-4 pt-20 sm:pt-24">
      <h2 id="service-highlights-title" className="sr-only">
        How Elite Escape Tourism helps
      </h2>
      <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <Reveal delay={i * 0.08} y={16}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-navy-light text-brand-navy-accent">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{text}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
