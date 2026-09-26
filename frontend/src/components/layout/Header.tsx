"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { closeOnLinkClick, MegaMenuPanel, MobileMegaList } from "@/components/layout/MegaMenu";
import { Button } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";
import { MEGA_MENUS, type MenuKind, type MenuPackage } from "@/lib/navigation";
import { NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

// "Plan Your Trip" already leads to /contact, so a Contact link in the bar would duplicate it.
const HEADER_LINKS = NAV_LINKS.filter((link) => link.href !== "/contact");

const menuFor = (href: string) => MEGA_MENUS.find((m) => m.navHref === href);

// Hover intent: a short delay before opening avoids flashing panels as the pointer crosses the bar,
// and a longer one before closing lets the pointer travel from the link down into the panel.
const OPEN_DELAY = 90;
const CLOSE_DELAY = 180;

export function Header({ packages = [] }: { packages?: readonly MenuPackage[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<MenuKind | null>(null);
  const [mobileSection, setMobileSection] = useState<MenuKind | null>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef(new Map<MenuKind, HTMLButtonElement>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const closeMega = useCallback(() => {
    clearTimer();
    setMegaOpen(null);
  }, []);
  const scheduleOpen = (kind: MenuKind) => {
    clearTimer();
    // Moving between menus switches instantly; the first open waits for hover intent.
    if (megaOpen) setMegaOpen(kind);
    else timer.current = setTimeout(() => setMegaOpen(kind), OPEN_DELAY);
  };
  const scheduleClose = () => {
    clearTimer();
    timer.current = setTimeout(() => setMegaOpen(null), CLOSE_DELAY);
  };

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

  // Desktop mega menu: Escape closes it (focus back on its trigger), so does a click anywhere outside.
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggerRefs.current.get(megaOpen)?.focus();
        closeMega();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) closeMega();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [megaOpen, closeMega]);

  // Any navigation closes whichever menu is open (state adjusted during render, React's pattern for
  // resetting state when a value changes).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMegaOpen(null);
    setOpen(false);
  }

  useEffect(() => () => clearTimer(), []);

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

  // Stop the page scrolling behind the mobile menu while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const activeMenu = MEGA_MENUS.find((m) => m.kind === megaOpen);

  return (
    // Floating glass bar: the outer header only positions it, so the gaps around the pill stay click-through.
    <header ref={headerRef} className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          // One fixed tint so the bar reads the same over the dark hero and over white sections;
          // the navy-tinted shadow and faint dark ring keep its edge crisp on light backgrounds.
          "pointer-events-auto relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border lg:rounded-full border-white/12 ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300",
          // The open phone menu sits over page content, so it gets a near-solid fill to stay legible.
          open ? "bg-[#081a2c]/95" : "bg-[#081a2c]/80",
          open || scrolled || megaOpen
            ? "shadow-[0_12px_36px_-10px_rgba(8,26,44,0.45)]"
            : "shadow-[0_8px_30px_-12px_rgba(8,26,44,0.3)]",
        )}
      >
        {/* 1fr / auto / 1fr keeps the nav optically centred however wide the logo and CTA are */}
        <div className="flex items-center justify-between gap-4 py-2 pl-5 pr-3 sm:pl-7 sm:pr-4 lg:grid lg:pl-8 lg:pr-2.5 lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="Elite Escape Tourism — home"
            className="flex items-center gap-2.5 justify-self-start rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal-light"
          >
            {/* Icon-only mark: the full logo's "ELITE" wordmark is illegible at bar height */}
            <Image
              src="/logo-mark.svg"
              alt=""
              width={40}
              height={37}
              priority
              className="h-9 w-auto"
            />
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight text-white">Elite Escape</span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
                Tourism
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {HEADER_LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const menu = menuFor(link.href);
              const expanded = !!menu && megaOpen === menu.kind;
              return (
                <div
                  key={link.href}
                  className="relative flex items-center"
                  onPointerEnter={menu ? (e) => e.pointerType === "mouse" && scheduleOpen(menu.kind) : undefined}
                  onPointerLeave={menu ? (e) => e.pointerType === "mouse" && scheduleClose() : undefined}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "relative isolate rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light xl:px-3.5 xl:text-sm",
                      menu && "pr-7 xl:pr-7",
                      active || expanded ? "text-white" : "text-white/75",
                      expanded && !active && "bg-white/8",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        transition={{ duration: 0.4, ease: EASE }}
                        className="absolute inset-0 -z-10 rounded-full bg-white/12"
                      />
                    )}
                    {link.label}
                  </Link>
                  {menu && (
                    // A separate disclosure button, so the label stays a normal link to the overview page.
                    <button
                      ref={(el) => {
                        if (el) triggerRefs.current.set(menu.kind, el);
                        else triggerRefs.current.delete(menu.kind);
                      }}
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`mega-${menu.kind}`}
                      aria-label={`${expanded ? "Hide" : "Show"} ${menu.title} menu`}
                      onClick={() => (expanded ? closeMega() : setMegaOpen(menu.kind))}
                      className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-teal-light"
                    >
                      <ChevronDown
                        size={14}
                        aria-hidden
                        className={cn("transition-transform duration-200", expanded && "rotate-180")}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="hidden justify-self-end lg:block">
            <Button
              href="/contact"
              className="bg-white px-5 py-2 text-sm font-semibold text-[#080f1c] shadow-md shadow-black/20 hover:bg-brand-teal-light hover:text-[#080f1c] hover:shadow-black/20"
            >
              Plan Your Trip
            </Button>
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              aria-label="Main"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              {/* The destination lists are long, so the open menu scrolls inside the bar. */}
              <div
                onClick={closeOnLinkClick(() => setOpen(false))}
                className="flex max-h-[calc(100dvh-6.5rem)] flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-3"
              >
                {HEADER_LINKS.map((link, i) => {
                  const active =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  const menu = menuFor(link.href);
                  const expanded = !!menu && mobileSection === menu.kind;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.04, ease: EASE }}
                    >
                      <div className="flex items-center gap-1">
                        <Link
                          href={link.href}
                          className={cn(
                            "block flex-1 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light",
                            active ? "bg-white/10 text-white" : "text-white/75",
                          )}
                        >
                          {link.label}
                        </Link>
                        {menu && (
                          <button
                            type="button"
                            aria-expanded={expanded}
                            aria-controls={`mobile-mega-${menu.kind}`}
                            aria-label={`${expanded ? "Hide" : "Show"} ${menu.title} destinations`}
                            onClick={() => setMobileSection(expanded ? null : menu.kind)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
                          >
                            <ChevronDown
                              size={18}
                              aria-hidden
                              className={cn("transition-transform duration-200", expanded && "rotate-180")}
                            />
                          </button>
                        )}
                      </div>
                      {menu && expanded && (
                        <MobileMegaList menu={menu} packages={packages} id={`mobile-mega-${menu.kind}`} />
                      )}
                    </motion.div>
                  );
                })}
                <Button
                  href="/contact"
                  className="mt-2 w-full bg-white text-[#080f1c] shadow-none hover:bg-brand-teal-light hover:shadow-none"
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
          className="pointer-events-none absolute inset-x-4 bottom-0 lg:inset-x-8 h-0.5 origin-left rounded-full scale-x-0 bg-gradient-to-r from-brand-blue via-brand-teal-light to-brand-teal"
        />
      </div>

      {/* Desktop mega menu: a sibling of the bar (the bar clips its overflow), sharing its width. */}
      <div className="relative mx-auto hidden max-w-7xl lg:block">
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              key={activeMenu.kind}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE }}
              onPointerEnter={(e) => e.pointerType === "mouse" && clearTimer()}
              onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
              // pt-3 is an invisible bridge between the bar and the panel, so hover isn't lost crossing it.
              className="pointer-events-auto absolute inset-x-0 top-0 pt-3"
            >
              <MegaMenuPanel
                menu={activeMenu}
                packages={packages}
                id={`mega-${activeMenu.kind}`}
                onClose={closeMega}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
