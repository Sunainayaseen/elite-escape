"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { focusAngles, type GlobePoint, HUB } from "@/lib/geo";
import { usePrefersReducedMotion } from "@/lib/use-motion-env";
import { cn } from "@/lib/utils";

// cobe projects a lat/lng with these constants (globe radius 0.8 of the canvas half-size).
const RADIUS = 0.8;
const MARKER_ELEVATION = 0.02;
// The canvas is drawn 25% larger than its box so the atmosphere glow has room; the sphere itself
// then exactly fills the box (0.8 × 1.25 = 1).
const CANVAS_OVERSCAN = 1.25;

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function project(lat: number, lng: number, phi: number, theta: number) {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const c = Math.cos(r);
  const k = RADIUS + MARKER_ELEVATION;
  const x = -c * Math.cos(a) * k;
  const y = Math.sin(r) * k;
  const z = c * Math.sin(a) * k;
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const px = cp * x + sp * z;
  const py = sp * st * x + ct * y - cp * st * z;
  const depth = -sp * ct * x + st * y + cp * ct * z;
  return {
    left: (px + 1) / 2,
    top: (-py + 1) / 2,
    // Fade pins out over the limb instead of popping.
    opacity: Math.max(0, Math.min(1, depth * 10)),
    front: depth > 0.01,
  };
}

function shortestAngle(from: number, to: number) {
  const twoPi = Math.PI * 2;
  return ((((to - from) % twoPi) + Math.PI * 3) % twoPi) - Math.PI;
}

/**
 * Lightweight WebGL globe (cobe, ~5KB) with real DOM pins on top, so every destination is a
 * keyboard-focusable link. Rendering only runs while the globe is on screen; the WebGL context is
 * released on unmount. Falls back to `fallback` when WebGL is unavailable.
 */
