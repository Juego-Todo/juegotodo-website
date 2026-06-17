"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { heritageTimeline } from "@/data/site";

export function HeritageSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] bg-[#050505] py-16 sm:py-24" ref={ref}>
      <motion.div className="absolute inset-0 opacity-30" style={{ y }} aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,16,16,0.18),transparent_30rem)]" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Filipino Heritage</p>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl lg:text-8xl">
            The Legacy of Filipino Martial Arts
          </h2>
          <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">
            From ancient warriors to modern championship cages — Juego Todo carries
            centuries of combat intelligence into broadcast-grade competition.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-[#FF1010] via-[#990000] to-transparent sm:left-8" aria-hidden />
          <div className="space-y-6">
            {heritageTimeline.map((era, index) => (
              <motion.div
                className="relative pl-10 sm:pl-16"
                initial={{ opacity: 0, x: -20 }}
                key={era.era}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                viewport={{ once: true, margin: "-40px" }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <span className="absolute left-2.5 top-6 h-3 w-3 rounded-full border-2 border-[#FF1010] bg-[#050505] shadow-[0_0_16px_rgba(255,16,16,0.6)] sm:left-6" />
                <article className="glass-panel card-3d overflow-hidden rounded-[1.5rem] border-white/[0.08] bg-[#0D0D0D]/70">
                  <div className={`h-2 bg-gradient-to-r ${era.accent}`} />
                  <div className="grid gap-4 p-5 sm:grid-cols-[0.35fr_1fr] sm:p-6">
                    <div>
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-zinc-500">{era.period}</p>
                      <h3 className="font-display mt-2 text-4xl uppercase leading-none text-white">{era.era}</h3>
                    </div>
                    <p className="text-sm leading-7 text-zinc-400 sm:text-base">{era.description}</p>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
