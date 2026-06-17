export type FighterFightResult = {
  opponent: string;
  result: "Win" | "Loss" | "Draw";
  method: string;
  event: string;
  date: string;
};

export type FighterStatistics = {
  knockouts: number;
  submissions: number;
  decisions: number;
  avgFightTime: string;
  weaponRoundWins: number;
};

export type FighterDetailExtras = {
  region: string;
  rankNumber: number;
  recentResults: FighterFightResult[];
  statistics: FighterStatistics;
  fightHistory: FighterFightResult[];
};

export const fighterDetailExtras: Record<string, FighterDetailExtras> = {
  "miguel-lakan-reyes": {
    region: "Metro Manila",
    rankNumber: 1,
    recentResults: [
      { opponent: "Carlos Soriano", result: "Win", method: "Decision", event: "JT Ascension Manila", date: "2025-11-14" },
      { opponent: "Kenji Sato", result: "Win", method: "TKO R3", event: "JT Night of Blades", date: "2025-08-21" },
    ],
    statistics: { knockouts: 4, submissions: 1, decisions: 3, avgFightTime: "12:04", weaponRoundWins: 6 },
    fightHistory: [
      { opponent: "Carlos Soriano", result: "Win", method: "Decision", event: "JT Ascension Manila", date: "2025-11-14" },
      { opponent: "Kenji Sato", result: "Win", method: "TKO R3", event: "JT Night of Blades", date: "2025-08-21" },
      { opponent: "Marco Ilustre", result: "Win", method: "Submission R2", event: "JT Proving Ground", date: "2025-05-03" },
    ],
  },
  "ana-bagaybay-santos": {
    region: "Central Visayas",
    rankNumber: 1,
    recentResults: [
      { opponent: "Isabel Mendoza", result: "Win", method: "Decision", event: "JT Ascension Manila", date: "2025-11-14" },
    ],
    statistics: { knockouts: 3, submissions: 0, decisions: 3, avgFightTime: "11:22", weaponRoundWins: 5 },
    fightHistory: [
      { opponent: "Isabel Mendoza", result: "Win", method: "Decision", event: "JT Ascension Manila", date: "2025-11-14" },
      { opponent: "Lia Villanueva", result: "Win", method: "TKO R2", event: "JT Regional Series", date: "2025-07-19" },
    ],
  },
  "ramon-dumog-cruz": {
    region: "CALABARZON",
    rankNumber: 2,
    recentResults: [
      { opponent: "Elias Tan", result: "Win", method: "Submission R3", event: "JT Proving Ground", date: "2025-09-02" },
    ],
    statistics: { knockouts: 2, submissions: 5, decisions: 3, avgFightTime: "13:48", weaponRoundWins: 4 },
    fightHistory: [
      { opponent: "Elias Tan", result: "Win", method: "Submission R3", event: "JT Proving Ground", date: "2025-09-02" },
      { opponent: "Noah Park", result: "Loss", method: "Decision", event: "JT Night of Blades", date: "2025-03-15" },
    ],
  },
  "ilia-navarro-kalasag": {
    region: "Central Visayas",
    rankNumber: 1,
    recentResults: [
      { opponent: "Marco Flores", result: "Win", method: "Decision", event: "JT Regional Series", date: "2025-10-05" },
    ],
    statistics: { knockouts: 4, submissions: 2, decisions: 3, avgFightTime: "11:40", weaponRoundWins: 7 },
    fightHistory: [
      { opponent: "Marco Flores", result: "Win", method: "Decision", event: "JT Regional Series", date: "2025-10-05" },
      { opponent: "Kenji Sato", result: "Win", method: "TKO R2", event: "JT Night of Blades", date: "2025-06-12" },
    ],
  },
  "gabriel-datu-hammer": {
    region: "Metro Manila",
    rankNumber: 1,
    recentResults: [
      { opponent: "Rico Alvarez", result: "Win", method: "KO R1", event: "JT Ascension Manila", date: "2025-09-18" },
    ],
    statistics: { knockouts: 7, submissions: 1, decisions: 3, avgFightTime: "9:12", weaponRoundWins: 5 },
    fightHistory: [
      { opponent: "Rico Alvarez", result: "Win", method: "KO R1", event: "JT Ascension Manila", date: "2025-09-18" },
      { opponent: "Noah Park", result: "Win", method: "Decision", event: "JT Proving Ground", date: "2025-04-22" },
    ],
  },
  "isabel-diwa-mendoza": {
    region: "Metro Manila",
    rankNumber: 4,
    recentResults: [
      { opponent: "Ana Santos", result: "Loss", method: "Decision", event: "JT Ascension Manila", date: "2025-11-14" },
    ],
    statistics: { knockouts: 5, submissions: 0, decisions: 2, avgFightTime: "10:55", weaponRoundWins: 3 },
    fightHistory: [
      { opponent: "Ana Santos", result: "Loss", method: "Decision", event: "JT Ascension Manila", date: "2025-11-14" },
      { opponent: "Javier Lim", result: "Win", method: "KO R1", event: "JT Regional Series", date: "2025-06-08" },
    ],
  },
};

export function getFighterDetailExtras(slug: string): FighterDetailExtras | undefined {
  return fighterDetailExtras[slug];
}

export function parseRecord(record: string) {
  const [wins = "0", losses = "0"] = record.split("-");
  return { wins: Number.parseInt(wins, 10) || 0, losses: Number.parseInt(losses, 10) || 0 };
}
