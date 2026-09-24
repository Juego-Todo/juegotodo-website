"use client";

import Link from "next/link";
import { PRO_PAGE_PATH } from "@/data/pro-membership";
import { ProBadge } from "@/components/pro/ProBadge";

export type MembershipStatusDisplay =
  | "none"
  | "inactive"
  | "active"
  | "expired"
  | "cancelled"
  | "past_due"
  | "pending";

const STATUS_COPY: Record<
  MembershipStatusDisplay,
  { label: string; badge: "default" | "locked" | "active"; hint: string }
> = {
  none: {
    label: "INACTIVE",
    badge: "locked",
    hint: "Unlock License Center with an annual Pro membership.",
  },
  inactive: {
    label: "INACTIVE",
    badge: "locked",
    hint: "Unlock License Center with an annual Pro membership.",
  },
  active: {
    label: "ACTIVE",
    badge: "active",
    hint: "License Center unlocked.",
  },
  expired: {
    label: "EXPIRED",
    badge: "locked",
    hint: "Renew to restore License Center access.",
  },
  cancelled: {
    label: "CANCELLED",
    badge: "locked",
    hint: "Access continues until the paid period ends, then renew to continue.",
  },
  past_due: {
    label: "PAST DUE",
    badge: "locked",
    hint: "Complete payment to restore Pro access.",
  },
  pending: {
    label: "PENDING",
    badge: "default",
    hint: "Payment is processing. Access unlocks after confirmation.",
  },
};

export function MembershipStatus({
  status,
  membershipId,
  expiresAt,
  compact = false,
}: {
  status: MembershipStatusDisplay;
  membershipId?: string | null;
  expiresAt?: string | null;
  compact?: boolean;
}) {
  const copy = STATUS_COPY[status] ?? STATUS_COPY.none;
  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <ProBadge label={`PRO ${copy.label}`} variant={copy.badge} />
        {expiryLabel && status === "active" ? (
          <span className="text-[0.65rem] uppercase tracking-[0.12em] text-zinc-500">
            until {expiryLabel}
          </span>
        ) : null}
        <Link
          href={PRO_PAGE_PATH}
          className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#FFCF6A] hover:underline"
        >
          {status === "active" ? "Manage" : status === "expired" ? "Renew" : "Get Pro"}
        </Link>
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#FFCF6A]">
            JuegoTodo Pro
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ProBadge label={copy.label} variant={copy.badge} />
            {membershipId ? (
              <span className="font-mono text-[0.7rem] text-zinc-500">{membershipId}</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-zinc-400">{copy.hint}</p>
          {expiryLabel ? (
            <p className="mt-1 text-xs text-zinc-500">
              {status === "active" ? "Expires" : "Ended"} {expiryLabel}
            </p>
          ) : null}
        </div>
        <Link
          href={PRO_PAGE_PATH}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-4 text-[0.65rem] font-black uppercase tracking-[0.14em] text-white transition hover:border-[#FFCF6A]/40"
        >
          {status === "active" ? "Manage" : status === "expired" ? "Renew" : "Become Pro"}
        </Link>
      </div>
    </article>
  );
}
