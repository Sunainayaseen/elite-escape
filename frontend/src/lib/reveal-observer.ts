// Shared IntersectionObserver for every scroll reveal (Reveal, SplitText, ImageReveal).
// Elements are visible by default; globals.css only hides them while `html.js` is set and the
// visitor has not asked for reduced motion. Observing flips `data-in` once, then stops.

const observers = new Map<string, IntersectionObserver>();
const pending = new Set<HTMLElement>();
let listening = false;

function reveal(el: HTMLElement) {
  el.setAttribute("data-in", "");
  pending.delete(el);
}

// The reveal margin shrinks the viewport a little so content animates in slightly after it
// appears. Elements in the last few pixels of the page (the footer's legal row) can therefore
// never cross that margin, so once the reader reaches the bottom we reveal whatever is on screen.
function flushAtBottom() {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (!atBottom) return;
  for (const el of [...pending]) {
    if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
  }
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", flushAtBottom, { passive: true });
  window.addEventListener("resize", flushAtBottom, { passive: true });
}

function getObserver(margin: string) {
  let observer = observers.get(margin);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer!.unobserve(entry.target);
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    );
    observers.set(margin, observer);
  }
  return observer;
}

export function observeReveal(el: HTMLElement, margin: string) {
  if (typeof IntersectionObserver === "undefined") {
    el.setAttribute("data-in", "");
    return () => {};
  }
  // Tells the failsafe timer in the root layout that hydration worked.
  (window as unknown as { __reveal?: boolean }).__reveal = true;
  const observer = getObserver(margin);
  observer.observe(el);
  pending.add(el);
  listen();
  flushAtBottom();
  return () => {
    observer.unobserve(el);
    pending.delete(el);
  };
}
