"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";
import { NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Keyboard users must be able to dismiss the mobile menu: Escape closes it and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close the mobile menu after navigating, and stop the page scrolling behind it while open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = open || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        solid
          ? "border-white/8 bg-[#080f1c]/95 shadow-lg shadow-black/20 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300",
          scrolled && !open ? "py-2" : "py-3",
        )}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Elite Escape Tourism — home"
          className="flex items-center gap-2.5"
        >
          <Image
            src="/logo.svg"
            alt="Elite Escape Tourism"
            width={72}
            height={72}
            priority
            className={cn(
              "w-auto transition-all duration-300",
              scrolled && !open ? "h-12" : "h-16 sm:h-[72px]",
            )}
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative py-1 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200 hover:text-white",
                  active ? "text-brand-teal-light" : "text-white/75",
                )}
              >
                {link.label}
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ duration: 0.4, ease: EASE }}
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-brand-teal-light"
                  />
                ) : (
                  <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-teal-light transition-transform duration-300 ease-out group-hover:scale-x-100" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button
            href="/contact"
            arrow
            className="neon-glow bg-brand-teal-light px-5 py-2.5 text-xs text-[#080f1c] hover:bg-white hover:text-[#080f1c]"
          >
            Plan Your Trip
          </Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-white/8 bg-[#080f1c] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link, i) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.04, ease: EASE }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white",
                        active ? "text-brand-teal-light" : "text-white/65",
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <Button
                href="/contact"
                className="neon-glow mt-2 w-full bg-brand-teal-light text-[#080f1c] hover:bg-white"
              >
                Plan Your Trip
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Reading progress — a scaleX transform, so it never triggers layout */}
      <span
        ref={progressRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-blue via-brand-teal-light to-brand-teal"
      />
    </header>
  );
}
