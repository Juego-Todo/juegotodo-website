"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { champions } from "@/data/site";

export function ChampionsSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#050505] py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.14),transparent_42rem)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.32em] text-[#FF1010]">Championship Legacy</p>
          <h2 className="font-display mt-3 text-4xl uppercase leading-[0.92] text-white sm:text-6xl lg:text-7xl">
            Juego Todo Champions
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            The titleholders who defined Juego Todo — from the inaugural champion to the reigning Hari ng Latayan.
          </p>
          <Link
            className="group mt-6 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white transition hover:text-[#FF1010]"
            href="/latayanology"
          >
            Search Fighter
            <ArrowRight className="transition group-hover:translate-x-1" size={15} aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-2">
          {champions.map((champion, index) => (
            <motion.article
              className="group relative min-h-[22rem] overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0a0a0a] sm:min-h-[28rem] lg:min-h-[34rem]"
              initial={{ opacity: 0, y: 28 }}
              key={champion.title}
              transition={{ delay: index * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-60px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {champion.imageSrc ? (
                <Image
                  alt={champion.imageAlt ?? `${champion.name}, ${champion.title}`}
                  className="object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={champion.imageSrc}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_35%_20%,rgba(255,16,16,0.35),transparent_40%),linear-gradient(160deg,#1a1a1d,#050505)]">
                  <span className="font-display text-7xl uppercase text-white/80">{champion.initials}</span>
                </div>
              )}

              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.15)_0%,rgba(5,5,5,0.2)_35%,rgba(5,5,5,0.92)_78%,#050505_100%)]"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,207,106,0.12),transparent_28%)] opacity-80"
                aria-hidden
              />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <p className="inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-amber-200">
                  <Trophy size={14} aria-hidden />
                  {champion.title}
                </p>
                <span className="hidden h-px flex-1 bg-gradient-to-r from-amber-200/40 to-transparent sm:block" aria-hidden />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-[#FF1010]">Champion</p>
                <h3 className="font-display mt-2 text-2xl uppercase leading-none text-white sm:text-4xl lg:text-5xl">
                  {champion.name}
                </h3>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">
                  Crowned {champion.crownedDate}
                </p>
              </div>

              <div
                className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#FF1010] via-amber-300 to-[#FF1010] opacity-80"
                aria-hidden
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
