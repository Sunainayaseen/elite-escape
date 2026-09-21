"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Wraps the itinerary list with a vertical rail that fills as the reader scrolls, and marks each
 * `.timeline-item` as passed / active. It only decorates: the items themselves (a native
 * <details> accordion) work identically without it.
 */
export function TimelineProgress({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const fill = fillRef.current;
    if (!wrap || !fill) return;

    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const line = vh * 0.5; // the "reading line"
      const rect = wrap.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (line - rect.top) / rect.height));
      fill.style.transform = `scaleY(${progress.toFixed(4)})`;

      let active: Element | null = null;
      wrap.querySelectorAll(".timeline-item").forEach((item) => {
        const top = item.getBoundingClientRect().top;
        const passed = top < line;
        item.toggleAttribute("data-passed", passed);
        if (passed) active = item;
        item.removeAttribute("data-active");
      });
      (active as Element | null)?.setAttribute("data-active", "");
    };

    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(wrap);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative pl-7 sm:pl-9">
      <span aria-hidden className="absolute bottom-6 left-[9px] top-6 w-px bg-line/15 sm:left-[13px]">
        <span
          ref={fillRef}
          className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-brand-blue to-brand-teal-light"
        />
      </span>
      {children}
    </div>
  );
}
