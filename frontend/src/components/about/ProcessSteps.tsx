"use client";

import { FileCheck2, MessageCircle, PlaneTakeoff, Route } from "lucide-react";
import { useEffect, useRef } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

// Kept here, not passed from the page: icon components can't cross the server/client boundary.
const STEPS = [
  {
    title: "Share your plans",
    text: "Message us on WhatsApp, call or use the contact form: where, when and who's travelling.",
    icon: MessageCircle,
  },
  {
    title: "Get a tailored itinerary",
    text: "We shape a trip around your dates, budget and pace, with clear per-person pricing.",
    icon: Route,
  },
  {
    title: "Visa and bookings",
    text: "We guide your visa documents and arrange the hotels, transfers and tours.",
    icon: FileCheck2,
  },
  {
    title: "Travel with a contact",
    text: "Questions before you fly? The same team is a message away.",
    icon: PlaneTakeoff,
  },
] as const;

/**
 * Numbered steps joined by a rail that fills as the section scrolls through the viewport
 * (horizontal on desktop, vertical on phones). Each step lights up once the fill reaches it.
 * The fill is decoration only; without JavaScript the steps read the same.
 */
export function ProcessSteps() {
  const steps = STEPS;
  const wrapRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the list's top reaches 80% of the viewport, 1 when its bottom passes 55%.
      const raw = reduced ? 1 : (vh * 0.8 - rect.top) / (rect.height + vh * 0.25);
      const progress = Math.max(0, Math.min(1, raw));
      wrap.style.setProperty("--p", progress.toFixed(4));
      const items = wrap.querySelectorAll<HTMLElement>("[data-step]");
      items.forEach((item, i) => {
        const at = items.length > 1 ? i / (items.length - 1) : 0;
        item.toggleAttribute("data-on", progress >= at - 0.02);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ol
      ref={wrapRef}
      className="relative mt-16 grid grid-cols-1 gap-10 pl-16 md:grid-cols-4 md:gap-8 md:pl-0"
    >
      {/* Rail: vertical on phones, horizontal from md up. Track + scroll-driven fill. */}
      <span
        aria-hidden
        className="absolute bottom-6 left-6 top-6 w-px bg-line/10 md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:top-7 md:h-px md:w-auto"
      />
      <span
        aria-hidden
        className="absolute bottom-6 left-6 top-6 w-px origin-top bg-gradient-to-b from-brand-teal to-brand-blue [transform:scaleY(var(--p,1))] md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:top-7 md:h-px md:w-auto md:origin-left md:bg-gradient-to-r md:[transform:scaleX(var(--p,1))]"
      />

      {steps.map(({ title, text, icon: Icon }, i) => (
        <li key={title} data-step className="group relative md:text-center">
          <Reveal delay={i * 0.1} y={20}>
            <span
              className={cn(
                "absolute -left-16 top-0 flex h-12 w-12 items-center justify-center rounded-full border bg-white text-text-muted shadow-sm transition-all duration-500 md:static md:mx-auto md:h-14 md:w-14",
                "border-line/10 group-data-[on]:border-transparent group-data-[on]:bg-brand-blue-strong group-data-[on]:text-white group-data-[on]:shadow-lg group-data-[on]:shadow-brand-blue/30",
              )}
            >
              <Icon size={20} aria-hidden />
            </span>
            <p className="font-serif text-sm italic text-brand-blue-strong md:mt-6">
              Step {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-1 font-serif text-xl font-semibold tracking-tight text-text-ink">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted md:mx-auto md:max-w-[15rem]">
              {text}
            </p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
