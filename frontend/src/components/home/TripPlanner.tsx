"use client";

import { ArrowRight, CalendarDays, ChevronDown, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useId, useRef, useState } from "react";

import { useWhatsAppNumber } from "@/components/layout/WhatsAppLink";
import type { Package } from "@/lib/types";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

const TRAVEL_TYPES = ["Family", "Couple", "Solo", "Luxury", "Adventure", "Honeymoon", "Business"];
const MIN_TRAVELERS = 1;
const MAX_TRAVELERS = 50;

// Borderless inputs inside labelled "segments", like a booking-site search bar.
const INPUT =
  "block w-full min-w-0 appearance-none bg-transparent py-0.5 text-sm font-semibold text-text-ink outline-none [color-scheme:light]";

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Segment({
  htmlFor,
  label,
  className,
  children,
}: {
  htmlFor: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        // Inputs are outline-none, so the whole segment carries the focus cue. On desktop the
        // dividers are short pseudo-element lines, not borders: a border on a rounded-full segment
        // curves into the half-circle artefacts the bar used to show.
        "relative min-w-0 rounded-xl bg-bg-navy px-4 py-2.5 transition-colors duration-200 hover:bg-bg-navy-light focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-teal-light/60",
        "lg:rounded-full lg:bg-transparent lg:px-6 lg:py-3 lg:hover:bg-bg-navy lg:focus-within:bg-white lg:focus-within:shadow-lg lg:focus-within:shadow-brand-blue/10",
        "lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:h-8 lg:before:w-px lg:before:-translate-y-1/2 lg:before:bg-line/10 lg:before:transition-opacity lg:hover:before:opacity-0 lg:focus-within:before:opacity-0",
        className,
      )}
    >
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * A native date input (keyboard and screen-reader friendly, mobile date pickers) that reads
 * "Add date" / "12 Oct 2026" instead of the browser's "mm/dd/yyyy". The formatted text is an
 * overlay; while the input has focus the native value shows, so typing a date still works.
 */
