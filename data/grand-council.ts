export type CouncilMember = {
  slug: string;
  name: string;
  title: string;
  specialty: string;
  region: string;
  bio: string;
  accent: string;
};

export const councilMembers: CouncilMember[] = [
  {
    slug: "antonio-dela-vega",
    name: "Antonio Dela Vega",
    title: "Grand Council Chairman",
    specialty: "Arnis / Eskrima Governance",
    region: "Metro Manila",
    bio: "Oversees Juego Todo's strategic direction, council deliberations, and alignment between traditional FMA leadership and modern competition standards.",
    accent: "from-red-700 via-zinc-950 to-yellow-900",
  },
  {
    slug: "elena-navarro",
    name: "Dr. Elena Navarro",
    title: "Rules & Ethics Commissioner",
    specialty: "Competition Integrity",
    region: "Cebu",
    bio: "Leads rules interpretation, athlete conduct standards, and the ethical framework that keeps Juego Todo fair across all divisions and age groups.",
    accent: "from-zinc-950 via-red-950 to-black",
  },
  {
    slug: "ricardo-mendoza",
    name: "Col. Ricardo Mendoza",
    title: "Athlete Safety Director",
    specialty: "Medical & Risk Management",
    region: "Quezon City",
    bio: "Directs medical protocols, weigh-in procedures, safety equipment standards, and emergency response planning for every Juego Todo event.",
    accent: "from-black via-zinc-900 to-red-950",
  },
  {
    slug: "lourdes-castillo",
    name: "Prof. Lourdes Castillo",
    title: "FMA Heritage Chair",
    specialty: "Lineage & Cultural Preservation",
    region: "Bacolod",
    bio: "Safeguards the cultural roots of Filipino martial arts within Juego Todo, ensuring each supported style retains its identity on the global stage.",
    accent: "from-red-900 via-zinc-950 to-amber-950",
  },
  {
    slug: "marco-sison",
    name: "Atty. Marco Sison",
    title: "Governance & Legal Counsel",
    specialty: "Athlete Contracts & Compliance",
    region: "Makati",
    bio: "Advises on athlete agreements, partner contracts, regulatory compliance, and the legal structure behind Juego Todo's international expansion.",
    accent: "from-zinc-950 via-stone-950 to-red-900",
  },
  {
    slug: "jasper-lim",
    name: "Coach Jasper Lim",
    title: "Competition Director",
    specialty: "Matchmaking & Event Operations",
    region: "Davao",
    bio: "Coordinates bout order, division movement, rankings input, and the operational execution of Juego Todo fight cards and seminar calendars.",
    accent: "from-red-800 via-black to-zinc-900",
  },
  {
    slug: "isabel-reyes",
    name: "Isabel Reyes",
    title: "Athlete Representative",
    specialty: "Fighter Advocacy",
    region: "Pasig",
    bio: "Represents active competitors on the council, channeling athlete feedback into rules updates, scheduling, and career development pathways.",
    accent: "from-black via-red-950 to-zinc-950",
  },
  {
    slug: "fernando-torres",
    name: "Fernando Torres",
    title: "Partner Gym Liaison",
    specialty: "Affiliate Network",
    region: "Iloilo",
    bio: "Connects affiliated gyms, coaches, and regional training hubs to the Juego Todo platform, seminars, and official registration pipeline.",
    accent: "from-zinc-900 via-red-900 to-black",
  },
];
