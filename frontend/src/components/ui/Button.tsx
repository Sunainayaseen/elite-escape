import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-brand-blue-strong text-white hover:bg-brand-navy-accent shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/30",
  outline:
    "border border-line/20 text-text-ink hover:border-brand-teal-light hover:text-brand-teal-light",
  ghost: "text-text-ink hover:text-brand-teal-light",
} as const;

type Variant = keyof typeof VARIANTS;

const baseClasses =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light";

export function Button({
  href,
  variant = "primary",
  arrow = false,
  className,
  children,
  ...props
}: {
  href?: string;
  variant?: Variant;
  /** Adds an arrow that nudges forward on hover. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(baseClasses, VARIANTS[variant], className);
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          size={15}
          aria-hidden
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
