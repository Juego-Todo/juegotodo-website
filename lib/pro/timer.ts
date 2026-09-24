import { PRO_REMINDER_DAYS } from "@/data/pro-membership";

export type ProTimerUrgency = "ok" | "warn" | "urgent" | "critical" | "expired" | "none";

export type ProTimerState = {
  expiresAt: Date | null;
  msRemaining: number;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  urgency: ProTimerUrgency;
  /** True when within any configured reminder window (30/14/7 days). */
  inReminderWindow: boolean;
  label: string;
  shortLabel: string;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole calendar days remaining until expiry (0 on expiry day before the timestamp passes). */
export function getProDaysRemaining(
  expiresAt: string | Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!expiresAt) return null;
  const end = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  if (Number.isNaN(end.getTime())) return null;
  const diffMs = startOfDay(end).getTime() - startOfDay(now).getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function resolveProTimer(
  expiresAt: string | Date | null | undefined,
  now: Date = new Date(),
): ProTimerState {
  if (!expiresAt) {
    return {
      expiresAt: null,
      msRemaining: 0,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      urgency: "none",
      inReminderWindow: false,
      label: "No expiry set",
      shortLabel: "—",
    };
  }

  const end = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  if (Number.isNaN(end.getTime())) {
    return {
      expiresAt: null,
      msRemaining: 0,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      urgency: "none",
      inReminderWindow: false,
      label: "Invalid expiry",
      shortLabel: "—",
    };
  }

  const msRemaining = end.getTime() - now.getTime();
  if (msRemaining <= 0) {
    const daysAgo = Math.max(1, Math.abs(getProDaysRemaining(end, now) ?? 0));
    return {
      expiresAt: end,
      msRemaining: 0,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      urgency: "expired",
      inReminderWindow: false,
      label: daysAgo === 1 ? "Expired yesterday" : `Expired ${daysAgo} days ago`,
      shortLabel: "Expired",
    };
  }

  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
  const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000));
  const minutesRemaining = Math.floor(msRemaining / (60 * 1000));
  const calendarDays = getProDaysRemaining(end, now) ?? daysRemaining;

  const reminderThreshold = PRO_REMINDER_DAYS.find((days) => calendarDays <= days) ?? null;
  const inReminderWindow = reminderThreshold !== null;

  let urgency: ProTimerUrgency = "ok";
  if (calendarDays <= 7) urgency = "critical";
  else if (calendarDays <= 14) urgency = "urgent";
  else if (calendarDays <= 30) urgency = "warn";

  let label: string;
  let shortLabel: string;
  if (hoursRemaining < 24) {
    const hours = Math.max(1, hoursRemaining);
    const mins = minutesRemaining % 60;
    label = hours < 1 ? `${Math.max(1, mins)}m left` : `${hours}h ${mins}m left`;
    shortLabel = hours < 1 ? `${Math.max(1, mins)}m` : `${hours}h left`;
  } else if (calendarDays === 1) {
    label = "1 day left";
    shortLabel = "1 day";
  } else {
    label = `${calendarDays} days left`;
    shortLabel = `${calendarDays}d left`;
  }

  if (inReminderWindow && reminderThreshold !== null && urgency !== "ok") {
    label = `${label} · renew soon`;
  }

  return {
    expiresAt: end,
    msRemaining,
    daysRemaining: calendarDays,
    hoursRemaining,
    minutesRemaining,
    urgency,
    inReminderWindow,
    label,
    shortLabel,
  };
}

export function formatProExpiryDate(expiresAt: string | Date | null | undefined): string | null {
  if (!expiresAt) return null;
  const end = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  if (Number.isNaN(end.getTime())) return null;
  return end.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
