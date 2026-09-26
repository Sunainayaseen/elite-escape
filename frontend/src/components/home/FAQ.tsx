"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessagesSquare, Plus } from "lucide-react";
import { useId, useState } from "react";

import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Button } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";
import { FAQS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function FAQ({
  eyebrow = "FAQ",
  title = "Frequently asked questions",
  items = FAQS,
  layout = "stacked",
}: {
  eyebrow?: string;
  title?: string;
  items?: readonly { question: string; answer: string }[];
  /** "split" puts the heading and a help card beside the questions on wide screens. */
  layout?: "stacked" | "split";
}) {
  const split = layout === "split";
  const uid = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const list = (
    <Reveal y={24}>
      <ul className="divide-y divide-line/8 overflow-hidden rounded-3xl border border-line/10 bg-white shadow-[0_1px_2px_rgba(15,27,43,0.04),0_16px_40px_-24px_rgba(15,27,43,0.18)]">
        {items.map((faq, i) => {
          const isOpen = openIndex === i;
          const buttonId = `${uid}-q${i}`;
          const panelId = `${uid}-a${i}`;
          return (
            <li key={faq.question} className="relative">
              {/* Accent bar marking the open question */}
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-6 left-0 top-6 w-[3px] origin-top rounded-r-full bg-brand-blue transition-transform duration-500 ease-out",
                  isOpen ? "scale-y-100" : "scale-y-0",
                )}
              />
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="group flex w-full items-start gap-4 px-5 py-6 text-left sm:gap-5 sm:px-8"
                >
                  <span
                    aria-hidden
                    className="w-7 shrink-0 pt-0.5 font-serif text-sm italic text-brand-blue-strong"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-sans text-[15px] font-semibold leading-snug text-text-ink transition-colors duration-200 group-hover:text-brand-blue-strong sm:text-[17px]">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "-mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      isOpen
                        ? "rotate-45 border-transparent bg-text-ink text-white"
                        : "border-line/12 text-text-ink group-hover:border-brand-blue/40 group-hover:text-brand-blue-strong",
                    )}
                  >
                    <Plus size={16} strokeWidth={2.25} />
                  </span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    {/* Indented to line up with the question text, past the number column */}
                    <p className="max-w-2xl px-5 pb-7 pl-[4.25rem] text-[15px] leading-relaxed text-text-muted sm:px-8 sm:pl-[5.25rem]">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );

  return (
    <section className="bg-bg-navy/60 py-24 sm:py-32">
      {split ? (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              align="left"
              eyebrow={eyebrow}
              title={title}
              description="Quick answers about booking, visas and what's included."
            />

            <Reveal delay={0.15} y={16} className="mt-10">
              <div className="rounded-3xl border border-line/10 bg-white p-7 shadow-[0_16px_40px_-24px_rgba(15,27,43,0.18)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-navy-light text-brand-blue-strong">
                  <MessagesSquare size={20} aria-hidden />
                </span>
                <p className="mt-5 font-serif text-xl font-semibold text-text-ink">
                  Still have questions?
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                  Our travel team can help with packages, visas and bookings.
                </p>
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
                  <WhatsAppLink
                    message="Hello Elite Escape Tourism, I have a question."
                    variant="primary"
                    className="flex-1 px-5"
                  >
                    Chat on WhatsApp
                  </WhatsAppLink>
                  <Button href="/contact" variant="outline" className="flex-1 px-5">
                    Contact us
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>

          {list}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeader eyebrow={eyebrow} title={title} />
          <div className="mt-12">{list}</div>
        </div>
      )}
    </section>
  );
}
