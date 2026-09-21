// One shared scroll listener drives every parallax layer on the page. Layers are moved with
// a GPU transform written straight to the element (no React re-render), and only while their
// section is near the viewport.

type Item = {
  el: HTMLElement;
  section: HTMLElement;
  range: number;
  visible: boolean;
};

const items = new Set<Item>();
const observer: IntersectionObserver | null =
  typeof IntersectionObserver === "undefined"
    ? null
    : new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            for (const item of items) {
              if (item.section === entry.target) item.visible = entry.isIntersecting;
            }
          }
          schedule();
        },
        { rootMargin: "20% 0px 20% 0px" },
      );

let frame = 0;
let listening = false;

function update() {
  frame = 0;
  const vh = window.innerHeight;
  // Softer travel on small screens: the effect stays but is much gentler.
  const scale = window.innerWidth < 768 ? 0.5 : 1;
  for (const item of items) {
    if (!item.visible) continue;
    const rect = item.section.getBoundingClientRect();
    const progress = (vh - rect.top) / (vh + rect.height); // 0 → 1 as the section crosses the screen
    const y = (progress * 2 - 1) * item.range * scale;
    item.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function unlisten() {
  if (!listening || items.size > 0) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
}

export function registerParallax(el: HTMLElement, section: HTMLElement, range: number) {
  const item: Item = { el, section, range, visible: true };
  items.add(item);
  observer?.observe(section);
  listen();
  schedule();

  return () => {
    items.delete(item);
    if (![...items].some((i) => i.section === section)) observer?.unobserve(section);
    el.style.transform = "";
    unlisten();
  };
}
