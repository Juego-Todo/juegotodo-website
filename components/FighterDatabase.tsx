"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, TrendingUp, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  filterAthletes,
  getAthleteMeta,
  getFeaturedP4pAthlete,
  getTrendingAthletes,
  hallOfFameMembers,
  latayanologyRankingTabs,
  latayanologySortOptions,
  parseWinRate,
  sortAthletes,
  statusBadgeStyles,
  type LatayanologyRankingTab,
  type LatayanologySortId,
} from "@/data/latayanology";
import { teams } from "@/data/teams";
import { getAllEnrichedFighters, type EnrichedFighterProfile } from "@/lib/fighters/profile";

const filterWeightClasses = [
  "All",
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Heavyweight",
];

function AthletePortrait({ fighter, large = false }: { fighter: EnrichedFighterProfile; large?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[linear-gradient(160deg,#2a2a2e_0%,#0a0a0a_55%)] ${
        large ? "h-full min-h-[16rem] w-full sm:min-h-[18rem]" : "h-24 w-20 shrink-0 sm:h-28 sm:w-24"
      }`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 20%, rgba(255,255,255,0.14), transparent 60%), radial-gradient(ellipse 50% 80% at 50% 100%, rgba(255,16,16,0.2), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-[28%] bottom-0 top-[18%] rounded-t-[40%] bg-gradient-to-b from-zinc-500/50 to-zinc-800/30"
        aria-hidden
      />
      <div
        className="absolute inset-x-[34%] top-[10%] h-[22%] rounded-full bg-gradient-to-b from-zinc-400/55 to-zinc-600/35"
        aria-hidden
      />
      <span
        className={`absolute bottom-3 right-3 font-display uppercase text-white/20 ${
          large ? "text-6xl sm:text-7xl" : "text-2xl"
        }`}
      >
        {fighter.initials}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = statusBadgeStyles[status as keyof typeof statusBadgeStyles] ?? statusBadgeStyles.Veteran;
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] ${style}`}>
      {status}
    </span>
  );
}

