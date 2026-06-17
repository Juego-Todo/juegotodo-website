export type TeamCategory = "official" | "affiliated-gym" | "regional";

export type TeamRosterEntry = {
  slug: string;
  name: string;
  division: string;
  record: string;
  rank?: string;
};

export type TeamResult = {
  opponent: string;
  result: "Win" | "Loss" | "Draw";
  event: string;
  date: string;
};

export type Coach = {
  slug: string;
  name: string;
  teamSlug: string;
  teamName: string;
  region: string;
  specialty: string;
  record: string;
};

export type Team = {
  slug: string;
  name: string;
  shortName: string;
  category: TeamCategory;
  region: string;
  headCoach: string;
  record: string;
  fighterCount: number;
  championships: number;
  tone: string;
  logoInitials: string;
  summary: string;
  roster: TeamRosterEntry[];
  recentResults: TeamResult[];
  ranking?: number;
};

export const teamCategoryLabels: Record<TeamCategory, string> = {
  official: "Official Team",
  "affiliated-gym": "Affiliated Gym",
  regional: "Regional Team",
};

export const teams: Team[] = [
  {
    slug: "mandirigma-lab-manila",
    name: "Mandirigma Lab Manila",
    shortName: "MLM",
    category: "official",
    region: "Metro Manila",
    headCoach: "Coach Arnel Vega",
    record: "42-11",
    fighterCount: 18,
    championships: 6,
    ranking: 1,
    tone: "from-red-900 via-zinc-950 to-black",
    logoInitials: "ML",
    summary:
      "Flagship JTGC official team producing welterweight champions and national camp selections across weapon and Mano y Mano formats.",
    roster: [
      { slug: "miguel-lakan-reyes", name: "Miguel Reyes", division: "Welterweight", record: "8-1", rank: "Champion" },
      { slug: "isabel-diwa-mendoza", name: "Isabel Mendoza", division: "Bantamweight", record: "7-2", rank: "#2" },
    ],
    recentResults: [
      { opponent: "Cebu Blade Athletics", result: "Win", event: "JT Ascension Manila", date: "2025-11-14" },
      { opponent: "Visayas Combat Union", result: "Win", event: "JT Proving Ground", date: "2025-09-02" },
    ],
  },
  {
    slug: "cebu-blade-athletics",
    name: "Cebu Blade Athletics",
    shortName: "CBA",
    category: "official",
    region: "Central Visayas",
    headCoach: "Coach Liza Ortega",
    record: "36-14",
    fighterCount: 14,
    championships: 4,
    ranking: 2,
    tone: "from-zinc-900 via-red-950 to-black",
    logoInitials: "CB",
    summary:
      "Visayas powerhouse known for sikaran kicking entries, stick trapping, and elite female division depth.",
    roster: [
      { slug: "ana-bagaybay-santos", name: "Ana Santos", division: "Flyweight", record: "6-0", rank: "#1" },
    ],
    recentResults: [
      { opponent: "Mandirigma Lab Manila", result: "Loss", event: "JT Ascension Manila", date: "2025-11-14" },
      { opponent: "Mindanao Iron Camp", result: "Win", event: "JT Night of Blades", date: "2025-08-21" },
    ],
  },
  {
    slug: "lakbay-grappling-club",
    name: "Lakbay Grappling Club",
    shortName: "LGC",
    category: "affiliated-gym",
    region: "CALABARZON",
    headCoach: "Coach Ramon Cruz Sr.",
    record: "28-9",
    fighterCount: 11,
    championships: 2,
    ranking: 3,
    tone: "from-yellow-900 via-zinc-950 to-red-950",
    logoInitials: "LG",
    summary:
      "Affiliated gym specializing in dumog transitions, clinch entries, and Round 3 grappling dominance.",
    roster: [
      { slug: "ramon-dumog-cruz", name: "Ramon Cruz", division: "Middleweight", record: "10-3", rank: "#3" },
    ],
    recentResults: [
      { opponent: "Manila Combat Lab", result: "Win", event: "JT Regional Series", date: "2025-10-05" },
    ],
  },
  {
    slug: "manila-combat-lab",
    name: "Manila Combat Lab",
    shortName: "MCL",
    category: "affiliated-gym",
    region: "Metro Manila",
    headCoach: "Coach Gabriel Datu",
    record: "31-12",
    fighterCount: 16,
    championships: 3,
    ranking: 4,
    tone: "from-red-950 via-black to-zinc-900",
    logoInitials: "MC",
    summary:
      "High-volume training facility feeding JTGC amateur pipelines and professional heavyweight contenders.",
    roster: [],
    recentResults: [
      { opponent: "Lakbay Grappling Club", result: "Loss", event: "JT Regional Series", date: "2025-10-05" },
    ],
  },
  {
    slug: "visayas-combat-union",
    name: "Visayas Combat Union",
    shortName: "VCU",
    category: "regional",
    region: "Western Visayas",
    headCoach: "Coach Marco Ilustre",
    record: "22-8",
    fighterCount: 9,
    championships: 1,
    ranking: 5,
    tone: "from-zinc-800 via-red-900 to-black",
    logoInitials: "VC",
    summary: "Regional team developing Visayas prospects through JTGC satellite camps and ranking qualifiers.",
    roster: [],
    recentResults: [
      { opponent: "Cebu Blade Athletics", result: "Loss", event: "JT Proving Ground", date: "2025-09-02" },
    ],
  },
  {
    slug: "mindanao-iron-camp",
    name: "Mindanao Iron Camp",
    shortName: "MIC",
    category: "regional",
    region: "Northern Mindanao",
    headCoach: "Coach Elena Navarro",
    record: "19-7",
    fighterCount: 8,
    championships: 1,
    ranking: 6,
    tone: "from-zinc-950 via-zinc-800 to-red-950",
    logoInitials: "MI",
    summary: "Mindanao regional squad built around power striking, weapon durability, and championship conditioning.",
    roster: [],
    recentResults: [
      { opponent: "Cebu Blade Athletics", result: "Loss", event: "JT Night of Blades", date: "2025-08-21" },
    ],
  },
  {
    slug: "north-luzon-blade-guild",
    name: "North Luzon Blade Guild",
    shortName: "NLBG",
    category: "regional",
    region: "Ilocos Region",
    headCoach: "Coach Paolo Santos",
    record: "15-6",
    fighterCount: 7,
    championships: 0,
    tone: "from-red-800 via-zinc-950 to-black",
    logoInitials: "NL",
    summary: "Regional blade guild developing northern Luzon athletes for JTGC weapon-format competition.",
    roster: [],
    recentResults: [],
  },
  {
    slug: "latayanology-elite-squad",
    name: "Latayanology Elite Squad",
    shortName: "LES",
    category: "official",
    region: "National",
    headCoach: "Grand Coach Reyes",
    record: "18-2",
    fighterCount: 6,
    championships: 5,
    ranking: 1,
    tone: "from-red-600 via-zinc-950 to-black",
    logoInitials: "LE",
    summary:
      "Select national squad representing JTGC in international showcases and championship superfights.",
    roster: [],
    recentResults: [
      { opponent: "SEA Combat Collective", result: "Win", event: "JT International Showcase", date: "2025-12-01" },
    ],
  },
];

export const coaches: Coach[] = teams.map((team) => ({
  slug: team.headCoach.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  name: team.headCoach,
  teamSlug: team.slug,
  teamName: team.name,
  region: team.region,
  specialty: team.category === "official" ? "Competition Systems" : "Development & Camps",
  record: team.record,
}));

export function getTeam(slug: string) {
  return teams.find((team) => team.slug === slug);
}

export function getTeamsByCategory(category: TeamCategory) {
  return teams.filter((team) => team.category === category);
}

export function getRankedTeams() {
  return [...teams].sort((a, b) => (a.ranking ?? 99) - (b.ranking ?? 99));
}

export function searchTeams(query: string, category?: TeamCategory | "all") {
  const normalized = query.trim().toLowerCase();
  return teams.filter((team) => {
    const matchesCategory = !category || category === "all" || team.category === category;
    if (!normalized) return matchesCategory;
    const haystack = [team.name, team.region, team.headCoach, team.shortName].join(" ").toLowerCase();
    return matchesCategory && haystack.includes(normalized);
  });
}
