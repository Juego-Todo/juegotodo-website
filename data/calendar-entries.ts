export type CalendarEntryKind = "event" | "competition";

/** Legacy member-facing status */
export type CalendarEntryStatus = "Upcoming" | "Results" | "Cancelled" | "Draft";

export type CalendarEntrySource = "static" | "admin";

export type CalendarEventType =
  | "juego_todo_event"
  | "amateur_tournament"
  | "international_event"
  | "seminar"
  | "license_examination"
  | "coaching_clinic"
  | "referee_course"
  | "judge_course"
  | "grand_master_workshop"
  | "certification_course"
  | "community_event"
  | "club_activity"
  | "open_training"
  | "outreach"
  | "fan_event"
  | "press_conference"
  | "grand_council_meeting"
  | "committee_meeting"
  | "partner_meeting"
  | "partner_event"
  | "awarding_ceremony"
  | "training_camp"
  | "live_broadcast"
  | "internal_administration";

export type CalendarOperationalStatus =
  | "draft"
  | "pending_approval"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "live"
  | "completed"
  | "cancelled"
  | "archived";

export type EventVisibility = "public" | "private" | "invitation_only";
export type EventEntryType = "free_admission" | "ticketed" | "vip_invitation";
export type EventTicketStatus = "available" | "limited" | "sold_out" | "coming_soon";
export type EventLevel = "international" | "national" | "regional" | "provincial" | "club";
export type SanctionStatus =
  | "jt_sanctioned"
  | "gab_sanctioned"
  | "co_sanctioned"
  | "pending_sanction"
  | "not_sanctioned";

export type EventWorkflowStage =
  | "planning"
  | "draft"
  | "internal_review"
  | "council_approval"
  | "gab_sanction"
  | "published"
  | "registration_open"
  | "fight_card_finalized"
  | "tickets_on_sale"
  | "live"
  | "results_published"
  | "certificates_issued"
  | "archived";

export type EventLocation = {
  country: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  venue: string;
  venueAddress: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
};

export type EventSchedule = {
  start: string;
  end: string;
  registrationOpens: string;
  registrationCloses: string;
  doorsOpen: string;
  weighIns: string;
  pressConference: string;
  awards: string;
};

export type EventCapacity = {
  maximum: number;
  registered: number;
  checkedIn: number;
  waitlist: number;
};

export type EventOwnership = {
  organizer: string;
  promoter: string;
  hostClub: string;
  regionalDirector: string;
  assignedAdministrator: string;
};

export type EventOfficials = {
  referees: number;
  judges: number;
  doctors: number;
  timekeepers: number;
  scorekeepers: number;
  ringAnnouncers: number;
  photographers: number;
  videographers: number;
  security: number;
  medicalTeam: number;
  grandCouncilRep: number;
};

export type EventHealthChecks = {
  venueConfirmed: boolean;
  officialsAssigned: boolean;
  medicalTeamAssigned: boolean;
  securityConfirmed: boolean;
  sponsorshipComplete: boolean;
  livestreamConfigured: boolean;
  gabSanctionComplete: boolean;
};

export type EventMedia = {
  posterTone: string;
  gallery: string[];
  trailerUrl: string;
  streamEmbedUrl: string;
};

export type EventSponsor = {
  name: string;
  tier: "gold" | "silver" | "bronze" | "partner";
  website: string;
};

import type { EventTypeDetails } from "@/data/event-type-details";

export type {
  EventTypeDetails,
  FightEventDetails,
  SeminarEventDetails,
  LicenseExamEventDetails,
  MeetingEventDetails,
} from "@/data/event-type-details";

export type CalendarEntryOperations = {
  capacity: EventCapacity;
  ticketsSold: number;
  ticketRevenue: number;
  registeredFighters: number;
  assignedReferees: number;
  assignedJudges: number;
  assignedDoctors: number;
  assignedCoaches: number;
  broadcastPartner: string;
  sponsors: string[];
  officials: EventOfficials;
  health: EventHealthChecks;
  media: EventMedia;
  shopProductSlug: string;
};

