export type RankedFighter = {
  rank: number;
  name: string;
  nickname: string;
  gym: string;
  country: string;
  flag: string;
  record: string;
  style: string;
  movement: number;
};

export type DivisionRanking = {
  slug: string;
  name: string;
  className: string;
  champion: RankedFighter;
  contenders: RankedFighter[];
};

export type RegionalRankingGroup = {
  title: string;
  regions: {
    name: string;
    leader: string;
    depth: number;
    hotbed: string;
  }[];
};

const fighter = (
  rank: number,
  name: string,
  nickname: string,
  country: string,
  flag: string,
  record: string,
  style: string,
  movement = 0,
  gym = "Independent Fight Camp",
): RankedFighter => ({
  rank,
  name,
  nickname,
  country,
  flag,
  record,
  style,
  movement,
  gym,
});

export const divisionRankings: DivisionRanking[] = [
  {
    slug: "heavyweight",
    name: "Heavyweight",
    className: "205+ lb",
    champion: fighter(0, "Gabriel Datu", "The Hammer", "Philippines", "PH", "11-1", "Dumog / Kali", 0, "Manila Combat Lab"),
    contenders: [
      fighter(1, "Tomas Alvarez", "Iron Island", "Guam", "GU", "9-2", "Yaw-Yan / Buno", 2),
      fighter(2, "Rafael Santos", "Tigre", "Brazil", "BR", "8-1", "BJJ / Panuntukan", -1),
      fighter(3, "Koji Nakamura", "Ronin", "Japan", "JP", "7-3", "Eskrima / Judo", 1),
      fighter(4, "Marcus Hale", "Breaker", "United States", "US", "6-2", "Kali / Wrestling", 0),
      fighter(5, "Anton Reyes", "Lakandula", "Philippines", "PH", "5-0", "Arnis / Boxing", 3),
    ],
  },
  {
    slug: "middleweight",
    name: "Middleweight",
    className: "185 lb",
    champion: fighter(0, "Ramon Cruz", "Dumog", "Philippines", "PH", "10-3", "Dumog / Buno", 0, "Lakbay Grappling Club"),
    contenders: [
      fighter(1, "Elias Tan", "Red Line", "Singapore", "SG", "8-2", "Kali / Muay Thai", 1),
      fighter(2, "Javier Lim", "Blade Flow", "Philippines", "PH", "7-1", "Eskrima / BJJ", 0),
      fighter(3, "Diego Mendez", "El Rayo", "Mexico", "MX", "6-2", "Panuntukan / Wrestling", 4),
      fighter(4, "Noah Park", "Seoul Steel", "South Korea", "KR", "6-3", "Sikaran / Kickboxing", -2),
      fighter(5, "Ari Velez", "Kadena", "Philippines", "PH", "5-1", "Arnis / Dumog", 1),
    ],
  },
  {
    slug: "welterweight",
    name: "Welterweight",
    className: "170 lb",
    champion: fighter(0, "Miguel Reyes", "Lakan", "Philippines", "PH", "8-1", "Kali / Panuntukan", 0, "Mandirigma Lab Manila"),
    contenders: [
      fighter(1, "Kenji Sato", "Split Step", "Japan", "JP", "9-2", "Kali / Karate", 1),
      fighter(2, "Andre Bautista", "North Star", "Canada", "CA", "7-2", "Eskrima / BJJ", -1),
      fighter(3, "Paolo Garcia", "Sibat", "Philippines", "PH", "6-1", "Arnis / Wrestling", 2),
      fighter(4, "Mateo Cruz", "Quickdraw", "Spain", "ES", "6-2", "Panuntukan / Boxing", 0),
      fighter(5, "Liam O'Connor", "Blackthorn", "Ireland", "IE", "5-2", "Kali / Judo", 1),
    ],
  },
  {
    slug: "lightweight",
    name: "Lightweight",
    className: "155 lb",
    champion: fighter(0, "Ilia Navarro", "Kalasag", "Philippines", "PH", "9-0", "Sikaran / Kali", 0, "Cebu Blade Athletics"),
    contenders: [
      fighter(1, "Niko Flores", "Signal", "Philippines", "PH", "8-2", "Yaw-Yan / BJJ", 2),
      fighter(2, "Arman Petrov", "Volk", "Kazakhstan", "KZ", "7-2", "Sambo / Eskrima", 1),
      fighter(3, "Charles Moreira", "Lobo", "Brazil", "BR", "7-3", "BJJ / Boxing", -1),
      fighter(4, "Tatsuya Mori", "Hibana", "Japan", "JP", "5-1", "Kali / Kickboxing", 3),
      fighter(5, "Marco Uy", "Talisman", "Philippines", "PH", "5-2", "Arnis / Dumog", 0),
    ],
  },
  {
    slug: "flyweight",
    name: "Flyweight",
    className: "125 lb",
    champion: fighter(0, "Ana Santos", "Bagaybay", "Philippines", "PH", "6-0", "Sikaran / Arnis", 0, "Cebu Blade Athletics"),
    contenders: [
      fighter(1, "Mika Aoki", "Current", "Japan", "JP", "7-1", "Kali / Judo", 1),
      fighter(2, "Leah Mendoza", "Diwa", "Philippines", "PH", "6-2", "Eskrima / Yaw-Yan", -1),
      fighter(3, "Sofia Reyes", "Kilatis", "Philippines", "PH", "5-1", "Panuntukan / BJJ", 2),
      fighter(4, "May Lin", "South Wind", "Taiwan", "TW", "5-3", "Sikaran / Boxing", 0),
      fighter(5, "Nadia Karim", "Spear", "Indonesia", "ID", "4-1", "Arnis / Wrestling", 3),
    ],
  },
  {
    slug: "womens-bantamweight",
    name: "Women's Bantamweight",
    className: "135 lb",
    champion: fighter(0, "Isabel Mendoza", "Diwa", "Philippines", "PH", "7-2", "Eskrima / Yaw-Yan", 0, "Quezon Combat Project"),
    contenders: [
      fighter(1, "Juliana Pena", "Halimaw", "United States", "US", "8-3", "Kali / Wrestling", 1),
      fighter(2, "Raquel Torres", "Bayanihan", "Mexico", "MX", "6-1", "Panuntukan / BJJ", 2),
      fighter(3, "Erin Walsh", "Cipher", "Ireland", "IE", "5-2", "Sikaran / Boxing", -1),
      fighter(4, "Norma Silva", "Norte", "Brazil", "BR", "5-3", "BJJ / Arnis", 0),
      fighter(5, "Jasmine Lim", "Pulse", "Singapore", "SG", "4-1", "Kali / Muay Thai", 4),
    ],
  },
];

