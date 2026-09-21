"use client";

import { type CSSProperties, useEffect, useRef } from "react";

import { observeReveal } from "@/lib/reveal-observer";

type Tag = "h1" | "h2" | "h3" | "p" | "span";

/**
 * Masked word-by-word heading reveal. The full text stays in the DOM as plain words inside the
 * real heading element, so semantics, SEO and screen readers are unaffected.
 */
export function SplitText({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  id,
}: {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    return el ? observeReveal(el, "0px 0px -8% 0px") : undefined;
  }, []);

  const words = text.split(" ");

  return (
    <Tag
      // The ref type differs per tag; all are HTMLElements.
      ref={ref as never}
      id={id}
      data-split
      className={className}
      style={{ "--rd": `${delay}s` } as CSSProperties}
    >
      {words.map((word, i) => (
        <span key={i}>
          <span className="split-word">
            <span className="split-inner" style={{ "--i": i } as CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