export type CalendarEntry = {
  id: string;
  slug: string;
  kind: CalendarEntryKind;
  eventType: CalendarEventType;
  operationalStatus: CalendarOperationalStatus;
  workflowStage: EventWorkflowStage;
  visibility: EventVisibility;
  entryType: EventEntryType;
  ticketStatus: EventTicketStatus;
  eventLevel: EventLevel;
  sanctionStatus: SanctionStatus;
  title: string;
  date: string;
  venue: string;
  city: string;
  region: string;
  organizer: string;
  weightDivision: string;
  location: EventLocation;
  schedule: EventSchedule;
  ownership: EventOwnership;
  status: CalendarEntryStatus;
  summary: string;
  mainEvent?: string;
  bouts: string[];
  divisions: string[];
  typeDetails?: EventTypeDetails;
  registrationDeadline?: string;
  isChampionship?: boolean;
  isLive?: boolean;
  published: boolean;
  source: CalendarEntrySource;
  operations: CalendarEntryOperations;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export type CalendarEntryInput = {
  slug: string;
  kind: CalendarEntryKind;
  eventType?: CalendarEventType;
  operationalStatus?: CalendarOperationalStatus;
  workflowStage?: EventWorkflowStage;
  visibility?: EventVisibility;
  entryType?: EventEntryType;
  ticketStatus?: EventTicketStatus;
  eventLevel?: EventLevel;
  sanctionStatus?: SanctionStatus;
  title: string;
  date: string;
  venue: string;
  city: string;
  region?: string;
  organizer?: string;
  weightDivision?: string;
  location?: Partial<EventLocation>;
  schedule?: Partial<EventSchedule>;
  ownership?: Partial<EventOwnership>;
  status: CalendarEntryStatus;
  summary: string;
  mainEvent?: string;
  bouts?: string[];
  divisions?: string[];
  typeDetails?: EventTypeDetails;
  registrationDeadline?: string;
  isChampionship?: boolean;
  isLive?: boolean;
  published?: boolean;
  operations?: Omit<Partial<CalendarEntryOperations>, "capacity" | "officials" | "health" | "media"> & {
    capacity?: Partial<EventCapacity>;
    officials?: Partial<EventOfficials>;
    health?: Partial<EventHealthChecks>;
    media?: Partial<EventMedia>;
  };
};

export const calendarEntryKindLabels: Record<CalendarEntryKind, string> = {
  event: "Event",
  competition: "Competition",
};

export const calendarEntryStatusLabels: Record<CalendarEntryStatus, string> = {
  Upcoming: "Upcoming",
  Results: "Results",
  Cancelled: "Cancelled",
  Draft: "Draft",
};

export const calendarEventTypeLabels: Record<CalendarEventType, string> = {
  juego_todo_event: "Juego Todo Event",
  amateur_tournament: "Amateur Tournament",
  international_event: "International Event",
  seminar: "Seminar",
  license_examination: "License Examination",
  coaching_clinic: "Coaching Clinic",
  referee_course: "Referee Course",
  judge_course: "Judge Course",
  grand_master_workshop: "Grand Master Workshop",
  certification_course: "Certification Course",
  community_event: "Community Event",
  club_activity: "Club Activity",
  open_training: "Open Training",
  outreach: "Outreach",
  fan_event: "Fan Event",
  press_conference: "Press Conference",
  grand_council_meeting: "Grand Council Meeting",
  committee_meeting: "Committee Meeting",
  partner_meeting: "Partner Meeting",
  partner_event: "Partner Event",
  awarding_ceremony: "Awarding Ceremony",
  training_camp: "Training Camp",
  live_broadcast: "Live Broadcast",
  internal_administration: "Internal Administration",
};

export const calendarOperationalStatusLabels: Record<CalendarOperationalStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  published: "Published",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const eventVisibilityLabels: Record<EventVisibility, string> = {
  public: "Public",
  private: "Private",
  invitation_only: "Invitation Only",
};

export const eventEntryTypeLabels: Record<EventEntryType, string> = {
  free_admission: "Free Admission",
  ticketed: "Ticketed",
  vip_invitation: "VIP Invitation",
};

export const eventTicketStatusLabels: Record<EventTicketStatus, string> = {
  available: "Available",
  limited: "Limited",
  sold_out: "Sold Out",
  coming_soon: "Coming Soon",
};

export const eventLevelLabels: Record<EventLevel, string> = {
  international: "International",
  national: "National",
  regional: "Regional",
  provincial: "Provincial",
  club: "Club",
};

export const sanctionStatusLabels: Record<SanctionStatus, string> = {
  jt_sanctioned: "Juego Todo Sanctioned",
  gab_sanctioned: "GAB Sanctioned",
  co_sanctioned: "Co-Sanctioned",
  pending_sanction: "Pending Sanction",
  not_sanctioned: "Not Sanctioned",
};

export const workflowStageLabels: Record<EventWorkflowStage, string> = {
  planning: "Planning",
  draft: "Draft",
  internal_review: "Internal Review",
  council_approval: "Grand Council Approval",
  gab_sanction: "GAB Sanction",
  published: "Published",
  registration_open: "Registration Open",
  fight_card_finalized: "Fight Card Finalized",
  tickets_on_sale: "Tickets On Sale",
  live: "Live Event",
  results_published: "Results Published",
  certificates_issued: "Certificates Issued",
  archived: "Archived",
};

export const calendarEventTypeColors: Record<
  CalendarEventType,
  { pill: string; border: string; glow: string; timeline: string; legend: string }
> = {
  juego_todo_event: {
    pill: "bg-[#FF1010]/20 text-red-100 border-[#FF1010]/45",
    border: "border-[#FF1010]/45",
    glow: "shadow-[0_0_30px_rgba(255,16,16,0.25)]",
    timeline: "from-[#FF1010] to-red-950",
    legend: "bg-[#FF1010]",
  },
  amateur_tournament: {
    pill: "bg-emerald-500/15 text-emerald-100 border-emerald-500/35",
    border: "border-emerald-500/35",
    glow: "shadow-[0_0_24px_rgba(16,185,129,0.2)]",
    timeline: "from-emerald-500 to-emerald-900",
    legend: "bg-emerald-500",
  },
  seminar: {
    pill: "bg-amber-500/15 text-amber-100 border-amber-500/35",
    border: "border-amber-500/35",
    glow: "shadow-[0_0_24px_rgba(245,158,11,0.2)]",
    timeline: "from-amber-500 to-amber-900",
    legend: "bg-amber-500",
  },
  license_examination: {
    pill: "bg-orange-500/15 text-orange-100 border-orange-500/35",
    border: "border-orange-500/35",
    glow: "shadow-[0_0_24px_rgba(249,115,22,0.2)]",
    timeline: "from-orange-500 to-orange-900",
    legend: "bg-orange-500",
  },
  press_conference: {
    pill: "bg-purple-500/15 text-purple-100 border-purple-500/35",
    border: "border-purple-500/35",
    glow: "shadow-[0_0_24px_rgba(168,85,247,0.2)]",
    timeline: "from-purple-500 to-purple-900",
    legend: "bg-purple-500",
  },
  grand_council_meeting: {
    pill: "bg-indigo-500/15 text-indigo-100 border-indigo-500/35",
    border: "border-indigo-500/35",
    glow: "shadow-[0_0_24px_rgba(99,102,241,0.2)]",
    timeline: "from-indigo-500 to-indigo-900",
    legend: "bg-indigo-500",
  },
  training_camp: {
    pill: "bg-teal-500/15 text-teal-100 border-teal-500/35",
    border: "border-teal-500/35",
    glow: "shadow-[0_0_24px_rgba(20,184,166,0.2)]",
    timeline: "from-teal-500 to-teal-900",
    legend: "bg-teal-500",
  },
  international_event: {
    pill: "bg-indigo-500/15 text-indigo-100 border-indigo-500/35",
    border: "border-indigo-500/35",
    glow: "shadow-[0_0_24px_rgba(99,102,241,0.2)]",
    timeline: "from-indigo-500 to-indigo-900",
    legend: "bg-indigo-500",
  },
  coaching_clinic: {
    pill: "bg-lime-500/15 text-lime-100 border-lime-500/35",
    border: "border-lime-500/35",
    glow: "shadow-[0_0_24px_rgba(132,204,22,0.2)]",
    timeline: "from-lime-500 to-lime-900",
    legend: "bg-lime-500",
  },
  referee_course: {
    pill: "bg-cyan-500/15 text-cyan-100 border-cyan-500/35",
    border: "border-cyan-500/35",
    glow: "shadow-[0_0_24px_rgba(6,182,212,0.2)]",
    timeline: "from-cyan-500 to-cyan-900",
    legend: "bg-cyan-500",
  },
  judge_course: {
    pill: "bg-blue-500/15 text-blue-100 border-blue-500/35",
    border: "border-blue-500/35",
    glow: "shadow-[0_0_24px_rgba(59,130,246,0.2)]",
    timeline: "from-blue-500 to-blue-900",
    legend: "bg-blue-500",
  },
  grand_master_workshop: {
    pill: "bg-violet-500/15 text-violet-100 border-violet-500/35",
    border: "border-violet-500/35",
    glow: "shadow-[0_0_24px_rgba(139,92,246,0.2)]",
    timeline: "from-violet-500 to-violet-900",
    legend: "bg-violet-500",
  },
  certification_course: {
    pill: "bg-fuchsia-500/15 text-fuchsia-100 border-fuchsia-500/35",
    border: "border-fuchsia-500/35",
    glow: "shadow-[0_0_24px_rgba(217,70,239,0.2)]",
    timeline: "from-fuchsia-500 to-fuchsia-900",
    legend: "bg-fuchsia-500",
  },
  community_event: {
    pill: "bg-teal-500/15 text-teal-100 border-teal-500/35",
    border: "border-teal-500/35",
    glow: "shadow-[0_0_24px_rgba(20,184,166,0.2)]",
    timeline: "from-teal-500 to-teal-900",
    legend: "bg-teal-500",
  },
  club_activity: {
    pill: "bg-emerald-500/15 text-emerald-100 border-emerald-500/35",
    border: "border-emerald-500/35",
    glow: "shadow-[0_0_24px_rgba(16,185,129,0.2)]",
    timeline: "from-emerald-500 to-emerald-900",
    legend: "bg-emerald-500",
  },
  open_training: {
    pill: "bg-green-500/15 text-green-100 border-green-500/35",
    border: "border-green-500/35",
    glow: "shadow-[0_0_24px_rgba(34,197,94,0.2)]",
    timeline: "from-green-500 to-green-900",
    legend: "bg-green-500",
  },
  outreach: {
    pill: "bg-rose-500/15 text-rose-100 border-rose-500/35",
    border: "border-rose-500/35",
    glow: "shadow-[0_0_24px_rgba(244,63,94,0.2)]",
    timeline: "from-rose-500 to-rose-900",
    legend: "bg-rose-500",
  },
  fan_event: {
    pill: "bg-pink-500/15 text-pink-100 border-pink-500/35",
    border: "border-pink-500/35",
    glow: "shadow-[0_0_24px_rgba(236,72,153,0.2)]",
    timeline: "from-pink-500 to-pink-900",
    legend: "bg-pink-500",
  },
  committee_meeting: {
    pill: "bg-slate-500/15 text-slate-200 border-slate-500/35",
    border: "border-slate-500/35",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.15)]",
    timeline: "from-slate-500 to-slate-900",
    legend: "bg-slate-500",
  },
  partner_meeting: {
    pill: "bg-zinc-500/15 text-zinc-200 border-zinc-500/35",
    border: "border-zinc-500/35",
    glow: "shadow-[0_0_20px_rgba(113,113,122,0.15)]",
    timeline: "from-zinc-500 to-zinc-900",
    legend: "bg-zinc-500",
  },
  partner_event: {
    pill: "bg-zinc-500/15 text-zinc-200 border-zinc-500/35",
    border: "border-zinc-500/35",
    glow: "shadow-[0_0_20px_rgba(113,113,122,0.15)]",
    timeline: "from-zinc-500 to-zinc-900",
    legend: "bg-zinc-500",
  },
  internal_administration: {
    pill: "bg-zinc-700/20 text-zinc-300 border-zinc-600/35",
    border: "border-zinc-600/35",
    glow: "shadow-[0_0_16px_rgba(63,63,70,0.2)]",
    timeline: "from-zinc-700 to-black",
    legend: "bg-zinc-700",
  },
  awarding_ceremony: {
    pill: "bg-amber-500/15 text-amber-100 border-amber-500/35",
    border: "border-amber-500/35",
    glow: "shadow-[0_0_24px_rgba(245,158,11,0.2)]",
    timeline: "from-amber-500 to-amber-900",
    legend: "bg-amber-500",
  },
  live_broadcast: {
    pill: "bg-[#FF1010]/15 text-red-100 border-[#FF1010]/35",
    border: "border-[#FF1010]/35",
    glow: "shadow-[0_0_24px_rgba(255,16,16,0.2)]",
    timeline: "from-[#FF1010] to-black",
    legend: "bg-[#FF1010]",
  },
};

