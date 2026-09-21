"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { type FormEvent, useState } from "react";

import { apiRequest } from "@/lib/api";

const FIELD_CLASSES =
  "w-full rounded-xl border border-line/15 bg-bg-navy-light px-4 py-3 text-sm text-text-ink outline-none transition-all duration-300 placeholder:text-text-muted focus:outline-none focus-visible:outline-none focus:-translate-y-0.5 focus:border-brand-blue/60 focus:bg-white focus:shadow-lg focus:shadow-brand-blue/10 focus:ring-4 focus:ring-brand-blue/10";

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
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
          phone: (data.get("phone") as string) || null,
          message: data.get("message"),
          source_page: "contact",
          inquiry_type: /visa/i.test(defaultMessage) ? "visa" : "general",
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line/10 bg-white p-10 text-center shadow-sm shadow-brand-blue/5">
        <CheckCircle2 size={40} className="text-brand-blue" />
        <p className="font-serif text-xl font-semibold text-text-ink">Message sent — thank you!</p>
        <p className="max-w-sm text-sm text-text-muted">
          Our team will get back to you soon. For anything urgent, message us
          on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-line/10 bg-white p-6 shadow-sm shadow-brand-blue/5 sm:p-8"
    >
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" required maxLength={150} placeholder="Full name" className={FIELD_CLASSES} />
        <input
          name="email"
          required
          type="email"
          placeholder="Email address"
          className={FIELD_CLASSES}
        />
      </div>
      <input
        name="phone"
        type="tel"
        maxLength={40}
        placeholder="Phone number (optional)"
        className={FIELD_CLASSES}
      />
      <textarea
        name="message"
        required
        rows={5}
        maxLength={4000}
        defaultValue={defaultMessage}
        placeholder="Tell us where you want to go, and when"
        className={`${FIELD_CLASSES} resize-none`}
      />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="neon-glow group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue-strong px-6 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-navy-accent active:translate-y-0 disabled:opacity-70"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Enquiry
            <Send
              size={15}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
            />
          </>
        )}
      </button>
    </form>
  );
}
