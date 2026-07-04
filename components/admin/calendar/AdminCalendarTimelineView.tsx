"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { CalendarEntry } from "@/data/calendar-entries";
import { CompactEventCard } from "@/components/admin/calendar/CompactEventCard";
import {
  getCurrentSeasonYear,
  groupEntriesByMonth,
  monthLabels,
} from "@/lib/admin/calendar-dashboard";

export function AdminCalendarTimelineView({
  entries,
  selectedEntryId,
  onSelectEntry,
}: {
  entries: CalendarEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: CalendarEntry) => void;
}) {
  const seasonYear = getCurrentSeasonYear(entries);
  const grouped = groupEntriesByMonth(entries.filter((entry) => new Date(entry.date).getFullYear() === seasonYear));
  const currentMonth = new Date().getMonth();
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(() => {
    const initial = new Set<number>([currentMonth]);
    grouped.forEach((monthEntries, monthIndex) => {
      if (monthEntries.length > 0) initial.add(monthIndex);
    });
    return initial;
  });

  const visibleMonths = useMemo(
    () =>
      monthLabels
        .map((label, monthIndex) => ({ label, monthIndex, entries: grouped.get(monthIndex) ?? [] }))
        .filter((month) => month.entries.length > 0),
    [grouped],
  );

  if (visibleMonths.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-6 py-16 text-center text-zinc-400">
        No events match the current filters.
      </div>
    );
  }

  function toggleMonth(monthIndex: number) {
    setExpandedMonths((current) => {
      const next = new Set(current);
      if (next.has(monthIndex)) next.delete(monthIndex);
      else next.add(monthIndex);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {visibleMonths.map(({ label, monthIndex, entries: monthEntries }) => {
        const expanded = expandedMonths.has(monthIndex);
        return (
          <section className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20" key={label}>
            <button
              className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.02]"
              onClick={() => toggleMonth(monthIndex)}
              type="button"
            >
              <div className="flex items-center gap-3">
                {expanded ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
                <div>
                  <h3 className="font-display text-2xl uppercase text-white">{label}</h3>
                  <p className="mt-1 text-xs text-zinc-500">{monthEntries.length} events · {seasonYear}</p>
                </div>
              </div>
            </button>
            {expanded ? (
              <div className="space-y-2 border-t border-white/5 px-3 py-3 sm:px-4">
                {monthEntries
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((entry) => (
                    <CompactEventCard
                      entry={entry}
                      key={entry.id}
                      onSelect={() => onSelectEntry(entry)}
                      selected={selectedEntryId === entry.id}
                    />
                  ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