function FeaturedAthleteHero({ fighter }: { fighter: EnrichedFighterProfile }) {
  const meta = getAthleteMeta(fighter.slug);
  const winRate = parseWinRate(fighter.record);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D0D0D]/90">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-white/[0.08] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#FF1010]">#1 Pound-for-Pound</p>
          <h3 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">{fighter.name}</h3>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">{fighter.nickname}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="font-stats text-3xl font-bold text-white">{fighter.record}</span>
            <StatusBadge status={meta.status} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {fighter.winStreak ?? 0} Fight Win Streak
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Division", fighter.division],
              ["Team", fighter.teamShort ?? fighter.team],
              ["Win %", `${winRate}%`],
              ["KO %", `${meta.koPercent}%`],
            ].map(([label, value]) => (
              <div className="rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2.5" key={label}>
                <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600">{label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {fighter.recentResults?.length ? (
            <div className="mt-5">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Recent Victories</p>
              <ul className="mt-2 space-y-1.5">
                {fighter.recentResults.slice(0, 2).map((result) => (
                  <li className="text-sm text-zinc-300" key={`${result.event}-${result.date}`}>
                    {result.result} vs {result.opponent} — {result.method}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
            href={`/fighters/${fighter.slug}`}
          >
            View Full Profile
            <ArrowRight className="ml-2" size={14} aria-hidden />
          </Link>
        </div>

        <div className="relative min-h-[14rem] p-4 sm:p-5 lg:min-h-0">
          <AthletePortrait fighter={fighter} large />
          <div className="absolute left-7 top-7 rounded-full border border-yellow-400/40 bg-black/70 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-yellow-200">
            Featured Champion
          </div>
        </div>
      </div>
    </div>
  );
}

function AthleteCard({ fighter }: { fighter: EnrichedFighterProfile }) {
  const meta = getAthleteMeta(fighter.slug);
  const wins = fighter.wins ?? 0;
  const losses = fighter.losses ?? 0;
  const winRate = parseWinRate(fighter.record);
  const rankLabel = fighter.rank.toLowerCase().includes("champion") ? "C" : fighter.rank.replace("#", "");

  return (
    <Link
      className="group block overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D0D0D]/80 transition hover:border-white/[0.14]"
      href={`/fighters/${fighter.slug}`}
    >
      <div className="flex gap-3 p-3.5 sm:p-4">
        <div className="relative">
          <AthletePortrait fighter={fighter} />
          <span className="absolute -left-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black text-[0.65rem] font-black text-white">
            {rankLabel}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white transition group-hover:text-red-100">{fighter.name}</h3>
              <p className="text-xs text-zinc-500">{fighter.division}</p>
            </div>
            <span className="font-stats shrink-0 text-lg font-bold text-white">{fighter.record}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge status={meta.status} />
          </div>
          <p className="mt-2 truncate text-xs text-zinc-400">{fighter.team}</p>
          <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {(fighter.winStreak ?? 0) > 0 ? `${fighter.winStreak} Fight Win Streak` : fighter.lastFight}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 border-t border-white/[0.06] bg-black/30 text-center">
        {[
          ["W", String(wins)],
          ["L", String(losses)],
          ["Win%", `${winRate}%`],
          ["KO%", `${meta.koPercent}%`],
          ["Streak", String(fighter.winStreak ?? 0)],
        ].map(([label, value]) => (
          <div className="px-1 py-2.5" key={label}>
            <p className="text-[0.5rem] font-black uppercase tracking-[0.1em] text-zinc-600">{label}</p>
            <p className="mt-0.5 text-[0.7rem] font-semibold text-zinc-300">{value}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] px-4 py-2.5 text-center text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500 transition group-hover:text-white">
        View Profile
      </div>
    </Link>
  );
}

function ComparePanel({
  athletes,
  leftSlug,
  rightSlug,
}: {
  athletes: EnrichedFighterProfile[];
  leftSlug: string;
  rightSlug: string;
}) {
  const left = athletes.find((fighter) => fighter.slug === leftSlug);
  const right = athletes.find((fighter) => fighter.slug === rightSlug);

  if (!left || !right) {
    return null;
  }

  const rows = [
    ["Record", left.record, right.record],
    ["Division", left.division, right.division],
    ["Team", left.team, right.team],
    ["Win %", `${parseWinRate(left.record)}%`, `${parseWinRate(right.record)}%`],
    ["Win Streak", String(left.winStreak ?? 0), String(right.winStreak ?? 0)],
    ["Status", getAthleteMeta(left.slug).status, getAthleteMeta(right.slug).status],
  ] as const;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#FF1010]/20 bg-[#0D0D0D]/90">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
        <p className="text-sm font-bold text-white">{left.name}</p>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#FF1010]">vs</span>
        <p className="text-right text-sm font-bold text-white">{right.name}</p>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {rows.map(([label, leftValue, rightValue]) => (
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-4 py-2.5 text-sm sm:px-5" key={label}>
            <span className="text-zinc-300">{leftValue}</span>
            <span className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600">{label}</span>
            <span className="text-right text-zinc-300">{rightValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FighterDatabase() {
  const athletes = useMemo(() => getAllEnrichedFighters(), []);
  const [activeTab, setActiveTab] = useState<LatayanologyRankingTab>("Pound for Pound");
  const [query, setQuery] = useState("");
  const [weightClass, setWeightClass] = useState("All");
  const [nationality, setNationality] = useState("All");
  const [team, setTeam] = useState("All");
  const [championOnly, setChampionOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [winStreakOnly, setWinStreakOnly] = useState(false);
  const [sortBy, setSortBy] = useState<LatayanologySortId>("ranking");
  const [compareLeft, setCompareLeft] = useState("");
  const [compareRight, setCompareRight] = useState("");

  const nationalities = useMemo(
    () => ["All", ...new Set(athletes.map((fighter) => fighter.country).filter((value): value is string => Boolean(value)))],
    [athletes],
  );
  const teamOptions = useMemo(
    () => ["All", ...new Set(athletes.map((fighter) => fighter.team).filter((value): value is string => Boolean(value)))],
    [athletes],
  );
  const featuredAthlete = useMemo(() => getFeaturedP4pAthlete(athletes), [athletes]);
  const trendingAthletes = useMemo(() => getTrendingAthletes(athletes), [athletes]);
  const topTeam = useMemo(() => teams.find((entry) => entry.ranking === 1) ?? teams[0], []);

  const filtered = useMemo(() => {
    const results = filterAthletes(athletes, {
      query,
      weightClass,
      team,
      nationality,
      championOnly,
      activeOnly,
      winStreakOnly,
      tab: activeTab,
    });
    return sortAthletes(results, sortBy, activeTab);
  }, [athletes, query, weightClass, team, nationality, championOnly, activeOnly, winStreakOnly, activeTab, sortBy]);

  const topRanked = filtered.slice(0, activeTab === "Pound for Pound" ? 5 : 4);

  return (
    <section className="py-16 sm:py-20" id="fighters">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Athlete Intelligence Platform</p>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none text-white sm:text-7xl">LATAYANOLOGY</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            The official athlete intelligence platform of Juego Todo — verified rankings, records, teams,
            and performance analytics for the global JTGC roster.
          </p>
        </div>

        {featuredAthlete ? (
          <div className="mt-10">
            <FeaturedAthleteHero fighter={featuredAthlete} />
          </div>
        ) : null}

        <div className="mt-10">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-zinc-500">Top Rankings</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {latayanologyRankingTabs.map((tab) => (
              <button
                className={`shrink-0 rounded-full px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] transition sm:text-xs ${
                  activeTab === tab
                    ? "bg-[#FF1010] text-white"
                    : "border border-white/[0.08] bg-[#0D0D0D] text-zinc-400 hover:text-white"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#0D0D0D]/80 p-4 sm:p-5">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Search & Filters</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-12">
            <label className="relative lg:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} aria-hidden />
              <input
                className="w-full rounded-lg border border-white/[0.08] bg-black/45 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-[#FF1010]/40"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Athletes"
                type="search"
                value={query}
              />
            </label>
            <FilterSelect className="lg:col-span-2" label="Weight Class" onChange={setWeightClass} options={filterWeightClasses} value={weightClass} />
            <FilterSelect className="lg:col-span-2" label="Team" onChange={setTeam} options={teamOptions} value={team} />
            <FilterSelect className="lg:col-span-2" label="Nation" onChange={setNationality} options={nationalities} value={nationality} />
            <FilterSelect
              className="lg:col-span-2"
              label="Sort By"
              onChange={(value) => setSortBy(value as LatayanologySortId)}
              options={latayanologySortOptions.map((option) => option.id)}
              optionLabels={Object.fromEntries(latayanologySortOptions.map((option) => [option.id, option.label]))}
              value={sortBy}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip active={championOnly} label="Champion Only" onClick={() => setChampionOnly((value) => !value)} />
            <ToggleChip active={activeOnly} label="Active Only" onClick={() => setActiveOnly((value) => !value)} />
            <ToggleChip active={winStreakOnly} label="Win Streak" onClick={() => setWinStreakOnly((value) => !value)} />
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Compare Athletes</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <CompareSelect athletes={athletes} onChange={setCompareLeft} placeholder="Select athlete" value={compareLeft} />
              <CompareSelect athletes={athletes} onChange={setCompareRight} placeholder="Select opponent" value={compareRight} />
            </div>
            {compareLeft && compareRight && compareLeft !== compareRight ? (
              <ComparePanel athletes={athletes} leftSlug={compareLeft} rightSlug={compareRight} />
            ) : null}
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_18rem]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-display text-3xl uppercase text-white sm:text-4xl">Athlete Database</h3>
            </div>

            {topRanked.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {topRanked.map((fighter, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    key={fighter.slug}
                    transition={{ delay: index * 0.04 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <AthleteCard fighter={fighter} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-zinc-500">No athletes match the current filters.</p>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/80 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-[#FF1010]" size={16} aria-hidden />
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-400">Trending Now</p>
              </div>
              <ul className="mt-4 space-y-3">
                {trendingAthletes.map((fighter, index) => (
                  <li key={fighter.slug}>
                    <Link className="group flex items-center justify-between gap-3" href={`/fighters/${fighter.slug}`}>
                      <div>
                        <p className="text-[0.58rem] font-black text-zinc-600">#{index + 1}</p>
                        <p className="text-sm font-semibold text-white transition group-hover:text-red-100">{fighter.name}</p>
                      </div>
                      <span className="text-xs text-zinc-500">{getAthleteMeta(fighter.slug).views.toLocaleString()} views</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {topTeam ? (
              <Link
                className="block rounded-xl border border-white/[0.08] bg-[#0D0D0D]/80 p-4 transition hover:border-white/[0.14]"
                href={`/teams/${topTeam.slug}`}
              >
                <div className="flex items-center gap-2">
                  <Users className="text-[#FF1010]" size={16} aria-hidden />
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-400">Top Ranked Team</p>
                </div>
                <p className="mt-3 font-display text-2xl uppercase text-white">{topTeam.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{topTeam.fighterCount} Fighters</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#FF1010]">#{topTeam.ranking} Ranked Team</p>
              </Link>
            ) : null}

            <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/80 p-4" id="hall-of-fame">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-300" size={16} aria-hidden />
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-400">Hall of Fame</p>
              </div>
              <ul className="mt-4 space-y-3">
                {hallOfFameMembers.map((member) => (
                  <li key={member.name}>
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{member.contribution}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
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
  className = "",
  optionLabels,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  optionLabels?: Record<string, string>;
}) {
  return (
    <label className={`grid gap-1 ${className}`}>
      <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600">{label}</span>
      <select
        className="rounded-lg border border-white/[0.08] bg-black/45 px-3 py-3 text-sm text-white outline-none focus:border-[#FF1010]/40"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`rounded-full border px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] transition ${
        active ? "border-[#FF1010]/40 bg-[#FF1010]/10 text-red-100" : "border-white/[0.08] text-zinc-500 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function CompareSelect({
  athletes,
  value,
  onChange,
  placeholder,
}: {
  athletes: EnrichedFighterProfile[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <select
      className="rounded-lg border border-white/[0.08] bg-black/45 px-3 py-3 text-sm text-white outline-none focus:border-[#FF1010]/40"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      <option value="">{placeholder}</option>
      {athletes.map((fighter) => (
        <option key={fighter.slug} value={fighter.slug}>
          {fighter.name}
        </option>
      ))}
    </select>
  );
}
