"use client";

import type { CalendarEntry } from "@/data/calendar-entries";
import { EventManagementCard } from "@/components/admin/calendar/EventManagementCard";

export function AdminCalendarListView({
  entries,
  selectedEntryId,
  onSelectEntry,
  onEdit,
  onDuplicate,
  onPublish,
  onArchive,
}: {
  entries: CalendarEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: CalendarEntry) => void;
  onEdit: (entry: CalendarEntry) => void;
  onDuplicate: (entry: CalendarEntry) => void;
  onPublish: (entry: CalendarEntry) => void;
  onArchive: (entry: CalendarEntry) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="glass-panel rounded-[1.5rem] p-16 text-center text-zinc-400">
        No events match the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <EventManagementCard
          entry={entry}
          key={entry.id}
          onArchive={() => onArchive(entry)}
          onDuplicate={() => onDuplicate(entry)}
          onEdit={() => onEdit(entry)}
          onPublish={() => onPublish(entry)}
          onSelect={() => onSelectEntry(entry)}
          selected={selectedEntryId === entry.id}
        />
      ))}
    </div>
  );
}
