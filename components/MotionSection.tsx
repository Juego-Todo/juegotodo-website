"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function MotionSection({ children, className = "", id }: MotionSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      {children}
    </motion.section>
  );
}
