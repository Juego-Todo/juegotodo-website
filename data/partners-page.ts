export type PartnerCategoryCard = {
  id: string;
  title: string;
  description: string;
  highlights: string[];
};

export type SponsorshipOpportunity = {
  title: string;
  description: string;
};

export const partnershipMetrics = [
  { value: "550+", label: "Verified Athletes" },
  { value: "58+", label: "Partner Gyms" },
  { value: "18", label: "Regions" },
  { value: "100+", label: "Matches" },
  { value: "50,000+", label: "Community Reach" },
] as const;

export const partnerCategoryCards: PartnerCategoryCard[] = [
  {
    id: "broadcast",
    title: "Broadcast Partners",
    description: "Own live distribution across fight nights, highlight packages, and international reach.",
    highlights: ["Livestream rights", "Event coverage", "Media distribution"],
  },
  {
    id: "equipment",
    title: "Equipment Partners",
    description: "Become the official supplier behind weapon rounds, protective gear, and competition check-in.",
    highlights: ["Official equipment", "Training gear", "Competition supplies"],
  },
  {
    id: "commercial",
    title: "Commercial Sponsors",
    description: "Integrate your brand across arenas, digital campaigns, athlete content, and flagship events.",
    highlights: ["Brand integrations", "Event activations", "Digital campaigns"],
  },
  {
    id: "gyms",
    title: "Affiliated Gyms",
    description: "Join the JTGC gym network with certification pathways, regional events, and athlete pipelines.",
    highlights: ["Gym certification", "Regional partnerships", "Athlete pipelines"],
  },
  {
    id: "media",
    title: "Media Partners",
    description: "Collaborate on press coverage, documentary content, podcasts, and broadcast-ready storytelling.",
    highlights: ["Press access", "Content collaborations", "Highlight distribution"],
  },
];

export const sponsorshipOpportunities: SponsorshipOpportunity[] = [
  {
    title: "Event Sponsor",
    description: "Own a major Juego Todo championship card with arena branding, broadcast mentions, and VIP hospitality.",
  },
  {
    title: "Athlete Sponsor",
    description: "Support athlete development, corner branding, and verified profile placement across LATAYANOLOGY.",
  },
  {
    title: "Broadcast Sponsor",
    description: "Reach livestream audiences, pre-fight programming, and replay distribution across partner networks.",
  },
  {
    title: "Equipment Sponsor",
    description: "Become the official equipment supplier for sanctioned bouts, seminars, and gym certification programs.",
  },
];

export const whyPartnerBenefits = [
  "National Events",
  "Livestream Coverage",
  "Verified Athletes",
  "Growing Community",
  "Exclusive Category Rights",
] as const;

export const currentPartnerLogos = [
  "FightCast Global",
  "RingSide Network",
  "Manila Sports TV",
  "Combat Stream PH",
  "Arena Vision",
  "Apex Broadcast",
  "Pacific Fight Media",
  "Sports5",
] as const;

export const partnershipTypes = [
  "Commercial Sponsor",
  "Equipment Partner",
  "Broadcast Partner",
  "Gym Affiliate",
  "Media Partner",
  "Investor",
  "Other",
] as const;

export const partnershipDeckMailto =
  "mailto:partners@juegotodo.com?subject=JTGC%20Partnership%20Deck%20Request";

export const partnershipCallMailto =
  "mailto:partners@juegotodo.com?subject=Schedule%20A%20Partnership%20Call";
