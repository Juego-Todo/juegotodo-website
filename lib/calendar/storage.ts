import {
  defaultCalendarOperations,
  defaultEventCapacity,
  defaultEventHealth,
  defaultEventLocation,
  defaultEventOfficials,
  defaultEventOwnership,
  defaultEventSchedule,
  inferEventType,
  migrateLegacyEventType,
  resolveRegion,
  slugifyCalendarEntry,
  type CalendarEntry,
  type CalendarEntryInput,
  type CalendarEntryStatus,
  type CalendarOperationalStatus,
  type EventWorkflowStage,
} from "@/data/calendar-entries";
import {
  entryTypeFromSeminarPricing,
  mergeTypeDetails,
  parseAdditionalDivisions,
} from "@/data/event-type-details";
import { calendarExampleEventInputs } from "@/data/calendar-example-events";
import { events, type Event } from "@/data/site";

const CALENDAR_KEY = "juego-todo.calendar.entries";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function mapLegacyStatusToOperational(status: CalendarEntryStatus, published: boolean): CalendarOperationalStatus {
  if (status === "Draft" || !published) return "draft";
  if (status === "Results") return "completed";
  if (status === "Cancelled") return "cancelled";
  return "published";
}

function mapOperationalToLegacyStatus(operationalStatus: CalendarOperationalStatus, dateIso: string): CalendarEntryStatus {
  if (operationalStatus === "draft") return "Draft";
  if (operationalStatus === "cancelled") return "Cancelled";
  if (operationalStatus === "completed" || operationalStatus === "archived") return "Results";
  if (new Date(dateIso).getTime() < Date.now()) return "Results";
  return "Upcoming";
}

function mapOperationalToWorkflow(status: CalendarOperationalStatus): EventWorkflowStage {
  switch (status) {
    case "draft":
      return "draft";
    case "pending_approval":
      return "internal_review";
    case "published":
      return "published";
    case "registration_open":
      return "registration_open";
    case "registration_closed":
      return "fight_card_finalized";
    case "live":
      return "live";
    case "completed":
      return "results_published";
    case "archived":
      return "archived";
    case "cancelled":
      return "archived";
    default:
      return "published";
  }
}

export function normalizeCalendarEntry(entry: CalendarEntry): CalendarEntry {
  const baseOps = defaultCalendarOperations();
  const legacyCapacity = typeof (entry.operations as unknown as { capacity?: number | { maximum?: number } })?.capacity === "number"
    ? { maximum: (entry.operations as unknown as { capacity: number }).capacity, registered: entry.operations?.registeredFighters ?? 0, checkedIn: 0, waitlist: 0 }
    : { ...defaultEventCapacity(), ...(entry.operations?.capacity ?? {}) };

  const operations = {
    ...baseOps,
    ...entry.operations,
    capacity: legacyCapacity,
    officials: { ...defaultEventOfficials(), ...(entry.operations?.officials ?? {}) },
    health: { ...defaultEventHealth(), ...(entry.operations?.health ?? {}) },
    media: { ...baseOps.media, ...(entry.operations?.media ?? {}) },
    sponsors: entry.operations?.sponsors ?? [],
    ticketRevenue: entry.operations?.ticketRevenue ?? Math.round((entry.operations?.ticketsSold ?? 0) * 850),
  };

  const eventType = entry.eventType
    ? migrateLegacyEventType(entry.eventType as string)
    : inferEventType(entry);
  const operationalStatus =
    entry.operationalStatus ?? mapLegacyStatusToOperational(entry.status, entry.published ?? true);
  const city = entry.city?.trim() || entry.location?.city || "";
  const venue = entry.venue?.trim() || entry.location?.venue || "";
  const region = entry.region?.trim() || entry.location?.region || resolveRegion(city);

  const location = defaultEventLocation({
    ...entry.location,
    country: entry.location?.country || (city.toLowerCase().includes("japan") ? "Japan" : "Philippines"),
    region,
    city,
    venue,
    venueAddress: entry.location?.venueAddress || `${venue}, ${city}`,
  });

  return {
    ...entry,
    eventType,
    operationalStatus,
    workflowStage: entry.workflowStage ?? mapOperationalToWorkflow(operationalStatus),
    visibility: entry.visibility ?? "public",
    entryType:
      entry.entryType ??
      (entry.typeDetails?.seminar ? entryTypeFromSeminarPricing(entry.typeDetails.seminar.pricing) : entry.isLive ? "ticketed" : "free_admission"),
    ticketStatus: entry.ticketStatus ?? (operations.ticketsSold >= legacyCapacity.maximum && legacyCapacity.maximum > 0 ? "sold_out" : "available"),
    eventLevel: entry.eventLevel ?? (entry.isChampionship ? "national" : region === "International" ? "international" : "regional"),
    sanctionStatus:
      entry.sanctionStatus ??
      (entry.typeDetails?.fight?.gabRequired || entry.isChampionship ? "gab_sanctioned" : "jt_sanctioned"),
    bouts: entry.bouts ?? [],
    divisions: entry.divisions?.length
      ? entry.divisions
      : parseAdditionalDivisions(entry.typeDetails?.fight?.additionalDivisions ?? ""),
    typeDetails: mergeTypeDetails(eventType, entry.typeDetails),
    region,
    city,
    venue,
    organizer: entry.organizer?.trim() || entry.ownership?.organizer || "Juego Todo PH",
    weightDivision:
      entry.weightDivision?.trim() ||
      entry.typeDetails?.fight?.weightDivision ||
      entry.divisions?.[0] ||
      "Open",
    location,
    schedule: { ...defaultEventSchedule(entry.date), ...entry.schedule, start: entry.schedule?.start || entry.date },
    ownership: { ...defaultEventOwnership(), ...entry.ownership, organizer: entry.organizer || entry.ownership?.organizer || "Juego Todo PH" },
    published: operationalStatus !== "draft" && operationalStatus !== "pending_approval" && (entry.published ?? true),
    status: mapOperationalToLegacyStatus(operationalStatus, entry.date),
    operations,
    source: entry.source ?? "admin",
  };
}

