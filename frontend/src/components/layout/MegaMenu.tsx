"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { type MegaMenu, type MenuItem, type MenuKind, type MenuPackage, resolveMenuItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const PAGE_NAME: Record<MenuKind, string> = {
  holidays: "package page",
  visa: "visa page",
  attractions: "attractions page",
};

/** Close the menu when any link inside it is followed (page links and WhatsApp enquiries alike). */
export function closeOnLinkClick(close: () => void) {
  return (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a")) close();
  };
}

function ItemLink({
  menu,
  item,
  packages,
  tone,
}: {
  menu: MegaMenu;
  item: MenuItem;
  packages: readonly MenuPackage[];
  tone: "light" | "dark";
}) {
  const resolved = resolveMenuItem(menu.kind, item, packages);
  const base = cn(
    "group/item flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-teal-light",
    tone === "light"
      ? "text-text-ink hover:bg-bg-navy-light hover:text-brand-blue-strong"
      : "text-white/75 hover:bg-white/10 hover:text-white",
  );

  if (resolved.type === "page") {
    return (
      <Link href={resolved.href} className={base}>
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal-light" />
          <span className="truncate font-semibold">{item.name}</span>
        </span>
        <ArrowRight
          size={14}
          aria-hidden
          className="shrink-0 -translate-x-1 opacity-0 transition-all duration-150 group-hover/item:translate-x-0 group-hover/item:opacity-100"
        />
      </Link>
    );
  }

  return (
    <WhatsAppLink message={resolved.message} fallbackHref={resolved.fallbackHref} className={base}>
      <span className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent" />
        <span className="truncate">{item.name}</span>
      </span>
      <MessageCircle
        size={14}
        aria-hidden
        className="shrink-0 opacity-0 transition-opacity duration-150 group-hover/item:opacity-70"
      />
    </WhatsAppLink>
  );
}

/** Desktop dropdown panel. Positioning and open/close state live in the Header. */
export function MegaMenuPanel({
  menu,
  packages,
  id,
  onClose,
}: {
  menu: MegaMenu;
  packages: readonly MenuPackage[];
  id: string;
  onClose: () => void;
}) {
  return (
    <div
      id={id}
      onClick={closeOnLinkClick(onClose)}
      className="grid grid-cols-[17rem_1fr] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_70px_-20px_rgba(8,26,44,0.45)] ring-1 ring-black/5"
    >
      {/* Intro column */}
      <div className="relative isolate flex flex-col justify-between overflow-hidden bg-[#081a2c] p-8 text-white">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-brand-teal opacity-25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-teal-light">
            Explore
          </p>
          <p className="mt-2 font-serif text-2xl font-semibold leading-tight">{menu.title}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">{menu.description}</p>
        </div>

        <div className="mt-8">
          <Link
            href={menu.navHref}
            className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#081a2c] transition-colors hover:bg-brand-teal-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
          >
            {menu.allLabel}
            <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <ul className="mt-6 space-y-1.5 text-xs text-white/55">
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-teal-light" />
              Opens the {PAGE_NAME[menu.kind]}
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={12} aria-hidden />
              Opens an enquiry with our team
            </li>
          </ul>
        </div>
      </div>

      {/* Categories: CSS columns pack uneven lists without gaps */}
      <div className="flex max-h-[min(34rem,calc(100dvh-8rem))] flex-col">
        <div className="columns-3 gap-6 overflow-y-auto p-7 [column-fill:balance]">
          {menu.categories.map((category) => (
            <div key={category.name} className="mb-6 break-inside-avoid">
              <p aria-hidden className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                {category.name}
              </p>
              <ul aria-label={category.name}>
                {category.items.map((item) => (
                  <li key={item.name}>
                    <ItemLink menu={menu} item={item} packages={packages} tone="light" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line/10 bg-bg-navy px-8 py-4 text-sm">
          <p className="text-text-muted">Can&apos;t see what you&apos;re looking for? Tell us and we&apos;ll plan it.</p>
          <Link
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-brand-blue-strong hover:text-brand-navy-accent"
          >
            Plan your trip
            <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Mobile: the same groups as an expandable list inside the phone menu. */
export function MobileMegaList({
  menu,
  packages,
  id,
}: {
  menu: MegaMenu;
  packages: readonly MenuPackage[];
  id: string;
}) {
  return (
    <div id={id} className="mb-2 ml-3 space-y-4 border-l border-white/10 py-2 pl-3">
      {menu.categories.map((category) => (
        <div key={category.name}>
          <p aria-hidden className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {category.name}
          </p>
          <ul aria-label={category.name}>
            {category.items.map((item) => (
              <li key={item.name}>
                <ItemLink menu={menu} item={item} packages={packages} tone="dark" />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Link
        href={menu.navHref}
        className="inline-flex items-center gap-1.5 px-2.5 text-sm font-semibold text-brand-teal-light"
      >
        {menu.allLabel}
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
