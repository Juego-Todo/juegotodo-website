"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

type StatItem = {
  label: string;
  value: number;
  suffix?: string;
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 24 });
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest)}${suffix}`;
      }
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function StatsCounter({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          className="stat-card glass-panel group rounded-3xl p-6 sm:p-7"
          initial={{ opacity: 0, y: 24 }}
          key={stat.label}
          transition={{ delay: index * 0.08, duration: 0.6 }}
          viewport={{ once: true, margin: "-40px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="font-stats text-[clamp(2.5rem,6vw,3.75rem)] font-bold leading-none text-white">
            <AnimatedNumber suffix={stat.suffix} value={stat.value} />
          </div>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.24em] text-zinc-500 transition group-hover:text-red-300">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
