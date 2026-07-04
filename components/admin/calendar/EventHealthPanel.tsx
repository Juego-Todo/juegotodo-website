"use client";

import type { CalendarEntry } from "@/data/calendar-entries";
import { computeEventHealth, getOccupancyPercent, getTicketSalesPercent } from "@/lib/calendar/platform";

export function EventHealthPanel({ entry }: { entry: CalendarEntry }) {
  const { checks, score } = computeEventHealth(entry);

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">Event Health</p>
          <p className="mt-1 text-sm text-zinc-400">Operational readiness overview</p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl leading-none text-white">{score}%</p>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-emerald-300">Ready</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#FF1010] to-emerald-500 transition-all" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2" key={check.label}>
            <span className="text-xs text-zinc-300">{check.label}</span>
            <span className={`text-[0.58rem] font-black uppercase tracking-[0.12em] ${check.complete ? "text-emerald-300" : "text-amber-300"}`}>
              {check.complete ? "Ready" : "Pending"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
          Ticket Sales: {getTicketSalesPercent(entry)}%
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
          Registration: {getOccupancyPercent(entry)}%
        </div>
      </div>
    </div>
  );
}