export const calendarOperationalStatusColors: Record<CalendarOperationalStatus, string> = {
  draft: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  pending_approval: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  published: "border-blue-500/35 bg-blue-500/10 text-blue-100",
  registration_open: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
  registration_closed: "border-emerald-800/35 bg-emerald-900/20 text-emerald-200",
  live: "border-[#FF1010]/40 bg-[#FF1010]/15 text-red-100",
  completed: "border-slate-500/35 bg-slate-500/10 text-slate-200",
  cancelled: "border-red-900/40 bg-red-950/30 text-red-200",
  archived: "border-black/40 bg-black/40 text-zinc-400",
};

export const eventVisibilityColors: Record<EventVisibility, string> = {
  public: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
  private: "border-zinc-500/35 bg-zinc-500/10 text-zinc-300",
  invitation_only: "border-blue-500/35 bg-blue-500/10 text-blue-100",
};

export const eventEntryTypeColors: Record<EventEntryType, string> = {
  free_admission: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
  ticketed: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  vip_invitation: "border-purple-500/35 bg-purple-500/10 text-purple-100",
};

export const eventLevelColors: Record<EventLevel, string> = {
  international: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  national: "border-red-500/35 bg-red-500/10 text-red-100",
  regional: "border-orange-500/35 bg-orange-500/10 text-orange-100",
  provincial: "border-blue-500/35 bg-blue-500/10 text-blue-100",
  club: "border-zinc-500/35 bg-zinc-500/10 text-zinc-300",
};

