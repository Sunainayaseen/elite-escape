"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MarginPart = `${number}px` | `${number}%`;
type MarginValue =
  | MarginPart
  | `${MarginPart} ${MarginPart}`
  | `${MarginPart} ${MarginPart} ${MarginPart} ${MarginPart}`;

export function Reveal({
  children,
  delay = 0,
  x = 0,
  y = 24,
  margin = "-80px",
  className,
}: {
  children: ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  margin?: MarginValue;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
