export const rankingsNavItems = [
  { label: "Official Rankings", href: "/rankings" },
  { label: "Pound-for-Pound", href: "/rankings#pound-for-pound" },
  { label: "Flyweight", href: "/rankings?division=flyweight" },
  { label: "Bantamweight", href: "/rankings?division=bantamweight" },
  { label: "Featherweight", href: "/rankings?division=featherweight" },
  { label: "Lightweight", href: "/rankings?division=lightweight" },
  { label: "Welterweight", href: "/rankings?division=welterweight" },
  { label: "Middleweight", href: "/rankings?division=middleweight" },
  { label: "Heavyweight", href: "/rankings?division=heavyweight" },
  { label: "Fighter Database", href: "/fighters" },
  { label: "Hall of Fame", href: "/rankings#hall-of-fame" },
  { label: "Rankings Methodology", href: "/ranking-methodology" },
];

export const weightClassSlugs = [
  "flyweight",
  "bantamweight",
  "featherweight",
  "lightweight",
  "welterweight",
  "middleweight",
  "heavyweight",
] as const;