function mapSiteEventToCalendarEntry(event: Event): CalendarEntry {
  const operationalStatus: CalendarOperationalStatus =
    event.status === "Results" ? "completed" : event.isLive ? "live" : "registration_open";
  const eventType = "juego_todo_event";
  const ticketsSold = event.isLive ? 8420 : event.status === "Results" ? 11200 : 0;
  const capacity = event.venue.toLowerCase().includes("arena") || event.venue.toLowerCase().includes("coliseum") ? 12000 : 5000;

  return normalizeCalendarEntry({
    id: `static-${event.slug}`,
    slug: event.slug,
    kind: "event",
    eventType,
    operationalStatus,
    workflowStage: mapOperationalToWorkflow(operationalStatus),
    visibility: "public",
    entryType: "ticketed",
    ticketStatus: ticketsSold >= capacity ? "sold_out" : ticketsSold > 0 ? "limited" : "available",
    eventLevel: event.isChampionship ? "national" : "regional",
    sanctionStatus: event.isChampionship ? "gab_sanctioned" : "jt_sanctioned",
    title: event.title,
    date: event.date,
    venue: event.venue,
    city: event.city,
    region: resolveRegion(event.city),
    organizer: "Juego Todo PH",
    weightDivision: "Open",
    location: defaultEventLocation({
      country: "Philippines",
      region: resolveRegion(event.city),
      province: event.city.split(",")[0] ?? "",
      city: event.city,
      venue: event.venue,
      venueAddress: `${event.venue}, ${event.city}`,
    }),
    schedule: defaultEventSchedule(event.date),
    ownership: defaultEventOwnership(),
    status: event.status,
    summary: event.mainEvent,
    mainEvent: event.mainEvent,
    bouts: event.bouts,
    divisions: [],
    isChampionship: event.isChampionship,
    isLive: event.isLive,
    published: true,
    source: "static",
    operations: {
      capacity: { maximum: capacity, registered: event.bouts.length * 2, checkedIn: event.status === "Results" ? event.bouts.length * 2 : 0, waitlist: 0 },
      ticketsSold,
      ticketRevenue: ticketsSold * 850,
      registeredFighters: event.bouts.length * 2,
      assignedReferees: 4,
      assignedJudges: 3,
      assignedDoctors: 2,
      assignedCoaches: 12,
      broadcastPartner: event.isLive ? "FightCast Global" : "",
      sponsors: event.isChampionship ? ["JT Official", "Mandirigma Lab"] : [],
      officials: { ...defaultEventOfficials(), referees: 4, judges: 3, doctors: 2, medicalTeam: 2, security: 8 },
      health: {
        venueConfirmed: true,
        officialsAssigned: true,
        medicalTeamAssigned: true,
        securityConfirmed: true,
        sponsorshipComplete: event.isChampionship ?? false,
        livestreamConfigured: event.isLive ?? false,
        gabSanctionComplete: event.isChampionship ?? false,
      },
      media: { posterTone: event.posterTone, gallery: [], trailerUrl: "", streamEmbedUrl: "" },
      shopProductSlug: event.slug,
    },
    createdAt: event.date,
    updatedAt: event.date,
  });
}

