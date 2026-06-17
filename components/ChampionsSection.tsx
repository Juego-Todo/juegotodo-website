"use client";

import { motion } from "framer-motion";
import { Shield, Swords, Trophy } from "lucide-react";
import Link from "next/link";
import { champions } from "@/data/site";

export function ChampionsSection() {
  return (
    <section className="relative border-y border-white/[0.08] bg-[#050505] py-16 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,16,16,0.12),transparent_40rem)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Trust The Belt</p>
            <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl lg:text-8xl">
              Current Champions
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              Verified titleholders across Juego Todo divisions — records, teams, and
              championship pedigree backed by LATAYANOLOGY.
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#FF1010]/35 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-red-100 transition hover:bg-[#FF1010]/10"
            href="/rankings"
          >
            Full Rankings
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {champions.map((champion, index) => (
            <motion.article
              className="card-3d glass-panel animated-border group relative overflow-hidden rounded-[1.75rem] bg-[#0D0D0D]/80"
              initial={{ opacity: 0, y: 32 }}
              key={champion.division}
              transition={{ delay: index * 0.1, duration: 0.7 }}
              viewport={{ once: true, margin: "-40px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent" />
              <div className="border-b border-white/[0.08] bg-gradient-to-r from-[#990000]/40 via-black to-[#0D0D0D] px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">{champion.division}</p>
                  <Trophy className="text-yellow-300" size={18} aria-hidden />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="relative mx-auto aspect-[4/5] max-w-[220px] overflow-hidden rounded-[1.25rem] border border-[#FF1010]/25 bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.45),transparent_38%),linear-gradient(160deg,#1a1a1d,#050505)]">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.85))]" />
                  <div className="flex h-full flex-col items-center justify-end p-5 text-center">
                    <span className="font-display text-6xl uppercase leading-none text-white/90 transition group-hover:scale-105">
                      {champion.initials}
                    </span>
                    <p className="mt-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#FF1010]">Champion</p>
                  </div>
                  <div className="absolute left-3 top-3 rounded-full border border-yellow-400/40 bg-black/60 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-yellow-200">
                    {champion.ranking}
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-300">{champion.nickname}</p>
                  <h3 className="font-display mt-1 text-4xl uppercase leading-none text-white">{champion.name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{champion.team}</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ["Record", champion.record],
                    ["Team", champion.teamShort],
                    ["KO Wins", champion.koWins],
                    ["Defenses", champion.titleDefenses],
                  ].map(([label, value]) => (
                    <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-3" key={label}>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <Swords size={14} aria-hidden />
                  {champion.style}
                  <Shield size={14} aria-hidden />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
