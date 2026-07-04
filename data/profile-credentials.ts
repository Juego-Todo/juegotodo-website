import type { FighterFightResult, FighterStatistics } from "@/data/fighter-details";

export type PhysicalAttributes = {
  height: string;
  weight: string;
  reach: string;
  stance: string;
  weaponSpecialty: string;
  fightStyle: string;
};

export type FighterAnalytics = {
  strikingAccuracy: number;
  defensiveRate: number;
  takedownDefense: number;
  averagePoints: number;
  leagueAvgStriking?: number;
  leagueAvgDefensive?: number;
  leagueAvgTakedown?: number;
  leagueAvgPoints?: number;
};

export type AthleteCredentialProfile = {
  slug?: string;
  rank: string;
  division: string;
  record: string;
  wins: number;
  losses: number;
  draws: number;
  koWins: number;
  submissionWins: number;
  decisionWins: number;
  winRate: number;
  finishRate: number;
  team: string;
  gym: string;
  region: string;
  country: string;
  status: "Active" | "Inactive" | "Suspended";
  matchCount: number;
  physical: PhysicalAttributes;
  statistics: FighterStatistics;
  analytics: FighterAnalytics;
  fightHistory: FighterFightResult[];
  achievements: string[];
  bannerTone: string;
  winStreak?: number;
  age?: number;
  coach?: string;
  biography?: string;
  debut?: string;
  portraitImage?: string;
  actionBackground?: string;
  upcomingFight?: {
    event: string;
    opponent: string;
    opponentRecord: string;
    opponentRank: number;
    opponentHeight: string;
    opponentReach: string;
    date: string;
    venue: string;
    forceCampMode?: boolean;
  };
  weightCut?: {
    currentKg: number;
    targetKg: number;
    progressPercent: number;
  };
  rankMovement?: {
    current: number;
    previous: number;
    periodLabel: string;
  };
};

export const demoAthleteProfiles: Record<string, AthleteCredentialProfile> = {
  "kiran-aames": {
    rank: "#4",
    division: "Lightweight",
    record: "14-2-0",
    wins: 14,
    losses: 2,
    draws: 0,
    koWins: 7,
    submissionWins: 2,
    decisionWins: 5,
    winRate: 87,
    finishRate: 64,
    team: "Bahad Zubu FMA",
    gym: "Bahad Zubu HQ",
    region: "Metro Manila",
    country: "Philippines",
    status: "Active",
    matchCount: 16,
    physical: {
      height: "170 cm",
      weight: "70 kg",
      reach: "174 cm",
      stance: "Orthodox",
      weaponSpecialty: "Doble Baston",
      fightStyle: "FMA / Submission Grappling",
    },
    statistics: {
      knockouts: 7,
      submissions: 2,
      decisions: 5,
      avgFightTime: "11:48",
      weaponRoundWins: 9,
    },
    analytics: {
      strikingAccuracy: 74,
      defensiveRate: 69,
      takedownDefense: 81,
      averagePoints: 18.2,
      leagueAvgStriking: 62,
      leagueAvgDefensive: 58,
      leagueAvgTakedown: 65,
      leagueAvgPoints: 14.5,
    },
    fightHistory: [
      { opponent: "Juan Reyes", result: "Win", method: "TKO R2", event: "JT Ascension Manila", date: "2026-01-18" },
      { opponent: "Mark Cruz", result: "Win", method: "Decision", event: "JT Regional Series", date: "2025-11-02" },
      { opponent: "Daniel Santos", result: "Loss", method: "Submission R3", event: "JT Night of Blades", date: "2025-08-21" },
      { opponent: "Carlo Diaz", result: "Win", method: "KO R1", event: "JT Proving Ground", date: "2025-05-14" },
      { opponent: "Noah Park", result: "Win", method: "Decision", event: "JT Open Cebu", date: "2025-02-09" },
    ],
    achievements: [
      "2026 Regional Champion",
      "2025 Gold Medalist",
      "2024 Rookie of the Year",
      "2 Fight Win Streak",
    ],
    bannerTone: "from-red-950/90 via-black/80 to-zinc-950/90",
    winStreak: 5,
    age: 28,
    coach: "Master Rey Galang",
    weightCut: { currentKg: 74, targetKg: 70, progressPercent: 82 },
    rankMovement: { current: 4, previous: 7, periodLabel: "Last Month" },
    actionBackground: "/juego-todo-event-background.png",
    upcomingFight: {
      event: "JT Ascension Manila",
      opponent: "Carlos Soriano",
      opponentRecord: "11-3",
      opponentRank: 4,
      opponentHeight: "174cm",
      opponentReach: "176cm",
      date: "2026-07-29",
      venue: "Mall of Asia Arena",
      forceCampMode: true,
    },
  },
  default: {
    rank: "#5",
    division: "Lightweight",
    record: "12-2-0",
    wins: 12,
    losses: 2,
    draws: 0,
    koWins: 8,
    submissionWins: 2,
    decisionWins: 2,
    winRate: 80,
    finishRate: 63,
    team: "Lakas Katorse",
    gym: "Lakas Katorse HQ",
    region: "Metro Manila",
    country: "Philippines",
    status: "Active",
    matchCount: 10,
    physical: {
      height: "170 cm",
      weight: "70 kg",
      reach: "174 cm",
      stance: "Orthodox",
      weaponSpecialty: "Doble Baston",
      fightStyle: "FMA / BJJ",
    },
    statistics: {
      knockouts: 8,
      submissions: 2,
      decisions: 2,
      avgFightTime: "7:42",
      weaponRoundWins: 6,
    },
    analytics: {
      strikingAccuracy: 68,
      defensiveRate: 61,
      takedownDefense: 74,
      averagePoints: 16.4,
      leagueAvgStriking: 62,
      leagueAvgDefensive: 58,
      leagueAvgTakedown: 65,
      leagueAvgPoints: 14.5,
    },
    fightHistory: [
      { opponent: "Carlos Soriano", result: "Win", method: "Decision", event: "JT Ascension Manila", date: "2025-11-14" },
      { opponent: "Kenji Sato", result: "Win", method: "TKO R3", event: "JT Night of Blades", date: "2025-08-21" },
    ],
    achievements: ["2025 Regional Finalist", "3 Fight Win Streak"],
    bannerTone: "from-red-950/85 via-black/75 to-zinc-950/90",
    winStreak: 5,
    age: 28,
    coach: "Coach Santos",
    debut: "2023",
    weightCut: { currentKg: 74, targetKg: 70, progressPercent: 82 },
    rankMovement: { current: 5, previous: 7, periodLabel: "Last Month" },
    actionBackground: "/juego-todo-event-background.png",
    upcomingFight: {
      event: "JT Ascension Manila",
      opponent: "Carlos Soriano",
      opponentRecord: "11-3",
      opponentRank: 4,
      opponentHeight: "174cm",
      opponentReach: "176cm",
      date: "2026-07-29",
      venue: "Mall of Asia Arena",
      forceCampMode: true,
    },
  },
};
