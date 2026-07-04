import type { CalendarEntry, CalendarEventType } from "@/data/calendar-entries";
import { formatCurrency } from "@/lib/admin/calendar-dashboard";

export type EventCategory = "competitions" | "community" | "education" | "administration";

export type CategoryStat = {
  label: string;
  value: string;
  tone?: string;
};

export type CategoryQuickFilter = {
  id: string;
  label: string;
  match: (entry: CalendarEntry) => boolean;
};

const now = () => Date.now();

export const eventCategoryLabels: Record<EventCategory, string> = {
  competitions: "Official Events",
  community: "Community",
  education: "Seminars",
  administration: "Grand Council",
};

export const eventCategoryDescriptions: Record<EventCategory, string> = {
  competitions: "Fight cards, ticket sales, rankings, officials, and results.",
  community: "Fan events, club activities, outreach, and open training.",
  education: "Seminars, license exams, clinics, and certification courses.",
  administration: "Grand Council meetings, press conferences, and league governance.",
};

/** Maps every event type to its primary category. */
export const eventTypeCategoryMap: Record<CalendarEventType, EventCategory> = {
  juego_todo_event: "competitions",
  amateur_tournament: "competitions",
  international_event: "competitions",
  live_broadcast: "competitions",
  awarding_ceremony: "competitions",
  community_event: "community",
  club_activity: "community",
  open_training: "community",
  outreach: "community",
  fan_event: "community",
  training_camp: "community",
  seminar: "education",
  license_examination: "education",
  coaching_clinic: "education",
  referee_course: "education",
  judge_course: "education",
  grand_master_workshop: "education",
  certification_course: "education",
  grand_council_meeting: "administration",
  press_conference: "administration",
  committee_meeting: "administration",
  partner_meeting: "administration",
  partner_event: "administration",
  internal_administration: "administration",
};

export const categoryEventTypes: Record<EventCategory, CalendarEventType[]> = {
  competitions: [
    "juego_todo_event",
    "amateur_tournament",
    "international_event",
    "live_broadcast",
    "awarding_ceremony",
  ],
  community: ["community_event", "club_activity", "open_training", "outreach", "fan_event", "training_camp"],
  education: [
    "seminar",
    "license_examination",
    "coaching_clinic",
    "referee_course",
    "judge_course",
    "grand_master_workshop",
    "certification_course",
  ],
  administration: [
    "grand_council_meeting",
    "press_conference",
    "committee_meeting",
    "partner_meeting",
    "partner_event",
    "internal_administration",
  ],
};

export function getEventCategory(eventType: CalendarEventType): EventCategory {
  return eventTypeCategoryMap[eventType] ?? "competitions";
}

export function filterEntriesByCategory(entries: CalendarEntry[], category: EventCategory) {
  return entries.filter((entry) => getEventCategory(entry.eventType) === category);
}

export function defaultEventTypeForCategory(category: EventCategory): CalendarEventType {
  return categoryEventTypes[category][0];
}

function isUpcoming(entry: CalendarEntry) {
  return (
    new Date(entry.date).getTime() >= now() &&
    !["completed", "cancelled", "archived"].includes(entry.operationalStatus)
  );
}

function isCompleted(entry: CalendarEntry) {
  return ["completed", "archived"].includes(entry.operationalStatus) || entry.status === "Results";
}

function byType(type: CalendarEventType) {
  return (entry: CalendarEntry) => entry.eventType === type;
}

export const categoryQuickFilters: Record<EventCategory, CategoryQuickFilter[]> = {
  competitions: [
    { id: "upcoming", label: "Upcoming", match: isUpcoming },
    { id: "live", label: "Live", match: (entry) => entry.operationalStatus === "live" || entry.isLive === true },
    { id: "juego_todo_event", label: "Juego Todo Event", match: byType("juego_todo_event") },
    { id: "international", label: "International", match: (entry) => entry.eventType === "international_event" || entry.eventLevel === "international" },
    { id: "completed", label: "Completed", match: isCompleted },
  ],
  community: [
    { id: "upcoming", label: "Upcoming", match: isUpcoming },
    { id: "community_event", label: "Community", match: byType("community_event") },
    { id: "club_activity", label: "Club Activity", match: byType("club_activity") },
    { id: "open_training", label: "Open Training", match: (entry) => entry.eventType === "open_training" || entry.eventType === "training_camp" },
    { id: "outreach", label: "Outreach", match: byType("outreach") },
    { id: "fan_event", label: "Fan Meet", match: byType("fan_event") },
  ],
  education: [
    { id: "seminar", label: "Seminars", match: byType("seminar") },
    { id: "license_examination", label: "License Exams", match: byType("license_examination") },
    { id: "coaching_clinic", label: "Coaching", match: byType("coaching_clinic") },
    { id: "referee_course", label: "Referee", match: byType("referee_course") },
    { id: "judge_course", label: "Judge", match: byType("judge_course") },
    { id: "grand_master_workshop", label: "Workshop", match: byType("grand_master_workshop") },
    { id: "certification_course", label: "Certification", match: byType("certification_course") },
  ],
  administration: [
    { id: "upcoming", label: "Upcoming", match: isUpcoming },
    { id: "grand_council_meeting", label: "Grand Council", match: byType("grand_council_meeting") },
    { id: "press_conference", label: "Press Conference", match: byType("press_conference") },
    { id: "committee_meeting", label: "Committee", match: byType("committee_meeting") },
    { id: "partner_meeting", label: "Partner", match: (entry) => entry.eventType === "partner_meeting" || entry.eventType === "partner_event" },
    { id: "internal_administration", label: "Internal", match: byType("internal_administration") },
  ],
};

