import type { CalendarEntryInput, CalendarEventType } from "@/data/calendar-entries";
import { calendarEventTypeLabels } from "@/data/calendar-entries";
import { categoryEventTypes } from "@/data/event-categories";
import { defaultTypeDetails } from "@/data/event-type-details";

type ExampleSeed = {
  eventType: CalendarEventType;
  title: string;
  slug: string;
  date: string;
  venue: string;
  city: string;
  summary: string;
  mainEvent?: string;
  bouts?: string[];
  isChampionship?: boolean;
  isLive?: boolean;
  eventLevel?: CalendarEntryInput["eventLevel"];
  entryType?: CalendarEntryInput["entryType"];
  visibility?: CalendarEntryInput["visibility"];
  operationalStatus?: CalendarEntryInput["operationalStatus"];
  typeDetails?: CalendarEntryInput["typeDetails"];
};

const exampleSeeds: ExampleSeed[] = [
  {
    eventType: "juego_todo_event",
    title: "Juego Todo: National Grand Prix",
    slug: "example-juego-todo-event",
    date: "2026-09-12T19:00:00+08:00",
    venue: "Smart Araneta Coliseum",
    city: "Quezon City, Philippines",
    summary: "Flagship Juego Todo event featuring ranked professional bouts and weaponized FMA championship stakes.",
    mainEvent: "Reyes vs Mendoza — Welterweight Grand Prix Final",
    bouts: ["Santos vs Aquino", "Cruz vs Villanueva", "Lim vs Navarro"],
    isChampionship: true,
    eventLevel: "national",
    entryType: "ticketed",
    typeDetails: {
      fight: {
        gender: "open",
        ageCategory: "senior",
        rounds: "5",
        weightDivision: "Welterweight",
        additionalDivisions: "Featherweight, Lightweight",
        gabRequired: true,
      },
    },
  },
  {
    eventType: "amateur_tournament",
    title: "JT Amateur Open — Luzon Qualifiers",
    slug: "example-amateur-tournament",
    date: "2026-07-18T14:00:00+08:00",
    venue: "Marikina Sports Center",
    city: "Marikina, Philippines",
    summary: "Regional amateur tournament feeding national rankings across Mano y Mano and weapon divisions.",
    mainEvent: "Junior Lightweight Final",
    bouts: ["Youth Stick Round Robin", "Amateur Grappling Bracket"],
    eventLevel: "regional",
    typeDetails: {
      fight: {
        gender: "mixed",
        ageCategory: "junior",
        rounds: "3",
        weightDivision: "Lightweight",
        additionalDivisions: "Bantamweight",
        gabRequired: false,
      },
    },
  },
  {
    eventType: "international_event",
    title: "Juego Todo x SEA Fight Summit",
    slug: "example-international-event",
    date: "2026-11-21T18:00:00+08:00",
    venue: "Singapore Indoor Stadium",
    city: "Singapore",
    summary: "International showcase pairing JTGC athletes with ASEAN federations under unified rules.",
    mainEvent: "Philippines vs Thailand Superfight",
    bouts: ["SEA Weapon Invitational", "Masters Exhibition"],
    eventLevel: "international",
    entryType: "ticketed",
    typeDetails: {
      fight: {
        gender: "open",
        ageCategory: "senior",
        rounds: "5",
        weightDivision: "Middleweight",
        additionalDivisions: "",
        gabRequired: true,
      },
    },
  },
  {
    eventType: "live_broadcast",
    title: "JT Live: Fight Night Broadcast",
    slug: "example-live-broadcast",
    date: "2026-08-08T20:00:00+08:00",
    venue: "JT Broadcast Studio",
    city: "Pasay, Philippines",
    summary: "Live-streamed fight card with multi-camera production and global PPV distribution.",
    mainEvent: "Ascension Manila Undercard Stream",
    isLive: true,
    entryType: "ticketed",
    operationalStatus: "live",
    typeDetails: {
      fight: {
        gender: "open",
        ageCategory: "senior",
        rounds: "3",
        weightDivision: "Open Weight",
        additionalDivisions: "",
        gabRequired: false,
      },
    },
  },
  {
    eventType: "awarding_ceremony",
    title: "JTGC Annual Awards Night",
    slug: "example-awarding-ceremony",
    date: "2026-12-05T18:30:00+08:00",
    venue: "Manila Hotel Ballroom",
    city: "Manila, Philippines",
    summary: "League awards ceremony honoring fighters, coaches, officials, and club excellence.",
    entryType: "vip_invitation",
    eventLevel: "national",
    typeDetails: {
      fight: {
        gender: "open",
        ageCategory: "open",
        rounds: "3",
        weightDivision: "Open Weight",
        additionalDivisions: "",
        gabRequired: false,
      },
    },
  },
  {
    eventType: "seminar",
    title: "Intro to Juego Todo Rules Clinic",
    slug: "example-seminar",
    date: "2026-07-26T09:00:00+08:00",
    venue: "Mandirigma Lab Manila",
    city: "Manila, Philippines",
    summary: "Foundational rules seminar for new athletes, coaches, and club administrators.",
    typeDetails: {
      seminar: {
        skillLevel: "beginner",
        pricing: "free",
        instructor: "Coach Ana Bagaybay Santos",
        certificateOffered: true,
        maxParticipants: 60,
      },
    },
  },
  {
    eventType: "license_examination",
    title: "National Fighter License Examination",
    slug: "example-license-examination",
    date: "2026-08-02T08:00:00+08:00",
    venue: "JTGC Licensing Center",
    city: "Quezon City, Philippines",
    summary: "Written and practical examination for new fighter license applicants nationwide.",
    typeDetails: {
      license: {
        licenseType: "Fighter",
        passMark: 75,
        maxApplicants: 80,
        examiner: "Grand Council Licensing Board",
      },
    },
  },
  {
    eventType: "coaching_clinic",
    title: "Elite Coaching Development Clinic",
    slug: "example-coaching-clinic",
    date: "2026-08-16T10:00:00+08:00",
    venue: "Cebu Blade Athletics HQ",
    city: "Cebu, Philippines",
    summary: "Advanced coaching clinic covering corner strategy, athlete safety, and fight preparation.",
    typeDetails: {
      seminar: {
        skillLevel: "advanced",
        pricing: "paid",
        instructor: "Senior Coach Ramon Dumog Cruz",
        certificateOffered: true,
        maxParticipants: 30,
      },
    },
  },
  {
    eventType: "referee_course",
    title: "National Referee Certification Course",
    slug: "example-referee-course",
    date: "2026-09-06T09:00:00+08:00",
    venue: "JT Officials Training Hall",
    city: "Pasay, Philippines",
    summary: "Certification course for referees covering weapon rounds, Mano y Mano, and championship protocol.",
    typeDetails: {
      seminar: {
        skillLevel: "intermediate",
        pricing: "paid",
        instructor: "Chief Referee Panel",
        certificateOffered: true,
        maxParticipants: 24,
      },
    },
  },
  {
    eventType: "judge_course",
    title: "Judges Scoring & Ethics Workshop",
    slug: "example-judge-course",
    date: "2026-09-20T09:00:00+08:00",
    venue: "JTGC Grand Council Annex",
    city: "Manila, Philippines",
    summary: "Workshop for licensed and aspiring judges on unified JT scoring criteria.",
    typeDetails: {
      seminar: {
        skillLevel: "intermediate",
        pricing: "paid",
        instructor: "Head Judge Commission",
        certificateOffered: true,
        maxParticipants: 20,
      },
    },
  },
  {
    eventType: "grand_master_workshop",
    title: "Grand Master Weapons Masterclass",
    slug: "example-grand-master-workshop",
    date: "2026-10-04T13:00:00+08:00",
    venue: "Heritage Combat Pavilion",
    city: "Laguna, Philippines",
    summary: "Exclusive workshop led by JT grand masters on traditional and modern weapon transitions.",
    typeDetails: {
      seminar: {
        skillLevel: "advanced",
        pricing: "paid",
        instructor: "Grand Master Council",
        certificateOffered: true,
        maxParticipants: 40,
      },
    },
  },
  {
    eventType: "certification_course",
    title: "Club Safety & Compliance Certification",
    slug: "example-certification-course",
    date: "2026-10-18T09:00:00+08:00",
    venue: "JT Academy South",
    city: "Davao, Philippines",
    summary: "Certification course for club owners and staff on league safety and operational standards.",
    typeDetails: {
      seminar: {
        skillLevel: "all_levels",
        pricing: "paid",
        instructor: "League Compliance Office",
        certificateOffered: true,
        maxParticipants: 35,
      },
    },
  },
  {
    eventType: "community_event",
    title: "Barangay Fight Sports Day",
    slug: "example-community-event",
    date: "2026-07-12T07:00:00+08:00",
    venue: "Barangay Covered Court",
    city: "Quezon City, Philippines",
    summary: "Community open day introducing Juego Todo rules, demos, and youth participation.",
    entryType: "free_admission",
    typeDetails: {
      meeting: { format: "in_person", agenda: "Demos, youth clinics, club sign-ups", quorumRequired: false },
    },
  },
  {
    eventType: "club_activity",
    title: "Mandirigma Lab Sparring Night",
    slug: "example-club-activity",
    date: "2026-07-19T18:00:00+08:00",
    venue: "Mandirigma Lab Manila",
    city: "Manila, Philippines",
    summary: "Hosted club sparring session for affiliated members and invited guests.",
    entryType: "free_admission",
    typeDetails: {
      meeting: { format: "in_person", agenda: "Controlled sparring rounds", quorumRequired: false },
    },
  },
  {
    eventType: "open_training",
    title: "Open Mat — Visayas Regional",
    slug: "example-open-training",
    date: "2026-08-09T16:00:00+08:00",
    venue: "Iloilo Combat Collective",
    city: "Iloilo, Philippines",
    summary: "Open training session for registered athletes preparing for upcoming qualifiers.",
    entryType: "free_admission",
    typeDetails: {
      meeting: { format: "in_person", agenda: "Open drills and conditioning", quorumRequired: false },
    },
  },
  {
    eventType: "outreach",
    title: "Schools Outreach — FMA Heritage Tour",
    slug: "example-outreach",
    date: "2026-08-23T08:30:00+08:00",
    venue: "Quezon City High School Gym",
    city: "Quezon City, Philippines",
    summary: "Educational outreach introducing Filipino martial arts heritage and JT athlete pathways.",
    entryType: "free_admission",
    typeDetails: {
      meeting: { format: "in_person", agenda: "School demos and Q&A", quorumRequired: false },
    },
  },
  {
    eventType: "fan_event",
    title: "Fight Night Fan Meet & Greet",
    slug: "example-fan-event",
    date: "2026-09-07T15:00:00+08:00",
    venue: "SM Mall of Asia Activity Center",
    city: "Pasay, Philippines",
    summary: "Fan meet with JT athletes, photo ops, and merchandise signing ahead of Ascension Manila.",
    entryType: "free_admission",
    typeDetails: {
      meeting: { format: "in_person", agenda: "Autographs, photos, fan Q&A", quorumRequired: false },
    },
  },
  {
    eventType: "training_camp",
    title: "National Team Training Camp",
    slug: "example-training-camp",
    date: "2026-09-28T06:00:00+08:00",
    venue: "Baguio High Altitude Camp",
    city: "Baguio, Philippines",
    summary: "Intensive multi-day camp for national squad athletes ahead of international assignments.",
    typeDetails: {
      seminar: {
        skillLevel: "advanced",
        pricing: "paid",
        instructor: "National Coaching Staff",
        certificateOffered: false,
        maxParticipants: 24,
      },
    },
  },
  {
    eventType: "grand_council_meeting",
    title: "JT Grand Council Quarterly Session",
    slug: "example-grand-council-meeting",
    date: "2026-08-30T14:00:00+08:00",
    venue: "JTGC Grand Council Chamber",
    city: "Manila, Philippines",
    summary: "Quarterly Grand Council session covering league policy, sanctions, and national calendar approval.",
    entryType: "vip_invitation",
    typeDetails: {
      meeting: {
        format: "hybrid",
        agenda: "Policy review, event approvals, disciplinary matters",
        quorumRequired: true,
      },
    },
  },
  {
    eventType: "press_conference",
    title: "Ascension Manila Press Conference",
    slug: "example-press-conference",
    date: "2026-08-20T11:00:00+08:00",
    venue: "MOA Arena Media Room",
    city: "Pasay, Philippines",
    summary: "Official weigh-in and press conference for Ascension Manila championship week.",
    typeDetails: {
      meeting: { format: "in_person", agenda: "Fighter introductions, media Q&A", quorumRequired: false },
    },
  },
  {
    eventType: "committee_meeting",
    title: "Rules & Safety Committee Review",
    slug: "example-committee-meeting",
    date: "2026-09-13T10:00:00+08:00",
    venue: "JT League Office",
    city: "Quezon City, Philippines",
    summary: "Committee review of proposed rule amendments and medical protocol updates.",
    visibility: "invitation_only",
    typeDetails: {
      meeting: { format: "virtual", agenda: "Rule amendments, medical protocols", quorumRequired: true },
    },
  },
  {
    eventType: "partner_meeting",
    title: "Broadcast Partner Strategy Meeting",
    slug: "example-partner-meeting",
    date: "2026-09-27T15:00:00+08:00",
    venue: "FightCast Global HQ",
    city: "Taguig, Philippines",
    summary: "Partner alignment on broadcast rights, production schedule, and sponsorship integration.",
    visibility: "invitation_only",
    typeDetails: {
      meeting: { format: "hybrid", agenda: "Broadcast schedule, sponsor integrations", quorumRequired: false },
    },
  },
  {
    eventType: "partner_event",
    title: "JT x Mandirigma Partner Showcase",
    slug: "example-partner-event",
    date: "2026-10-11T17:00:00+08:00",
    venue: "Mandirigma Lab Manila",
    city: "Manila, Philippines",
    summary: "Co-branded partner event highlighting gym affiliates and league development programs.",
    entryType: "ticketed",
    typeDetails: {
      meeting: { format: "in_person", agenda: "Partner demos, affiliate announcements", quorumRequired: false },
    },
  },
  {
    eventType: "internal_administration",
    title: "League Operations Planning Session",
    slug: "example-internal-administration",
    date: "2026-10-25T09:00:00+08:00",
    venue: "JT National Office",
    city: "Manila, Philippines",
    summary: "Internal staff session for calendar planning, logistics, and regional coordination.",
    visibility: "invitation_only",
    typeDetails: {
      meeting: { format: "in_person", agenda: "Calendar planning, logistics review", quorumRequired: false },
    },
  },
];