export const poundForPound = [
  divisionRankings[2].champion,
  divisionRankings[3].champion,
  divisionRankings[4].champion,
  divisionRankings[1].champion,
  divisionRankings[5].champion,
  divisionRankings[0].champion,
  divisionRankings[2].contenders[0],
  divisionRankings[4].contenders[1],
];

export const regionalRankingGroups: RegionalRankingGroup[] = [
  {
    title: "Philippines Rankings",
    regions: [
      { name: "Metro Manila", leader: "Miguel Reyes", depth: 48, hotbed: "Panuntukan / Kali" },
      { name: "Cebu", leader: "Ana Santos", depth: 32, hotbed: "Sikaran / Arnis" },
      { name: "Davao", leader: "Anton Reyes", depth: 24, hotbed: "Yaw-Yan / Dumog" },
      { name: "Northern Luzon", leader: "Paolo Garcia", depth: 19, hotbed: "Arnis / Buno" },
      { name: "Western Visayas", leader: "Marco Uy", depth: 15, hotbed: "Eskrima / Boxing" },
    ],
  },
  {
    title: "Asia Pacific Rankings",
    regions: [
      { name: "Japan", leader: "Kenji Sato", depth: 29, hotbed: "Kali / Karate" },
      { name: "South Korea", leader: "Noah Park", depth: 21, hotbed: "Sikaran / Kickboxing" },
      { name: "Singapore", leader: "Elias Tan", depth: 18, hotbed: "Kali / Muay Thai" },
      { name: "Indonesia", leader: "Nadia Karim", depth: 16, hotbed: "Arnis / Wrestling" },
      { name: "Australia & NZ", leader: "Mason Clark", depth: 23, hotbed: "Eskrima / MMA" },
    ],
  },
  {
    title: "Worldwide Rankings",
    regions: [
      { name: "North America", leader: "Andre Bautista", depth: 41, hotbed: "Kali / Wrestling" },
      { name: "Latin America", leader: "Diego Mendez", depth: 36, hotbed: "Panuntukan / BJJ" },
      { name: "Europe", leader: "Liam O'Connor", depth: 33, hotbed: "Kali / Judo" },
      { name: "Middle East", leader: "Samir Haddad", depth: 12, hotbed: "Arnis / Kickboxing" },
      { name: "Africa", leader: "Kwame Mensah", depth: 14, hotbed: "Dumog / Boxing" },
    ],
  },
];

export const rankingMethodology = [
  "Recent sanctioned Juego Todo results",
  "Strength of schedule and opponent quality",
  "Round dominance across Doble Baston, Solo Baston, and Mano y Mano",
  "Activity, medical clearance, and commission eligibility",
  "Champion status, title defenses, and contender eliminators",
];
