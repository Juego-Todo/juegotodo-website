import type { ProMembershipStatus } from "@/data/pro-membership";

export type ProAccessRecord = {
  status: string;
  expires_at?: string | null;
  started_at?: string | null;
  cancelled_at?: string | null;
  membership_id?: string | null;
  plan?: string | null;
  payment_status?: string | null;
};

function parseExpiry(expiresAt: string | null | undefined): Date | null {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** True when status is active and expires_at is in the future (or null for open-ended admin grant). */
export function hasActiveProMembership(
  record: ProAccessRecord | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!record) return false;
  if (record.status !== "active") return false;

  const expiresAt = parseExpiry(record.expires_at);
  if (!expiresAt) {
    return true;
  }

  return expiresAt.getTime() > now.getTime();
}

/**
 * Cancelled members keep access until expires_at if still in the paid period.
 * Expired / inactive / pending do not grant access.
 */
export function resolveProAccessState(
  record: ProAccessRecord | null | undefined,
  now: Date = new Date(),
): {
  entitled: boolean;
  displayStatus: ProMembershipStatus | "none";
} {
  if (!record) {
    return { entitled: false, displayStatus: "none" };
  }

  if (hasActiveProMembership(record, now)) {
    return { entitled: true, displayStatus: "active" };
  }

  if (record.status === "cancelled") {
    const expiresAt = parseExpiry(record.expires_at);
    if (expiresAt && expiresAt.getTime() > now.getTime()) {
      return { entitled: true, displayStatus: "cancelled" };
    }
  }

  if (record.status === "expired") {
    return { entitled: false, displayStatus: "expired" };
  }

  const expiresAt = parseExpiry(record.expires_at);
  if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    return { entitled: false, displayStatus: "expired" };
  }

  return { entitled: false, displayStatus: record.status as ProMembershipStatus };
}

export function generateProMembershipId(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JT-PRO-${suffix}`;
}

export function computeProExpiry(from: Date = new Date(), durationMonths = 12): Date {
  const expires = new Date(from);
  expires.setMonth(expires.getMonth() + durationMonths);
  return expires;
}
