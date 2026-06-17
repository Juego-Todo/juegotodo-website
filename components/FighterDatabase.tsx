"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { fighterDatabase } from "@/data/site";

const weightClasses = ["All", "Flyweight", "Lightweight", "Welterweight", "Middleweight", "Heavyweight"];

export function FighterDatabase() {
  const [query, setQuery] = useState("");
  const [weightClass, setWeightClass] = useState("All");
  const [nationality, setNationality] = useState("All");
  const [team, setTeam] = useState("All");
  const [winStreak, setWinStreak] = useState(false);

  const nationalities = useMemo(
    () => ["All", ...new Set(fighterDatabase.map((fighter) => fighter.nationality))],
    [],
  );
  const teams = useMemo(
    () => ["All", ...new Set(fighterDatabase.map((fighter) => fighter.team))],
    [],
  );

  const filtered = fighterDatabase.filter((fighter) => {
    const matchesQuery =
      query.trim().length === 0 ||
      fighter.name.toLowerCase().includes(query.toLowerCase()) ||
      fighter.nickname.toLowerCase().includes(query.toLowerCase());
    const matchesWeight = weightClass === "All" || fighter.division === weightClass;
    const matchesNationality = nationality === "All" || fighter.nationality === nationality;
    const matchesTeam = team === "All" || fighter.team === team;
    const matchesStreak = !winStreak || fighter.winStreak >= 3;
    return matchesQuery && matchesWeight && matchesNationality && matchesTeam && matchesStreak;
  });

  return (
    <section className="py-16 sm:py-20" id="fighters">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Rankings · Fighter Database</p>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">
            Interactive Athlete Rankings
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Search, filter, and analyze the official Juego Todo roster — part of the Rankings hub for fans,
            matchmakers, and broadcast teams.
          </p>
          <Link
            className="mt-6 inline-flex items-center text-xs font-black uppercase tracking-[0.18em] text-[#FF1010] transition hover:text-white"
            href="/fighters"
          >
            Open Full Fighter Database
            <ArrowRight className="ml-2" size={16} aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden />
            <input
              className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0D0D] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#FF1010]/40"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fighter..."
              type="search"
              value={query}
            />
          </label>
          <FilterSelect label="Weight" onChange={setWeightClass} options={weightClasses} value={weightClass} />
          <FilterSelect label="Nation" onChange={setNationality} options={nationalities} value={nationality} />
          <FilterSelect label="Team" onChange={setTeam} options={teams} value={team} />
          <button
            className={`rounded-2xl border px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] transition ${
              winStreak
                ? "border-[#FF1010]/40 bg-[#FF1010]/10 text-red-100"
                : "border-white/[0.08] bg-[#0D0D0D] text-zinc-400 hover:text-white"
            }`}
            onClick={() => setWinStreak((value) => !value)}
            type="button"
          >
            Win Streak 3+
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((fighter, index) => (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              key={fighter.slug}
              transition={{ delay: index * 0.04 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Link
                className="card-3d glass-panel group block overflow-hidden rounded-[1.5rem] border-white/[0.08] bg-[#0D0D0D]/75 transition hover:border-[#FF1010]/30"
                href={`/fighters/${fighter.slug}`}
              >
                <div className="grid grid-cols-[auto_1fr] gap-4 p-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#FF1010]/25 bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.4),transparent_38%),linear-gradient(145deg,#27272a,#050505)] font-display text-3xl text-white">
                    {fighter.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">{fighter.rank}</p>
                        <h3 className="truncate text-lg font-bold text-white">{fighter.name}</h3>
                      </div>
                      <span className="font-stats text-xl font-bold text-white">{fighter.record}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{fighter.style}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-white/[0.08] bg-black/30 text-center">
                  {[
                    ["Team", fighter.teamShort],
                    ["Division", fighter.division],
                    ["Last Fight", fighter.lastFight],
                  ].map(([label, value]) => (
                    <div className="px-3 py-3" key={label}>
                      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600">{label}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-zinc-300">{value}</p>
                    </div>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-600">{label}</span>
      <select
        className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D] px-3 py-3 text-sm text-white outline-none focus:border-[#FF1010]/40"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
