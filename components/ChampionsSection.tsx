"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import Image from "next/image";
import { MagneticButton } from "@/components/MagneticButton";
import { champions } from "@/data/site";

export function ChampionsSection() {
  return (
    <section className="relative border-t border-white/[0.08] bg-[#050505] py-16 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.12),transparent_40rem)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Championship Legacy</p>
            <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl lg:text-8xl">
              Juego Todo Champions
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              The titleholders who defined Juego Todo — from the inaugural champion to the reigning Hari ng Latayan.
            </p>
          </div>
          <MagneticButton className="w-full sm:w-auto" href="/latayanology">
            Search Fighter
            <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} aria-hidden />
          </MagneticButton>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {champions.map((champion, index) => (
            <motion.article
              className="card-3d glass-panel animated-border group relative overflow-hidden rounded-[1.75rem] bg-[#0D0D0D]/80"
              initial={{ opacity: 0, y: 32 }}
              key={champion.title}
              transition={{ delay: index * 0.1, duration: 0.7 }}
              viewport={{ once: true, margin: "-40px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent" />
              <div className="border-b border-white/[0.08] bg-gradient-to-r from-[#990000]/40 via-black to-[#0D0D0D] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">{champion.title}</p>
                  <Trophy className="shrink-0 text-yellow-300" size={18} aria-hidden />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="relative mx-auto aspect-[4/5] max-w-[220px] overflow-hidden rounded-[1.25rem] border border-[#FF1010]/25 bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.45),transparent_38%),linear-gradient(160deg,#1a1a1d,#050505)]">
                  {champion.imageSrc ? (
                    <>
                      <Image
                        alt={champion.imageAlt ?? `${champion.name}, ${champion.title}`}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                        fill
                        sizes="(max-width: 640px) 45vw, 220px"
                        src={champion.imageSrc}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(0,0,0,0.88))]" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                        <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#FF1010]">Champion</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.85))]" />
                      <div className="flex h-full flex-col items-center justify-end p-5 text-center">
                        <span className="font-display text-6xl uppercase leading-none text-white/90 transition group-hover:scale-105">
                          {champion.initials}
                        </span>
                        <p className="mt-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#FF1010]">Champion</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 text-center">
                  <h3 className="font-display text-4xl uppercase leading-none text-white">{champion.name}</h3>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    {champion.crownedDate}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
