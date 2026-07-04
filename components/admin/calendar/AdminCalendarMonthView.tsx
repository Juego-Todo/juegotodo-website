"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calendarEventTypeColors,
  type CalendarEntry,
} from "@/data/calendar-entries";
import { AdminCalendarMiniMonth } from "@/components/admin/calendar/AdminCalendarFilterSidebar";
import { EventTagPills } from "@/components/admin/calendar/EventPlatformUi";
import {
  buildMonthGrid,
  entriesForDay,
  formatAdminDate,
  isSameDay,
  monthLabels,
} from "@/lib/admin/calendar-dashboard";

export function AdminCalendarMonthView({
  entries,
  activeMonth,
  selectedEntryId,
  onMonthChange,
  onSelectEntry,
  onReschedule,
}: {
  entries: CalendarEntry[];
  activeMonth: Date;
  selectedEntryId: string | null;
  onMonthChange: (date: Date) => void;
  onSelectEntry: (entry: CalendarEntry) => void;
  onReschedule: (entryId: string, date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [previewEntry, setPreviewEntry] = useState<CalendarEntry | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const today = new Date();
  const cells = useMemo(() => buildMonthGrid(activeMonth), [activeMonth]);

  function shiftMonth(delta: number) {
    onMonthChange(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + delta, 1));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_18rem]">
      <div className="glass-panel rounded-[1.5rem] border border-white/10 p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Monthly Operations View</p>
            <h2 className="font-display mt-2 text-3xl uppercase text-white">
              {monthLabels[activeMonth.getMonth()]} {activeMonth.getFullYear()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-white/10 p-2 text-zinc-300 hover:text-white" onClick={() => shiftMonth(-1)} type="button">
              <ChevronLeft size={16} />
            </button>
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 hover:text-white"
              onClick={() => onMonthChange(new Date())}
              type="button"
            >
              Today
            </button>
            <button className="rounded-full border border-white/10 p-2 text-zinc-300 hover:text-white" onClick={() => shiftMonth(1)} type="button">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => {
            if (!cell.date) {
              return <div className="min-h-28 rounded-[1rem] border border-transparent bg-black/10" key={cell.key} />;
            }

            const dayEntries = entriesForDay(entries, cell.date);
            const isToday = isSameDay(cell.date, today);
            const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
            const isSelected = isSameDay(cell.date, selectedDate);

            return (
              <div
                className={`min-h-28 rounded-[1rem] border p-2 transition ${
                  isSelected ? "border-[#FF1010]/40 bg-[#FF1010]/10" : "border-white/10 bg-black/20"
                } ${isWeekend ? "bg-black/35" : ""} ${isToday ? "ring-1 ring-[#FF1010]/40" : ""} ${
                  draggingId ? "hover:border-emerald-400/40" : ""
                }`}
                key={cell.key}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingId) {
                    const nextDate = new Date(cell.date!);
                    const dragged = entries.find((entry) => entry.id === draggingId);
                    if (dragged) {
                      const original = new Date(dragged.date);
                      nextDate.setHours(original.getHours(), original.getMinutes(), 0, 0);
                      onReschedule(draggingId, nextDate);
                    }
                    setDraggingId(null);
                  }
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-xs font-black ${isToday ? "text-[#FF1010]" : "text-zinc-300"}`}>{cell.date.getDate()}</span>
                  {dayEntries.length > 0 ? (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[0.55rem] text-zinc-400">{dayEntries.length}</span>
                  ) : null}
                </div>
                <div className="space-y-1">
                  {dayEntries.slice(0, 3).map((entry) => {
                    const colors =
                      entry.operationalStatus === "draft"
                        ? "border-zinc-500/40 bg-zinc-500/10 text-zinc-300"
                        : calendarEventTypeColors[entry.eventType].pill;

                    return (
                      <button
                        className={`block w-full truncate rounded-full border px-2 py-1 text-left text-[0.55rem] font-black uppercase tracking-[0.08em] transition hover:scale-[1.02] ${colors} ${
                          selectedEntryId === entry.id ? "ring-1 ring-white/40" : ""
                        }`}
                        draggable={entry.source === "admin"}
                        key={entry.id}
                        onClick={() => {
                          setSelectedDate(cell.date!);
                          onSelectEntry(entry);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        onDragStart={() => setDraggingId(entry.id)}
                        onMouseEnter={() => setPreviewEntry(entry)}
                        onMouseLeave={() => setPreviewEntry(null)}
                        type="button"
                      >
                        {entry.title.replace("Juego Todo: ", "")}
                      </button>
                    );
                  })}
                  {dayEntries.length > 3 ? (
                    <p className="text-[0.55rem] text-zinc-500">+{dayEntries.length - 3} more</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <AdminCalendarMiniMonth
          activeMonth={activeMonth}
          entries={entries}
          onMonthChange={onMonthChange}
          onSelectDate={(date) => {
            setSelectedDate(date);
            onMonthChange(new Date(date.getFullYear(), date.getMonth(), 1));
          }}
          selectedDate={selectedDate}
        />

        <AnimatePresence>
          {previewEntry ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.25rem] border border-white/10 bg-black/40 p-4"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
            >
              <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#FF1010]">Quick Preview</p>
              <p className="font-display mt-2 text-xl uppercase text-white">{previewEntry.title.replace("Juego Todo: ", "")}</p>
              <p className="mt-2 text-sm text-zinc-400">{formatAdminDate(previewEntry.date)}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {previewEntry.location.venue || previewEntry.venue} · {previewEntry.location.city || previewEntry.city}
              </p>
              <div className="mt-3">
                <EventTagPills compact entry={previewEntry} />
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                {previewEntry.operations.capacity.registered} registered · {previewEntry.operations.ticketsSold} tickets sold
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
