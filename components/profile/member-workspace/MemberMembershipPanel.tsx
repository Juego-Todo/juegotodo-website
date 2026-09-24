"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  membershipApplicationStatusLabels,
  membershipPaymentStatusLabels,
  type MembershipApplicationRecord,
} from "@/data/membership-applications";
import { MembershipStatus } from "@/components/pro/MembershipStatus";
import { membershipFetch } from "@/lib/membership/client";
import { useProMembership } from "@/lib/pro/use-pro-membership";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isSupabaseUnavailableResponse } from "@/lib/platform/client";
import {
  MemberPanelShell,
  PanelEmptyState,
  PanelErrorState,
  PanelLoadingState,
  StatusBadge,
  SupabaseUnavailableNotice,
  formatPanelDate,
} from "@/components/profile/member-workspace/shared";

export function MemberMembershipPanel() {
  const supabaseReady = isSupabaseConfigured();
  const [applications, setApplications] = useState<MembershipApplicationRecord[]>([]);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(!supabaseReady);
  const { displayStatus, membership, loading: proLoading } = useProMembership();

  useEffect(() => {
    if (!supabaseReady) return;

    let cancelled = false;

    void membershipFetch("/api/membership/applications")
      .then(async (response) => {
        const payload = (await response.json()) as {
          applications?: MembershipApplicationRecord[];
          error?: string;
        };
        if (cancelled) return;

        if (isSupabaseUnavailableResponse(response.status)) {
          setUnavailable(true);
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load applications.");
        }

        setApplications(payload.applications ?? []);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load applications.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [supabaseReady]);

  const latest = applications[0];

  return (
    <MemberPanelShell
      action={
        <Link
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.14em] text-zinc-200 transition hover:border-red-500/40 hover:text-white"
          href="/membership/applications"
        >
          View All Applications
        </Link>
      }
      description="Track membership standing, renewal dates, and official league affiliation."
      title="My Membership"
    >
      {!proLoading ? (
        <div className="mb-5">
          <MembershipStatus
            status={displayStatus}
            membershipId={membership?.membership_id}
            expiresAt={membership?.expires_at}
          />
        </div>
      ) : null}

      {unavailable ? <SupabaseUnavailableNotice /> : null}
      {loading ? <PanelLoadingState /> : null}
      {error ? <PanelErrorState message={error} /> : null}

      {!loading && !error && !unavailable && !latest ? (
        <PanelEmptyState
          href="/membership/apply/local-membership"
          linkLabel="Apply for Membership"
          message="You have not submitted a JT1 local membership application yet."
        />
      ) : null}

      {!loading && !error && !unavailable && latest ? (
        <Link
          className="block rounded-[1.35rem] border border-white/10 bg-black/30 p-5 transition hover:border-red-500/30"
          href={`/membership/application/${latest.id}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                Latest JT1 Application
              </p>
              <p className="mt-2 truncate text-lg font-semibold text-white">{latest.applicationNumber}</p>
              <p className="mt-1 truncate text-sm text-zinc-400">{latest.fullName}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge label={membershipApplicationStatusLabels[latest.applicationStatus]} tone="warning" />
                <StatusBadge label={membershipPaymentStatusLabels[latest.paymentStatus]} />
                <StatusBadge label={`Updated ${formatPanelDate(latest.updatedAt)}`} />
              </div>
            </div>
            <ChevronRight className="shrink-0 text-zinc-500" size={20} aria-hidden />
          </div>
          {applications.length > 1 ? (
            <p className="mt-4 text-xs text-zinc-500">{applications.length} total applications on file.</p>
          ) : null}
        </Link>
      ) : null}
    </MemberPanelShell>
  );
}
