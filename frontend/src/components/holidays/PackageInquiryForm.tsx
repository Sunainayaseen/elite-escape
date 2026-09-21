"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";

const FIELD =
  "rounded-xl border border-line/15 bg-white px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-brand-blue focus:outline-none";

function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function PackageInquiryForm({
  packageTitle,
  packageSlug,
}: {
  packageTitle: string;
  packageSlug: string;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("submitting");
    setError(null);
    try {
      await apiRequest("/api/inquiries", {
        body: {
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: ((data.get("notes") as string) || "").trim() || `I'd like to enquire about ${packageTitle}.`,
          source_page: `package:${packageSlug}`,
          inquiry_type: "package",
          package_slug: packageSlug,
          travel_start: data.get("travel_date"),
          travelers: Number(data.get("travelers")) || 1,
          website: data.get("website"),
        },
      });
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line/10 bg-bg-navy-light px-6 py-10 text-center">
        <CheckCircle2 size={36} className="text-brand-blue" />
        <p className="font-serif text-lg font-semibold text-text-ink">
          Thanks — we&apos;ve got it!
        </p>
        <p className="text-sm text-text-muted">
          One of our travel experts will reach out to you about {packageTitle}{" "}
          soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" required type="text" placeholder="Full name" className={FIELD} />
        <input name="phone" required type="tel" placeholder="Phone number" className={FIELD} />
      </div>
      <input name="email" required type="email" placeholder="Email address" className={FIELD} />
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <input
          name="travel_date"
          required
          type="date"
          min={todayIso()}
          aria-label="Preferred travel date"
          className={FIELD}
        />
        <input
          name="travelers"
          type="number"
          min={1}
          max={50}
          defaultValue={2}
          aria-label="Number of travelers"
          className={FIELD}
        />
      </div>
      <textarea
        name="notes"
        rows={3}
        maxLength={2000}
        placeholder="Anything specific? Group size, budget, requests..."
        className={`${FIELD} resize-none`}
      />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-1 w-full justify-center" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending...
          </>
        ) : (
          `Enquire about ${packageTitle}`
        )}
      </Button>
      <p className="text-center text-[11px] text-text-muted">
        No payment required — this just starts the conversation.
      </p>
    </form>
  );
}
