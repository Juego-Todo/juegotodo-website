import { BadgeCheck, Globe2, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import {
  divisionRankings,
  poundForPound,
  rankingMethodology,
  regionalRankingGroups,
  type DivisionRanking,
  type RankedFighter,
} from "@/data/rankings";

export function RankingsFull() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="glass-panel overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
        <div className="grid gap-5 border-b border-white/10 bg-gradient-to-r from-red-950/80 via-black to-zinc-950 p-5 sm:p-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-red-200">
              Juego Todo Rankings
            </p>
            <h2 className="font-display mt-3 text-4xl uppercase leading-none text-white sm:text-6xl">
              Current System
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rankingMethodology.map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-300"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
            Rankings shown here are placeholder data for design and structure.
            Future versions can connect these divisions to a CMS, official bout
            results, eligibility status, regional databases, and automated
            movement history.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" id="pound-for-pound">
        <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
                Pound For Pound
              </p>
              <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">
                Elite Board
              </h2>
            </div>
            <Trophy className="text-red-300" aria-hidden />
          </div>
          <div className="mt-6 divide-y divide-white/10">
            {poundForPound.map((fighter, index) => (
              <RankingRow fighter={{ ...fighter, rank: index + 1 }} key={`${fighter.name}-${index}`} />
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
            Champion Index
          </p>
          <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">
            Belt Holders
          </h2>
          <div className="mt-6 grid gap-3">
            {divisionRankings.map((division) => (
              <div
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:gap-4 sm:p-4"
                key={division.slug}
              >
                <BadgeCheck className="text-yellow-300" aria-hidden />
                <div>
                  <p className="font-bold text-white">{division.champion.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {division.name}
                  </p>
                </div>
                <span className="font-display text-xl text-red-200 sm:text-2xl">
                  {division.champion.record}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
              Division Tables
            </p>
            <h2 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-6xl">
              Fighter Rankings
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-zinc-400">
            Each division displays the champion, contender list, movement,
            record, nationality, gym, and core fighting style.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {divisionRankings.map((division) => (
            <DivisionRankingCard division={division} key={division.slug} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
            Regional Rankings
          </p>
          <h2 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-6xl">
            Fight Hotbeds
          </h2>
        </div>
        <div className="space-y-5">
          {regionalRankingGroups.map((group) => (
            <div className="glass-panel rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-5" key={group.title}>
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <h3 className="text-base font-black uppercase tracking-[0.16em] text-white sm:text-xl sm:tracking-[0.18em]">
                  {group.title}
                </h3>
                <Globe2 className="text-red-300" aria-hidden />
              </div>
              <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-5">
                {group.regions.map((region) => (
                  <div
                    className="min-w-[15rem] snap-center overflow-hidden rounded-2xl border border-white/10 bg-black/35 sm:min-w-0"
                    key={region.name}
                  >
                    <CountryMapTile
                      className="h-32 rounded-none border-0"
                      count={`${region.depth} fighters`}
                      label={region.name}
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-white">{region.name}</h4>
                      <p className="mt-2 text-sm text-zinc-400">Leader: {region.leader}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-red-300">
                        {region.hotbed}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6" id="hall-of-fame">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Hall of Fame</p>
        <h2 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">
          JTGC Legacy
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          Championship pioneers, title defense records, and career achievements will be enshrined here as the league
          archive grows.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["First Champions", "Title Defense Records", "Career Achievement"].map((label) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={label}>
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Coming soon</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DivisionRankingCard({
  division,
  compact = false,
}: {
  division: DivisionRanking;
  compact?: boolean;
}) {
  const contenders = compact ? division.contenders.slice(0, 4) : division.contenders;

  return (
    <article className="glass-panel overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]" id={division.slug}>
      <div className="border-b border-white/10 bg-gradient-to-r from-red-950/85 via-black to-zinc-950 px-5 py-3">
        <h3 className="text-center text-base font-black uppercase tracking-[0.16em] text-yellow-300 sm:text-lg">
          {division.name}
        </h3>
      </div>
      <div className={compact ? "p-4" : "p-4 sm:p-5"}>
        <div
          className={
            compact
              ? "grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4"
              : "grid grid-cols-[0.35fr_1fr_0.35fr] items-center gap-3 text-center sm:gap-4"
          }
        >
          <div className={compact ? "text-left" : ""}>
            <div className="text-sm text-zinc-500">#</div>
            <div className={compact ? "font-display text-4xl text-zinc-300" : "font-display text-5xl text-zinc-300"}>
              1
            </div>
          </div>
          <div className={compact ? "min-w-0" : ""}>
            <FighterAvatar fighter={division.champion} large={!compact} />
            <h4 className={`${compact ? "mt-0 truncate text-base" : "mt-3 text-lg"} font-bold text-white`}>
              {division.champion.name}
            </h4>
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-red-300 sm:text-xs sm:tracking-[0.18em]">
              Champion • {division.className}
            </p>
          </div>
          <div>
            <CountryMapTile
              className={compact ? "h-14 w-20" : "h-20 w-24"}
              label={division.champion.country}
            />
            <Trophy className="mx-auto mt-2 text-yellow-300" aria-hidden />
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          {contenders.map((fighter, index) => (
            <RankingRow
              compact={compact}
              fighter={fighter}
              key={fighter.name}
              striped={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function RankingRow({
  fighter,
  striped = false,
  compact = false,
}: {
  fighter: RankedFighter;
  striped?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid ${
        compact ? "grid-cols-[auto_auto_1fr_auto]" : "grid-cols-[auto_auto_auto_1fr_auto]"
      } items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 ${
        striped ? "bg-white/[0.035]" : "bg-black/20"
      }`}
    >
      <span className="w-7 text-sm font-bold text-zinc-400 sm:w-8">#{fighter.rank}</span>
      <FighterAvatar fighter={fighter} />
      {compact ? null : (
        <CountryMapTile className="hidden h-10 w-14 rounded-lg sm:block" label={fighter.country} />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{fighter.name}</p>
        <p className="truncate text-xs text-zinc-500">
          {compact
            ? `${fighter.record} • ${fighter.country}`
            : `${fighter.flag} ${fighter.country} • ${fighter.record} • ${fighter.style}`}
        </p>
      </div>
      <Movement value={fighter.movement} />
    </div>
  );
}

function FighterAvatar({ fighter, large = false }: { fighter: RankedFighter; large?: boolean }) {
  const initials = fighter.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      aria-label={fighter.name}
      className={`grid shrink-0 place-items-center rounded-xl border border-red-500/25 bg-[radial-gradient(circle_at_35%_20%,rgba(229,9,20,0.45),transparent_36%),linear-gradient(145deg,#27272a,#050506)] font-display text-white shadow-[0_0_22px_rgba(229,9,20,0.14)] ${
        large ? "mx-auto h-24 w-24 text-4xl" : "h-10 w-10 text-lg"
      }`}
      title={fighter.name}
    >
      {initials}
    </div>
  );
}

function CountryMapTile({
  label,
  count,
  className = "",
}: {
  label: string;
  count?: string;
  className?: string;
}) {
  const focus = getMapFocus(label);

  return (
    <div
      aria-label={`${label} map graphic`}
      className={`relative isolate overflow-hidden rounded-xl border border-white/10 bg-[#120305] ${className}`}
      title={label}
    >
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 220 140"
      >
        <rect fill="#2b2b2d" height="140" width="220" />
        <path d="M0 0H220V140H0Z" fill="url(#rankGrid)" opacity="0.55" />
        <path
          d="M8 41C24 18 49 16 68 29C85 41 88 60 76 78C61 101 30 95 11 75C-2 62-1 51 8 41Z"
          fill="#f4f4f0"
          opacity={focus.zone === "americas" ? "1" : "0.42"}
        />
        <path
          d="M69 83C86 86 102 99 96 118C91 134 73 139 58 130C43 120 47 101 58 91C61 88 65 85 69 83Z"
          fill="#f4f4f0"
          opacity={focus.zone === "latin" ? "1" : "0.44"}
        />
        <path
          d="M108 39C125 20 157 18 184 31C207 42 217 61 207 80C197 101 166 98 144 87C126 78 103 75 98 58C96 51 101 45 108 39Z"
          fill="#f4f4f0"
          opacity={focus.zone === "asia" ? "1" : "0.48"}
        />
        <path
          d="M114 77C130 77 145 89 145 105C145 125 128 136 111 128C94 120 92 96 103 84C106 80 110 78 114 77Z"
          fill="#f4f4f0"
          opacity={focus.zone === "africa" ? "1" : "0.42"}
        />
        <path
          d="M168 91C182 84 205 91 211 107C218 127 199 136 181 130C165 125 157 108 168 91Z"
          fill="#f4f4f0"
          opacity={focus.zone === "oceania" ? "1" : "0.45"}
        />
        <circle cx={focus.x} cy={focus.y} fill="#e50914" opacity="0.8" r="30" />
        <circle cx={focus.x} cy={focus.y} fill="none" r="18" stroke="#fff" strokeOpacity="0.9" strokeWidth="2" />
        <defs>
          <pattern height="12" id="rankGrid" patternUnits="userSpaceOnUse" width="12">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#e50914" strokeOpacity="0.16" strokeWidth="1" />
          </pattern>
        </defs>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.48),transparent_14%),linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.72))]" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
        <span className="truncate rounded-full bg-black/60 px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-white">
          {count ?? label}
        </span>
      </div>
    </div>
  );
}

function getMapFocus(label: string) {
  const normalized = label.toLowerCase();

  if (
    ["philippines", "metro manila", "cebu", "davao", "northern luzon", "western visayas", "japan", "south korea", "singapore", "indonesia", "taiwan", "guam", "kazakhstan"].some((value) =>
      normalized.includes(value),
    )
  ) {
    return { x: 169, y: 61, zone: "asia" };
  }

  if (["australia", "nz"].some((value) => normalized.includes(value))) {
    return { x: 185, y: 105, zone: "oceania" };
  }

  if (["brazil", "mexico", "latin"].some((value) => normalized.includes(value))) {
    return { x: 76, y: 102, zone: "latin" };
  }

  if (["united states", "canada", "north america"].some((value) => normalized.includes(value))) {
    return { x: 45, y: 52, zone: "americas" };
  }

  if (["spain", "ireland", "europe"].some((value) => normalized.includes(value))) {
    return { x: 118, y: 49, zone: "asia" };
  }

  if (["middle east"].some((value) => normalized.includes(value))) {
    return { x: 139, y: 64, zone: "asia" };
  }

  if (["africa"].some((value) => normalized.includes(value))) {
    return { x: 121, y: 99, zone: "africa" };
  }

  return { x: 154, y: 68, zone: "asia" };
}

function Movement({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-300">
        <TrendingUp size={14} aria-hidden />
        {value}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-black text-red-300">
        <TrendingDown size={14} aria-hidden />
        {Math.abs(value)}
      </span>
    );
  }

  return <span className="text-xs font-black text-zinc-500">-</span>;
}
