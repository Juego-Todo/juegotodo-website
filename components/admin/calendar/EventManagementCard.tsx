"use client";

import { Archive, Copy, Pencil, Radio } from "lucide-react";
import type { CalendarEntry } from "@/data/calendar-entries";
import { calendarEventTypeColors } from "@/data/calendar-entries";
import { EventTagPills } from "@/components/admin/calendar/EventPlatformUi";
import { formatAdminDate, formatCurrency } from "@/lib/admin/calendar-dashboard";
import { formatLocationStack, getTotalOfficials } from "@/lib/calendar/platform";
import { formatTypeDetailsSummary } from "@/data/event-type-details";

export function EventManagementCard({
  entry,
  selected,
  onSelect,
  onEdit,
  onDuplicate,
  onPublish,
  onArchive,
  showActions = true,
}: {
  entry: CalendarEntry;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  showActions?: boolean;
}) {
  const colors = calendarEventTypeColors[entry.eventType];
  const location = formatLocationStack(entry);

  return (
    <article
      className={`glass-panel rounded-[1.35rem] border p-4 transition hover:-translate-y-0.5 hover:shadow-2xl sm:p-5 ${
        selected ? "border-[#FF1010]/40" : "border-white/10"
      }`}
    >
      <div className="grid gap-5 xl:grid-cols-[12rem_1fr_16rem]">
        <div className="flex gap-4 xl:flex-col">
          <div className={`h-28 w-full min-w-[7rem] rounded-[1rem] bg-gradient-to-br ${colors.timeline}`} />
          <div>
            <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">{formatAdminDate(entry.date)}</p>
            {entry.source === "static" ? <p className="mt-2 text-[0.58rem] uppercase tracking-[0.12em] text-zinc-500">Seeded Event</p> : null}
          </div>
        </div>

        <button className="min-w-0 text-left" onClick={onSelect} type="button">
          <EventTagPills entry={entry} />
          <h3 className="font-display mt-3 text-3xl uppercase text-white">{entry.title.replace("Juego Todo: ", "")}</h3>
          <div className="mt-3 space-y-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">
            <p>{location.line1}</p>
            <p>{location.line2}</p>
            <p>{location.line3}</p>
            <p className="text-zinc-300">{location.line4}</p>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
            {entry.summary || formatTypeDetailsSummary(entry.eventType, entry.typeDetails) || "No description yet."}
          </p>
        </button>

        <div>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <Metric label="Capacity" value={`${entry.operations.capacity.registered}/${entry.operations.capacity.maximum || "—"}`} />
            <Metric label="Tickets" value={String(entry.operations.ticketsSold)} />
            <Metric label="Revenue" value={formatCurrency(entry.operations.ticketRevenue)} />
            <Metric label="Officials" value={String(getTotalOfficials(entry))} />
          </div>
          {showActions ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />
              <ActionButton disabled={entry.source === "static"} icon={Copy} label="Duplicate" onClick={onDuplicate} />
              <ActionButton disabled={entry.source === "static"} icon={Radio} label="Publish" onClick={onPublish} />
              <ActionButton disabled={entry.source === "static"} icon={Archive} label="Archive" onClick={onArchive} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <p className="text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon: Icon,
  disabled = false,
}: {
  label: string;
  onClick?: () => void;
  icon: typeof Pencil;
  disabled?: boolean;
}) {
  return (
    <button
      className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled || !onClick}
      onClick={onClick}
      type="button"
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
