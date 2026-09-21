import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-brand-blue text-white hover:bg-brand-teal shadow-lg shadow-brand-blue/20",
  outline:
    "border border-line/20 text-text-ink hover:border-brand-teal-light hover:text-brand-teal-light",
  ghost: "text-text-ink hover:text-brand-teal-light",
} as const;

type Variant = keyof typeof VARIANTS;

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light";

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: {
  href?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(baseClasses, VARIANTS[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
