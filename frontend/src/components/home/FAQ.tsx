"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { FAQS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function FAQ({
  eyebrow = "FAQ",
  title = "Frequently asked questions",
  items = FAQS,
}: {
  eyebrow?: string;
  title?: string;
  items?: readonly { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-bg-navy/40 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #EAF2F8 0%, rgba(234,242,248,0) 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #E9ECF7 0%, rgba(233,236,247,0) 70%)" }}
      />

      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeader eyebrow={eyebrow} title={title} />

        <div className="mt-12 flex flex-col gap-4">
          {items.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.question} delay={i * 0.05} y={16}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                    isOpen
                      ? "border-brand-teal-light/50 shadow-lg shadow-brand-blue/10"
                      : "border-line/10 shadow-sm shadow-brand-blue/5 hover:border-brand-blue/25 hover:shadow-md hover:shadow-brand-blue/10",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors duration-200 sm:text-base",
                        isOpen ? "text-brand-blue" : "text-text-ink",
                      )}
                    >
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{
                        rotate: isOpen ? 180 : 0,
                        backgroundColor: isOpen ? "#2890BD" : "rgba(15,27,43,0.05)",
                      }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    >
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-colors duration-200",
                          isOpen ? "text-white" : "text-brand-blue",
                        )}
                      />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-line/8 px-6 pb-5 pt-4">
                          <p className="text-sm leading-relaxed text-text-muted">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
