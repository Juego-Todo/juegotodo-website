"use client";

import { motion } from "framer-motion";
import { ArrowUpDown, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import { teams } from "@/data/teams";
import { getAllEnrichedFighters, type EnrichedFighterProfile } from "@/lib/fighters/profile";

const weightClasses = [
  "All",
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Heavyweight",
  "Strawweight",
];

const regions = ["All", "Metro Manila", "Central Visayas", "CALABARZON", "Philippines"];

type SortKey = "ranking" | "win-streak" | "activity";

function parseRank(rank: string) {
  if (rank.toLowerCase().includes("champion")) {
    return 0;
  }
  const match = rank.match(/#(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 99;
}

function activityScore(fighter: EnrichedFighterProfile) {
  const lastFight = fighter.lastFight ?? "";
  if (lastFight.toLowerCase().includes("win")) {
    return 2;
  }
  if (lastFight.toLowerCase().includes("loss")) {
    return 0;
  }
  return 1;
}

export function FighterDatabaseHub() {
  const allFighters = useMemo(() => getAllEnrichedFighters(), []);
  const [query, setQuery] = useState("");
  const [weightClass, setWeightClass] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [minWins, setMinWins] = useState("All");
  const [rankedOnly, setRankedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("ranking");

  const teamOptions = useMemo(
    () => ["All", ...new Set(allFighters.map((fighter) => fighter.team ?? fighter.gym).filter(Boolean))],
    [allFighters],
  );

  const filtered = useMemo(() => {
    const results = allFighters.filter((fighter) => {
      const teamName = fighter.team ?? fighter.gym;
      const matchesQuery =
        query.trim().length === 0 ||
        fighter.name.toLowerCase().includes(query.toLowerCase()) ||
        fighter.nickname.toLowerCase().includes(query.toLowerCase()) ||
        teamName.toLowerCase().includes(query.toLowerCase());
      const matchesWeight = weightClass === "All" || fighter.division === weightClass;
      const matchesTeam = teamFilter === "All" || teamName === teamFilter;
      const matchesRegion =
        regionFilter === "All" ||
        fighter.region === regionFilter ||
        fighter.country === regionFilter;
      const matchesWins =
        minWins === "All" || fighter.wins >= Number.parseInt(minWins, 10);
      const matchesRank =
        !rankedOnly || parseRank(fighter.rank) <= 15 || fighter.rank.toLowerCase().includes("champion");

      return matchesQuery && matchesWeight && matchesTeam && matchesRegion && matchesWins && matchesRank;
    });

    return [...results].sort((a, b) => {
      if (sortBy === "win-streak") {
        return (b.winStreak ?? 0) - (a.winStreak ?? 0);
      }
      if (sortBy === "activity") {
        return activityScore(b) - activityScore(a);
      }
      return parseRank(a.rank) - parseRank(b.rank);
    });
  }, [allFighters, query, weightClass, teamFilter, regionFilter, minWins, rankedOnly, sortBy]);

  return (
    <MotionSection className="mx-auto max-w-7xl pb-14 sm:pb-20">
      <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden />
            <input
              className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0D0D] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#FF1010]/40"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fighters..."
              type="search"
              value={query}
            />
          </label>
          <FilterSelect label="Weight Class" onChange={setWeightClass} options={weightClasses} value={weightClass} />
          <FilterSelect label="Team" onChange={setTeamFilter} options={teamOptions} value={teamFilter} />
          <FilterSelect label="Region" onChange={setRegionFilter} options={regions} value={regionFilter} />
          <FilterSelect
            label="Min Wins"
            onChange={setMinWins}
            options={["All", "3", "5", "8", "10"]}
            value={minWins}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            className={`rounded-full border px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] transition ${
              rankedOnly
                ? "border-[#FF1010]/40 bg-[#FF1010]/10 text-red-100"
                : "border-white/[0.08] bg-[#0D0D0D] text-zinc-400 hover:text-white"
            }`}
            onClick={() => setRankedOnly((value) => !value)}
            type="button"
          >
            Ranked Only
          </button>
          <div className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-zinc-500">
            <ArrowUpDown size={14} aria-hidden />
            Sort
          </div>
          {(
            [
              ["ranking", "Ranking"],
              ["win-streak", "Win Streak"],
              ["activity", "Activity"],
            ] as const
          ).map(([key, label]) => (
            <button
              className={`rounded-full border px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] transition ${
                sortBy === key
                  ? "border-[#FF1010]/40 bg-[#FF1010]/10 text-red-100"
                  : "border-white/[0.08] text-zinc-400 hover:text-white"
              }`}
              key={key}
              onClick={() => setSortBy(key)}
              type="button"
            >
              {label}
            </button>
          ))}
          <p className="ml-auto text-sm text-zinc-500">{filtered.length} fighters</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((fighter, index) => (
          <FighterCard fighter={fighter} index={index} key={fighter.slug} teams={teams} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">No fighters match your filters.</p>
      ) : null}
    </MotionSection>
  );
}

function FighterCard({
  fighter,
  index,
  teams: teamList,
}: {
  fighter: EnrichedFighterProfile;
  index: number;
  teams: typeof teams;
}) {
  const teamName = fighter.team ?? fighter.gym;
  const team = teamList.find((entry) => entry.slug === fighter.teamSlug || entry.name === teamName);
  const initials =
    fighter.initials ??
    fighter.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
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
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                  {fighter.rank} {fighter.division}
                </p>
                <h3 className="truncate text-lg font-bold text-white">{fighter.name}</h3>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-200">{fighter.nickname}</p>
              </div>
              <span className="font-stats text-xl font-bold text-white">{fighter.record}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{fighter.style}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-white/[0.08] bg-black/30 text-center">
          {[
            ["Team", team?.shortName ?? teamName.slice(0, 3).toUpperCase()],
            ["Country", fighter.country ?? "PH"],
            ["Streak", fighter.winStreak ? `${fighter.winStreak}W` : "—"],
          ].map(([label, value]) => (
            <div className="px-3 py-3" key={label}>
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600">{label}</p>
              <p className="mt-1 truncate text-xs font-semibold text-zinc-300">{value}</p>
            </div>
          ))}
        </div>
      </Link>
    </motion.div>
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