export const sanctionStatusColors: Record<SanctionStatus, string> = {
  jt_sanctioned: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
  gab_sanctioned: "border-blue-500/35 bg-blue-500/10 text-blue-100",
  co_sanctioned: "border-purple-500/35 bg-purple-500/10 text-purple-100",
  pending_sanction: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  not_sanctioned: "border-red-500/35 bg-red-500/10 text-red-200",
};

export const eventLegendItems = [
  { type: "juego_todo_event" as const, label: "Juego Todo Event" },
  { type: "seminar" as const, label: "Seminar" },
  { type: "license_examination" as const, label: "License Examination" },
  { type: "press_conference" as const, label: "Press Conference" },
  { type: "grand_council_meeting" as const, label: "Grand Council Meeting" },
  { type: "training_camp" as const, label: "Training Camp" },
  { type: "amateur_tournament" as const, label: "International Event" },
  { type: "partner_event" as const, label: "Partner Event" },
  { type: "internal_administration" as const, label: "Internal Administration" },
];

export const philippineRegions = [
  "National",
  "NCR",
  "Luzon",
  "Visayas",
  "Mindanao",
  "International",
] as const;

export function defaultEventLocation(overrides: Partial<EventLocation> = {}): EventLocation {
  return {
    country: "Philippines",
    region: "National",
    province: "",
    city: "",
    barangay: "",
    venue: "",
    venueAddress: "",
    postalCode: "",
    latitude: null,
    longitude: null,
    ...overrides,
  };
}

