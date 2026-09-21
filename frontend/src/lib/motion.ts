// Single source of truth for motion values. The CSS custom properties in globals.css
// (--ease-out, --dur-*, --reveal-distance) mirror these so CSS and JS animations feel the same.

export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const DURATION = {
  fast: 0.2,
  base: 0.6,
  slow: 1.0,
} as const;

export const STAGGER = 0.08;
export const REVEAL_DISTANCE = 28;

// Parallax travel in px (half-range: an element moves from -range to +range as its section
// scrolls through the viewport). Kept small so layers never look detached from the layout.
export const PARALLAX = {
  background: 60,
  media: 36,
  decoration: 90,
} as const;

// Cursor parallax depth in px per layer (multiplied by the pointer's -1..1 offset).
export const POINTER_DEPTH = {
  background: 8,
  midground: 16,
  foreground: 24,
} as const;

export const TILT_MAX_DEG = 4;
export const MAGNET_MAX_PX = 6;