function DateField({
  id,
  value,
  min,
  onChange,
  describedBy,
  invalid,
}: {
  id: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  describedBy?: string;
  invalid?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function openPicker() {
    try {
      ref.current?.showPicker?.();
    } catch {
      /* not allowed here (e.g. cross-origin iframe); the input still works by keyboard */
    }
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type="date"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn(
          INPUT,
          "peer cursor-pointer text-transparent focus:text-text-ink",
          // Chrome/Edge: stretch the invisible picker button over the whole field.
          "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-between gap-2 text-sm peer-focus:hidden"
      >
        <span className={value ? "truncate font-semibold text-text-ink" : "truncate text-text-muted"}>
          {value ? formatDate(value) : "Add date"}
        </span>
        <CalendarDays size={15} className="shrink-0 text-text-muted" />
      </span>
    </div>
  );
}

function SelectField({ children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} data-own-icon className={cn(INPUT, "ui-select cursor-pointer px-0 pr-6")}>
        {children}
      </select>
      <ChevronDown
        size={15}
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
}

// Opens a WhatsApp chat with the trip details pre-written (no booking is created). The planner has
// no name/phone fields, so nothing is saved to the dashboard from here; if no WhatsApp number is
// configured it falls back to the contact form with the details pre-filled.
export function TripPlanner({ packages }: { packages: readonly Package[] }) {
  const router = useRouter();
  const whatsappNumber = useWhatsAppNumber();
  const uid = useId();
  const today = new Date().toISOString().slice(0, 10);

  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const destinations = Array.from(new Set(packages.map((p) => p.country))).sort();

  function changeDeparture(value: string) {
    setDeparture(value);
    // Keep the pair valid: a return date before the new departure is cleared, not silently kept.
    if (returnDate && value && returnDate < value) setReturnDate("");
    setError(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (departure && returnDate && returnDate < departure) {
      setError("Return date must be on or after the departure date.");
      return;
    }
    setError(null);

    const data = new FormData(e.currentTarget);
    const destination = String(data.get("destination") || "");
    const type = String(data.get("type") || "");

    const parts = [
      `${type ? `${type} trip` : "Trip"}${destination ? ` to ${destination}` : ""}`,
      departure
        ? returnDate
          ? `${formatDate(departure)} – ${formatDate(returnDate)}`
          : `from ${formatDate(departure)}`
        : "",
      `${travelers} ${travelers === 1 ? "traveler" : "travelers"}`,
    ].filter(Boolean);

    const summary = parts.join(", ");
    const chat = whatsappUrl(
      whatsappNumber,
      `Hello Elite Escape Tourism, I'd like help planning a trip: ${summary}.`,
    );
    if (chat) {
      window.open(chat, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(`/contact?topic=${encodeURIComponent(summary)}`);
  }

  const stepButton =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line/15 text-text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-teal-light disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line/15 disabled:hover:text-text-ink";

  return (
    <section id="plan-your-trip" aria-labelledby={`${uid}-title`} className="scroll-mt-28">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-1">
        <h2 id={`${uid}-title`} className="font-serif text-lg font-semibold text-white">
          Plan your trip
        </h2>
        <p className="text-sm text-white/60">
          Share the basics and our team will pick it up from there.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-2.5 shadow-2xl shadow-black/30 ring-1 ring-black/5 lg:rounded-full lg:p-2"
      >
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1.35fr_1fr_1fr_0.95fr_1fr_auto] lg:items-stretch lg:gap-0 [&>*]:min-w-0 lg:[&>*:hover+*]:before:opacity-0 lg:[&>*:focus-within+*]:before:opacity-0">
          <Segment
            htmlFor={`${uid}-dest`}
            label="Destination"
            className="col-span-2 lg:col-span-1 lg:pl-7 lg:before:hidden"
          >
            <SelectField id={`${uid}-dest`} name="destination" defaultValue="">
              <option value="">Not sure yet</option>
              {destinations.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          </Segment>

          <Segment htmlFor={`${uid}-from`} label="Departure">
            <DateField id={`${uid}-from`} value={departure} min={today} onChange={changeDeparture} />
          </Segment>

          <Segment htmlFor={`${uid}-to`} label="Return">
            <DateField
              id={`${uid}-to`}
              value={returnDate}
              min={departure || today}
              onChange={(v) => {
                setReturnDate(v);
                setError(null);
              }}
              describedBy={error ? `${uid}-error` : undefined}
              invalid={!!error}
            />
          </Segment>

          <Segment htmlFor={`${uid}-pax`} label="Travelers">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setTravelers((n) => Math.max(MIN_TRAVELERS, n - 1))}
                disabled={travelers <= MIN_TRAVELERS}
                aria-label="Fewer travelers"
                className={stepButton}
              >
                <Minus size={13} aria-hidden />
              </button>
              <input
                id={`${uid}-pax`}
                name="travelers"
                type="number"
                inputMode="numeric"
                min={MIN_TRAVELERS}
                max={MAX_TRAVELERS}
                value={travelers}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) {
                    setTravelers(Math.min(MAX_TRAVELERS, Math.max(MIN_TRAVELERS, Math.round(n))));
                  }
                }}
                className={cn(
                  INPUT,
                  "w-8 text-center [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                )}
              />
              <button
                type="button"
                onClick={() => setTravelers((n) => Math.min(MAX_TRAVELERS, n + 1))}
                disabled={travelers >= MAX_TRAVELERS}
                aria-label="More travelers"
                className={stepButton}
              >
                <Plus size={13} aria-hidden />
              </button>
            </div>
          </Segment>

          <Segment htmlFor={`${uid}-type`} label="Travel type">
            <SelectField id={`${uid}-type`} name="type" defaultValue="">
              <option value="">Any</option>
              {TRAVEL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectField>
          </Segment>

          <div className="col-span-2 flex lg:col-span-1 lg:pl-2">
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue-strong px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-blue/30 transition-all duration-300 hover:bg-brand-navy-accent hover:shadow-xl active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light lg:rounded-full lg:px-8"
            >
              Start planning
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </form>

      {error && (
        <p id={`${uid}-error`} role="alert" className="mt-3 px-1 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