function mapExampleEventToCalendarEntry(input: CalendarEntryInput): CalendarEntry {
  const normalized = buildNormalizedInput({ ...input, published: true, status: "Upcoming" });
  return normalizeCalendarEntry({
    ...normalized,
    id: `example-${input.slug}`,
    source: "static",
    published: true,
  });
}

function readStoredEntries(): CalendarEntry[] {
  const parsed = readJson<CalendarEntry[]>(CALENDAR_KEY, []);
  return Array.isArray(parsed) ? parsed.map((entry) => normalizeCalendarEntry(entry)) : [];
}

function writeStoredEntries(entries: CalendarEntry[]) {
  writeJson(CALENDAR_KEY, entries.map((entry) => normalizeCalendarEntry({ ...entry, source: "admin" })));
}

function sortByDate(entries: CalendarEntry[]) {
  return [...entries].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
}

function mergeCalendarEntries(stored: CalendarEntry[], includeDrafts: boolean) {
  const staticEntries = events.map(mapSiteEventToCalendarEntry);
  const exampleEntries = calendarExampleEventInputs.map(mapExampleEventToCalendarEntry);
  const reservedSlugs = new Set([...stored.map((entry) => entry.slug), ...staticEntries.map((entry) => entry.slug)]);
  const merged = [
    ...staticEntries,
    ...exampleEntries.filter((entry) => !reservedSlugs.has(entry.slug)),
    ...stored.map(normalizeCalendarEntry),
  ];
  return sortByDate(includeDrafts ? merged : merged.filter((entry) => entry.published && entry.operationalStatus !== "draft"));
}

export function getStoredCalendarEntries() {
  return readStoredEntries();
}

export function getAllCalendarEntries(includeDrafts = false) {
  return mergeCalendarEntries(readStoredEntries(), includeDrafts);
}

export function getCalendarEntryById(id: string) {
  return getAllCalendarEntries(true).find((entry) => entry.id === id) ?? null;
}

