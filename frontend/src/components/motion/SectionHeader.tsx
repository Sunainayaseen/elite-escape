import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/utils";

/** Eyebrow + masked-reveal h2 + supporting copy, shared by every major section. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "center",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  tone?: "light" | "dark";
  align?: "center" | "left";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      <Reveal y={12}>
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-widest",
            dark ? "text-brand-teal-light" : "text-brand-blue",
          )}
        >
          {eyebrow}
        </p>
      </Reveal>
      <SplitText
        text={title}
        delay={0.05}
        className={cn(
          "mt-3 font-serif text-3xl font-semibold sm:text-4xl",
          dark ? "text-white" : "text-text-ink",
        )}
      />
      {description && (
        <Reveal delay={0.15} y={14}>
          <div className={cn("mt-4", dark ? "text-white/70" : "text-text-muted")}>{description}</div>
        </Reveal>
      )}
    </div>
  );
}
