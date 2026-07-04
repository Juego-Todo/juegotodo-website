"use client";

import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  calendarEventTypeLabels,
  calendarOperationalStatusLabels,
  eventEntryTypeLabels,
  eventLevelLabels,
  eventVisibilityLabels,
  eventLegendItems,
  calendarEventTypeColors,
  sanctionStatusLabels,
  type CalendarEntry,
} from "@/data/calendar-entries";
import {
  calendarOperationalStatusColors,
  eventEntryTypeColors,
  eventLevelColors,
  eventVisibilityColors,
  sanctionStatusColors,
} from "@/data/calendar-entries";

export function EventTagPills({ entry, compact = false }: { entry: CalendarEntry; compact?: boolean }) {
  const size = compact ? "px-2 py-0.5 text-[0.52rem]" : "px-2.5 py-1 text-[0.58rem]";
  const tags = [
    { label: calendarEventTypeLabels[entry.eventType], className: calendarEventTypeColors[entry.eventType].pill },
    { label: calendarOperationalStatusLabels[entry.operationalStatus], className: calendarOperationalStatusColors[entry.operationalStatus] },
    { label: eventVisibilityLabels[entry.visibility], className: eventVisibilityColors[entry.visibility] },
    { label: eventEntryTypeLabels[entry.entryType], className: eventEntryTypeColors[entry.entryType] },
    { label: eventLevelLabels[entry.eventLevel], className: eventLevelColors[entry.eventLevel] },
    { label: sanctionStatusLabels[entry.sanctionStatus], className: sanctionStatusColors[entry.sanctionStatus] },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span className={`rounded-full border font-black uppercase tracking-[0.1em] ${size} ${tag.className}`} key={tag.label}>
          {tag.label}
        </span>
      ))}
    </div>
  );
}

export function EventLegendPopover({
  items,
}: {
  items?: Array<{ type: string; label: string; color: string }>;
} = {}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const legendItems =
    items ??
    eventLegendItems.map((item) => ({
      type: item.type,
      label: item.label,
      color: calendarEventTypeColors[item.type].legend,
    }));

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Event type legend"
        className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-white"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Info size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[22rem] rounded-2xl border border-white/10 bg-[#111] p-4 shadow-2xl">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">Event Types</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {legendItems.map((item) => (
              <div className="flex items-center gap-2" key={item.type}>
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-zinc-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function EventLegend() {
  return (
    <div className="glass-panel rounded-[1.25rem] border border-white/10 p-4 sm:p-5">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Event Legend</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {eventLegendItems.map((item) => (
          <div className="flex items-center gap-2" key={item.type}>
            <span className={`h-2.5 w-2.5 rounded-full ${calendarEventTypeColors[item.type].legend}`} />
            <span className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
