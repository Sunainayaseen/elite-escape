import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { TRUST_STATS } from "@/lib/site-data";

export function WhyEliteEscape() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal x={-40} y={0}>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            About us
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
            Why Elite Escape
          </h2>
          <p className="mt-5 leading-relaxed text-text-muted">
            We turn &ldquo;I wish we could go there&rdquo; into a plan. Every
            package is a starting point that our travel team will adjust to
            your dates, your budget, and the parts of a trip you actually care
            about. Holidays, visa assistance, and the small details in
            between: one team, one point of contact, start to finish.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl font-semibold text-text-ink">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} x={40} y={0}>
          <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-xl shadow-brand-blue/10 sm:h-[520px]">
            <Image
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80"
              alt="Snow-capped mountain range"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-text-ink backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-brand-teal-light" />
              Providing exclusive, end-to-end travel experiences
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
