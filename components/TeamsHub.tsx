"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, Shield, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { SaveEntityButton } from "@/components/commerce/SaveEntityButton";
import {
  coaches,
  getRankedTeams,
  searchTeams,
  teamCategoryLabels,
  type TeamCategory,
} from "@/data/teams";

const filters: { label: string; value: TeamCategory | "all" }[] = [
  { label: "All Teams", value: "all" },
  { label: "Official Teams", value: "official" },
  { label: "Affiliated Gyms", value: "affiliated-gym" },
  { label: "Regional Teams", value: "regional" },
];

export function TeamsHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TeamCategory | "all">("all");
  const rankedTeams = getRankedTeams();
  const filteredTeams = searchTeams(query, category);

  return (
    <>
      <MotionSection className="mx-auto max-w-7xl pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Official Teams", value: rankedTeams.filter((t) => t.category === "official").length, icon: Shield },
            { label: "Affiliated Gyms", value: rankedTeams.filter((t) => t.category === "affiliated-gym").length, icon: Users },
            { label: "Regional Teams", value: rankedTeams.filter((t) => t.category === "regional").length, icon: Trophy },
            { label: "Active Coaches", value: coaches.length, icon: Users },
          ].map((stat) => (
            <div className="glass-panel rounded-[1.5rem] p-5" key={stat.label}>
              <stat.icon className="text-red-300" size={20} aria-hidden />
              <p className="font-display mt-4 text-4xl text-white">{stat.value}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Team Rankings</h2>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">JTGC Official Standings</p>
        </div>
        <div className="glass-panel overflow-hidden rounded-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Rank</th>
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4">Region</th>
                  <th className="px-5 py-4">Record</th>
                  <th className="px-5 py-4">Titles</th>
                </tr>
              </thead>
              <tbody>
                {rankedTeams.slice(0, 6).map((team) => (
                  <tr className="border-b border-white/[0.06] transition hover:bg-white/[0.03]" key={team.slug}>
                    <td className="px-5 py-4 font-stats text-zinc-400">#{team.ranking ?? "—"}</td>
                    <td className="px-5 py-4">
                      <Link className="font-semibold text-white hover:text-red-200" href={`/teams/${team.slug}`}>
                        {team.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{team.region}</td>
                    <td className="px-5 py-4 text-zinc-300">{team.record}</td>
                    <td className="px-5 py-4 text-zinc-300">{team.championships}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-8">
        <div className="glass-panel mb-6 rounded-[1.5rem] p-4 sm:p-5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden />
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-4"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, regions, coaches..."
              value={query}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                  category === filter.value
                    ? "bg-red-600 text-white"
                    : "border border-white/10 text-zinc-300 hover:border-red-500/40"
                }`}
                key={filter.value}
                onClick={() => setCategory(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map((team, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              key={team.slug}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                className="glass-panel group block overflow-hidden rounded-[1.75rem] transition hover:-translate-y-2 hover:border-red-500/40"
                href={`/teams/${team.slug}`}
              >
                <div className={`bg-gradient-to-br ${team.tone} p-5 sm:p-6`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/35 text-lg font-black text-white">
                      {team.logoInitials}
                    </div>
                    <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-200">
                      {teamCategoryLabels[team.category]}
                    </span>
                  </div>
                  <h3 className="font-display mt-8 text-3xl uppercase leading-none text-white">{team.name}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{team.region}</p>
                </div>
                <div className="space-y-3 p-5">
                  <p className="text-sm leading-6 text-zinc-400">{team.summary}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-display text-2xl text-white">{team.record}</p>
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">Record</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl text-white">{team.fighterCount}</p>
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">Fighters</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl text-white">{team.championships}</p>
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">Titles</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center text-xs font-black uppercase tracking-[0.16em] text-red-200">
                    View Team Profile
                    <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={14} aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
        <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Coaches Directory</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.slice(0, 6).map((coach) => (
            <div className="glass-panel rounded-[1.35rem] p-5" key={coach.slug}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">{coach.specialty}</p>
              <h3 className="mt-2 font-display text-2xl uppercase text-white">{coach.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{coach.teamName}</p>
              <p className="mt-1 text-xs text-zinc-500">{coach.region} • {coach.record}</p>
              <Link
                className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-200"
                href={`/teams/${coach.teamSlug}`}
              >
                View Team
              </Link>
            </div>
          ))}
        </div>
      </MotionSection>
    </>
  );
}

export function TeamSaveButton({ teamSlug }: { teamSlug: string }) {
  return <SaveEntityButton slug={teamSlug} type="team" />;
}
