import { ChevronDown } from "lucide-react";

type Day = { day: number; title: string; description: string };

// Native <details>: keyboard and screen-reader accessible, works without JavaScript, and the full
// itinerary text stays in the HTML for search engines. The first day starts open.
export function ItineraryAccordion({ days }: { days: readonly Day[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {days.map((d, i) => (
        <li key={d.day} className="timeline-item relative">
          <details
            open={i === 0}
            className="group rounded-xl border border-line/10 bg-white transition-shadow open:shadow-md open:shadow-brand-blue/5"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 rounded-xl px-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light [&::-webkit-details-marker]:hidden">
              <span className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-bg-navy-light text-brand-navy-accent">
                <span className="text-[11px] font-semibold uppercase tracking-widest">Day</span>
                <span className="font-serif text-lg font-semibold leading-none">
                  {String(d.day).padStart(2, "0")}
                </span>
              </span>
              <h3 className="flex-1 font-serif text-base font-semibold text-text-ink sm:text-lg">
                {d.title}
              </h3>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className="shrink-0 text-text-muted transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            {d.description && (
              <p className="px-4 pb-5 pl-[5.5rem] pr-6 text-sm leading-relaxed text-text-muted">
                {d.description}
              </p>
            )}
          </details>
        </li>
      ))}
    </ol>
  );
}
