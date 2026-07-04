"use client";

import { Download, MoreHorizontal, Plus, Search, SlidersHorizontal, Upload, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { calendarEventTypeColors, calendarEventTypeLabels } from "@/data/calendar-entries";
import { categoryLegendTypes, type CategoryStat, type EventCategory } from "@/data/event-categories";
import { EventLegendPopover } from "@/components/admin/calendar/EventPlatformUi";
import type { AdminCalendarView } from "@/lib/admin/calendar-dashboard";

const viewOptions: { id: AdminCalendarView; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "calendar", label: "Calendar" },
  { id: "agenda", label: "Agenda" },
  { id: "list", label: "List" },
  { id: "year", label: "Year" },
  { id: "analytics", label: "Analytics" },
];

export function AdminCalendarHeader({
  search,
  onSearchChange,
  onCreate,
  onPublish,
  onImport,
  onExport,
  onOpenFilters,
  activeFilterCount,
  category,
  view,
  onViewChange,
  stats,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onPublish: () => void;
  onImport: () => void;
  onExport: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  category: EventCategory;
  view: AdminCalendarView;
  onViewChange: (view: AdminCalendarView) => void;
  stats: CategoryStat[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#FF1010]">National Event Platform</p>
          <h1 className="font-display mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">Events</h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-3xl lg:justify-end">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              className="w-full rounded-full border border-white/10 bg-black/35 py-3 pl-11 pr-4 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-4"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search events, venues, cities, organizers, fight cards..."
              value={search}
            />
          </label>
          <div className="flex shrink-0 gap-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#FF1010] px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]" onClick={onCreate} type="button">
              <Plus size={14} /> Create Event
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.16em] text-emerald-100" onClick={onPublish} type="button">
              <Zap size={14} /> Publish
            </button>
            <button
              aria-label="Open filters"
              className="relative inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-white"
              onClick={onOpenFilters}
              type="button"
            >
              <SlidersHorizontal size={16} />
              {activeFilterCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF1010] px-1 text-[0.55rem] font-black text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <CategoryLegendButton category={category} />
            <div className="relative" ref={menuRef}>
              <button className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-white" onClick={() => setMenuOpen((open) => !open)} type="button" aria-label="More actions">
                <MoreHorizontal size={16} />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[12rem] overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl">
                  {viewOptions.map((option) => (
                    <button
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm ${view === option.id ? "bg-[#FF1010]/15 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
                      key={option.id}
                      onClick={() => {
                        onViewChange(option.id);
                        setMenuOpen(false);
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                  <div className="border-t border-white/10" />
                  <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white" onClick={() => { onImport(); setMenuOpen(false); }} type="button">
                    <Upload size={14} /> Import Calendar
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white" onClick={() => { onExport(); setMenuOpen(false); }} type="button">
                    <Download size={14} /> Export Calendar
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[1.25rem] border border-white/10 px-5 py-4">
        {stats.map((stat) => (
          <Stat key={stat.label} label={stat.label} tone={stat.tone} value={stat.value} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className={`font-display mt-1 text-2xl leading-none ${tone}`}>{value}</p>
    </div>
  );
}

function CategoryLegendButton({ category }: { category: EventCategory }) {
  const types = categoryLegendTypes(category);
  return (
    <EventLegendPopover
      items={types.map((type) => ({
        type,
        label: calendarEventTypeLabels[type],
        color: calendarEventTypeColors[type].legend,
      }))}
    />
  );
}
