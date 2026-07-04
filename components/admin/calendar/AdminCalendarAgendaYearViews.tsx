"use client";

import type { CalendarEntry } from "@/data/calendar-entries";
import { CompactEventCard } from "@/components/admin/calendar/CompactEventCard";
import { formatAdminDate, groupEntriesByDate } from "@/lib/admin/calendar-dashboard";

export function AdminCalendarAgendaView({
  entries,
  selectedEntryId,
  onSelectEntry,
}: {
  entries: CalendarEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: CalendarEntry) => void;
}) {
  const grouped = groupEntriesByDate(entries);

  if (grouped.length === 0) {
    return <div className="glass-panel rounded-[1.5rem] p-16 text-center text-zinc-400">No events in the current agenda.</div>;
  }

  return (
    <div className="space-y-6">
      {grouped.map(([dateKey, dayEntries]) => (
        <section key={dateKey}>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#FF1010]" />
            <h3 className="font-display text-2xl uppercase text-white">{formatAdminDate(dayEntries[0].date)}</h3>
            <span className="text-sm text-zinc-500">{dayEntries.length} events</span>
          </div>
          <div className="space-y-3">
            {dayEntries.map((entry) => (
              <CompactEventCard
                entry={entry}
                key={entry.id}
                onSelect={() => onSelectEntry(entry)}
                selected={selectedEntryId === entry.id}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function AdminCalendarYearView({
  entries,
  year = new Date().getFullYear(),
  onSelectEntry,
  selectedEntryId,
}: {
  entries: CalendarEntry[];
  year?: number;
  onSelectEntry: (entry: CalendarEntry) => void;
  selectedEntryId: string | null;
}) {
  const yearEntries = entries.filter((entry) => new Date(entry.date).getFullYear() === year);

  return (
    <div className="glass-panel rounded-[1.5rem] border border-white/10 p-5">
      <div className="mb-5">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Year View</p>
        <h2 className="font-display mt-2 text-4xl uppercase text-white">{year} National Calendar</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, monthIndex) => {
          const monthEntries = yearEntries.filter((entry) => new Date(entry.date).getMonth() === monthIndex);
          return (
            <button
              className="rounded-[1.15rem] border border-white/10 bg-black/25 p-4 text-left transition hover:border-[#FF1010]/30"
              key={monthIndex}
              onClick={() => monthEntries[0] && onSelectEntry(monthEntries[0])}
              type="button"
            >
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                {new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long" })}
              </p>
              <p className="font-display mt-3 text-4xl text-white">{monthEntries.length}</p>
              <p className="mt-1 text-xs text-zinc-500">scheduled events</p>
              {monthEntries.slice(0, 2).map((entry) => (
                <p className={`mt-2 truncate text-xs ${selectedEntryId === entry.id ? "text-red-200" : "text-zinc-400"}`} key={entry.id}>
                  {entry.title.replace("Juego Todo: ", "")}
                </p>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