export function defaultEventSchedule(dateIso = ""): EventSchedule {
  return {
    start: dateIso,
    end: dateIso,
    registrationOpens: "",
    registrationCloses: "",
    doorsOpen: "",
    weighIns: "",
    pressConference: "",
    awards: "",
  };
}

export function defaultEventCapacity(): EventCapacity {
  return { maximum: 0, registered: 0, checkedIn: 0, waitlist: 0 };
}

export function defaultEventOwnership(): EventOwnership {
  return {
    organizer: "Juego Todo PH",
    promoter: "",
    hostClub: "",
    regionalDirector: "",
    assignedAdministrator: "",
  };
}

export function defaultEventOfficials(): EventOfficials {
  return {
    referees: 0,
    judges: 0,
    doctors: 0,
    timekeepers: 0,
    scorekeepers: 0,
    ringAnnouncers: 0,
    photographers: 0,
    videographers: 0,
    security: 0,
    medicalTeam: 0,
    grandCouncilRep: 0,
  };
}

export function defaultEventHealth(): EventHealthChecks {
  return {
    venueConfirmed: false,
    officialsAssigned: false,
    medicalTeamAssigned: false,
    securityConfirmed: false,
    sponsorshipComplete: false,
    livestreamConfigured: false,
    gabSanctionComplete: false,
  };
}

