"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-brand-teal-light transition-transform duration-300 ease-out group-hover:scale-x-100",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button
            href="/contact"
            className="neon-glow bg-brand-teal-light px-5 py-2.5 text-xs text-[#080f1c] hover:bg-white hover:text-[#080f1c]"
          >
            Plan Your Trip
          </Button>
        </div>

        <button
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
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/8 bg-[#080f1c] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/5 hover:text-white",
                      active ? "text-brand-teal-light" : "text-white/65",
                    )}
                  >
                    {link.label}
                  </Link>
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
    </header>
  );
}
