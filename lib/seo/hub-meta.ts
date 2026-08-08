import type { PageSlug } from "@/data/site";

/** SEO-optimized titles/descriptions for hub routes (display copy stays in pageContent). */
export const hubSeo: Record<
  PageSlug,
  { title: string; description: string; keywords?: string[]; image?: string }
> = {
  events: {
    title: "Upcoming Events & Fight Cards",
    description:
      "Browse official Juego Todo fight cards, venues, countdowns, and ticket links for upcoming Filipino combat sports events in the Philippines.",
    keywords: ["Juego Todo events", "fight cards Philippines", "UGB46"],
    image: "/events/juego-todo-sta-lucia-barrio-brawls.png",
  },
  media: {
    title: "News, Media Clips & Goatism Podcast",
    description:
      "Official Juego Todo media — fight news, YouTube highlights, Barrio Brawls clips, and Goatism podcast episodes.",
    keywords: [
      "Juego Todo news",
      "fight highlights",
      "Goatism podcast",
      "Barrio Brawls",
      "YouTube clips",
    ],
    image: "/juego-todo-event-background.png",
  },
  shop: {
    title: "Official Shop — Gear, Merch & Event Tickets",
    description:
      "Shop official Juego Todo competition gear, apparel, championship collectibles, digital products, and event tickets.",
    keywords: ["Juego Todo shop", "Arnis gear", "fight tickets"],
    image: "/shop-hero-banner.png",
  },
  registration: {
    title: "Athlete, Gym & Official Registration",
    description:
      "Register as a fighter, gym, coach, or official with Juego Todo. Start your JTGC license and competition pathway.",
    keywords: ["fighter registration", "JTGC license"],
  },
  partnerships: {
    title: "Partnerships & Sponsorship Opportunities",
    description:
      "Partner with Juego Todo for athlete access, livestream audiences, national events, seminars, and commercial sponsorships.",
    keywords: ["combat sports sponsorship Philippines"],
  },
  partners: {
    title: "Become a Juego Todo Partner",
    description:
      "Access JTGC athletes, gyms, events, and audiences through official Juego Todo partnership programs.",
    keywords: ["Juego Todo partners"],
  },
  teams: {
    title: "Official Teams, Gyms & Regional Squads",
    description:
      "Explore JTGC official teams, affiliated gyms, regional squads, coaches, and championship records across the Philippines.",
    keywords: ["Juego Todo teams", "FMA gyms"],
  },
  "juego-todo-seminars": {
    title: "Seminars Calendar & Registration",
    description:
      "Join Juego Todo seminars on disarming, striking, grappling, and official rules — for athletes, parents, coaches, and gyms.",
    keywords: ["Arnis seminar", "FMA training Philippines"],
  },
  consultation: {
    title: "Consultation Services",
    description:
      "Book Feng Shui, BaZi, destiny, and timing consultation services through the Juego Todo consultation atelier.",
  },
  "rules-regulations": {
    title: "Official Rules, Safety & Competition Format",
    description:
      "Read official Juego Todo rules covering divisions, scoring, equipment, medical checks, fouls, and competition procedures.",
    keywords: ["Juego Todo rules", "Arnis competition rules"],
  },
  "about-juego-todo": {
    title: "About Juego Todo & JTGC Leadership",
    description:
      "Learn how the Juego Todo Grand Council governs Filipino weaponized combat sports, athlete safety, and global expansion.",
    keywords: ["what is Juego Todo", "JTGC"],
  },
  "grand-council": {
    title: "Juego Todo Grand Council (JTGC)",
    description:
      "Meet the JTGC leadership guiding league operations, regional command, arena standards, and athlete governance worldwide.",
  },
  "fma-lineage": {
    title: "Filipino Martial Arts Lineage",
    description:
      "Explore the traditional FMA lineages — Arnis, Eskrima, Kali, and more — that shape Juego Todo rules and seminars.",
    keywords: ["Filipino Martial Arts lineage", "Arnis Eskrima Kali"],
  },
  contact: {
    title: "Contact Juego Todo",
    description:
      "Reach Juego Todo for fight operations, athlete management, sponsorship, press, and gym affiliation inquiries.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How Juego Todo collects, uses, stores, and protects personal data across registrations, shop orders, and LATAYANOLOGY.",
  },
  terms: {
    title: "Terms of Service",
    description:
      "Terms governing Juego Todo website usage, platform access, intellectual property, user conduct, and liability.",
  },
  cookies: {
    title: "Cookie Policy",
    description:
      "How Juego Todo uses cookies, analytics, and tracking technologies across the combat sports platform.",
  },
  disclaimer: {
    title: "Disclaimer",
    description:
      "Important notices regarding rankings, schedules, athlete records, and content accuracy on the Juego Todo platform.",
  },
  "broadcast-rights": {
    title: "Broadcast Rights Policy",
    description:
      "Rights and restrictions for Juego Todo fight footage, livestreams, photography, highlights, and partner broadcasts.",
  },
  "fighter-agreement": {
    title: "Fighter Registration Agreement",
    description:
      "Athlete eligibility, conduct, rankings participation, suspensions, and medical requirements for Juego Todo fighters.",
  },
  waiver: {
    title: "Waiver & Release",
    description:
      "Release terms for Juego Todo seminars, sparring, tryouts, tournaments, and sanctioned competition activity.",
  },
  "safety-policy": {
    title: "Medical & Safety Policy",
    description:
      "Medical exams, equipment standards, injury protocols, and safety requirements for Juego Todo athletes and events.",
  },
  "media-accreditation": {
    title: "Media Accreditation",
    description:
      "Press credentials, event access tiers, photography permissions, and media compliance for Juego Todo coverage.",
  },
  sponsorships: {
    title: "Sponsorship Policy",
    description:
      "Partnership requirements, advertising rules, brand guidelines, and sponsor standards for Juego Todo events.",
  },
  latayanology: {
    title: "LATAYANOLOGY — Athlete Rankings & Records",
    description:
      "Official JTGC athlete intelligence: verified rankings, fight records, teams, and performance analytics.",
    keywords: ["fighter rankings", "LATAYANOLOGY", "JTGC roster"],
  },
};