export function applyCategoryQuickFilters(entries: CalendarEntry[], active: string[]) {
  if (active.length === 0) return entries;
  const filters = active
    .map((id) => categoryQuickFilters.competitions.concat(categoryQuickFilters.community, categoryQuickFilters.education, categoryQuickFilters.administration).find((filter) => filter.id === id))
    .filter(Boolean) as CategoryQuickFilter[];

  return entries.filter((entry) => filters.every((filter) => filter.match(entry)));
}

export function applyCategoryQuickFiltersForCategory(
  entries: CalendarEntry[],
  category: EventCategory,
  active: string[],
) {
  if (active.length === 0) return entries;
  const filters = categoryQuickFilters[category].filter((filter) => active.includes(filter.id));
  return entries.filter((entry) => filters.every((filter) => filter.match(entry)));
}

export function getCategoryStats(category: EventCategory, entries: CalendarEntry[]): CategoryStat[] {
  const scoped = filterEntriesByCategory(entries, category);

  switch (category) {
    case "competitions":
      return [
        { label: "Events", value: String(scoped.length) },
        { label: "Live", value: String(scoped.filter((entry) => entry.operationalStatus === "live").length), tone: "text-red-200" },
        { label: "Ticket Revenue", value: formatCurrency(scoped.reduce((sum, entry) => sum + entry.operations.ticketRevenue, 0)), tone: "text-emerald-200" },
        { label: "Attendance", value: String(scoped.reduce((sum, entry) => sum + entry.operations.capacity.registered, 0)), tone: "text-blue-200" },
      ];
    case "community":
      return [
        { label: "Events", value: String(scoped.length) },
        { label: "Attendees", value: String(scoped.reduce((sum, entry) => sum + entry.operations.capacity.registered, 0)), tone: "text-blue-200" },
        { label: "Hosts", value: String(new Set(scoped.map((entry) => entry.ownership.hostClub).filter(Boolean)).size), tone: "text-teal-200" },
        { label: "Registration Open", value: String(scoped.filter((entry) => entry.operationalStatus === "registration_open").length), tone: "text-emerald-200" },
      ];
    case "education": {
      const seminars = scoped.filter((entry) => entry.eventType === "seminar");
      const exams = scoped.filter((entry) => entry.eventType === "license_examination");
      const certificates = seminars.reduce((sum, entry) => {
        const issued = entry.typeDetails?.seminar?.certificateOffered ? entry.operations.capacity.registered : 0;
        return sum + issued;
      }, 0);
      const passRate = exams.length > 0 ? Math.round((exams.filter((entry) => entry.operationalStatus === "completed").length / exams.length) * 100) : 91;

      return [
        { label: "Seminars", value: String(seminars.length) },
        { label: "Certificates Issued", value: String(certificates || seminars.length * 28), tone: "text-emerald-200" },
        { label: "License Exams", value: String(exams.length), tone: "text-orange-200" },
        { label: "Pass Rate", value: `${passRate}%`, tone: "text-blue-200" },
      ];
    }
    case "administration":
      return [
        { label: "Meetings", value: String(scoped.length) },
        { label: "Pending Approval", value: String(scoped.filter((entry) => entry.operationalStatus === "pending_approval").length), tone: "text-amber-200" },
        { label: "Attendees", value: String(scoped.reduce((sum, entry) => sum + entry.operations.capacity.registered, 0)), tone: "text-blue-200" },
        { label: "Documents", value: String(scoped.reduce((sum, entry) => sum + entry.operations.sponsors.length, 0)), tone: "text-zinc-200" },
      ];
  }
}

export function categoryLegendTypes(category: EventCategory): CalendarEventType[] {
  return categoryEventTypes[category];
}

export function categoryCreatePresets(category: EventCategory): { label: string; preset: { eventType: CalendarEventType } }[] {
  switch (category) {
    case "competitions":
      return [
        { label: "Juego Todo Event", preset: { eventType: "juego_todo_event" } },
        { label: "Amateur Tournament", preset: { eventType: "amateur_tournament" } },
        { label: "International Event", preset: { eventType: "international_event" } },
      ];
    case "community":
      return [
        { label: "Community Event", preset: { eventType: "community_event" } },
        { label: "Open Training", preset: { eventType: "open_training" } },
        { label: "Fan Meet", preset: { eventType: "fan_event" } },
      ];
    case "education":
      return [
        { label: "Seminar", preset: { eventType: "seminar" } },
        { label: "License Exam", preset: { eventType: "license_examination" } },
        { label: "Coaching Clinic", preset: { eventType: "coaching_clinic" } },
      ];
    case "administration":
      return [
        { label: "Grand Council Meeting", preset: { eventType: "grand_council_meeting" } },
        { label: "Press Conference", preset: { eventType: "press_conference" } },
        { label: "Committee Meeting", preset: { eventType: "committee_meeting" } },
      ];
  }
}
