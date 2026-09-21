"use client";

import { motion, useMotionTemplate, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const rotateX = useSpring(0, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 25 });
  const scale = useSpring(1, { stiffness: 300, damping: 25 });
  const glowX = useSpring(50, { stiffness: 300, damping: 30 });
  const glowY = useSpring(50, { stiffness: 300, damping: 30 });
  const glow = useMotionTemplate`radial-gradient(220px circle at ${glowX}% ${glowY}%, rgba(40,144,189,0.14), transparent 70%)`;

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 14);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseEnter={() => scale.set(1.02)}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 900 }}
      className={cn("relative", className)}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: glow }}
      />
    </motion.div>
  );
}
