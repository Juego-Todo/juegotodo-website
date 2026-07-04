"use client";

import {
  calendarEventTypeColors,
  calendarEventTypeLabels,
  calendarOperationalStatusLabels,
  eventLevelLabels,
  type CalendarEntry,
} from "@/data/calendar-entries";
import { ChevronRight } from "lucide-react";

export function CompactEventCard({
  entry,
  selected,
  onSelect,
}: {
  entry: CalendarEntry;
  selected?: boolean;
  onSelect: () => void;
}) {
  const colors = calendarEventTypeColors[entry.eventType];
  const title = entry.title.replace("Juego Todo: ", "");
  const date = new Date(entry.date);
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Manila" });
  const venue = entry.location.venue || entry.venue;
  const city = entry.location.city || entry.city;

  return (
    <button
      className={`group flex w-full items-center gap-4 rounded-[1.15rem] border bg-black/25 px-4 py-3 text-left transition hover:border-white/20 hover:bg-black/40 ${
        selected ? "border-[#FF1010]/40 ring-1 ring-[#FF1010]/20" : "border-white/10"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className={`h-14 w-11 shrink-0 rounded-lg bg-gradient-to-br ${colors.timeline}`} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg uppercase leading-tight text-white">{title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.08em] ${colors.pill}`}>
            {calendarEventTypeLabels[entry.eventType]}
          </span>
          <span className="text-[0.52rem] font-black uppercase tracking-[0.08em] text-zinc-500">
            {eventLevelLabels[entry.eventLevel]}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-zinc-500">
          {dateLabel} · {venue}{city ? `, ${city}` : ""}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-500">
          {calendarOperationalStatusLabels[entry.operationalStatus]}
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-200">{entry.operations.ticketsSold.toLocaleString()} tickets</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-500 group-hover:text-white">
        View
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
