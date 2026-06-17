"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  divisionRankings,
  type DivisionRanking,
  type RankedFighter,
} from "@/data/rankings";

const featuredDivisions = divisionRankings.filter((division) =>
  ["flyweight", "bantamweight", "featherweight", "lightweight", "welterweight", "middleweight"].includes(
    division.slug,
  ),
);

const tabDivisions =
  featuredDivisions.length > 0
    ? featuredDivisions
    : divisionRankings.slice(0, 6);

export function RankingsPreview() {
  const [activeSlug, setActiveSlug] = useState(tabDivisions[0]?.slug ?? "welterweight");
  const activeDivision = tabDivisions.find((division) => division.slug === activeSlug) ?? tabDivisions[0];

  return (
    <div id="rankings">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Official Rankings</p>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl lg:text-8xl">
            Division Hierarchy
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Champion, #1 contender, #2 contender, and #3 contender — updated for
            broadcast and fan engagement.
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#FF1010]/35 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-red-100 transition hover:bg-[#FF1010]/10"
          href="/rankings"
        >
          Full Rankings
          <ArrowRight className="ml-2" size={16} aria-hidden />
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabDivisions.map((division) => (
          <button
            className={`rounded-full px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.16em] transition sm:text-xs ${
              activeSlug === division.slug
                ? "bg-[#FF1010] text-white shadow-[0_0_24px_rgba(255,16,16,0.35)]"
                : "border border-white/[0.08] bg-[#0D0D0D] text-zinc-400 hover:text-white"
            }`}
            key={division.slug}
            onClick={() => setActiveSlug(division.slug)}
            type="button"
          >
            {division.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeDivision ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            initial={{ opacity: 0, y: 16 }}
            key={activeDivision.slug}
            transition={{ duration: 0.35 }}
          >
            <UfcRankingBoard division={activeDivision} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function UfcRankingBoard({ division }: { division: DivisionRanking }) {
  const podium = [division.champion, ...division.contenders.slice(0, 3)];

  return (
    <div className="mt-8 glass-panel animated-border overflow-hidden rounded-[1.75rem] border-white/[0.08] bg-[#0D0D0D]/80">
      <div className="border-b border-white/[0.08] bg-gradient-to-r from-[#990000]/50 via-black to-[#0D0D0D] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-yellow-300">{division.name}</p>
            <p className="text-xs text-zinc-500">{division.className}</p>
          </div>
          <Trophy className="text-yellow-300" aria-hidden />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-white/[0.08] p-5 lg:border-b-0 lg:border-r">
          <ChampionSpotlight fighter={division.champion} />
        </div>
        <div className="divide-y divide-white/[0.08]">
          {podium.slice(1).map((fighter, index) => (
            <ContenderRow fighter={fighter} key={fighter.name} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChampionSpotlight({ fighter }: { fighter: RankedFighter }) {
  const initials = fighter.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="text-center lg:text-left">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[1.25rem] border border-yellow-400/30 bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.45),transparent_38%),linear-gradient(145deg,#27272a,#050505)] font-display text-5xl text-white lg:mx-0">
        {initials}
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-yellow-300">Champion</p>
      <h3 className="font-display mt-1 text-5xl uppercase leading-none text-white">{fighter.name}</h3>
      <p className="mt-2 text-sm text-zinc-400">{fighter.nickname} • {fighter.record}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">{fighter.gym}</p>
    </div>
  );
}

function ContenderRow({ fighter, rank }: { fighter: RankedFighter; rank: number }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4">
      <span className="font-stats text-2xl font-bold text-zinc-500">#{rank}</span>
      <div>
        <p className="font-bold text-white">{fighter.name}</p>
        <p className="text-xs text-zinc-500">{fighter.record} • {fighter.style}</p>
      </div>
      <span className="text-sm font-bold text-[#FF1010]">{fighter.flag}</span>
    </div>
  );
}

// Keep full rankings export for rankings page
export { RankingsFull } from "./RankingsSystemFull";
