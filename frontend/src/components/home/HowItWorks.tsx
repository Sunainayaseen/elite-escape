import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { HOW_IT_WORKS } from "@/lib/site-data";

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <SectionHeader eyebrow="How it works" title="Three steps to your next trip" />

      <ol className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
        {/* Hairline joining the three steps on wide screens */}
        <span
          aria-hidden
          className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-gradient-to-r from-brand-blue/10 via-brand-blue/40 to-brand-blue/10 md:block"
        />
        {HOW_IT_WORKS.map((item, i) => {
          const Icon = item.icon;
          return (
            <li key={item.step} className="relative text-center">
              <Reveal delay={i * 0.12} y={24}>
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand-blue/20 bg-white text-brand-blue-strong shadow-lg shadow-brand-blue/10">
                  <Icon size={22} aria-hidden />
                </span>
                <p className="mt-6 font-serif text-sm italic text-brand-blue-strong">
                  Step {item.step}
                </p>
                <h3 className="mt-1 font-serif text-2xl font-medium tracking-tight text-text-ink">
                  {item.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
                  {item.description}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
