"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const button =
  "flex h-9 w-9 items-center justify-center rounded-full border border-line/15 text-text-muted transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43m8.02-17.45A11.27 11.27 0 0 0 12.04.75C5.8.75.72 5.83.72 12.07c0 2 .52 3.94 1.51 5.66L.62 23.25l5.65-1.48a11.3 11.3 0 0 0 5.41 1.38h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.02-1.18-5.87-3.32-8.01" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-8.2h2.77l.41-3.2H13.5V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14A22.6 22.6 0 0 0 14.31 3c-2.46 0-4.14 1.5-4.14 4.25V9.6H7.4v3.2h2.77V21z" />
    </svg>
  );
}

/** Share a package with family or friends: WhatsApp, Facebook, or copy the link. */
export function PackageShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${title} — Elite Escape Tourism\n${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked (e.g. insecure context); the link is still in the address bar */
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Share this trip</p>
      <div className="flex items-center gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp (opens in a new tab)"
          className={cn(button, "hover:border-[#25D366] hover:text-[#14803c]")}
        >
          <WhatsAppIcon />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook (opens in a new tab)"
          className={button}
        >
          <FacebookIcon />
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Link copied" : "Copy link"}
          className={cn(button, copied && "border-brand-blue text-brand-blue-strong")}
        >
          {copied ? <Check size={15} aria-hidden /> : <Link2 size={15} aria-hidden />}
        </button>
        <span role="status" className="sr-only">
          {copied ? "Link copied to clipboard" : ""}
        </span>
      </div>
    </div>
  );
}
