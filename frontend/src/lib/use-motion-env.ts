"use client";

import { useSyncExternalStore } from "react";

function subscribeTo(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

// Server and first client render both report `false`, so enhanced visuals only switch on
// after hydration and never cause a mismatch.
function useMedia(query: string) {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function usePrefersReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}

/** True on devices with a real hover-capable pointer (desktop/laptop mouse or trackpad). */
export function useFinePointer() {
  return useMedia("(hover: hover) and (pointer: fine)");
}

/** True from tablet-landscape / small desktop upward. */
export function useWideViewport() {
  return useMedia("(min-width: 1024px)");
}
