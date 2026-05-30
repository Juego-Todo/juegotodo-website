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
    label: "About",
    href: "/about-juego-todo",
    children: [
      { label: "Partnerships", href: "/partnerships" },
      { label: "Rules & Regulations", href: "/rules-regulations" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [{ label: "Juego Todo Seminars", href: "/juego-todo-seminars" }],
  },
  {
    label: "Fighters",
    href: "/fighters",
    children: [
      { label: "Rankings", href: "/rankings" },
      { label: "Registration", href: "/registration" },
    ],
  },
  { label: "Shop", href: "/shop" },
  { label: "Sign Up / Login", href: "/registration", cta: true },
];

export const stats = [
  { label: "FMA Systems", value: "08" },
  { label: "Fight Divisions", value: "12" },
  { label: "Partner Gyms", value: "40+" },
  { label: "Broadcast Reach", value: "Global" },
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
    slug: "jt-ascension-manila",
    title: "Juego Todo: Ascension Manila",
    date: "2026-08-22T19:00:00+08:00",
    venue: "Mall of Asia Arena",
    city: "Pasay, Philippines",
    status: "Upcoming",
    mainEvent: "Reyes vs Cruz - Welterweight Title",
    posterTone: "from-red-700 via-zinc-950 to-yellow-900",
    bouts: ["Santos vs Mendoza", "Dela Torre vs Bautista", "Lim vs Navarro"],
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
  },
];

export const mediaReels = [
  "Title fight finishes",
  "Inside the Mandirigma camp",
  "Weapon-to-empty-hand breakdown",
  "Road to Ascension Manila",
];

export const mediaPartners = [
  "FightCast Global",
  "RingSide Network",
  "Manila Sports TV",
  "Combat Stream PH",
  "Apex Broadcast",
  "JT Live",
  "Pacific Fight Media",
  "Arena Vision",
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
  fighters: {
    eyebrow: "Athlete Roster",
    title: "Fighter Profiles With Style, Record, Gym, And Highlights",
    intro:
      "A scalable fighter system prepared for CMS-backed profiles, media reels, rankings, and division pages.",
  },
  rankings: {
    eyebrow: "Official Standings",
    title: "Champion Banners And Broadcast-Ready Ranking Tables",
    intro:
      "Clear division hierarchy, champion callouts, and contender cards designed for weekly updates.",
  },
  media: {
    eyebrow: "Video First",
    title: "Highlight Reels, Camp Features, And Social-Ready Clips",
    intro:
      "A cinematic media hub for finishes, documentary features, livestream previews, and partner content.",
  },
  shop: {
    eyebrow: "Official Store",
    title: "Juego Todo Gear, Sticks, And Fight Equipment",
    intro:
      "Placeholder shop for official Arnis sticks, protective gear, apparel, and training accessories aligned with Juego Todo competition standards.",
  },
  registration: {
    eyebrow: "Official Funnel",
    title: "Register Fighters, Gyms, Officials, And Event Applicants",
    intro:
      "A clean intake experience ready to connect with forms, CRM, payment, waivers, and athlete verification.",
  },
  partnerships: {
    eyebrow: "Brand Growth",
    title: "Sponsor, Gym, Media, And Broadcast Partnership System",
    intro:
      "A premium partner destination for commercial sponsors, affiliated gyms, media teams, and livestream collaborators.",
  },
  "juego-todo-seminars": {
    eyebrow: "Training & Education",
    title: "Juego Todo Seminars Calendar And Registration",
    intro:
      "Browse upcoming paid and free seminars focused on Disarming, Striking, Legs, Grappling, and official Juego Todo rules — built for first-time athletes, parents, coaches, and gym teams.",
  },
  "rules-regulations": {
    eyebrow: "Combat Integrity",
    title: "Rules, Regulations, Safety Standards, And Competition Format",
    intro:
      "A structured rules library for divisions, scoring, equipment, medical checks, fouls, and official procedures.",
  },
  "about-juego-todo": {
    eyebrow: "The Mission",
    title: "Modernizing Filipino Martial Arts For A Global Fight Audience",
    intro:
      "Juego Todo elevates Arnis, Eskrima, Kali, Panuntukan, Sikaran, Dumog, Buno, and Yaw-Yan into a modern combat sports platform.",
  },
  contact: {
    eyebrow: "Connect",
    title: "Reach The Juego Todo Team",
    intro:
      "Contact channels for fight operations, athlete management, sponsorship, press, and gym affiliation.",
  },
};

export type PageSlug = keyof typeof pageContent;
