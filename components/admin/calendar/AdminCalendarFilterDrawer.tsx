"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  calendarEventTypeLabels,
  calendarOperationalStatusLabels,
  philippineRegions,
  type CalendarEventType,
  type CalendarOperationalStatus,
} from "@/data/calendar-entries";
import type { CalendarFilters } from "@/lib/admin/calendar-dashboard";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-red-500/40 focus:ring-4";

export function AdminCalendarFilterDrawer({
  open,
  draft,
  options,
  onClose,
  onApply,
  onDraftChange,
  onClear,
}: {
  open: boolean;
  draft: CalendarFilters;
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
  onClose: () => void;
  onApply: () => void;
  onDraftChange: (filters: CalendarFilters) => void;
  onClear: () => void;
}) {
  function update<K extends keyof CalendarFilters>(key: K, value: CalendarFilters[K]) {
    onDraftChange({ ...draft, [key]: value });
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[85] bg-black/60 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
            aria-label="Close filters"
          />
          <motion.aside
            animate={{ x: 0 }}
            className="fixed inset-y-0 right-0 z-[86] flex w-full max-w-md flex-col border-l border-white/10 bg-[#0a0a0a] shadow-2xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Advanced Filters</p>
                <h2 className="font-display text-2xl uppercase text-white">Filter Events</h2>
              </div>
              <button className="rounded-full border border-white/10 p-2 text-zinc-400 hover:text-white" onClick={onClose} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-3">
                <FilterSelect label="Year" onChange={(value) => update("year", value)} options={options.years} value={draft.year} />
                <FilterSelect
                  label="Month"
                  onChange={(value) => update("month", value)}
                  options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]}
                  optionLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
                  value={draft.month}
                />
                <FilterSelect label="Country" onChange={(value) => update("country", value)} options={options.countries} value={draft.country} />
                <FilterSelect label="Region" onChange={(value) => update("region", value)} options={[...philippineRegions, ...options.regions.filter((r) => !philippineRegions.includes(r as never))]} value={draft.region} />
                <FilterSelect label="Province" onChange={(value) => update("province", value)} options={options.provinces} value={draft.province} />
                <FilterSelect label="City" onChange={(value) => update("city", value)} options={options.cities} value={draft.city} />
                <FilterSelect label="Venue" onChange={(value) => update("venue", value)} options={options.venues} value={draft.venue} />
                <FilterSelect label="Organizer" onChange={(value) => update("organizer", value)} options={options.organizers} value={draft.organizer} />
                <FilterSelect label="Club" onChange={(value) => update("club", value)} options={options.clubs} value={draft.club} />
                <FilterSelect label="Weight Division" onChange={(value) => update("weightDivision", value)} options={options.weightDivisions} value={draft.weightDivision} />
                <FilterSelect
                  label="Event Type"
                  onChange={(value) => update("eventType", value)}
                  options={options.eventTypes}
                  optionLabels={options.eventTypes.map((type) => calendarEventTypeLabels[type as CalendarEventType] ?? type)}
                  value={draft.eventType}
                />
                <FilterSelect
                  label="Status"
                  onChange={(value) => update("status", value)}
                  options={options.statuses}
                  optionLabels={options.statuses.map((status) => calendarOperationalStatusLabels[status as CalendarOperationalStatus] ?? status)}
                  value={draft.status}
                />
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/10 px-5 py-4">
              <button className="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300" onClick={onClear} type="button">
                Clear Filters
              </button>
              <button className="flex-1 rounded-full bg-[#FF1010] px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white" onClick={onApply} type="button">
                Apply Filters
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
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