export default function InteractiveGlobe({
  points,
  focusId,
  onActiveChange,
  decorative = false,
  className,
  fallback,
}: {
  points: readonly GlobePoint[];
  focusId?: string | null;
  onActiveChange?: (id: string | null) => void;
  /** Non-interactive background globe: no pins, no dragging, hidden from assistive tech. */
  decorative?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinRefs = useRef(new Map<string, HTMLElement>());
  const reduced = usePrefersReducedMotion();
  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  const cameraTarget = useRef<{ phi: number; theta: number } | null>(null);
  const hovering = useRef(false);

  // Follow an externally controlled focus (the destination list next to the globe).
  useEffect(() => {
    const point = points.find((p) => p.id === focusId);
    cameraTarget.current = point ? focusAngles(point.lat, point.lng) : null;
    hovering.current = !!point;
  }, [focusId, points]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let disposed = false;
    let raf = 0;
    let onScreen = false;
    let globe: { update: (s: Record<string, unknown>) => void; destroy: () => void } | null = null;
    let size = 0;

    const small = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);

    let phi = 4.2; // starts facing Europe/Asia
    let theta = 0.3;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let last = performance.now();

    const destinations = points.filter((p) => p.kind === "destination");
    const markers = points.map((p) => ({
      location: [p.lat, p.lng] as [number, number],
      size: p.kind === "office" ? 0.05 : 0.04,
      color: (p.kind === "office" ? [0.91, 0.75, 0.49] : [0.36, 0.76, 0.94]) as [number, number, number],
    }));
    const arcs = decorative
      ? []
      : destinations
          .filter((p) => Math.abs(p.lat - HUB[0]) + Math.abs(p.lng - HUB[1]) > 1)
          .map((p) => ({ from: HUB, to: [p.lat, p.lng] as [number, number] }));

    function measure() {
      size = wrap!.clientWidth * CANVAS_OVERSCAN;
      globe?.update({ width: size, height: size });
    }

    function frame(now: number) {
      raf = 0;
      if (disposed || !onScreen || document.hidden) return;
      const dt = Math.min(50, now - last);
      last = now;

      const target = cameraTarget.current;
      if (target && !dragging) {
        if (reduced) {
          phi = target.phi;
          theta = target.theta;
        } else {
          phi += shortestAngle(phi, target.phi) * 0.07;
          theta += (target.theta - theta) * 0.07;
        }
      } else if (!dragging && !hovering.current && !reduced) {
        phi += dt * 0.00018; // ~one turn per 35s
      }

      globe?.update({ phi, theta });

      if (!decorative) {
        for (const p of points) {
          const el = pinRefs.current.get(p.id);
          if (!el) continue;
          const pos = project(p.lat, p.lng, phi, theta);
          el.style.left = `${pos.left * 100}%`;
          el.style.top = `${pos.top * 100}%`;
          el.style.opacity = String(pos.opacity);
          // `visibility: hidden` also removes back-facing pins from the tab order.
          el.style.visibility = pos.front ? "visible" : "hidden";
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!raf && onScreen && !disposed) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
      },
      { rootMargin: "80px" },
    );
    io.observe(wrap);

    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    const onVisibility = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVisibility);

    // Drag to rotate (mouse, touch and pen). Vertical page scroll still works on touch.
    const onDown = (e: PointerEvent) => {
      dragging = true;
      cameraTarget.current = null;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      phi += (e.clientX - lastX) * 0.006;
      theta = Math.max(-0.6, Math.min(0.9, theta + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
      canvas.style.cursor = "grab";
    };
    if (!decorative) {
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
    }

    // cobe is loaded on demand so it never weighs on the initial page.
    import("cobe")
      .then(({ default: createGlobe }) => {
        if (disposed) return;
        if (!webglAvailable()) {
          setSupported(false);
          return;
        }
        size = wrap.clientWidth * CANVAS_OVERSCAN;
        try {
          globe = createGlobe(canvas, {
            devicePixelRatio: dpr,
            width: size,
            height: size,
            phi,
            theta,
            dark: 1,
            diffuse: 1.25,
            mapSamples: small ? 9000 : 16000,
            mapBrightness: 5.5,
            baseColor: [0.14, 0.3, 0.5],
            markerColor: [0.36, 0.76, 0.94],
            glowColor: [0.1, 0.42, 0.68],
            markers,
            arcs,
            arcColor: [0.36, 0.76, 0.94],
            arcWidth: 0.5,
            arcHeight: 0.22,
            markerElevation: MARKER_ELEVATION,
          }) as typeof globe;
          if (onScreen) start();
        } catch {
          if (!disposed) setSupported(false);
        }
      })
      .catch(() => !disposed && setSupported(false));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      globe?.destroy();
      // Release the GPU context immediately instead of waiting for garbage collection.
      try {
        const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        /* context already gone */
      }
    };
  }, [points, decorative, reduced]);

  if (!supported) return <>{fallback}</>;

  function activate(id: string | null) {
    setActive(id);
    onActiveChange?.(id);
    const point = points.find((p) => p.id === id);
    cameraTarget.current = point ? focusAngles(point.lat, point.lng) : null;
    hovering.current = !!point;
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden={decorative || undefined}
      className={cn("relative aspect-square w-full", className)}
    >
      <div
        className="absolute"
        style={{ inset: `${((1 - CANVAS_OVERSCAN) / 2) * 100}%` }}
      >
        <canvas
          ref={canvasRef}
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : "Interactive globe of Elite Escape destinations"}
          className={cn("h-full w-full", !decorative && "cursor-grab touch-pan-y")}
        />

        {!decorative &&
          points.map((p) => {
            const isActive = active === p.id || focusId === p.id;
            return (
              <div
                key={p.id}
                ref={(el) => {
                  if (el) pinRefs.current.set(p.id, el);
                  else pinRefs.current.delete(p.id);
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 opacity-0"
                style={{ left: "50%", top: "50%" }}
              >
                <Link
                  href={p.href}
                  onMouseEnter={() => activate(p.id)}
                  onMouseLeave={() => activate(null)}
                  onFocus={() => activate(p.id)}
                  onBlur={() => activate(null)}
                  aria-label={`${p.label}${p.sublabel ? ` — ${p.sublabel}` : ""}`}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
                >
                  <span
                    className={cn(
                      "block rounded-full border-2 border-white/90 transition-all duration-300",
                      p.kind === "office" ? "bg-gold" : "bg-brand-teal-light",
                      isActive ? "h-4 w-4 shadow-[0_0_0_6px_rgba(92,195,239,0.28)]" : "h-2.5 w-2.5",
                    )}
                  />
                  <span
                    role="tooltip"
                    className={cn(
                      "pointer-events-none absolute bottom-full left-1/2 mb-1 w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-left shadow-xl transition-all duration-200",
                      isActive ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                    )}
                  >
                    <span className="block text-xs font-semibold text-text-ink">{p.label}</span>
                    {p.sublabel && (
                      <span className="block text-[11px] text-text-muted">{p.sublabel}</span>
                    )}
                  </span>
                </Link>
              </div>
            );
          })}
      </div>
    </div>
  );
}
