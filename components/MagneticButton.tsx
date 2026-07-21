"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  variant?: "primary" | "secondary";
};

export function MagneticButton({
  children,
  className = "",
  href,
  variant = "primary",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const baseClass =
    variant === "primary"
      ? "bg-[#FF1010] text-white shadow-[0_0_40px_rgba(255,16,16,0.45)] hover:bg-[#ff2828]"
      : "border border-white/20 bg-black/55 text-white backdrop-blur-md hover:bg-white/15";

  function handleMove(event: React.MouseEvent<HTMLAnchorElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.18);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div className={className.includes("w-full") ? "w-full" : undefined} style={{ x: springX, y: springY }}>
      <Link
        className={`group inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition sm:text-sm ${baseClass} ${className}`}
        href={href}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        ref={ref}
      >
        {children}
      </Link>
    </motion.div>
  );
}
