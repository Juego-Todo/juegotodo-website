import type { EnrichedFighterProfile } from "@/lib/fighters/profile";

export type AthleteStatus = "Champion" | "Contender" | "Rising Star" | "Veteran" | "Hall of Fame";

export type LatayanologyAthleteMeta = {
  status: AthleteStatus;
  p4pRank: number | null;
  views: number;
  koPercent: number;
  active: boolean;
};

export const latayanologyRankingTabs = [
  "Pound for Pound",
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Heavyweight",
] as const;

export type LatayanologyRankingTab = (typeof latayanologyRankingTabs)[number];

export const latayanologyLiveStats = [
  { value: "550+", label: "Verified Athletes" },
  { value: "100+", label: "Matches" },
  { value: "58+", label: "Affiliated Gyms" },
  { value: "18", label: "Regions" },
] as const;

export const latayanologySortOptions = [
  { id: "ranking", label: "Ranking" },
  { id: "win-streak", label: "Win Streak" },
  { id: "most-active", label: "Most Active" },
  { id: "most-viewed", label: "Most Viewed" },
  { id: "recent-wins", label: "Recent Wins" },
] as const;

export type LatayanologySortId = (typeof latayanologySortOptions)[number]["id"];

export const hallOfFameMembers = [
  { name: "Doug Marcaida", contribution: "FMA Ambassador & Blade Culture" },
  { name: "Ronnie Ricketts", contribution: "Combat Sports Pioneer" },
  { name: "Diana Lee Inosanto", contribution: "Arnis Heritage & Cinema" },
] as const;

export const latayanologyAthleteMeta: Record<string, LatayanologyAthleteMeta> = {
  "miguel-lakan-reyes": { status: "Champion", p4pRank: 1, views: 48200, koPercent: 50, active: true },
  "ana-bagaybay-santos": { status: "Champion", p4pRank: 2, views: 39100, koPercent: 33, active: true },
  "ilia-navarro-kalasag": { status: "Rising Star", p4pRank: 3, views: 28400, koPercent: 44, active: true },
  "gabriel-datu-hammer": { status: "Champion", p4pRank: 4, views: 25600, koPercent: 64, active: true },
  "ramon-dumog-cruz": { status: "Champion", p4pRank: 5, views: 21800, koPercent: 30, active: true },
  "isabel-diwa-mendoza": { status: "Contender", p4pRank: 6, views: 17200, koPercent: 43, active: true },
};

export const statusBadgeStyles: Record<AthleteStatus, string> = {
  Champion: "border-yellow-400/40 bg-yellow-400/10 text-yellow-200",
  Contender: "border-[#FF1010]/40 bg-[#FF1010]/10 text-red-100",
  "Rising Star": "border-cyan-400/35 bg-cyan-400/10 text-cyan-100",
  Veteran: "border-zinc-400/35 bg-zinc-400/10 text-zinc-200",
  "Hall of Fame": "border-purple-400/35 bg-purple-400/10 text-purple-100",
};

export function getAthleteMeta(slug: string): LatayanologyAthleteMeta {
  return (
    latayanologyAthleteMeta[slug] ?? {
      status: "Veteran",
      p4pRank: null,
      views: 8000,
      koPercent: 25,
      active: true,
    }
  );
}

export function parseWinRate(record: string) {
  const [wins, losses] = record.split("-").map((value) => Number.parseInt(value, 10));
  if (!wins || Number.isNaN(wins) || Number.isNaN(losses)) {
    return 0;
  }
  const total = wins + losses;
  return total === 0 ? 0 : Math.round((wins / total) * 100);
}

export function getRankSortValue(fighter: EnrichedFighterProfile, tab: LatayanologyRankingTab) {
  if (tab === "Pound for Pound") {
    return getAthleteMeta(fighter.slug).p4pRank ?? 99;
  }
  if (fighter.division !== tab) {
    return 99;
  }
  if (fighter.rank.toLowerCase().includes("champion")) {
    return 0;
  }
  const match = fighter.rank.match(/#(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 99;
}

export function sortAthletes(
  athletes: EnrichedFighterProfile[],
  sortId: LatayanologySortId,
  tab: LatayanologyRankingTab,
) {
  const sorted = [...athletes];

  sorted.sort((a, b) => {
    const metaA = getAthleteMeta(a.slug);
    const metaB = getAthleteMeta(b.slug);

    switch (sortId) {
      case "win-streak":
        return (b.winStreak ?? 0) - (a.winStreak ?? 0);
      case "most-viewed":
        return metaB.views - metaA.views;
      case "most-active":
        return Number(metaB.active) - Number(metaA.active) || metaB.views - metaA.views;
      case "recent-wins":
        return (b.lastFight?.toLowerCase().includes("win") ? 1 : 0) - (a.lastFight?.toLowerCase().includes("win") ? 1 : 0);
      default:
        return getRankSortValue(a, tab) - getRankSortValue(b, tab);
    }
  });

  return sorted;
}

export function filterAthletes(
  athletes: EnrichedFighterProfile[],
  {
    query,
    weightClass,
    team,
    nationality,
    championOnly,
    activeOnly,
    winStreakOnly,
    tab,
  }: {
    query: string;
    weightClass: string;
    team: string;
    nationality: string;
    championOnly: boolean;
    activeOnly: boolean;
    winStreakOnly: boolean;
    tab: LatayanologyRankingTab;
  },
) {
  return athletes.filter((fighter) => {
    const meta = getAthleteMeta(fighter.slug);
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      fighter.name.toLowerCase().includes(normalizedQuery) ||
      fighter.nickname.toLowerCase().includes(normalizedQuery) ||
      (fighter.team?.toLowerCase().includes(normalizedQuery) ?? false);
    const matchesWeight = weightClass === "All" || fighter.division === weightClass;
    const matchesTeam = team === "All" || fighter.team === team;
    const matchesNation = nationality === "All" || fighter.country === nationality;
    const matchesChampion = !championOnly || meta.status === "Champion";
    const matchesActive = !activeOnly || meta.active;
    const matchesStreak = !winStreakOnly || (fighter.winStreak ?? 0) >= 3;

    if (tab !== "Pound for Pound" && fighter.division !== tab) {
      return false;
    }

    return (
      matchesQuery &&
      matchesWeight &&
      matchesTeam &&
      matchesNation &&
      matchesChampion &&
      matchesActive &&
      matchesStreak
    );
  });
}

export function getFeaturedP4pAthlete(athletes: EnrichedFighterProfile[]) {
  return (
    athletes.find((fighter) => getAthleteMeta(fighter.slug).p4pRank === 1) ??
    athletes.find((fighter) => fighter.rank.toLowerCase().includes("champion")) ??
    athletes[0]
  );
}

export function getTrendingAthletes(athletes: EnrichedFighterProfile[], limit = 3) {
  return [...athletes]
    .sort((a, b) => getAthleteMeta(b.slug).views - getAthleteMeta(a.slug).views)
    .slice(0, limit);
}
