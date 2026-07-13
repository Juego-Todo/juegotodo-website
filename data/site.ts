import { barrioBrawlsEvent } from "@/data/shop-tickets";

export type Fighter = {
  slug: string;
  name: string;
  nickname: string;
  style: string;
  gym: string;
  record: string;
  rank: string;
  division: string;
  highlight: string;
};

export type Event = {
  slug: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  status: "Upcoming" | "Results";
  mainEvent: string;
  posterTone: string;
  bouts: string[];
  isChampionship?: boolean;
  isLive?: boolean;
};

export type Champion = {
  title: string;
  name: string;
  crownedDate: string;
  initials: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type FighterProfile = {
  slug: string;
  name: string;
  nickname: string;
  initials: string;
  record: string;
  rank: string;
  division: string;
  nationality: string;
  team: string;
  teamShort: string;
  style: string;
  lastFight: string;
  winStreak: number;
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
  cta?: boolean;
};


export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about-juego-todo",
    children: [
      { label: "About Juego Todo", href: "/about-juego-todo" },
      { label: "Calendar", href: "/calendar" },
      { label: "Grand Council", href: "/grand-council" },
      { label: "Rules & Regulations", href: "/rules-regulations" },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    label: "Latayanology",
    href: "/latayanology",
    children: [
      { label: "Search Fighter", href: "/latayanology" },
      { label: "Lineage Finder", href: "/fma-lineage" },
      { label: "JT Seminars", href: "/juego-todo-seminars" },
    ],
  },
  {
    label: "Media",
    href: "/media",
    children: [
      { label: "News", href: "/media" },
      { label: "Media Clips", href: "/media#clips" },
      { label: "Podcast", href: "/media#podcast" },
    ],
  },
  { label: "Shop", href: "/shop" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/login?mode=register", cta: true },
];

export const footerNavColumns = navItems
  .filter((item) => !item.cta && item.label !== "Login" && item.label !== "Register")
  .map((item) => ({
    title: item.label,
    links: item.children?.length
      ? item.children.filter(
          (child, index, arr) => arr.findIndex((entry) => entry.href === child.href) === index,
        )
      : [{ label: item.label, href: item.href }],
  }));

export const footerLegalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const;

export const stats = [
  { label: "Professional Fighters", value: 125, suffix: "+" },
  { label: "Gyms", value: 32 },
  { label: "Regions", value: 11 },
  { label: "Matches", value: 500, suffix: "+" },
];

export const footerStats = [
  { label: "Fighters", value: 125, suffix: "+" },
  { label: "Gyms", value: 32, suffix: "+" },
  { label: "Matches", value: 500, suffix: "+" },
  { label: "Regions", value: 11, suffix: "+" },
];

export const broadcastPartners = [
  "FightCast Global",
  "RingSide Network",
  "Manila Sports TV",
  "Combat Stream PH",
  "Apex Broadcast",
];

export const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

export const champions: Champion[] = [
  {
    title: "Juego Todo Inaugural Champion",
    name: "Genil Francisco",
    crownedDate: "December 20, 2019",
    initials: "GF",
    imageSrc: "/champions/genil-francisco.png",
    imageAlt: "Genil Francisco, Juego Todo Inaugural Champion, holding the championship belt and arnis sticks",
  },
  {
    title: "Hari ng Latayan",
    name: "Alfredo Melendres Jr.",
    crownedDate: "Dec 12, 2025",
    initials: "AM",
  },
];

export const fighterDatabase: FighterProfile[] = [
  {
    slug: "miguel-lakan-reyes",
    name: "Miguel Reyes",
    nickname: "Lakan",
    initials: "MR",
    record: "8-1",
    rank: "Champion",
    division: "Welterweight",
    nationality: "Philippines",
    team: "Mandirigma Lab Manila",
    teamShort: "MLM",
    style: "Kali / Panuntukan",
    lastFight: "Win vs Soriano",
    winStreak: 4,
  },
  {
    slug: "ana-bagaybay-santos",
    name: "Ana Santos",
    nickname: "Bagaybay",
    initials: "AS",
    record: "6-0",
    rank: "Champion",
    division: "Flyweight",
    nationality: "Philippines",
    team: "Cebu Blade Athletics",
    teamShort: "CBA",
    style: "Sikaran / Arnis",
    lastFight: "Win vs Villanueva",
    winStreak: 6,
  },
  {
    slug: "ramon-dumog-cruz",
    name: "Ramon Cruz",
    nickname: "Dumog",
    initials: "RC",
    record: "10-3",
    rank: "Champion",
    division: "Middleweight",
    nationality: "Philippines",
    team: "Lakbay Grappling Club",
    teamShort: "LGC",
    style: "Dumog / Buno",
    lastFight: "Win vs Tan",
    winStreak: 3,
  },
  {
    slug: "isabel-diwa-mendoza",
    name: "Isabel Mendoza",
    nickname: "Diwa",
    initials: "IM",
    record: "7-2",
    rank: "#3",
    division: "Flyweight",
    nationality: "Philippines",
    team: "Quezon Combat Project",
    teamShort: "QCP",
    style: "Eskrima / Yaw-Yan",
    lastFight: "Win vs Javier",
    winStreak: 2,
  },
  {
    slug: "ilia-navarro-kalasag",
    name: "Ilia Navarro",
    nickname: "Kalasag",
    initials: "IN",
    record: "9-0",
    rank: "Champion",
    division: "Lightweight",
    nationality: "Philippines",
    team: "Cebu Blade Athletics",
    teamShort: "CBA",
    style: "Sikaran / Kali",
    lastFight: "Win vs Flores",
    winStreak: 9,
  },
  {
    slug: "gabriel-datu-hammer",
    name: "Gabriel Datu",
    nickname: "The Hammer",
    initials: "GD",
    record: "11-1",
    rank: "Champion",
    division: "Heavyweight",
    nationality: "Philippines",
    team: "Manila Combat Lab",
    teamShort: "MCL",
    style: "Dumog / Kali",
    lastFight: "Win vs Alvarez",
    winStreak: 5,
  },
];

export const videoCategories = [
  {
    id: "highlights",
    label: "Fight Highlights",
    videos: [
      { title: "Reyes Retains Welterweight Gold", fighter: "Miguel Reyes", duration: "4:12", tone: "from-red-700 via-zinc-950 to-black" },
      { title: "Santos vs Mendoza Full Sequence", fighter: "Ana Santos", duration: "6:08", tone: "from-zinc-950 via-red-900 to-black" },
      { title: "Night of Blades Main Event", fighter: "Juego Todo", duration: "8:44", tone: "from-black via-red-950 to-zinc-900" },
    ],
  },
  {
    id: "knockouts",
    label: "Knockouts",
    videos: [
      { title: "Spinning Back Elbow Finish", fighter: "Isabel Mendoza", duration: "0:42", tone: "from-red-800 via-black to-red-950" },
      { title: "Stick Disarm to Knockout", fighter: "Kenji Sato", duration: "1:05", tone: "from-zinc-900 via-red-800 to-black" },
      { title: "Clinch Dump & Ground Finish", fighter: "Ramon Cruz", duration: "1:18", tone: "from-black via-zinc-900 to-red-900" },
    ],
  },
  {
    id: "techniques",
    label: "Techniques",
    videos: [
      { title: "Doble Baston Entry Patterns", fighter: "LATAYANOLOGY", duration: "5:30", tone: "from-red-950 via-black to-zinc-900" },
      { title: "Weapon-to-Empty-Hand Transitions", fighter: "Mandirigma Lab", duration: "7:12", tone: "from-zinc-950 via-red-950 to-black" },
      { title: "Panuntukan Angle Cutting", fighter: "Miguel Reyes", duration: "4:55", tone: "from-black via-red-900 to-zinc-950" },
    ],
  },
  {
    id: "stories",
    label: "Athlete Stories",
    videos: [
      { title: "Road to Ascension Manila", fighter: "Miguel Reyes", duration: "12:04", tone: "from-red-900 via-black to-yellow-950" },
      { title: "Cebu Blade Camp Documentary", fighter: "Ana Santos", duration: "9:48", tone: "from-zinc-950 via-red-900 to-black" },
      { title: "From Dumog to Champion", fighter: "Ramon Cruz", duration: "11:22", tone: "from-black via-red-950 to-zinc-900" },
    ],
  },
];

export const heritageTimeline = [
  {
    era: "Ancient Warriors",
    period: "Pre-Colonial Era",
    description: "Tribal combat systems forged in island warfare — blade intelligence, ambush tactics, and warrior culture.",
    accent: "from-red-900 via-[#990000] to-transparent",
  },
  {
    era: "Tribal Combat",
    period: "Indigenous Systems",
    description: "Regional fighting traditions preserved through ritual, mentorship, and battlefield necessity across the archipelago.",
    accent: "from-orange-900 via-red-900 to-transparent",
  },
  {
    era: "Kali",
    period: "Blade Mastery",
    description: "Flow, angles, and live-blade timing evolve into structured combat science passed through generations.",
    accent: "from-red-800 via-[#990000] to-transparent",
  },
  {
    era: "Eskrima",
    period: "Stick & Blade",
    description: "Stick fighting systems refined for speed, rhythm, and disarming — the foundation of modern FMA competition.",
    accent: "from-red-700 via-red-950 to-transparent",
  },
  {
    era: "Arnis",
    period: "National Identity",
    description: "Filipino martial arts recognized as national sport — standardized for schools, tournaments, and global export.",
    accent: "from-[#FF1010] via-[#990000] to-transparent",
  },
  {
    era: "Juego Todo",
    period: "Modern Era",
    description: "Weaponized combat enters the cage — professional rules, verified rankings, and broadcast-grade championship sport.",
    accent: "from-[#FF1010] via-yellow-600 to-transparent",
  },
];

export const sponsorTiers = [
  {
    name: "Global Partner",
    partners: ["FightCast Global", "Apex Broadcast", "Pacific Fight Media"],
  },
  {
    name: "Official Partner",
    partners: ["RingSide Network", "Manila Sports TV", "Combat Stream PH"],
  },
  {
    name: "Equipment Partner",
    partners: ["JT Live", "Arena Vision", "Mandirigma Gear"],
  },
];

export const systems = [
  {
    name: "Arnis",
    text: "Weapon discipline, angles, rhythm, and live combat timing.",
  },
  {
    name: "Eskrima",
    text: "Blade and stick intelligence adapted for broadcast-ready bouts.",
  },
  {
    name: "Kali",
    text: "Fluid transitions across weapon, empty hand, and clinch ranges.",
  },
  {
    name: "Panuntukan",
    text: "Filipino boxing with elbows, limb destructions, and dirty boxing craft.",
  },
  {
    name: "Sikaran",
    text: "Kicking range, footwork, sweeps, and explosive Filipino striking.",
  },
  {
    name: "Dumog",
    text: "Clinch control, off-balancing, and pressure fighting.",
  },
  {
    name: "Buno",
    text: "Native wrestling entries, takedowns, rides, and pins.",
  },
  {
    name: "Yaw-Yan",
    text: "High-impact striking lineage with angular kicks and knockout intent.",
  },
];

export const fighters: Fighter[] = [
  {
    slug: "miguel-lakan-reyes",
    name: "Miguel Reyes",
    nickname: "Lakan",
    style: "Kali / Panuntukan",
    gym: "Mandirigma Lab Manila",
    record: "8-1",
    rank: "Champion",
    division: "Welterweight",
    highlight: "Southpaw pressure fighter with ruthless hand-trapping entries.",
  },
  {
    slug: "ana-bagaybay-santos",
    name: "Ana Santos",
    nickname: "Bagaybay",
    style: "Sikaran / Arnis",
    gym: "Cebu Blade Athletics",
    record: "6-0",
    rank: "#1",
    division: "Flyweight",
    highlight: "Switch-stance kicker with championship pace and sharp counters.",
  },
  {
    slug: "ramon-dumog-cruz",
    name: "Ramon Cruz",
    nickname: "Dumog",
    style: "Dumog / Buno",
    gym: "Lakbay Grappling Club",
    record: "10-3",
    rank: "#2",
    division: "Middleweight",
    highlight: "Clinch specialist who turns every exchange into a takedown threat.",
  },
  {
    slug: "isabel-diwa-mendoza",
    name: "Isabel Mendoza",
    nickname: "Diwa",
    style: "Eskrima / Yaw-Yan",
    gym: "Quezon Combat Project",
    record: "7-2",
    rank: "#3",
    division: "Strawweight",
    highlight: "Explosive angle cutter with spinning attacks and fearless pace.",
  },
];

export const events: Event[] = [
  {
    slug: "barrio-brawls",
    title: "Juego Todo: Barrio Brawls",
    date: barrioBrawlsEvent.target,
    venue: barrioBrawlsEvent.venue,
    city: "Philippines",
    status: "Upcoming",
    mainEvent: "Flagship hybrid FMA card",
    posterTone: "from-red-950 via-black to-zinc-950",
    bouts: ["Main card TBA", "Regional qualifiers", "Amateur showcase"],
    isChampionship: true,
  },
  {
    slug: "jt-ascension-manila",
    title: "Juego Todo: Ascension Manila",
    date: "2026-08-22T19:00:00+08:00",
    venue: "Mall of Asia Arena",
    city: "Pasay, Philippines",
    status: "Upcoming",
    mainEvent: "Reyes vs Cruz - Welterweight Title",
    posterTone: "from-red-700 via-zinc-950 to-yellow-900",
    bouts: ["Santos vs Mendoza", "Dela Torre vs Bautista", "Lim vs Navarro"],
    isChampionship: true,
    isLive: true,
  },
  {
    slug: "jt-proving-ground-cebu",
    title: "Juego Todo: Proving Ground Cebu",
    date: "2026-10-10T18:30:00+08:00",
    venue: "Waterfront Cebu City",
    city: "Cebu, Philippines",
    status: "Upcoming",
    mainEvent: "Santos vs Villanueva - Flyweight Grand Prix",
    posterTone: "from-zinc-950 via-red-950 to-black",
    bouts: ["Mendoza vs Aquino", "Garcia vs Flores", "Tan vs Uy"],
    isChampionship: true,
  },
  {
    slug: "jt-night-of-blades",
    title: "Juego Todo: Night of Blades",
    date: "2026-04-18T19:00:00+08:00",
    venue: "Araneta Coliseum",
    city: "Quezon City, Philippines",
    status: "Results",
    mainEvent: "Reyes def. Soriano by TKO R3",
    posterTone: "from-black via-zinc-900 to-red-950",
    bouts: ["Cruz def. Ramos", "Mendoza def. Javier", "Bautista def. Lee"],
    isChampionship: true,
  },
];

export const mediaReels = [
  "Title fight finishes",
  "Inside the Mandirigma camp",
  "Weapon-to-empty-hand breakdown",
  "Road to Ascension Manila",
];

export const heroMainStats = [
  { value: "50+", label: "Professional Fighters" },
  { value: "500+", label: "Amateur Fighters" },
  { value: "100+", label: "Matches" },
  { value: "100+", label: "Styles" },
  { value: "18", label: "Regions" },
  { value: "20+", label: "Juego Todo PH" },
  { value: "58+", label: "Juego Todo Int." },
] as const;

/** @deprecated Use heroMainStats for homepage hero */
export const heroTrustStats = heroMainStats;

export type MediaPartner = {
  name: string;
  logoSrc: string;
};

export const mediaPartners: MediaPartner[] = [
  { name: "Manila Bulletin", logoSrc: "/as-seen-on/manila-bulletin.png" },
  { name: "Powcast", logoSrc: "/as-seen-on/powcast.png" },
  { name: "GMA Sports", logoSrc: "/as-seen-on/gma-sports.png" },
  { name: "Black Belt Magazine", logoSrc: "/as-seen-on/black-belt-magazine.png" },
  { name: "Philippine Daily Inquirer", logoSrc: "/as-seen-on/daily-inquirer.png" },
  { name: "Games and Amusements Board", logoSrc: "/as-seen-on/games-and-amusements-board.png" },
];

export const partners = [
  "Official apparel",
  "Broadcast media",
  "Partner gyms",
  "Equipment sponsors",
  "Event venues",
  "Wellness partners",
];

export { scheduledSeminars, seminarTopics } from "@/data/seminars";

export { shopProducts, getShopProduct, type ShopProduct } from "@/data/shop";

export const pageContent = {
  events: {
    eyebrow: "Fight Calendar",
    title: "Premium Events Built For Arenas, Streams, And Global Fight Weeks",
    intro:
      "Upcoming cards, countdowns, posters, bout lineups, results, and highlight-ready media blocks for every Juego Todo event.",
  },
  media: {
    eyebrow: "Video First",
    title: "Highlight Reels, Camp Features, And Social-Ready Clips",
    intro:
      "A cinematic media hub for finishes, documentary features, livestream previews, and partner content.",
  },
  shop: {
    eyebrow: "Fighter Equipment Armory",
    title: "Official Gear Connected To Athlete Profiles",
    intro:
      "Premium Juego Todo merchandise, competition equipment, championship collectibles, and digital training products — integrated with member profiles, athlete discounts, and order history.",
  },
  registration: {
    eyebrow: "Official Funnel",
    title: "Register Fighters, Gyms, Officials, And Event Applicants",
    intro:
      "A clean intake experience ready to connect with forms, CRM, payment, waivers, and athlete verification.",
  },
  partnerships: {
    eyebrow: "Partnerships",
    title: "Partner With The Future Of Filipino Combat Sports",
    intro:
      "Access athletes, gyms, livestream audiences, events, seminars, and national competition circuits through JTGC commercial partnerships.",
  },
  partners: {
    eyebrow: "Partnerships",
    title: "Partner With The Future Of Filipino Combat Sports",
    intro:
      "Access athletes, gyms, livestream audiences, events, seminars, and national competition circuits through JTGC commercial partnerships.",
  },
  teams: {
    eyebrow: "JTGC Team Ecosystem",
    title: "Official Teams, Affiliated Gyms, And Regional Squads",
    intro:
      "Browse team rankings, official squads, affiliated gyms, regional teams, and coaches — connected to the JTGC athlete database and championship history.",
  },
  "juego-todo-seminars": {
    eyebrow: "Training & Education",
    title: "Juego Todo Seminars Calendar And Registration",
    intro:
      "Browse upcoming paid and free seminars focused on Disarming, Striking, Legs, Grappling, and official Juego Todo rules — built for first-time athletes, parents, coaches, and gym teams.",
  },
  consultation: {
    eyebrow: "Consultation Atelier",
    title: "Guidance For Every Chapter Of Life",
    intro:
      "Explore a refined suite of Feng Shui, BaZi, destiny, and timing services before continuing to the dedicated booking page.",
  },
  "rules-regulations": {
    eyebrow: "Combat Integrity",
    title: "Rules, Regulations, Safety Standards, And Competition Format",
    intro:
      "A structured rules library for divisions, scoring, equipment, medical checks, fouls, and official procedures.",
  },
  "about-juego-todo": {
    eyebrow: "Leadership & Governance",
    title: "JTGC Organizational Structure",
    intro:
      "The Juego Todo Grand Council (JTGC) governs league operations, athlete safety, regional command, arena standards, and the platform's global expansion.",
  },
  "grand-council": {
    eyebrow: "Leadership & Governance",
    title: "JTGC Organizational Structure",
    intro:
      "Supreme Grand Councils, elders, advisers, regional commanders, arena operations, and administrative leadership guiding Juego Todo worldwide.",
  },
  "fma-lineage": {
    eyebrow: "Filipino Martial Arts",
    title: "FMA Lineage Supporting Juego Todo",
    intro:
      "Explore the traditional Filipino martial arts lineages that form the foundation of Juego Todo's rules, seminars, and competition formats.",
  },
  contact: {
    eyebrow: "Connect",
    title: "Reach The Juego Todo Team",
    intro:
      "Contact channels for fight operations, athlete management, sponsorship, press, and gym affiliation.",
  },
  privacy: {
    eyebrow: "Legal & Compliance",
    title: "Privacy Policy",
    intro:
      "How Juego Todo collects, uses, stores, and protects personal data across registrations, newsletters, analytics, and LATAYANOLOGY.",
  },
  terms: {
    eyebrow: "Legal & Compliance",
    title: "Terms of Service",
    intro:
      "Terms governing website usage, platform access, intellectual property, user conduct, and liability across Juego Todo services.",
  },
  cookies: {
    eyebrow: "Legal & Compliance",
    title: "Cookie Policy",
    intro:
      "How Juego Todo uses cookies, analytics tools, and tracking technologies across the combat sports platform.",
  },
  disclaimer: {
    eyebrow: "Legal & Compliance",
    title: "Disclaimer",
    intro:
      "Important notices regarding information accuracy, rankings, schedules, athlete records, and platform content.",
  },
  "broadcast-rights": {
    eyebrow: "Legal & Compliance",
    title: "Broadcast Rights Policy",
    intro:
      "Rights and restrictions governing fight footage, livestreams, photography, highlight packages, and partner broadcasts.",
  },
  "fighter-agreement": {
    eyebrow: "Athlete Compliance",
    title: "Fighter Registration Agreement",
    intro:
      "Terms covering athlete eligibility, conduct, rankings participation, suspensions, and medical requirements.",
  },
  waiver: {
    eyebrow: "Athlete Compliance",
    title: "Waiver & Release",
    intro:
      "Release terms for seminars, sparring, tryouts, tournaments, and sanctioned Juego Todo competition activity.",
  },
  "safety-policy": {
    eyebrow: "Athlete Compliance",
    title: "Medical & Safety Policy",
    intro:
      "Medical examinations, equipment standards, injury protocols, and safety requirements for Juego Todo athletes and events.",
  },
  "media-accreditation": {
    eyebrow: "Media & Broadcast",
    title: "Media Accreditation",
    intro:
      "Press credentialing, event access tiers, photography permissions, and media compliance for Juego Todo coverage.",
  },
  sponsorships: {
    eyebrow: "Business & Partners",
    title: "Sponsorship Policy",
    intro:
      "Partnership requirements, advertising rules, brand guidelines, and sponsor integration standards for Juego Todo.",
  },
  latayanology: {
    eyebrow: "Athlete Intelligence",
    title: "LATAYANOLOGY",
    intro:
      "The official athlete intelligence platform of Juego Todo — verified rankings, records, teams, and performance analytics for the global JTGC roster.",
  },
};

export type PageSlug = keyof typeof pageContent;
