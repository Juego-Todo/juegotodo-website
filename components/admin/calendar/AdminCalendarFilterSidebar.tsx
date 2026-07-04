"use client";

import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  calendarEventTypeLabels,
  calendarOperationalStatusLabels,
  philippineRegions,
  type CalendarEntry,
  type CalendarEventType,
  type CalendarOperationalStatus,
} from "@/data/calendar-entries";
import { EventTagPills } from "@/components/admin/calendar/EventPlatformUi";
import { EventHealthPanel } from "@/components/admin/calendar/EventHealthPanel";
import type { CalendarFilters } from "@/lib/admin/calendar-dashboard";
import { formatAdminDate } from "@/lib/admin/calendar-dashboard";
import { formatLocationStack, getMapLinks } from "@/lib/calendar/platform";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-red-500/40 focus:ring-4";

export function AdminCalendarFilterSidebar({
  open,
  filters,
  options,
  onToggle,
  onChange,
}: {
  open: boolean;
  filters: CalendarFilters;
  options: {
    years: string[];
    countries: string[];
    regions: string[];
    provinces: string[];
    cities: string[];
    venues: string[];
    organizers: string[];
    clubs: string[];
    weightDivisions: string[];
    eventTypes: string[];
    statuses: string[];
  };
  onToggle: () => void;
  onChange: (filters: CalendarFilters) => void;
}) {
  if (!open) {
    return (
      <button
        className="glass-panel inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300"
        onClick={onToggle}
        type="button"
      >
        <PanelLeftOpen size={14} />
        Filters
      </button>
    );
  }

  function update<K extends keyof CalendarFilters>(key: K, value: CalendarFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="glass-panel w-full shrink-0 rounded-[1.5rem] border border-white/10 p-4 lg:w-72 xl:w-80">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Filters</p>
        <button className="text-zinc-400 hover:text-white" onClick={onToggle} type="button" aria-label="Collapse filters">
          <PanelLeftClose size={16} />
        </button>
      </div>

      <label className="block text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">
        Search
        <input
          className={fieldClassName}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Event, venue, region..."
          value={filters.search}
        />
      </label>

      <div className="mt-4 space-y-3">
        <FilterSelect label="Year" onChange={(value) => update("year", value)} options={options.years} value={filters.year} />
        <FilterSelect
          label="Month"
          onChange={(value) => update("month", value)}
          options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]}
          optionLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
          value={filters.month}
        />
        <FilterSelect label="Country" onChange={(value) => update("country", value)} options={options.countries} value={filters.country} />
        <FilterSelect label="Region" onChange={(value) => update("region", value)} options={[...philippineRegions, ...options.regions.filter((r) => !philippineRegions.includes(r as never))]} value={filters.region} />
        <FilterSelect label="Province" onChange={(value) => update("province", value)} options={options.provinces} value={filters.province} />
        <FilterSelect label="City" onChange={(value) => update("city", value)} options={options.cities} value={filters.city} />
        <FilterSelect
          label="Event Type"
          onChange={(value) => update("eventType", value)}
          options={options.eventTypes}
          optionLabels={options.eventTypes.map((type) => calendarEventTypeLabels[type as CalendarEventType] ?? type)}
          value={filters.eventType}
        />
        <FilterSelect
          label="Status"
          onChange={(value) => update("status", value)}
          options={options.statuses}
          optionLabels={options.statuses.map((status) => calendarOperationalStatusLabels[status as CalendarOperationalStatus] ?? status)}
          value={filters.status}
        />
        <FilterSelect label="Venue" onChange={(value) => update("venue", value)} options={options.venues} value={filters.venue} />
        <FilterSelect label="Organizer" onChange={(value) => update("organizer", value)} options={options.organizers} value={filters.organizer} />
        <FilterSelect label="Club" onChange={(value) => update("club", value)} options={options.clubs} value={filters.club} />
        <FilterSelect label="Weight Division" onChange={(value) => update("weightDivision", value)} options={options.weightDivisions} value={filters.weightDivision} />
      </div>

      <button
        className="mt-5 w-full rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:text-white"
        onClick={() =>
          onChange({
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
          })
        }
        type="button"
      >
        Reset Filters
      </button>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  optionLabels,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  optionLabels?: string[];
}) {
  return (
    <label className="block text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">
      {label}
      <select className={fieldClassName} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="all">All</option>
        {options.map((option, index) => (
          <option key={option} value={option}>
            {optionLabels?.[index] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminCalendarDetailSidebar({
  entry,
  onClose,
  onEdit,
}: {
  entry: CalendarEntry | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!entry) {
    return null;
  }

  const ops = entry.operations;
  const location = formatLocationStack(entry);
  const maps = getMapLinks(entry);

  return (
    <aside className="glass-panel w-full shrink-0 rounded-[1.5rem] border border-white/10 p-5 lg:w-80 xl:w-[24rem]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Event Command Panel</p>
          <h3 className="font-display mt-2 text-2xl uppercase leading-none text-white">{entry.title.replace("Juego Todo: ", "")}</h3>
        </div>
        <button className="text-zinc-400 hover:text-white" onClick={onClose} type="button" aria-label="Close details">×</button>
      </div>

      <div className={`overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br ${entry.operations.media.posterTone} p-5`}>
        <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-400">Event Poster</p>
        <p className="font-display mt-8 text-3xl uppercase text-white">{entry.location.city || entry.city}</p>
        <p className="mt-2 text-sm text-zinc-300">{entry.location.venue || entry.venue}</p>
      </div>

      <div className="mt-4">
        <EventTagPills compact entry={entry} />
      </div>

      <div className="mt-4 space-y-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">
        <p>{location.line1}</p>
        <p>{location.line2}</p>
        <p>{location.line3}</p>
        <p className="text-zinc-300">{location.line4}</p>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <DetailRow label="Date" value={formatAdminDate(entry.date)} />
        <DetailRow label="Capacity" value={`${ops.capacity.registered} / ${ops.capacity.maximum || "—"} registered`} />
        <DetailRow label="Ticket Sales" value={`${ops.ticketsSold} sold`} />
        <DetailRow label="Assigned Officials" value={String(ops.officials.referees + ops.officials.judges + ops.officials.doctors)} />
        <DetailRow label="Broadcast Partner" value={ops.broadcastPartner || "TBA"} />
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MapLink href={maps.googleMaps} label="Google Maps" />
        <MapLink href={maps.openMaps} label="Open Maps" />
        <MapLink href={maps.directions} label="Directions" />
        <button className="rounded-full border border-white/10 px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300" onClick={() => navigator.clipboard.writeText(maps.address)} type="button">
          Copy Address
        </button>
      </div>
      {maps.coordinates ? <p className="mt-2 text-xs text-zinc-500">GPS: {maps.coordinates}</p> : null}

      <div className="mt-5">
        <EventHealthPanel entry={entry} />
      </div>

      <div className="mt-5 space-y-2">
        <SidebarAction label="Edit Event" onClick={onEdit} primary />
        <SidebarAction label="Manage Fight Card" onClick={onEdit} />
        <SidebarAction label="Assign Officials" onClick={onEdit} />
        <SidebarAction label="Open Registration" onClick={onEdit} />
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/5 pb-3">
      <dt className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</dt>
      <dd className="mt-1 text-zinc-200">{value}</dd>
    </div>
  );
}

function MapLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="rounded-full border border-white/10 px-3 py-2 text-center text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300 transition hover:border-white/30 hover:text-white"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function SidebarAction({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      className={`w-full rounded-full px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
        primary
          ? "bg-[#FF1010] text-white hover:bg-[#ff2828]"
          : "border border-white/10 text-zinc-300 hover:border-white/30 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function AdminCalendarMiniMonth({
  activeMonth,
  selectedDate,
  entries,
  onMonthChange,
  onSelectDate,
}: {
  activeMonth: Date;
  selectedDate: Date;
  entries: CalendarEntry[];
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
}) {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-400">Jump To Date</p>
        <div className="flex gap-1">
          <button className="rounded-full border border-white/10 p-1 text-zinc-400" onClick={() => onMonthChange(new Date(year, month - 1, 1))} type="button">
            <ChevronLeft size={14} />
          </button>
          <button className="rounded-full border border-white/10 p-1 text-zinc-400" onClick={() => onMonthChange(new Date(year, month + 1, 1))} type="button">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <p className="font-display text-xl uppercase text-white">
        {activeMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.58rem] text-zinc-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, index) => (
          <span key={`pad-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const hasEvents = entries.some((entry) => new Date(entry.date).toDateString() === date.toDateString());
          const isSelected = selectedDate.toDateString() === date.toDateString();
          const isToday = today.toDateString() === date.toDateString();

          return (
            <button
              className={`rounded-lg py-1 text-xs transition ${
                isSelected
                  ? "bg-[#FF1010] text-white"
                  : isToday
                    ? "border border-[#FF1010]/40 text-red-100"
                    : hasEvents
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
              key={day}
              onClick={() => onSelectDate(date)}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
