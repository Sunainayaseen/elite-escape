"use client";

import Link from "next/link";
import { createContext, type ReactNode, useContext } from "react";

import { buttonClasses, type ButtonVariant } from "@/components/ui/Button";
import { whatsappUrl } from "@/lib/whatsapp";

// The WhatsApp number comes from site settings (set once in the root layout), so enquiry buttons
// anywhere on the site can open a chat without each page having to pass the number down.
const WhatsAppNumberContext = createContext("");

export function WhatsAppProvider({ number, children }: { number: string; children: ReactNode }) {
  return <WhatsAppNumberContext.Provider value={number}>{children}</WhatsAppNumberContext.Provider>;
}

export function useWhatsAppNumber() {
  return useContext(WhatsAppNumberContext);
}

/**
 * An enquiry button/link that opens WhatsApp with a pre-filled message. If no WhatsApp number is
 * configured it falls back to `fallbackHref` (the contact form), so the button never dead-ends.
 */
export function WhatsAppLink({
  message,
  fallbackHref = "/contact",
  variant,
  className,
  children,
}: {
  message: string;
  fallbackHref?: string;
  /** Style it like a <Button>; omit to style it yourself via className. */
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  const url = whatsappUrl(useWhatsAppNumber(), message);
  const classes = variant ? buttonClasses(variant, className) : className;

  if (!url) {
    return (
      <Link href={fallbackHref} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={classes}>
      {children}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
