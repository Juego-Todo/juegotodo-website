export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPage = {
  slug: string;
  category: "legal" | "athletes" | "media" | "platform" | "business";
  lastUpdated: string;
  metaDescription: string;
  sections: LegalSection[];
  relatedLinks: { label: string; href: string }[];
};

const LAST_UPDATED = "June 17, 2026";

export const legalPages: Record<string, LegalPage> = {
  privacy: {
    slug: "privacy",
    category: "legal",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "How Juego Todo collects, uses, stores, and protects personal data across registrations, newsletters, and platform services.",
    relatedLinks: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "Juego Todo Combat Sports Platform (\"Juego Todo,\" \"we,\" \"us\") respects your privacy and is committed to protecting personal information collected through our website, registration systems, newsletters, and LATAYANOLOGY athlete database.",
          "This Privacy Policy explains what data we collect, why we collect it, how we use it, and the choices available to you.",
        ],
      },
      {
        id: "information-collected",
        title: "Information We Collect",
        bullets: [
          "Account and registration data including name, email, gym affiliation, and athlete profile details",
          "Newsletter and marketing signup information",
          "Contact form submissions and partnership inquiries",
          "Event registration, seminar enrollment, and waiver acknowledgments",
          "Usage analytics such as pages visited, device type, and referral source",
          "Cookies and similar technologies as described in our Cookie Policy",
        ],
      },
      {
        id: "how-we-use",
        title: "How We Use Information",
        bullets: [
          "Operate fighter registration, rankings, and LATAYANOLOGY verification workflows",
          "Send event announcements, rankings updates, and broadcast alerts when you opt in",
          "Respond to inquiries from athletes, gyms, media, and sponsors",
          "Improve platform performance, security, and user experience",
          "Comply with legal obligations and enforce our Terms of Service",
        ],
      },
      {
        id: "sharing",
        title: "How We Share Information",
        paragraphs: [
          "We do not sell personal data. We may share information with service providers that help us operate the platform, official broadcast partners under contract, affiliated gyms where relevant to athlete verification, and authorities when required by law.",
        ],
      },
      {
        id: "retention-rights",
        title: "Retention & Your Rights",
        bullets: [
          "Request access, correction, or deletion of your personal data",
          "Withdraw marketing consent at any time",
          "Object to certain processing where applicable under local law",
          "Contact us at privacy@juegotodo.com for privacy-related requests",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    category: "legal",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Terms governing use of the Juego Todo website, athlete platform, rankings, media assets, and league services.",
    relatedLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Fighter Agreement", href: "/fighter-agreement" },
    ],
    sections: [
      {
        id: "acceptance",
        title: "Acceptance of Terms",
        paragraphs: [
          "By accessing or using juegotodo.com and related Juego Todo digital services, you agree to these Terms of Service. If you do not agree, do not use the platform.",
        ],
      },
      {
        id: "permitted-use",
        title: "Permitted Use",
        bullets: [
          "Use the platform for lawful purposes related to Juego Todo events, athletes, rankings, and media",
          "Provide accurate information during registration and profile updates",
          "Respect intellectual property belonging to Juego Todo, athletes, partners, and broadcasters",
          "Refrain from scraping, reverse engineering, or disrupting platform systems",
        ],
      },
      {
        id: "prohibited-conduct",
        title: "Prohibited Conduct",
        bullets: [
          "Misrepresenting affiliation with Juego Todo, JTGC, or official partners",
          "Uploading malicious code or attempting unauthorized access",
          "Harassing athletes, officials, staff, or other users",
          "Republishing rankings, footage, or proprietary data without authorization",
        ],
      },
      {
        id: "ip-liability",
        title: "Intellectual Property & Liability",
        paragraphs: [
          "All trademarks, logos, broadcast packages, rankings systems, and LATAYANOLOGY analytics frameworks are owned by or licensed to Juego Todo. To the fullest extent permitted by law, Juego Todo is not liable for indirect or consequential damages arising from platform use. Event participation remains subject to separate athlete agreements and waivers.",
        ],
      },
    ],
  },
  cookies: {
    slug: "cookies",
    category: "legal",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "How Juego Todo uses cookies, analytics, and tracking technologies across the combat sports platform.",
    relatedLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    sections: [
      {
        id: "what-are-cookies",
        title: "What Are Cookies",
        paragraphs: [
          "Cookies are small text files stored on your device to help websites function, remember preferences, and understand how visitors use the platform.",
        ],
      },
      {
        id: "cookies-we-use",
        title: "Cookies We Use",
        bullets: [
          "Essential cookies required for login, security, and session management",
          "Preference cookies that remember language, region, or display settings",
          "Analytics cookies such as Google Analytics to measure traffic and performance",
          "Marketing cookies such as Meta Pixel when campaign tracking is enabled",
        ],
      },
      {
        id: "your-choices",
        title: "Your Choices",
        bullets: [
          "Adjust browser settings to block or delete cookies",
          "Use opt-out tools provided by analytics and advertising vendors",
          "Note that disabling essential cookies may limit platform functionality",
        ],
      },
    ],
  },
  disclaimer: {
    slug: "disclaimer",
    category: "legal",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Important disclaimers regarding rankings, schedules, athlete data, and informational content on Juego Todo.",
    relatedLinks: [
      { label: "Ranking Methodology", href: "/ranking-methodology" },
      { label: "Safety Policy", href: "/safety-policy" },
    ],
    sections: [
      {
        id: "general",
        title: "General Disclaimer",
        paragraphs: [
          "Information on this website is provided for general league communication and fan engagement. While Juego Todo strives for accuracy, content may contain errors, omissions, or delays.",
        ],
      },
      {
        id: "rankings-events",
        title: "Rankings & Events",
        bullets: [
          "Official rankings may change following sanctioned results and commission review",
          "Event schedules, fight cards, and broadcast times are subject to change",
          "Athlete records displayed on LATAYANOLOGY may be provisional until verified",
          "Historical statistics should not be treated as legal or contractual guarantees",
        ],
      },
      {
        id: "no-advice",
        title: "No Professional Advice",
        paragraphs: [
          "Platform content does not constitute medical, legal, or financial advice. Athletes and gyms should consult qualified professionals regarding training, health, and contracts.",
        ],
      },
    ],
  },
  "broadcast-rights": {
    slug: "broadcast-rights",
    category: "legal",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Broadcast rights, streaming, photography, and fight footage usage policy for Juego Todo events and media partners.",
    relatedLinks: [
      { label: "Media Accreditation", href: "/media-accreditation" },
      { label: "Sponsorship Policy", href: "/sponsorships" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        id: "ownership",
        title: "Ownership of Broadcast Content",
        paragraphs: [
          "All live streams, television broadcasts, highlight packages, event photography, and archival fight footage produced under the Juego Todo brand are protected intellectual property unless explicitly licensed.",
        ],
      },
      {
        id: "restricted-uses",
        title: "Restricted Uses",
        bullets: [
          "Unauthorized rebroadcast, restreaming, or redistribution of live events",
          "Commercial use of fight footage without written license from Juego Todo",
          "Removal or alteration of official broadcast graphics, logos, or watermarks",
          "Use of JTGC or LATAYANOLOGY data overlays in third-party broadcasts without approval",
        ],
      },
      {
        id: "licensing",
        title: "Licensing & Partnerships",
        bullets: [
          "Official broadcast partners receive territorial or platform-specific rights by contract",
          "Highlight clips for news reporting may require media accreditation",
          "License requests should be directed to partners@juegotodo.com",
          "Violation may result in takedown, account suspension, and legal action",
        ],
      },
      {
        id: "fan-content",
        title: "Fan Content Guidelines",
        paragraphs: [
          "Non-commercial fan discussion and limited personal social sharing may be permitted where it does not reproduce full broadcasts or undermine official partner exclusivity. Juego Todo reserves final discretion.",
        ],
      },
    ],
  },
  "fighter-agreement": {
    slug: "fighter-agreement",
    category: "athletes",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Terms governing athlete registration, eligibility, conduct, rankings, suspensions, and medical requirements for Juego Todo competitors.",
    relatedLinks: [
      { label: "Registration", href: "/registration" },
      { label: "Waiver & Release", href: "/waiver" },
      { label: "Safety Policy", href: "/safety-policy" },
    ],
    sections: [
      {
        id: "eligibility",
        title: "Eligibility",
        bullets: [
          "Athletes must meet division age, weight, and experience requirements",
          "Medical clearance and commission eligibility must remain current",
          "False representation of record, nationality, or gym affiliation is prohibited",
          "JTGC may require additional documentation before ranking activation",
        ],
      },
      {
        id: "conduct",
        title: "Conduct & Integrity",
        bullets: [
          "Athletes must comply with Juego Todo rules, JTGC directives, and official decisions",
          "Match fixing, prohibited substances, and unsafe conduct may result in suspension",
          "Social media conduct that damages league integrity may be reviewed by JTGC",
        ],
      },
      {
        id: "rankings",
        title: "Rankings & Records",
        paragraphs: [
          "Participation in Juego Todo events authorizes record publication through LATAYANOLOGY. Rankings movement follows the official Ranking Methodology and may be adjusted after review.",
        ],
      },
      {
        id: "suspension",
        title: "Suspension & Termination",
        bullets: [
          "Temporary suspension for medical, disciplinary, or administrative reasons",
          "Permanent removal for repeated violations or commission rulings",
          "Appeals may be submitted through official JTGC channels",
        ],
      },
    ],
  },
  waiver: {
    slug: "waiver",
    category: "athletes",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Waiver and release terms for Juego Todo seminars, sparring, tryouts, tournaments, and sanctioned competition.",
    relatedLinks: [
      { label: "Fighter Agreement", href: "/fighter-agreement" },
      { label: "Safety Policy", href: "/safety-policy" },
      { label: "Seminars", href: "/juego-todo-seminars" },
    ],
    sections: [
      {
        id: "scope",
        title: "Scope of Waiver",
        paragraphs: [
          "By registering for Juego Todo seminars, sparring sessions, tryouts, tournaments, or sanctioned bouts, participants acknowledge inherent risks associated with martial arts and combat sports activity.",
        ],
      },
      {
        id: "assumption-of-risk",
        title: "Assumption of Risk",
        bullets: [
          "Contact strikes, weapon engagement, takedowns, and conditioning drills",
          "Injury ranging from minor bruising to serious physical harm",
          "Property damage to personal equipment or venue facilities",
        ],
      },
      {
        id: "release",
        title: "Release of Liability",
        paragraphs: [
          "To the fullest extent permitted by law, participants release Juego Todo, JTGC members, partner gyms, officials, venues, and sponsors from claims arising from ordinary negligence related to authorized league activity, except where prohibited by law.",
        ],
      },
      {
        id: "medical",
        title: "Medical Representation",
        bullets: [
          "Participants confirm they are physically fit to participate",
          "Existing injuries or conditions must be disclosed during registration",
          "Emergency medical treatment may be authorized when necessary",
        ],
      },
    ],
  },
  "safety-policy": {
    slug: "safety-policy",
    category: "athletes",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Medical examinations, safety standards, equipment requirements, and injury protocols for Juego Todo athletes and events.",
    relatedLinks: [
      { label: "Rules & Regulations", href: "/rules-regulations" },
      { label: "Waiver & Release", href: "/waiver" },
      { label: "Fighter Agreement", href: "/fighter-agreement" },
    ],
    sections: [
      {
        id: "medical",
        title: "Medical Requirements",
        bullets: [
          "Pre-bout medical examinations administered by approved physicians",
          "Weight certification and hydration checks where applicable",
          "Concussion protocols and mandatory recovery periods",
          "Periodic blood work or imaging when required by commission",
        ],
      },
      {
        id: "equipment",
        title: "Equipment Standards",
        bullets: [
          "Sanctioned sticks, protective gear, and mouthguards per division rules",
          "Inspection by JT Head Officials before competition",
          "Replacement or removal of defective or non-compliant equipment",
        ],
      },
      {
        id: "injury-protocols",
        title: "Injury Protocols",
        bullets: [
          "Immediate stoppage authority granted to referees and medical staff",
          "Post-fight evaluation before athlete departure",
          "Incident reporting through JTGC combat operations",
          "Return-to-competition clearance documentation",
        ],
      },
    ],
  },
  "media-accreditation": {
    slug: "media-accreditation",
    category: "media",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Media accreditation, press access, photography permissions, and event credentialing for Juego Todo coverage.",
    relatedLinks: [
      { label: "Broadcast Rights", href: "/broadcast-rights" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        id: "accreditation",
        title: "Press Accreditation",
        bullets: [
          "Applications must be submitted before event credential deadlines",
          "Media outlets must provide publication details and assignment editor contact",
          "Freelance journalists may be approved on a case-by-case basis",
        ],
      },
      {
        id: "access",
        title: "Event Access",
        bullets: [
          "Credential tiers include working press, photo pit, and broadcast partner zones",
          "Access is non-transferable and must be displayed at all times",
          "JTGC may restrict access for safety or broadcast exclusivity",
        ],
      },
      {
        id: "photography",
        title: "Photography & Filming",
        bullets: [
          "Still photography for editorial use may be permitted with accreditation",
          "Live streaming from the venue floor is prohibited without broadcast license",
          "All content remains subject to Broadcast Rights Policy",
        ],
      },
    ],
  },
  sponsorships: {
    slug: "sponsorships",
    category: "business",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Sponsorship requirements, advertising rules, and brand guidelines for Juego Todo commercial partners.",
    relatedLinks: [
      { label: "Partnerships", href: "/partnerships" },
      { label: "Broadcast Rights", href: "/broadcast-rights" },
      { label: "Contact", href: "/contact" },
    ],
    sections: [
      {
        id: "partnership-tiers",
        title: "Partnership Tiers",
        bullets: [
          "Global Partner — league-wide visibility and broadcast integration",
          "Official Partner — category exclusivity within approved verticals",
          "Equipment Partner — product integration and athlete gear standards",
          "Regional Partner — territory-specific activation rights",
        ],
      },
      {
        id: "brand-guidelines",
        title: "Brand Guidelines",
        bullets: [
          "Juego Todo logos must follow official color, spacing, and placement rules",
          "Co-branded assets require approval from Creative & Technical Department",
          "Partners may not imply JTGC endorsement beyond contracted scope",
        ],
      },
      {
        id: "advertising-rules",
        title: "Advertising Rules",
        bullets: [
          "No advertising of prohibited substances, unsafe products, or conflicting combat brands without approval",
          "Cage, broadcast, and digital placements are allocated by official matchmaking and marketing",
          "Campaign analytics may be shared with LATAYANOLOGY partner dashboards when applicable",
        ],
      },
    ],
  },
  "ranking-methodology": {
    slug: "ranking-methodology",
    category: "platform",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "Official Juego Todo ranking methodology including verification, point weighting, division movement, and LATAYANOLOGY data standards.",
    relatedLinks: [
      { label: "Rankings", href: "/rankings" },
      { label: "LATAYANOLOGY", href: "/latayanology" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
    sections: [
      {
        id: "principles",
        title: "Ranking Principles",
        paragraphs: [
          "Juego Todo rankings are designed for transparency, competitive integrity, and broadcast clarity. Movement is driven by sanctioned results reviewed through LATAYANOLOGY and approved by JTGC combat operations.",
        ],
      },
      {
        id: "criteria",
        title: "Primary Criteria",
        bullets: [
          "Recent sanctioned Juego Todo results and official bout outcomes",
          "Strength of schedule and quality of opposition",
          "Round dominance across Doble Baston, Solo Baston, and Mano y Mano formats",
          "Activity level, medical clearance, and commission eligibility",
          "Champion status, title defenses, and contender eliminator results",
        ],
      },
      {
        id: "verification",
        title: "Verification Process",
        bullets: [
          "Bout results entered by certified JT Head Officials and judges",
          "Cross-check against event records, medical reports, and video review when needed",
          "Provisional updates published within 72 hours of sanctioned events",
          "Final ranking lock after JTGC review window closes",
        ],
      },
      {
        id: "movement",
        title: "Division Movement",
        bullets: [
          "Weight class changes require official notification and medical re-certification",
          "Inactive athletes may be marked inactive after 12 months without sanctioned activity",
          "Pound-for-pound lists combine division performance and strength of opposition",
        ],
      },
    ],
  },
  latayanology: {
    slug: "latayanology",
    category: "platform",
    lastUpdated: LAST_UPDATED,
    metaDescription:
      "LATAYANOLOGY methodology for verified fighter records, weapon statistics, performance analytics, and the Juego Todo data engine.",
    relatedLinks: [
      { label: "Ranking Methodology", href: "/ranking-methodology" },
      { label: "Fighter Roster", href: "/fighters" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
    sections: [
      {
        id: "platform-overview",
        title: "Platform Overview",
        paragraphs: [
          "LATAYANOLOGY is the official Filipino martial arts analytics platform powering Juego Todo. It combines verified bout records, division rankings, weapon statistics, and broadcast-ready athlete intelligence in one system.",
        ],
      },
      {
        id: "fighter-database",
        title: "Fighter Database",
        bullets: [
          "Centralized athlete profiles with record, gym, division, and nationality data",
          "Historical match logs across seminars, qualifiers, and championship events",
          "Status flags for medical clearance, suspension, and commission eligibility",
        ],
      },
      {
        id: "verification-engine",
        title: "Record Verification",
        bullets: [
          "Multi-source validation from officials, venues, and video review teams",
          "Disputed results enter review queue before public ranking impact",
          "Gym and regional directors may submit corrections with evidence",
        ],
      },
      {
        id: "analytics",
        title: "Statistics & Analytics",
        bullets: [
          "Weapon engagement metrics across stick and empty-hand rounds",
          "Finish rates, strike efficiency, and positional dominance indicators",
          "Broadcast overlays and partner dashboards for live events",
          "Performance trends used by matchmakers and JTGC leadership",
        ],
      },
      {
        id: "access",
        title: "Data Access",
        paragraphs: [
          "Public rankings and selected statistics are available to fans and media. Advanced analytics, API access, and partner telemetry require official authorization from Juego Todo.",
        ],
      },
    ],
  },
};

export type LegalPageSlug = keyof typeof legalPages;

export const legalPageSlugs = Object.keys(legalPages) as LegalPageSlug[];

export function getLegalPage(slug: string): LegalPage | undefined {
  return legalPages[slug];
}

export function isLegalPageSlug(slug: string): slug is LegalPageSlug {
  return slug in legalPages;
}
