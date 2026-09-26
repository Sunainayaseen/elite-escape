import { ArrowDown, FileCheck2, Globe2, MapPin, MessageCircle, Send, ShieldCheck } from "lucide-react";
import type { CSSProperties } from "react";

import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { flagSrc } from "@/lib/flags";
import type { VisaCountry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { visaWhatsAppMessage } from "@/lib/whatsapp";

// CSS-only entrance (.fade-up in globals.css): the copy is visible without JavaScript.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

// One neon accent for the whole hero, so the glow reads as intentional rather than decorative.
const NEON = "#67e8f9";

// Every point restates something the site already says (visa page FAQ, steps, offices).
const TRUST_POINTS = [
  { icon: ShieldCheck, label: "With your holiday or on its own" },
  { icon: FileCheck2, label: "A checklist for your case" },
  { icon: MapPin, label: "Dubai & Lahore offices" },
] as const;

// The same four steps as the section below, shown as the "application" the traveller starts.
const JOURNEY = [
  { icon: MessageCircle, title: "Consultation", detail: "Your destination and dates" },
  { icon: FileCheck2, title: "Documents", detail: "Forms, appointments, checklist" },
  { icon: Send, title: "Submission", detail: "A complete, accurate file" },
  { icon: Globe2, title: "Tracking", detail: "Updates until the decision" },
] as const;

const FLAG_LIMIT = 6;

export function VisaHero({ countries }: { countries: readonly VisaCountry[] }) {
  const flagged = countries
    .map((c) => ({ name: c.country_name, src: flagSrc(c.flag_emoji) }))
    .filter((c): c is { name: string; src: string } => c.src !== null);
  const shown = flagged.slice(0, FLAG_LIMIT);

  return (
    <section className="relative isolate overflow-hidden bg-[#050d18] pb-20 pt-36 sm:pb-28 sm:pt-44">
      {/* Background: a fine grid that fades out, one soft cyan bloom, and a neon horizon line. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(103,232,249,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.06)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_60%_40%,black,transparent)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 right-[-10%] -z-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.18),transparent_65%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#67e8f9]/60 to-transparent shadow-[0_0_24px_2px_rgba(103,232,249,0.35)]"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p
            style={delay(0.05)}
            className="fade-up inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/60"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: NEON, boxShadow: `0 0 10px 2px ${NEON}` }}
            />
            Visa assistance
          </p>

          <h1
            style={delay(0.12)}
            className="fade-up mt-6 font-serif text-[clamp(2.6rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
          >
            Visa assistance,
            <br />
            <em
              className="font-normal"
              style={{ color: NEON, textShadow: "0 0 28px rgba(103,232,249,0.45)" }}
            >
              made simpler.
            </em>
          </h1>

          <p
            style={delay(0.22)}
            className="fade-up mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg lg:mx-0"
          >
            From document preparation to application guidance, our team helps make your visa journey
            clearer and more organized.
          </p>

          <div
            style={delay(0.3)}
            className="fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <WhatsAppLink
              message={visaWhatsAppMessage()}
              fallbackHref="/contact?topic=Visa%20assistance"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#67e8f9] px-7 py-3.5 text-sm font-semibold text-[#04121f] shadow-[0_0_0_1px_rgba(103,232,249,0.5),0_8px_32px_-6px_rgba(103,232,249,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_10px_40px_-6px_rgba(103,232,249,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67e8f9] sm:w-auto"
            >
              <MessageCircle size={16} aria-hidden />
              Get visa assistance
            </WhatsAppLink>
            <a
              href="#destinations"
              className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              Explore destinations
              <ArrowDown
                size={16}
                aria-hidden
                className="text-[#67e8f9] transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </a>
          </div>

          <ul
            style={delay(0.38)}
            className="fade-up mt-12 flex flex-col items-center gap-3 border-t border-white/[0.08] pt-6 text-[13px] text-white/50 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-7 lg:justify-start"
          >
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={15} aria-hidden className="shrink-0 text-[#67e8f9]/80" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual: the visa "application" as a minimal neon timeline */}
        <div style={delay(0.3)} className="fade-up relative mx-auto w-full max-w-md lg:mr-0">
          {/* 1px gradient border: the lit edge fades from cyan at the top to almost nothing */}
          <div className="rounded-[1.75rem] bg-gradient-to-b from-[#67e8f9]/50 via-white/[0.08] to-white/[0.03] p-px shadow-[0_30px_80px_-30px_rgba(103,232,249,0.35)]">
            <div className="rounded-[calc(1.75rem-1px)] bg-[#07131f]/95 p-7 backdrop-blur-xl sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-serif text-xl font-medium text-white">Your visa journey</p>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                  4 steps
                </p>
              </div>

              <div className="relative mt-8">
                {/* Rail: dim track, a lit segment for the current step, and a light that travels down */}
                <span aria-hidden className="absolute bottom-5 left-[15px] top-5 w-px bg-white/10" />
                <span
                  aria-hidden
                  className="absolute left-[15px] top-5 h-14 w-px bg-gradient-to-b from-[#67e8f9] to-transparent"
                />
                <span
                  aria-hidden
                  style={{ "--scan-distance": "12rem" } as CSSProperties}
                  className="neon-scan absolute left-[14px] top-5 h-10 w-[3px] rounded-full bg-gradient-to-b from-transparent via-[#67e8f9] to-transparent blur-[1px]"
                />

                <ol>

                {JOURNEY.map(({ icon: Icon, title, detail }, i) => {
                  const current = i === 0;
                  return (
                    <li key={title} className={cn("relative flex gap-5", i > 0 && "mt-7")}>
                      <span
                        className={cn(
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                          current
                            ? "border-[#67e8f9] bg-[#07131f] text-[#67e8f9] shadow-[0_0_18px_2px_rgba(103,232,249,0.45)]"
                            : "border-white/15 bg-[#07131f] text-white/45",
                        )}
                      >
                        <Icon size={14} aria-hidden />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            current ? "text-white" : "text-white/75",
                          )}
                        >
                          {title}
                        </p>
                        <p className="mt-0.5 text-xs text-white/45">{detail}</p>
                      </div>
                      <span
                        className={cn(
                          "ml-auto pt-1 font-mono text-[11px] tabular-nums",
                          current ? "text-[#67e8f9]" : "text-white/25",
                        )}
                      >
                        0{i + 1}
                      </span>
                    </li>
                  );
                })}
                </ol>
              </div>

              {countries.length > 0 && (
                <div className="mt-9 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
                  {shown.length > 0 && (
                    <div className="flex -space-x-1.5">
                      {shown.map((c) => (
                        // eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs
                        <img
                          key={c.name}
                          src={c.src}
                          alt={c.name}
                          title={c.name}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full object-cover ring-2 ring-[#07131f]"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-right text-xs text-white/45">
                    <span className="font-semibold text-white">{countries.length} destinations</span>
                    <span className="hidden sm:inline"> · more on request</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