export function defaultCalendarOperations(): CalendarEntryOperations {
  return {
    capacity: defaultEventCapacity(),
    ticketsSold: 0,
    ticketRevenue: 0,
    registeredFighters: 0,
    assignedReferees: 0,
    assignedJudges: 0,
    assignedDoctors: 0,
    assignedCoaches: 0,
    broadcastPartner: "",
    sponsors: [],
    officials: defaultEventOfficials(),
    health: defaultEventHealth(),
    media: { posterTone: "from-red-950 via-black to-zinc-950", gallery: [], trailerUrl: "", streamEmbedUrl: "" },
    shopProductSlug: "",
  };
}

export function slugifyCalendarEntry(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function resolveRegion(city: string) {
  const normalized = city.toLowerCase();
  if (normalized.includes("cebu") || normalized.includes("iloilo")) return "Visayas";
  if (normalized.includes("davao") || normalized.includes("mindanao")) return "Mindanao";
  if (normalized.includes("manila") || normalized.includes("pasay") || normalized.includes("quezon") || normalized.includes("marikina")) return "NCR";
  if (normalized.includes("philippines")) return "National";
  if (normalized.includes("japan") || normalized.includes("tokyo")) return "International";
  return "Luzon";
}

export function inferEventType(entry: {
  kind: CalendarEntryKind;
  isChampionship?: boolean;
  title?: string;
  slug?: string;
}): CalendarEventType {
  const title = `${entry.title ?? ""} ${entry.slug ?? ""}`.toLowerCase();
  if (title.includes("barrio") || title.includes("championship") || title.includes("ascension") || entry.isChampionship) {
    return "juego_todo_event";
  }
  if (title.includes("seminar")) return "seminar";
  if (title.includes("license") || title.includes("licensing")) return "license_examination";
  if (title.includes("council")) return "grand_council_meeting";
  if (entry.kind === "competition") return "amateur_tournament";
  return "juego_todo_event";
}

export function migrateLegacyEventType(value: string): CalendarEventType {
  switch (value) {
    case "regional":
    case "professional_event":
    case "championship":
    case "barrio_brawls":
      return "juego_todo_event";
    case "licensing":
      return "license_examination";
    case "grand_council":
      return "grand_council_meeting";
    default:
      return value in calendarEventTypeLabels ? (value as CalendarEventType) : "juego_todo_event";
  }
}
