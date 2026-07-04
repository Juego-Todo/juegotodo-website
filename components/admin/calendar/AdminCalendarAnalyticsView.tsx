"use client";

import type { CalendarEntry } from "@/data/calendar-entries";
import { formatCurrency } from "@/lib/admin/calendar-dashboard";

export function AdminCalendarAnalyticsView({
  entries,
  stats,
}: {
  entries: CalendarEntry[];
  stats: {
    upcoming: number;
    live: number;
    draft: number;
    completed: number;
    ticketRevenue: number;
    registeredParticipants: number;
  };
}) {
  const topTicketEvents = [...entries].sort((a, b) => b.operations.ticketsSold - a.operations.ticketsSold).slice(0, 5);
  const topRegistrationEvents = [...entries]
    .sort((a, b) => b.operations.capacity.registered - a.operations.capacity.registered)
    .slice(0, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AnalyticsCard title="Operational Overview">
        <Metric label="Upcoming" value={String(stats.upcoming)} />
        <Metric label="Live" value={String(stats.live)} />
        <Metric label="Draft" value={String(stats.draft)} />
        <Metric label="Completed" value={String(stats.completed)} />
      </AnalyticsCard>
      <AnalyticsCard title="Revenue & Registration">
        <Metric label="Ticket Revenue" value={formatCurrency(stats.ticketRevenue)} />
        <Metric label="Registered Participants" value={String(stats.registeredParticipants)} />
        <Metric label="Events In View" value={String(entries.length)} />
      </AnalyticsCard>
      <AnalyticsCard className="lg:col-span-2" title="Top Ticket Sales">
        {topTicketEvents.map((entry) => (
          <Row key={entry.id} label={entry.title.replace("Juego Todo: ", "")} value={`${entry.operations.ticketsSold.toLocaleString()} tickets`} />
        ))}
      </AnalyticsCard>
      <AnalyticsCard className="lg:col-span-2" title="Top Registration">
        {topRegistrationEvents.map((entry) => (
          <Row
            key={entry.id}
            label={entry.title.replace("Juego Todo: ", "")}
            value={`${entry.operations.capacity.registered} registered`}
          />
        ))}
      </AnalyticsCard>
    </div>
  );
}

function AnalyticsCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-panel rounded-[1.25rem] border border-white/10 p-5 ${className}`}>
      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 text-sm">
      <span className="truncate text-zinc-300">{label}</span>
      <span className="shrink-0 text-zinc-500">{value}</span>
    </div>
  );
}
