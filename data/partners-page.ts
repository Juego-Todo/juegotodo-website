export type PartnerCategory = {
  id: string;
  title: string;
  description: string;
  partners: string[];
};

export const partnershipStats = [
  { label: "Average Event Viewership", value: "1.2M", suffix: "+" },
  { label: "Social Reach", value: "240K", suffix: "+" },
  { label: "Affiliated Gyms", value: 32, suffix: "+" },
  { label: "Broadcast Markets", value: 11, suffix: "+" },
];

export const whyPartnerPoints = [
  {
    title: "Global Combat Sports Platform",
    text: "Juego Todo is the world's first weaponized combat league — built for broadcast, merchandise, and live event scale.",
  },
  {
    title: "Verified Athlete Database",
    text: "Partners integrate with rankings, fighter profiles, team ecosystems, and LATAYANOLOGY performance data.",
  },
  {
    title: "Premium Fan Demographics",
    text: "Engaged martial arts audiences across the Philippines and diaspora markets with high event attendance intent.",
  },
  {
    title: "Multi-Channel Activation",
    text: "Arena branding, broadcast integrations, digital content, shop placements, and seminar partnerships.",
  },
];

export const currentPartnerLogos = [
  "FightCast Global",
  "RingSide Network",
  "Manila Sports TV",
  "Combat Stream PH",
  "Apex Broadcast",
  "SteelGuard Equipment",
  "Pacific Wellness Co.",
  "Arena Pro Venues",
];

export const partnerCategories: PartnerCategory[] = [
  {
    id: "commercial",
    title: "Commercial Sponsors",
    description: "Title sponsors, presenting partners, and brand integrations across JTGC events and digital platforms.",
    partners: ["SteelGuard Equipment", "Pacific Wellness Co.", "Arena Pro Venues"],
  },
  {
    id: "broadcast",
    title: "Broadcast Partners",
    description: "Livestream, television, and international distribution partners for fight night coverage.",
    partners: ["FightCast Global", "RingSide Network", "Manila Sports TV", "Combat Stream PH"],
  },
  {
    id: "equipment",
    title: "Equipment Partners",
    description: "Official sticks, protective gear, training weapons, and competition equipment suppliers.",
    partners: ["SteelGuard Equipment", "JT Official Gear Lab"],
  },
  {
    id: "apparel",
    title: "Official Apparel Partners",
    description: "Fight kits, corner wear, fan merchandise, and team uniform collaborations.",
    partners: ["JT Performance Wear", "Combat Thread Co."],
  },
  {
    id: "wellness",
    title: "Wellness Partners",
    description: "Recovery, sports medicine, nutrition, and athlete performance support programs.",
    partners: ["Pacific Wellness Co.", "Revive Sports Clinic"],
  },
  {
    id: "venue",
    title: "Venue Partners",
    description: "Arenas, training facilities, and regional host venues for JTGC cards and seminars.",
    partners: ["Arena Pro Venues", "Manila Combat Arena", "Cebu Fight Dome"],
  },
  {
    id: "media",
    title: "Media Partners",
    description: "Press, content creators, documentary teams, and highlight distribution collaborators.",
    partners: ["Apex Broadcast", "Combat Media PH", "FightWeek Studios"],
  },
];

export const audienceReach = [
  { label: "Monthly Digital Impressions", value: "8.5M" },
  { label: "Registered Platform Members", value: "18K+" },
  { label: "Event Attendance (Annual)", value: "45K+" },
  { label: "Shop Conversion Rate", value: "4.2%" },
];

export const partnershipFaq = [
  {
    question: "What partnership tiers does Juego Todo offer?",
    answer:
      "Title, presenting, official product, broadcast, venue, and regional affiliate tiers — each with custom activation packages.",
  },
  {
    question: "Can partners integrate with the JTGC shop and athlete database?",
    answer:
      "Yes. Equipment, apparel, and wellness partners can appear in the official store, event check-in flows, and athlete profiles.",
  },
  {
    question: "How are broadcast rights handled?",
    answer:
      "Broadcast partners receive defined territory rights, logo placements, and content usage terms outlined in the Broadcast Rights Policy.",
  },
  {
    question: "What is the typical partnership timeline?",
    answer:
      "Initial discovery calls happen within 5 business days. Seasonal activations are planned 90–120 days before flagship events.",
  },
];
