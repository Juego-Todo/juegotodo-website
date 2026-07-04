import type { CalendarEntry } from "@/data/calendar-entries";

export type AdminCalendarView = "calendar" | "timeline" | "agenda" | "list" | "year" | "analytics";

export type QuickFilterId =
  | "upcoming"
  | "live"
  | "juego_todo_event"
  | "seminar"
  | "license_examination"
  | "public"
  | "private"
  | "national"
  | "regional"
  | "ncr";

export type LocationContext = {
  country?: string;
  region?: string;
  city?: string;
  venue?: string;
};

export type CalendarFilters = {
  search: string;
  year: string;
  month: string;
  country: string;
  region: string;
  province: string;
  city: string;
  eventType: string;
  status: string;
  venue: string;
  organizer: string;
  club: string;
  weightDivision: string;
};

export const defaultCalendarFilters = (): CalendarFilters => ({
  search: "",
  year: "all",
  month: "all",
  country: "all",
  region: "all",
  province: "all",
  city: "all",
  eventType: "all",
  status: "all",
  venue: "all",
  organizer: "all",
  club: "all",
  weightDivision: "all",
});

export function filterCalendarEntries(entries: CalendarEntry[], filters: CalendarFilters) {
  const query = filters.search.trim().toLowerCase();

  return entries.filter((entry) => {
    if (query) {
      const haystack = [
        entry.title,
        entry.slug,
        entry.city,
        entry.venue,
        entry.region,
        entry.organizer,
        entry.summary,
        entry.weightDivision,
        entry.eventType,
        entry.operationalStatus,
        entry.location.country,
        entry.location.region,
        entry.location.province,
        entry.location.city,
        entry.location.venue,
        entry.ownership.organizer,
        entry.ownership.hostClub,
        entry.ownership.promoter,
        entry.ownership.regionalDirector,
        entry.mainEvent,
        ...entry.bouts,
        ...entry.divisions,
        entry.operations.broadcastPartner,
        ...entry.operations.sponsors,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    const entryDate = new Date(entry.date);
    if (filters.year !== "all" && String(entryDate.getFullYear()) !== filters.year) return false;
    if (filters.month !== "all" && String(entryDate.getMonth()) !== filters.month) return false;
    if (filters.country !== "all" && entry.location.country !== filters.country) return false;
    if (filters.region !== "all" && entry.location.region !== filters.region) return false;
    if (filters.province !== "all" && entry.location.province !== filters.province) return false;
    if (filters.city !== "all" && entry.location.city !== filters.city) return false;
    if (filters.eventType !== "all" && entry.eventType !== filters.eventType) return false;
    if (filters.status !== "all" && entry.operationalStatus !== filters.status) return false;
    if (filters.venue !== "all" && entry.location.venue !== filters.venue) return false;
    if (filters.organizer !== "all" && entry.ownership.organizer !== filters.organizer) return false;
    if (filters.club !== "all" && entry.ownership.hostClub !== filters.club) return false;
    if (filters.weightDivision !== "all" && entry.weightDivision !== filters.weightDivision) return false;
    return true;
  });
}

export function getFilterOptions(entries: CalendarEntry[]) {
  const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
  return {
    years: unique(entries.map((entry) => String(new Date(entry.date).getFullYear()))),
    countries: unique(entries.map((entry) => entry.location.country)),
    regions: unique(entries.map((entry) => entry.location.region)),
    provinces: unique(entries.map((entry) => entry.location.province)),
    cities: unique(entries.map((entry) => entry.location.city)),
    venues: unique(entries.map((entry) => entry.location.venue)),
    organizers: unique(entries.map((entry) => entry.ownership.organizer)),
    clubs: unique(entries.map((entry) => entry.ownership.hostClub)),
    weightDivisions: unique(entries.map((entry) => entry.weightDivision)),
    eventTypes: unique(entries.map((entry) => entry.eventType)),
    statuses: unique(entries.map((entry) => entry.operationalStatus)),
  };
}

export function buildMonthGrid(activeMonth: Date) {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date | null; key: string }> = [];
  for (let index = 0; index < startOffset; index += 1) cells.push({ date: null, key: `empty-start-${index}` });
  for (let day = 1; day <= daysInMonth; day += 1) cells.push({ date: new Date(year, month, day), key: `day-${day}` });
  while (cells.length % 7 !== 0) cells.push({ date: null, key: `empty-end-${cells.length}` });
  return cells;
}

export function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export function entriesForDay(entries: CalendarEntry[], day: Date) {
  return entries.filter((entry) => isSameDay(new Date(entry.date), day));
}

export function groupEntriesByMonth(entries: CalendarEntry[]) {
  const groups = new Map<number, CalendarEntry[]>();
  for (let month = 0; month < 12; month += 1) groups.set(month, []);
  entries.forEach((entry) => {
    const month = new Date(entry.date).getMonth();
    groups.set(month, [...(groups.get(month) ?? []), entry]);
  });
  return groups;
}

export function groupEntriesByDate(entries: CalendarEntry[]) {
  const groups = new Map<string, CalendarEntry[]>();
  entries.forEach((entry) => {
    const key = new Date(entry.date).toDateString();
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  });
  return [...groups.entries()].sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
}

export function getCurrentSeasonYear(entries: CalendarEntry[]) {
  const years = entries.map((entry) => new Date(entry.date).getFullYear());
  return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
}

export function formatAdminDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

export function applyQuickFilters(entries: CalendarEntry[], active: QuickFilterId[]) {
  if (active.length === 0) return entries;
  const now = Date.now();

  return entries.filter((entry) =>
    active.every((chip) => {
      switch (chip) {
        case "upcoming":
          return new Date(entry.date).getTime() >= now && !["completed", "cancelled", "archived"].includes(entry.operationalStatus);
        case "live":
          return entry.operationalStatus === "live";
        case "juego_todo_event":
          return entry.eventType === "juego_todo_event";
        case "seminar":
          return entry.eventType === "seminar" || entry.eventType === "training_camp";
        case "license_examination":
          return entry.eventType === "license_examination";
        case "public":
          return entry.visibility === "public";
        case "private":
          return entry.visibility === "private";
        case "national":
          return entry.eventLevel === "national";
        case "regional":
          return entry.eventLevel === "regional";
        case "ncr":
          return entry.location.region === "NCR" || entry.region === "NCR";
        default:
          return true;
      }
    }),
  );
}

export function applyLocationContext(entries: CalendarEntry[], context: LocationContext) {
  return entries.filter((entry) => {
    if (context.country && entry.location.country !== context.country) return false;
    if (context.region && entry.location.region !== context.region && entry.region !== context.region) return false;
    if (context.city && entry.location.city !== context.city && entry.city !== context.city) return false;
    if (context.venue && entry.location.venue !== context.venue && entry.venue !== context.venue) return false;
    return true;
  });
}

export function countActiveFilters(filters: CalendarFilters) {
  return Object.entries(filters).filter(([key, value]) => key !== "search" && value !== "all" && value !== "").length;
}

export const quickFilterOptions: { id: QuickFilterId; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "live", label: "Live" },
  { id: "juego_todo_event", label: "Juego Todo Event" },
  { id: "seminar", label: "Seminar" },
  { id: "license_examination", label: "License Exam" },
  { id: "public", label: "Public" },
  { id: "private", label: "Private" },
  { id: "national", label: "National" },
  { id: "regional", label: "Regional" },
  { id: "ncr", label: "NCR" },
];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount);
}

export const monthLabels = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const monthShortLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;