function buildNormalizedInput(input: CalendarEntryInput): CalendarEntry {
  const operationalStatus = input.operationalStatus ?? mapLegacyStatusToOperational(input.status, input.published ?? true);
  const city = input.city.trim();
  const venue = input.venue.trim();
  const eventType = input.eventType ? migrateLegacyEventType(input.eventType as string) : inferEventType(input);

  return normalizeCalendarEntry({
    id: "pending",
    slug: input.slug.trim() || slugifyCalendarEntry(input.title),
    kind: input.kind,
    eventType,
    operationalStatus,
    workflowStage: input.workflowStage ?? mapOperationalToWorkflow(operationalStatus),
    visibility: input.visibility ?? "public",
    entryType: input.entryType ?? "free_admission",
    ticketStatus: input.ticketStatus ?? "available",
    eventLevel: input.eventLevel ?? "national",
    sanctionStatus: input.sanctionStatus ?? "jt_sanctioned",
    title: input.title.trim(),
    date: input.date,
    venue,
    city,
    region: input.region?.trim() || resolveRegion(city),
    organizer: input.organizer?.trim() || "Juego Todo PH",
    weightDivision: input.weightDivision?.trim() || input.divisions?.[0] || "Open",
    location: defaultEventLocation({ ...input.location, city, venue, region: input.region || resolveRegion(city) }),
    schedule: { ...defaultEventSchedule(input.date), ...input.schedule, start: input.date },
    ownership: { ...defaultEventOwnership(), ...input.ownership, organizer: input.organizer || "Juego Todo PH" },
    status: mapOperationalToLegacyStatus(operationalStatus, input.date),
    summary: input.summary.trim(),
    mainEvent: input.mainEvent?.trim() || "",
    bouts: input.bouts?.map((entry) => entry.trim()).filter(Boolean) ?? [],
    divisions: input.divisions?.map((entry) => entry.trim()).filter(Boolean) ?? [],
    typeDetails: mergeTypeDetails(eventType, input.typeDetails),
    registrationDeadline: input.registrationDeadline?.trim() || "",
    isChampionship: input.isChampionship ?? false,
    isLive: input.isLive ?? operationalStatus === "live",
    published: operationalStatus !== "draft" && operationalStatus !== "pending_approval" && (input.published ?? false),
    source: "admin",
    operations: {
      ...defaultCalendarOperations(),
      ...input.operations,
      capacity: { ...defaultEventCapacity(), ...input.operations?.capacity },
      officials: { ...defaultEventOfficials(), ...input.operations?.officials },
      health: { ...defaultEventHealth(), ...input.operations?.health },
      media: { ...defaultCalendarOperations().media, ...input.operations?.media },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function createCalendarEntry(input: CalendarEntryInput, createdBy?: string) {
  const normalized = buildNormalizedInput(input);
  const entries = readStoredEntries();
  if (entries.some((entry) => entry.slug === normalized.slug)) throw new Error("An entry with this slug already exists.");
  const now = new Date().toISOString();
  const entry: CalendarEntry = { ...normalized, id: crypto.randomUUID(), createdAt: now, updatedAt: now, createdBy };
  writeStoredEntries([...entries, entry]);
  return entry;
}

export function updateCalendarEntry(id: string, input: CalendarEntryInput) {
  const normalized = buildNormalizedInput(input);
  const entries = readStoredEntries();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) throw new Error("Calendar entry not found.");
  if (entries.some((entry, entryIndex) => entryIndex !== index && entry.slug === normalized.slug)) {
    throw new Error("An entry with this slug already exists.");
  }
  const updated = normalizeCalendarEntry({
    ...entries[index],
    ...normalized,
    id: entries[index].id,
    source: "admin",
    createdAt: entries[index].createdAt,
    createdBy: entries[index].createdBy,
    updatedAt: new Date().toISOString(),
  });
  entries[index] = updated;
  writeStoredEntries(entries);
  return updated;
}

export function deleteCalendarEntry(id: string) {
  const entries = readStoredEntries();
  const next = entries.filter((entry) => entry.id !== id);
  if (next.length === entries.length) throw new Error("Calendar entry not found.");
  writeStoredEntries(next);
}

export function updateCalendarOperationalStatus(id: string, operationalStatus: CalendarOperationalStatus) {
  const entry = getCalendarEntryById(id);
  if (!entry || entry.source === "static") throw new Error("Only admin-created entries can change operational status.");
  return updateCalendarEntry(id, {
    slug: entry.slug,
    kind: entry.kind,
    eventType: entry.eventType,
    operationalStatus,
    workflowStage: mapOperationalToWorkflow(operationalStatus),
    visibility: entry.visibility,
    entryType: entry.entryType,
    ticketStatus: entry.ticketStatus,
    eventLevel: entry.eventLevel,
    sanctionStatus: entry.sanctionStatus,
    title: entry.title,
    date: entry.date,
    venue: entry.venue,
    city: entry.city,
    region: entry.region,
    organizer: entry.organizer,
    weightDivision: entry.weightDivision,
    location: entry.location,
    schedule: entry.schedule,
    ownership: entry.ownership,
    status: mapOperationalToLegacyStatus(operationalStatus, entry.date),
    summary: entry.summary,
    mainEvent: entry.mainEvent,
    bouts: entry.bouts,
    divisions: entry.divisions,
    registrationDeadline: entry.registrationDeadline,
    isChampionship: entry.isChampionship,
    isLive: operationalStatus === "live",
    published: operationalStatus !== "draft" && operationalStatus !== "pending_approval",
    operations: entry.operations,
  });
}

export function rescheduleCalendarEntry(id: string, dateIso: string) {
  const entry = getCalendarEntryById(id);
  if (!entry || entry.source === "static") throw new Error("Only admin-created entries can be rescheduled.");
  return updateCalendarEntry(id, {
    slug: entry.slug,
    kind: entry.kind,
    eventType: entry.eventType,
    operationalStatus: entry.operationalStatus,
    workflowStage: entry.workflowStage,
    visibility: entry.visibility,
    entryType: entry.entryType,
    ticketStatus: entry.ticketStatus,
    eventLevel: entry.eventLevel,
    sanctionStatus: entry.sanctionStatus,
    title: entry.title,
    date: dateIso,
    venue: entry.venue,
    city: entry.city,
    region: entry.region,
    organizer: entry.organizer,
    weightDivision: entry.weightDivision,
    location: entry.location,
    schedule: { ...entry.schedule, start: dateIso },
    ownership: entry.ownership,
    status: entry.status,
    summary: entry.summary,
    mainEvent: entry.mainEvent,
    bouts: entry.bouts,
    divisions: entry.divisions,
    registrationDeadline: entry.registrationDeadline,
    isChampionship: entry.isChampionship,
    isLive: entry.isLive,
    published: entry.published,
    operations: entry.operations,
  });
}

export function duplicateCalendarEntry(id: string, createdBy?: string) {
  const entry = getCalendarEntryById(id);
  if (!entry) throw new Error("Calendar entry not found.");
  let slug = `${entry.slug}-copy`;
  let counter = 2;
  while (getAllCalendarEntries(true).some((item) => item.slug === slug)) {
    slug = `${entry.slug}-copy-${counter}`;
    counter += 1;
  }
  return createCalendarEntry(
    {
      slug,
      kind: entry.kind,
      eventType: entry.eventType,
      operationalStatus: "draft",
      workflowStage: "draft",
      visibility: entry.visibility,
      entryType: entry.entryType,
      ticketStatus: "coming_soon",
      eventLevel: entry.eventLevel,
      sanctionStatus: entry.sanctionStatus,
      title: `${entry.title} (Copy)`,
      date: entry.date,
      venue: entry.venue,
      city: entry.city,
      region: entry.region,
      organizer: entry.organizer,
      weightDivision: entry.weightDivision,
      location: entry.location,
      schedule: entry.schedule,
      ownership: entry.ownership,
      status: "Draft",
      summary: entry.summary,
      mainEvent: entry.mainEvent,
      bouts: entry.bouts,
      divisions: entry.divisions,
      registrationDeadline: entry.registrationDeadline,
      isChampionship: entry.isChampionship,
      isLive: false,
      published: false,
      operations: { ...entry.operations, ticketsSold: 0, ticketRevenue: 0, capacity: { ...entry.operations.capacity, registered: 0, checkedIn: 0 } },
    },
    createdBy,
  );
}

export function exportCalendarEntries() {
  return JSON.stringify(readStoredEntries(), null, 2);
}

export function importCalendarEntries(raw: string, createdBy?: string) {
  const parsed = JSON.parse(raw) as CalendarEntryInput[];
  if (!Array.isArray(parsed)) throw new Error("Invalid calendar import file.");
  parsed.forEach((entry) => createCalendarEntry(entry, createdBy));
}

export function splitCalendarEntries(entries: CalendarEntry[]) {
  const upcoming = entries.filter((entry) => entry.status === "Upcoming").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = entries.filter((entry) => entry.status === "Results").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const other = entries.filter((entry) => entry.status !== "Upcoming" && entry.status !== "Results");
  return { upcoming, past, other };
}

export function getCalendarDashboardStats(entries: CalendarEntry[]) {
  const now = Date.now();
  return {
    upcoming: entries.filter((entry) => ["published", "registration_open", "registration_closed", "pending_approval"].includes(entry.operationalStatus) && new Date(entry.date).getTime() >= now).length,
    live: entries.filter((entry) => entry.operationalStatus === "live" || entry.isLive).length,
    completed: entries.filter((entry) => ["completed", "archived"].includes(entry.operationalStatus)).length,
    draft: entries.filter((entry) => entry.operationalStatus === "draft" || !entry.published).length,
    ticketRevenue: entries.reduce((sum, entry) => sum + entry.operations.ticketRevenue, 0),
    registeredParticipants: entries.reduce((sum, entry) => sum + entry.operations.capacity.registered, 0),
  };
}

export function updateCalendarEntryStatus(id: string, status: CalendarEntryStatus) {
  const entry = getCalendarEntryById(id);
  if (!entry || entry.source === "static") throw new Error("Calendar entry not found.");
  return updateCalendarEntry(id, {
    slug: entry.slug,
    kind: entry.kind,
    eventType: entry.eventType,
    operationalStatus: mapLegacyStatusToOperational(status, entry.published),
    workflowStage: entry.workflowStage,
    visibility: entry.visibility,
    entryType: entry.entryType,
    ticketStatus: entry.ticketStatus,
    eventLevel: entry.eventLevel,
    sanctionStatus: entry.sanctionStatus,
    title: entry.title,
    date: entry.date,
    venue: entry.venue,
    city: entry.city,
    region: entry.region,
    organizer: entry.organizer,
    weightDivision: entry.weightDivision,
    location: entry.location,
    schedule: entry.schedule,
    ownership: entry.ownership,
    status,
    summary: entry.summary,
    mainEvent: entry.mainEvent,
    bouts: entry.bouts,
    divisions: entry.divisions,
    registrationDeadline: entry.registrationDeadline,
    isChampionship: entry.isChampionship,
    isLive: entry.isLive,
    published: entry.published,
    operations: entry.operations,
  });
}
