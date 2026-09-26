"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";

import { formatTravelDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A native date input (keyboard and screen-reader friendly, mobile date pickers) that reads
 * "Add date" / "12 Oct 2026" instead of the browser's "mm/dd/yyyy". The formatted text is an
 * overlay; while the input has focus the native value shows, so typing a date still works.
 * `inputClassName` and `overlayClassName` must share horizontal padding so the text lines up.
 */
export function DateField({
  id,
  name,
  value,
  min,
  onChange,
  required,
  label,
  describedBy,
  invalid,
  placeholder = "Add date",
  inputClassName,
  overlayClassName,
}: {
  id?: string;
  name?: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** Accessible name when there is no visible <label htmlFor>. */
  label?: string;
  describedBy?: string;
  invalid?: boolean;
  placeholder?: string;
  inputClassName?: string;
  overlayClassName?: string;
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
        name={name}
        type="date"
        min={min}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        // The caller's classes come first so the hide-until-focused colour below always wins.
        className={cn(
          inputClassName,
          "peer w-full cursor-pointer text-transparent focus:text-text-ink [color-scheme:light]",
          // Chrome/Edge: stretch the invisible picker button over the whole field.
          "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-between gap-2 text-sm peer-focus:hidden",
          overlayClassName,
        )}
      >
        <span className={value ? "truncate font-semibold text-text-ink" : "truncate text-text-muted"}>
          {value ? formatTravelDate(value) : placeholder}
        </span>
        <CalendarDays size={15} className="shrink-0 text-text-muted" />
      </span>
    </div>
  );
}
