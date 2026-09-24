"use client";

import { useEffect, useState } from "react";
import { formatProExpiryDate, resolveProTimer, type ProTimerUrgency } from "@/lib/pro/timer";

const URGENCY_CLASS: Record<ProTimerUrgency, string> = {
  ok: "text-zinc-400",
  warn: "text-amber-200",
  urgent: "text-orange-300",
  critical: "text-red-300",
  expired: "text-red-400",
  none: "text-zinc-500",
};

const URGENCY_BAR: Record<ProTimerUrgency, string> = {
  ok: "bg-emerald-400",
  warn: "bg-amber-400",
  urgent: "bg-orange-400",
  critical: "bg-red-400",
  expired: "bg-red-500",
  none: "bg-zinc-600",
};

function progressPercent(daysRemaining: number, urgency: ProTimerUrgency): number {
  if (urgency === "expired" || urgency === "none") return 0;
  // Visual against a 365-day year; clamp so near-expiry still shows a sliver.
  const pct = Math.min(100, Math.max(4, (daysRemaining / 365) * 100));
  return pct;
}

export function ProCountdown({
  expiresAt,
  entitled = true,
  compact = false,
  showBar = true,
  className = "",
}: {
  expiresAt?: string | null;
  entitled?: boolean;
  compact?: boolean;
  showBar?: boolean;
  className?: string;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!expiresAt) return;
    const timer = resolveProTimer(expiresAt, new Date());
    // Tick every second under 24h; otherwise every minute.
    const intervalMs = timer.hoursRemaining < 24 ? 1000 : 60_000;
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) {
    return null;
  }

  const timer = resolveProTimer(expiresAt, now);
  const dateLabel = formatProExpiryDate(expiresAt);

  if (compact) {
    return (
      <p className={`text-[0.65rem] tabular-nums ${URGENCY_CLASS[timer.urgency]} ${className}`}>
        {entitled || timer.urgency === "expired" ? timer.shortLabel : dateLabel}
        {dateLabel && entitled ? ` · ${dateLabel}` : ""}
      </p>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={`text-sm font-semibold tabular-nums ${URGENCY_CLASS[timer.urgency]}`}>
          {timer.label}
        </p>
        {dateLabel ? <p className="text-xs text-zinc-500">{dateLabel}</p> : null}
      </div>
      {showBar && timer.urgency !== "none" ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${URGENCY_BAR[timer.urgency]}`}
            style={{ width: `${progressPercent(timer.daysRemaining, timer.urgency)}%` }}
          />
        </div>
      ) : null}
      {timer.inReminderWindow && timer.urgency !== "expired" ? (
        <p className="text-[0.65rem] uppercase tracking-[0.12em] text-amber-200/80">
          Renewal window
        </p>
      ) : null}
    </div>
  );
}
