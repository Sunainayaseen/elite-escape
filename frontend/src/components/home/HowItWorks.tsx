import { ArrowRight } from "lucide-react";
import { Fragment } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { HOW_IT_WORKS } from "@/lib/site-data";

const STAGGER_Y = ["lg:translate-y-3", "lg:-translate-y-4", "lg:translate-y-3"];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-bg-navy/40 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #EAF2F8 0%, rgba(234,242,248,0) 70%)" }}
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #E9ECF7 0%, rgba(233,236,247,0) 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            How it works
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
            Three steps to your next trip
          </h2>
        </Reveal>

        <div className="mt-20 flex flex-col gap-10 lg:mt-24 lg:flex-row lg:items-center lg:gap-0">
          {HOW_IT_WORKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Fragment key={item.step}>
                <div className={`lg:flex-1 ${STAGGER_Y[i] ?? ""}`}>
                  <Reveal delay={i * 0.15} x={-56} y={0}>
                    <TiltCard className="h-full rounded-2xl">
                      <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#101c30] to-[#080f1c] p-7 shadow-xl shadow-[#080f1c]/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-teal-light/30 hover:shadow-2xl hover:shadow-brand-blue/20">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-teal-light/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -right-1 -top-3 font-serif text-6xl font-bold text-white/[0.05] select-none"
                        >
                          {item.step}
                        </span>

                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-navy-accent text-white shadow-lg shadow-brand-blue/40 transition-transform duration-300 group-hover:scale-105">
                          <Icon size={24} />
                        </div>

                        <h3 className="relative mt-4 font-serif text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="relative mt-2 text-sm leading-relaxed text-white/55">
                          {item.description}
                        </p>
                      </div>
                    </TiltCard>
                  </Reveal>
                </div>

                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden shrink-0 lg:flex lg:items-center lg:justify-center lg:px-5">
                    <div className="relative flex h-14 w-14 items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-teal-light/30 via-brand-blue/15 to-transparent blur-xl" />
                      <ArrowRight size={22} className="relative text-brand-blue/60" />
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