function isCompetitionType(eventType: CalendarEventType) {
  return categoryEventTypes.competitions.includes(eventType);
}

function buildExampleInput(seed: ExampleSeed): CalendarEntryInput {
  const typeDetails = seed.typeDetails ?? defaultTypeDetails(seed.eventType);

  return {
    slug: seed.slug,
    kind: isCompetitionType(seed.eventType) ? "competition" : "event",
    eventType: seed.eventType,
    operationalStatus: seed.operationalStatus ?? "registration_open",
    visibility: seed.visibility ?? "public",
    entryType: seed.entryType ?? (seed.typeDetails?.seminar?.pricing === "paid" ? "ticketed" : "free_admission"),
    ticketStatus: "available",
    eventLevel: seed.eventLevel ?? "national",
    sanctionStatus: seed.typeDetails?.fight?.gabRequired || seed.isChampionship ? "gab_sanctioned" : "jt_sanctioned",
    title: seed.title,
    date: seed.date,
    venue: seed.venue,
    city: seed.city,
    organizer: "Juego Todo PH",
    summary: seed.summary,
    mainEvent: seed.mainEvent ?? "",
    bouts: seed.bouts ?? [],
    divisions: seed.typeDetails?.fight?.additionalDivisions
      ? seed.typeDetails.fight.additionalDivisions.split(",").map((entry) => entry.trim()).filter(Boolean)
      : [],
    typeDetails,
    isChampionship: seed.isChampionship ?? false,
    isLive: seed.isLive ?? seed.operationalStatus === "live",
    status: "Upcoming",
    published: true,
    weightDivision: seed.typeDetails?.fight?.weightDivision ?? "Open",
    operations: {
      capacity: {
        maximum: seed.typeDetails?.seminar?.maxParticipants ?? seed.typeDetails?.license?.maxApplicants ?? 500,
        registered: 0,
        checkedIn: 0,
        waitlist: 0,
      },
      health: {
        venueConfirmed: true,
        officialsAssigned: isCompetitionType(seed.eventType),
        medicalTeamAssigned: isCompetitionType(seed.eventType),
        securityConfirmed: true,
        sponsorshipComplete: false,
        livestreamConfigured: seed.isLive ?? false,
        gabSanctionComplete: seed.typeDetails?.fight?.gabRequired ?? false,
      },
    },
  };
}

export const calendarExampleEventInputs: CalendarEntryInput[] = exampleSeeds.map(buildExampleInput);

export const calendarExampleEventTypes = exampleSeeds.map((seed) => seed.eventType);

/** Ensures every defined event type has a seeded example. */
export function assertCalendarExampleCoverage() {
  const allTypes = Object.values(categoryEventTypes).flat();
  const missing = allTypes.filter((type) => !calendarExampleEventTypes.includes(type));
  if (missing.length > 0) {
    throw new Error(`Missing calendar examples for: ${missing.map((type) => calendarEventTypeLabels[type]).join(", ")}`);
  }
}

assertCalendarExampleCoverage();
